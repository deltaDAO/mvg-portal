'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import ChartModal from './ChartModal'
import ChartSkeleton from './ChartSkeleton'
import ChartError from './ChartError'

interface DataDistributionProps {
  title: string
  description?: string
  type: 'email' | 'date'
  skipLoading?: boolean
  data: Array<{
    time: string
    count: number
    emails_per_day?: number
  }>
}

interface DataPoint {
  time?: string | Date
  count?: number
  emails_per_day?: number
}

interface FormattedDatePoint {
  time: Date | null
  count: number
}

const DataDistribution = ({
  title,
  description,
  type,
  skipLoading = false,
  data
}: DataDistributionProps) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chartType, setChartType] = useState<'date' | 'email'>(type)

  // Process data when it changes
  useEffect(() => {
    if (data && data.length > 0) {
      setLoading(false)
      setError(null)
    } else {
      setError('No data available')
      setLoading(false)
    }
  }, [data])

  // Render chart when data is available
  useEffect(() => {
    if (!data.length || !chartRef.current) return

    // Clear any existing chart
    d3.select(chartRef.current).selectAll('*').remove()

    const container = chartRef.current
    const margin = { top: 20, right: 30, bottom: 60, left: 50 }
    const width = container.clientWidth - margin.left - margin.right
    const height = container.clientHeight - margin.top - margin.bottom

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', container.clientWidth)
      .attr('height', container.clientHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create chart based on chart type
    if (chartType === 'date') {
      // Date distribution chart - Bar chart
      const parseTime = d3.timeParse('%Y-%m-%d')

      // Ensure data is properly formatted
      const formattedData: FormattedDatePoint[] = data
        .map((d) => {
          const parsedDate = parseTime(d.time)
          return {
            time: parsedDate,
            count: d.count
          }
        })
        .filter((d) => d.time !== null)

      if (formattedData.length === 0) {
        console.error('No valid dates found in the data')
        container.innerHTML =
          '<p class="text-red-500 text-center">Error: Could not parse date data</p>'
        return
      }

      // Sort data by date
      formattedData.sort((a, b) => {
        if (!a.time || !b.time) return 0
        return a.time.getTime() - b.time.getTime()
      })

      // Set up scales
      const x = d3
        .scaleTime()
        .domain(d3.extent(formattedData, (d) => d.time) as [Date, Date])
        .range([0, width])

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(formattedData, (d) => d.count) as number])
        .nice()
        .range([height, 0])

      // Add X axis
      const xAxis = svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(6)
            .tickFormat(d3.timeFormat('%b %Y') as any)
        )

      xAxis
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')

      // Add Y axis
      svg.append('g').call(d3.axisLeft(y).ticks(5))

      // Add area under the line with gradient
      const areaGradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', 'area-gradient-' + container.id)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')

      areaGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#4F46E5')
        .attr('stop-opacity', 0.3)

      areaGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#4F46E5')
        .attr('stop-opacity', 0.05)

      // Create area generator
      const area = d3
        .area<FormattedDatePoint>()
        .defined((d) => d.time !== null)
        .x((d) => x(d.time!))
        .y0(height)
        .y1((d) => y(d.count))
        .curve(d3.curveCatmullRom.alpha(0.5)) // Smoother curve

      // Add the area
      svg
        .append('path')
        .datum(formattedData)
        .attr('fill', `url(#area-gradient-${container.id})`)
        .attr('stroke', '#4F46E5')
        .attr('stroke-width', 2)
        .attr('d', area)

      // Add dots
      svg
        .selectAll('circle')
        .data(formattedData)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d.time!))
        .attr('cy', (d) => y(d.count))
        .attr('r', 4)
        .attr('fill', '#4F46E5')
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .style('opacity', 0.8)
        .on('mouseover', function (event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6)
            .style('opacity', 1)

          const tooltip = d3
            .select(container)
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('transition', 'opacity 0.2s')

          tooltip
            .html(
              `<div class="text-sm">
                <div class="font-medium">${d3.timeFormat('%B %d, %Y')(
                  d.time!
                )}</div>
                <div class="text-gray-600">Count: ${d.count}</div>
              </div>`
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px')
            .transition()
            .duration(200)
            .style('opacity', 1)
        })
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4)
            .style('opacity', 0.8)

          d3.selectAll('.tooltip').remove()
        })
    } else {
      // Email distribution chart - Histogram
      // Ensure data is properly formatted
      const values = data.map((d) => d.emails_per_day || d.count)

      if (values.length === 0) {
        console.error('No valid data found')
        container.innerHTML =
          '<p class="text-red-500 text-center">Error: No data available</p>'
        return
      }

      // Create histogram data
      const maxValue = d3.max(values) || 10
      const histogram = d3
        .bin()
        .domain([0, maxValue + 1])
        .thresholds(d3.range(0, maxValue + 2))(values)

      // Set up scales
      const x = d3
        .scaleLinear()
        .domain([0, maxValue + 1])
        .range([0, width])

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(histogram, (d) => d.length) || 0])
        .nice()
        .range([height, 0])

      // Add X axis
      const xAxis = svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(Math.min(maxValue + 1, 15)))

      xAxis.selectAll('text').style('text-anchor', 'middle').attr('dy', '1em')

      // Add Y axis
      svg.append('g').call(d3.axisLeft(y).ticks(5))

      // Add gradient for bars
      const barGradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', 'bar-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')

      barGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#4F46E5')
        .attr('stop-opacity', 0.9)

      barGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#4F46E5')
        .attr('stop-opacity', 0.6)

      // Add bars
      svg
        .selectAll('rect')
        .data(histogram)
        .enter()
        .append('rect')
        .attr('x', (d) => x(d.x0 as number))
        .attr('y', (d) => y(d.length))
        .attr('width', (d) =>
          Math.max(0, x(d.x1 as number) - x(d.x0 as number) - 1)
        )
        .attr('height', (d) => height - y(d.length))
        .attr('fill', 'url(#bar-gradient)')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .attr('rx', 2) // Rounded corners
        .attr('opacity', 0.9)
        .on('mouseover', function (event, d) {
          d3.select(this).transition().duration(200).attr('opacity', 1)

          const tooltip = d3
            .select(container)
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('transition', 'opacity 0.2s')

          tooltip
            .html(
              `<div class="text-sm">
                <div class="text-gray-600">Emails: ${d.x0} - ${d.x1}</div>
                <div class="text-gray-600">Count: ${d.length}</div>
              </div>`
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 28 + 'px')
            .transition()
            .duration(200)
            .style('opacity', 1)
        })
        .on('mouseout', function () {
          d3.select(this).transition().duration(200).attr('opacity', 0.9)

          d3.selectAll('.tooltip').remove()
        })

      // Add axis labels
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Emails per Day')
        .attr('class', 'text-sm text-gray-600')

      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Frequency')
        .attr('class', 'text-sm text-gray-600')
    }
  }, [data, chartType])

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  if (loading && !skipLoading) {
    return <ChartSkeleton type="line" height={300} />
  }

  if (error) {
    return <ChartError message={error} onRetry={() => {}} />
  }

  // Convert data for chart modal
  const chartData =
    type === 'date'
      ? data.map((item) => ({
          time: new Date(item.time),
          count: item.count
        }))
      : data.map((item) => ({
          emails_per_day: item.emails_per_day || item.count
        }))

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={handleOpenModal}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div
        ref={chartRef}
        className="w-full h-[300px] bg-white rounded-lg shadow-sm"
      />

      <ChartModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={title}
        chartData={chartData}
        chartType={chartType}
      />
    </div>
  )
}

export default DataDistribution
