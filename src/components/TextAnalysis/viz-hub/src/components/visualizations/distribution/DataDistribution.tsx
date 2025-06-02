'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import ChartModal from './ChartModal'
import ChartSkeleton from '../../ui/common/ChartSkeleton'
import ChartError from '../../ui/common/ChartError'
import { useDataStore } from '../../../store/dataStore'
import { useTheme } from '../../../store/themeStore'

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
  const { theme } = useTheme()

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

  // Render chart when data is available or theme changes
  useEffect(() => {
    if (!data.length || !chartRef.current) return

    // Clear any existing chart
    d3.select(chartRef.current).selectAll('*').remove()

    const container = chartRef.current

    // Ensure container has a unique ID for styling
    if (!container.id) {
      container.id = `chart-${Math.random().toString(36).substr(2, 9)}`
    }

    const margin = { top: 20, right: 30, bottom: 60, left: 50 }
    const width = container.clientWidth - margin.left - margin.right
    const height = container.clientHeight - margin.top - margin.bottom

    // Set colors based on theme
    const textColor = theme === 'dark' ? '#e5e7eb' : '#4b5563' // gray-200 : gray-600
    const titleColor = theme === 'dark' ? '#d1d5db' : '#374151' // gray-300 : gray-700
    const strokeColor = theme === 'dark' ? '#1f2937' : '#ffffff' // gray-800 : white
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb' // gray-700 : gray-200
    const axisColor = theme === 'dark' ? '#6b7280' : '#9ca3af' // gray-500 : gray-400
    const primaryColor = '#4F46E5' // Indigo color for both themes
    const pointColor = '#F59E0B' // Amber color for data points

    // Add CSS to style the axes based on theme
    const style = document.createElement('style')
    style.textContent = `
      #${container.id} .domain,
      #${container.id} .tick line {
        stroke: ${axisColor};
      }
      #${container.id} .tick text {
        fill: ${textColor};
      }
    `
    document.head.appendChild(style)

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
          '<p class="text-red-500 dark:text-red-400 text-center">Error: Could not parse date data</p>'
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
        .style('fill', textColor)

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
        .attr('stop-color', primaryColor)
        .attr('stop-opacity', 0.3)

      areaGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', primaryColor)
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
        .attr('stroke', primaryColor) // Indigo color for line
        .attr('stroke-width', 2.5)
        .attr('d', line)

      // Add points
      svg
        .selectAll('.dot')
        .data(formattedData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => x(d.time!))
        .attr('cy', (d) => y(d.count))
        .attr('r', 3) // Smaller points
        .attr('fill', pointColor) // Amber color for points
        .attr('stroke', strokeColor)
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.8)

      // Add labels with theme-aware colors
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Date')
        .style('fill', textColor)
        .attr('class', 'text-sm')

      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Count')
        .style('fill', textColor)
        .attr('class', 'text-sm')

      // Add title with theme-aware color
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', -5)
        .text('Email Count Over Time')
        .style('fill', titleColor)
        .attr('class', 'text-xs font-semibold')
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
          '<p class="text-red-500 dark:text-red-400 text-center">Error: Could not parse email count data</p>'
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
        .attr('stop-color', primaryColor)
        .attr('stop-opacity', 0.9)

      barGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', primaryColor)
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
        .attr('stroke', strokeColor)
        .attr('stroke-width', 0.5)

      // Add labels with theme-aware colors
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Emails per Day')
        .style('fill', textColor)
        .attr('class', 'text-sm')

      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Frequency')
        .style('fill', textColor)
        .attr('class', 'text-sm')

      // Add title with theme-aware color
      svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', -5)
        .text('Distribution of Emails per Day')
        .style('fill', titleColor)
        .attr('class', 'text-xs font-semibold')
    } else {
      console.warn('Could not determine chart type:', { data, type })
      container.innerHTML =
        '<p class="text-red-500 dark:text-red-400 text-center">Error: Could not determine chart type</p>'
    }

    return () => {
      if (style.parentNode) {
        document.head.removeChild(style)
      }
    }
  }, [data, chartType, type, theme])

  // Handle opening the modal
  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 w-full">
      <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        {data.length > 0 && !loading && !error && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center p-1.5 rounded-md text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer relative group"
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
            <span className="absolute -bottom-8 right-0 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Expand
            </span>
          </button>
        )}
      </div>
      {description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      )}

      <div
        ref={chartRef}
        id={`chart-container-${chartType}`}
        className="w-full h-64 bg-gray-50 dark:bg-gray-900 rounded flex items-center justify-center cursor-pointer"
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
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
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
