'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import ChartModal from './ChartModal'
import ChartSkeleton from './ChartSkeleton'
import ChartError from './ChartError'
import { useDataStore } from '@/store/dataStore'

interface DataDistributionProps {
  title: string
  description?: string
  type: 'email' | 'date'
  skipLoading?: boolean
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
  skipLoading = false
}: DataDistributionProps) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chartType, setChartType] = useState<'date' | 'email'>(type)

  // Get data fetching functions from store
  const { fetchEmailDistribution, fetchDateDistribution } = useDataStore()

  // Fetch data with retry functionality
  const fetchDistributionData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let csvText
      if (type === 'email') {
        const emailData = await fetchEmailDistribution()
        csvText = emailData
        setChartType('email')
      } else if (type === 'date') {
        const dateData = await fetchDateDistribution()
        csvText = dateData
        setChartType('date')
      } else {
        throw new Error('Invalid distribution type specified')
      }

      // Parse CSV data
      const parsedData = d3.csvParse(csvText)
      setData(parsedData as unknown as DataPoint[])
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [type, fetchEmailDistribution, fetchDateDistribution])

  // Fetch data on component mount
  useEffect(() => {
    fetchDistributionData()
  }, [fetchDistributionData, skipLoading])

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
          // Get the key names which might vary depending on how the CSV is parsed
          const timeKey = 'time' in d ? 'time' : Object.keys(d)[0]
          const countKey = 'count' in d ? 'count' : Object.keys(d)[1]

          const timeValue = d[timeKey as keyof typeof d] as string
          const countValue = +(d[countKey as keyof typeof d] as string)

          // Parse the date string
          const parsedDate = parseTime(timeValue)

          return {
            time: parsedDate,
            count: countValue
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
        .attr('fill', 'url(#area-gradient-' + container.id + ')')
        .attr('d', area)

      // Add line chart with smoother curve
      const line = d3
        .line<FormattedDatePoint>()
        .defined((d) => d.time !== null)
        .x((d) => x(d.time!))
        .y((d) => y(d.count))
        .curve(d3.curveCatmullRom.alpha(0.5)) // Smoother curve

      // Add the line path
      svg
        .append('path')
        .datum(formattedData)
        .attr('fill', 'none')
        .attr('stroke', '#4F46E5') // Indigo color for line
        .attr('stroke-width', 2.5)
        .attr('d', line)

      // Add points without hover effects
      svg
        .selectAll('.dot')
        .data(formattedData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => x(d.time!))
        .attr('cy', (d) => y(d.count))
        .attr('r', 3) // Smaller points
        .attr('fill', '#F59E0B') // Amber color for points
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.8)

      // Add labels
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Date')
        .attr('class', 'text-sm text-gray-600')

      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Count')
        .attr('class', 'text-sm text-gray-600')

      // Add title
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', -5)
        .text('Email Count Over Time')
        .attr('class', 'text-xs font-semibold text-gray-700')
    } else if (chartType === 'email') {
      // Emails per day histogram
      const getEmailValue = (d: DataPoint): number => {
        if ('emails_per_day' in d) {
          return +(d.emails_per_day ?? 0)
        }
        const firstKey = Object.keys(d)[0]
        return +(d[firstKey as keyof DataPoint] ?? 0)
      }

      const values = data.map(getEmailValue).filter((v) => !isNaN(v))

      if (values.length === 0) {
        console.error('No valid email count values found')
        container.innerHTML =
          '<p class="text-red-500 text-center">Error: Could not parse email count data</p>'
        return
      }

      // Create histogram data
      const maxValue = d3.max(values) as number
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
        .domain([0, d3.max(histogram, (d) => d.length) as number])
        .nice()
        .range([height, 0])

      // Add X axis
      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(Math.min(maxValue + 1, 10))
            .tickFormat(d3.format('d'))
        )

      // Add Y axis
      svg.append('g').call(d3.axisLeft(y).ticks(5))

      // Add gradient for bars
      const barGradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', 'bar-gradient-' + container.id)
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

      // Add bars without hover effects for small chart
      svg
        .selectAll('rect')
        .data(histogram)
        .enter()
        .append('rect')
        .attr('class', 'dot')
        .attr('x', (d) => x(d.x0 as number))
        .attr('width', (d) =>
          Math.max(0, x(d.x1 as number) - x(d.x0 as number) - 1)
        )
        .attr('y', (d) => y(d.length))
        .attr('height', (d) => height - y(d.length))
        .attr('fill', 'url(#bar-gradient-' + container.id + ')') // Gradient fill
        .attr('rx', 2) // Rounded corners
        .attr('opacity', 0.9)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5)

      // Add labels
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

      // Add title
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', -5)
        .text('Distribution of Emails per Day')
        .attr('class', 'text-xs font-semibold text-gray-700')
    } else {
      console.warn('Could not determine chart type:', { data, type })
      container.innerHTML =
        '<p class="text-red-500 text-center">Error: Could not determine chart type</p>'
    }
  }, [data, chartType, type])

  // Handle opening the modal
  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {data.length > 0 && !loading && !error && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center p-1.5 rounded-md text-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer relative group"
            aria-label="Expand chart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            </svg>
            <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Expand
            </span>
          </button>
        )}
      </div>
      {description && <p className="text-gray-600 mb-4">{description}</p>}

      <div
        ref={chartRef}
        className="w-full h-64 bg-gray-50 rounded flex items-center justify-center cursor-pointer"
        onClick={
          data.length > 0 && !loading && !error ? handleOpenModal : undefined
        }
      >
        {loading && !skipLoading ? (
          <ChartSkeleton
            type={chartType === 'date' ? 'line' : 'bar'}
            height={256}
          />
        ) : error ? (
          <ChartError message={error} onRetry={fetchDistributionData} />
        ) : data.length === 0 ? (
          <p className="text-gray-500">No data available</p>
        ) : null}
      </div>

      {/* Modal for zoomed view */}
      <ChartModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={title}
        chartData={
          chartType === 'date'
            ? data
                .map((d) => {
                  const timeKey = 'time' in d ? 'time' : Object.keys(d)[0]
                  const countKey = 'count' in d ? 'count' : Object.keys(d)[1]
                  const timeValue = d[timeKey as keyof typeof d] as string
                  const countValue = +(d[countKey as keyof typeof d] as string)
                  const parsedDate = d3.timeParse('%Y-%m-%d')(timeValue)
                  return {
                    time: parsedDate,
                    count: countValue
                  }
                })
                .filter((d) => d.time !== null)
            : data.map((d) => ({
                emails_per_day: d.emails_per_day ?? 0
              }))
        }
        chartType={chartType}
      />
    </div>
  )
}

export default DataDistribution
