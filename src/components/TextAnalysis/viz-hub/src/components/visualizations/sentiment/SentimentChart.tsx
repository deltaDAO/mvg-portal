'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { useDataStore } from '../../../store/dataStore'
import { useTheme } from '../../../store/themeStore'
import { TextAnalysisUseCaseData } from '@/@context/UseCases/models/TextAnalysis.model'

interface SentimentData {
  name: string
  values: [string, number][]
}

interface DateRange {
  start: Date
  end: Date
}

interface FormattedDataPoint {
  date: Date
  value: number
}

interface FormattedSeries {
  name: string
  values: FormattedDataPoint[]
}

// Utility function to decimate data points
const decimateData = (
  data: FormattedDataPoint[],
  maxPoints: number
): FormattedDataPoint[] => {
  if (data.length <= maxPoints) return data

  const decimated: FormattedDataPoint[] = []

  decimated.push(data[0])

  for (let i = 1; i < maxPoints - 1; i++) {
    const bucketStart = Math.floor((i * data.length) / maxPoints)
    const bucketEnd = Math.floor(((i + 1) * data.length) / maxPoints)

    let maxPoint = data[bucketStart]
    let maxValue = data[bucketStart].value

    for (let j = bucketStart; j < bucketEnd; j++) {
      if (data[j].value > maxValue) {
        maxValue = data[j].value
        maxPoint = data[j]
      }
    }

    decimated.push(maxPoint)
  }

  decimated.push(data[data.length - 1])

  return decimated
}

// Debounce function
const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  wait: number
) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<F>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface SentimentChartProps {
  skipLoading?: boolean
  data: TextAnalysisUseCaseData[]
}

const SentimentChart = ({ skipLoading = false, data }: SentimentChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const brushRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(0)
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [loading, setLoading] = useState(true)
  const tooltipRef = useRef<d3.Selection<
    HTMLDivElement,
    unknown,
    null,
    undefined
  > | null>(null)
  const verticalLineRef = useRef<d3.Selection<
    SVGLineElement,
    unknown,
    null,
    undefined
  > | null>(null)
  const { theme } = useTheme()

  const { fetchSentimentData } = useDataStore()

  const parseTime = useCallback(
    () => d3.timeParse('%Y-%m-%dT%H:%M:%SZ') as (date: string) => Date | null,
    []
  )
  const formatDate = useCallback(
    () => d3.timeFormat('%b %d, %Y') as (date: Date) => string,
    []
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const sentimentData: SentimentData[] = await fetchSentimentData(data)

        sentimentData.sort((a, b) => {
          const aNum = parseInt(a.name.replace('+', ''))
          const bNum = parseInt(b.name.replace('+', ''))
          return aNum - bNum
        })

        setSentimentData(sentimentData)

        const allDates = sentimentData
          .flatMap((d) => d.values.map((v) => parseTime()(v[0])))
          .filter((d): d is Date => d !== null)

        if (allDates.length > 0) {
          const extent = d3.extent(allDates) as [Date, Date]
          setDateRange({ start: extent[0], end: extent[1] })
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading sentiment data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [parseTime, fetchSentimentData])

  useEffect(() => {
    if (!chartRef.current) return

    setChartWidth(chartRef.current.clientWidth)

    const handleResize = debounce(() => {
      if (chartRef.current) {
        setChartWidth(chartRef.current.clientWidth)
      }
    }, 150)

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [chartRef])

  const renderChart = useCallback(() => {
    if (!chartRef.current || !dateRange) return

    const container = d3.select(chartRef.current)

    // Set theme-aware colors
    const textColor = theme === 'dark' ? '#e5e7eb' : '#4b5563' // gray-200 : gray-600
    const mutedTextColor = theme === 'dark' ? '#9ca3af' : '#6b7280' // gray-400 : gray-500
    const axisColor = theme === 'dark' ? '#4b5563' : '#d1d5db' // gray-600 : gray-300
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb' // gray-700 : gray-200
    const tooltipBg =
      theme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)' // gray-800 : white
    const tooltipBorder = theme === 'dark' ? '#4b5563' : '#d1d5db' // gray-600 : gray-300
    const tooltipTextColor = theme === 'dark' ? '#e5e7eb' : '#4b5563' // gray-200 : gray-600

    if (!tooltipRef.current) {
      tooltipRef.current = container
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', tooltipBg)
        .style('border', `1px solid ${tooltipBorder}`)
        .style('border-radius', '4px')
        .style('padding', '8px')
        .style(
          'box-shadow',
          `2px 2px 6px ${
            theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)'
          }`
        )
        .style('pointer-events', 'none')
        .style('font-size', '12px')
        .style('z-index', '10')
        .style('color', tooltipTextColor)
        .style('transition', 'left 0.15s ease-out, top 0.15s ease-out')
    } else {
      tooltipRef.current
        .style('background-color', tooltipBg)
        .style('border', `1px solid ${tooltipBorder}`)
        .style(
          'box-shadow',
          `2px 2px 6px ${
            theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)'
          }`
        )
        .style('color', tooltipTextColor)
    }

    container.selectAll('svg').remove()

    const margin = { top: 40, right: 40, bottom: 40, left: 50 }
    const width = chartRef.current.clientWidth - margin.left - margin.right
    const chartCount = sentimentData.length
    const chartHeight = 70
    const spacing = 15
    const totalHeight =
      chartHeight * chartCount +
      spacing * (chartCount - 1) +
      margin.top +
      margin.bottom

    if (width <= 0) return

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', totalHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const formattedData: FormattedSeries[] = sentimentData.map((d) => ({
      name: d.name,
      values: d.values
        .map((v) => {
          const date = parseTime()(v[0])
          return {
            date: date!,
            value: v[1]
          }
        })
        .filter(
          (point) =>
            point.date !== null &&
            point.date >= dateRange.start &&
            point.date <= dateRange.end
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime())
    }))

    const maxPointsPerLine = Math.max(100, Math.floor(width / 3))
    const decimatedData = formattedData.map((series) => ({
      name: series.name,
      values: decimateData(series.values, maxPointsPerLine)
    }))

    if (
      decimatedData.length === 0 ||
      decimatedData.every((d) => d.values.length === 0)
    ) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', totalHeight / 2)
        .attr('text-anchor', 'middle')
        .style('fill', textColor)
        .text('No data points in the selected date range')
      return
    }

    const x = d3
      .scaleTime()
      .domain([dateRange.start, dateRange.end])
      .range([0, width])

    decimatedData.forEach((series, i) => {
      const yPos = i * (chartHeight + spacing)

      const maxValue = d3.max(series.values, (d) => d.value) || 1

      const y = d3
        .scaleLinear()
        .domain([0, maxValue * 1.1])
        .range([chartHeight, 0])
        .nice()

      svg
        .append('defs')
        .append('clipPath')
        .attr('id', `clip-${i}`)
        .append('rect')
        .attr('width', width)
        .attr('height', chartHeight)

      const chartGroup = svg
        .append('g')
        .attr('transform', `translate(0,${yPos})`)
        .attr('clip-path', `url(#clip-${i})`)

      svg
        .append('rect')
        .attr('x', 0)
        .attr('y', yPos)
        .attr('width', width)
        .attr('height', chartHeight)
        .style('fill', 'none')
        .style('stroke', gridColor)
        .style('stroke-width', 0.25)

      svg
        .append('text')
        .attr('x', -15)
        .attr('y', yPos + chartHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'text-xs font-medium')
        .style('fill', getSentimentColor(String(series.name), theme))
        .text(series.name)

      const sentimentLabel = () => {
        switch (series.name) {
          case '-2':
            return 'Very Negative'
          case '-1':
            return 'Negative'
          case '0':
            return 'Neutral'
          case '1':
          case '+1':
            return 'Positive'
          case '2':
          case '+2':
            return 'Very Positive'
          default:
            return ''
        }
      }

      svg
        .append('text')
        .attr('x', 10)
        .attr('y', yPos + 15)
        .attr('class', 'text-xs')
        .style('opacity', 0.7)
        .style('fill', getSentimentColor(String(series.name), theme))
        .text(sentimentLabel())

      const gradientId = `gradient-${i}`
      const gradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%')

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', getSentimentColor(String(series.name), theme))
        .attr('stop-opacity', 0.95)

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', getSentimentColor(String(series.name), theme))
        .attr('stop-opacity', 0.6)

      const area = d3
        .area<FormattedDataPoint>()
        .x((d) => x(d.date))
        .y0(chartHeight)
        .y1((d) => y(d.value))
        .curve(d3.curveBasis)
        .defined((d) => !isNaN(d.value))

      chartGroup
        .append('path')
        .datum(series.values)
        .attr('class', 'area')
        .attr('d', area)
        .style('fill', `url(#${gradientId})`)
        .style('opacity', 0.9)
        .style('stroke', 'none')

      chartGroup
        .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', chartHeight)
        .attr('y2', chartHeight)
        .style('stroke', gridColor)
        .style('stroke-width', 0.5)
    })

    svg
      .append('g')
      .attr(
        'transform',
        `translate(0,${chartCount * (chartHeight + spacing) - spacing})`
      )
      .call(
        d3
          .axisBottom(x)
          .ticks(width > 600 ? 6 : 4)
          .tickSize(5)
          .tickFormat((d: Date | d3.NumberValue) => {
            if (d instanceof Date) {
              return d3.timeFormat('%Y')(d)
            }
            return ''
          })
      )
      .attr('class', 'text-xs')
      .call((g) =>
        g.select('.domain').attr('stroke-width', 0.5).attr('stroke', axisColor)
      )
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('stroke-width', 0.5)
          .attr('stroke', axisColor)
      )
      .call((g) => g.selectAll('.tick text').attr('fill', textColor))

    const monthsPerYear = width > 800 ? 4 : width > 600 ? 3 : 2
    const startYear = dateRange.start.getFullYear()
    const endYear = dateRange.end.getFullYear()

    const timeLabels: Date[] = []

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month += 12 / monthsPerYear) {
        const labelDate = new Date(year, month, 1)
        if (labelDate >= dateRange.start && labelDate <= dateRange.end) {
          timeLabels.push(labelDate)
        }
      }
    }

    timeLabels.forEach((date) => {
      svg
        .append('text')
        .attr('x', x(date))
        .attr('y', chartCount * (chartHeight + spacing) - spacing + 25)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-xs')
        .style('fill', mutedTextColor)
        .text(d3.timeFormat('%b')(date))
    })

    const verticalLine = svg
      .append('line')
      .attr('class', 'vertical-line')
      .style('stroke', theme === 'dark' ? '#9ca3af' : '#999')
      .style('stroke-width', '1px')
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0)
      .attr('y1', 0)
      .attr('y2', chartCount * (chartHeight + spacing) - spacing)

    verticalLineRef.current = verticalLine

    const mouseArea = svg
      .append('rect')
      .attr('width', width)
      .attr('height', chartCount * (chartHeight + spacing) - spacing)
      .style('fill', 'none')
      .style('pointer-events', 'all')

    const dateValues = new Map<number, Map<string, number>>()

    decimatedData.forEach((series) => {
      series.values.forEach((point) => {
        const timestamp = point.date.getTime()
        if (!dateValues.has(timestamp)) {
          dateValues.set(timestamp, new Map<string, number>())
        }

        dateValues.get(timestamp)?.set(series.name, point.value)
      })
    })

    const sortedTimestamps = Array.from(dateValues.keys()).sort((a, b) => a - b)

    let lastMove = 0
    const throttleDelay = 30

    mouseArea
      .on('mouseover', () => {
        if (tooltipRef.current)
          tooltipRef.current.style('visibility', 'visible')
        verticalLine.style('opacity', 1)
      })
      .on('mousemove', (event) => {
        const now = Date.now()
        if (now - lastMove < throttleDelay) return
        lastMove = now

        const [mouseX] = d3.pointer(event)

        if (sortedTimestamps.length === 0) return

        const mouseDate = x.invert(mouseX).getTime()
        let left = 0
        let right = sortedTimestamps.length - 1
        let closestIndex = 0

        while (left <= right) {
          const mid = Math.floor((left + right) / 2)
          if (
            Math.abs(sortedTimestamps[mid] - mouseDate) <
            Math.abs(sortedTimestamps[closestIndex] - mouseDate)
          ) {
            closestIndex = mid
          }

          if (sortedTimestamps[mid] < mouseDate) {
            left = mid + 1
          } else {
            right = mid - 1
          }
        }

        const selectedTimestamp = sortedTimestamps[closestIndex]
        const selectedDate = new Date(selectedTimestamp)

        verticalLine.attr('x1', x(selectedDate)).attr('x2', x(selectedDate))

        const tooltipHeaderColor = theme === 'dark' ? '#d1d5db' : '#555' // gray-300 : dark gray
        let tooltipContent = `<div class="font-medium text-xs mb-1" style="color:${tooltipHeaderColor};">${formatDate()(
          selectedDate
        )}</div>`

        tooltipContent += `<div class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">`

        decimatedData.forEach((series) => {
          const seriesValues = dateValues.get(selectedTimestamp)
          const value = seriesValues?.get(series.name) ?? 0

          tooltipContent += `
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 mr-1" style="background-color: ${getSentimentColor(
                String(series.name),
                theme
              )};"></span>
              <span style="color:${tooltipHeaderColor};">Sentiment ${
            series.name
          }</span>
            </div>
            <div class="font-medium text-right">${value}</div>
          `
        })

        tooltipContent += `</div>`

        if (tooltipRef.current) {
          tooltipRef.current.html(tooltipContent)

          const tooltipNode = tooltipRef.current.node()
          const tooltipWidth = tooltipNode
            ? tooltipNode.getBoundingClientRect().width
            : 200

          const chartContainer = d3.select(chartRef.current).node()
          const containerWidth = chartContainer
            ? chartContainer.getBoundingClientRect().width
            : 0

          const spaceOnRight = containerWidth - event.offsetX
          const tooltipX =
            spaceOnRight < tooltipWidth + 20
              ? `${event.offsetX - tooltipWidth - 10}px`
              : `${event.offsetX + 15}px`

          tooltipRef.current
            .style('left', tooltipX)
            .style('top', `${event.offsetY - 28}px`)
        }
      })
      .on('mouseout', () => {
        if (tooltipRef.current) tooltipRef.current.style('visibility', 'hidden')
        verticalLine.style('opacity', 0)
      })
  }, [chartRef, dateRange, sentimentData, formatDate, theme])

  const renderBrush = useCallback(() => {
    if (!brushRef.current || !dateRange) return

    const container = d3.select(brushRef.current)
    container.selectAll('svg').remove()

    // Set theme-aware colors
    const textColor = theme === 'dark' ? '#e5e7eb' : '#4b5563' // gray-200 : gray-600
    const axisColor = theme === 'dark' ? '#4b5563' : '#ccc' // gray-600 : light gray
    const brushHandleColor = theme === 'dark' ? '#6b7280' : '#69b3a2' // gray-500 : teal
    const brushFillColor =
      theme === 'dark' ? 'rgba(107, 114, 128, 0.3)' : 'rgba(105, 179, 162, 0.3)' // gray-500 : teal with opacity

    const margin = { top: 10, right: 40, bottom: 20, left: 50 }
    const width = brushRef.current.clientWidth - margin.left - margin.right
    const height = 60 - margin.top - margin.bottom

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const allDates = sentimentData
      .flatMap((d) => d.values.map((v) => parseTime()(v[0])))
      .filter((d): d is Date => d !== null)

    const fullDateRange = d3.extent(allDates) as [Date, Date]

    const overviewData = sentimentData.map((series) => {
      const values = series.values
        .map((v) => ({
          date: parseTime()(v[0]),
          value: v[1]
        }))
        .filter((d): d is { date: Date; value: number } => d.date !== null)
        .sort((a, b) => a.date.getTime() - b.date.getTime())

      return {
        name: series.name,
        values: decimateData(values, 50)
      }
    })

    const x = d3.scaleTime().domain(fullDateRange).range([0, width])

    const maxValue =
      d3.max(overviewData, (d) => d3.max(d.values, (v) => v.value)) || 0

    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.05])
      .range([height, 0])

    const line = d3
      .line<{ date: Date; value: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5))

    overviewData.forEach((series) => {
      if (series.values.length > 0) {
        const area = d3
          .area<{ date: Date; value: number }>()
          .x((d) => x(d.date))
          .y0(height)
          .y1((d) => y(d.value))
          .curve(d3.curveCatmullRom.alpha(0.5))

        svg
          .append('path')
          .datum(series.values)
          .attr('class', 'mini-area')
          .attr('d', area as any)
          .style('fill', getSentimentColor(String(series.name), theme))
          .style('fill-opacity', 0.3)
          .style('stroke', getSentimentColor(String(series.name), theme))
          .style('stroke-width', 0.75)
          .style('stroke-opacity', 0.8)
      }
    })

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(5)
          .tickSize(-height)
          .tickFormat((d: Date | d3.NumberValue) => {
            if (d instanceof Date) {
              return d3.timeFormat('%b %Y')(d)
            }
            return ''
          })
      )
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('stroke', axisColor)
          .attr('stroke-dasharray', '2,2')
      )
      .call((g) =>
        g
          .selectAll('.tick text')
          .style('text-anchor', 'middle')
          .attr('dy', '1em')
          .attr('fill', textColor)
      )

    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [width, height]
      ])
      .on('brush', (event) => {
        if (!event.sourceEvent || !event.selection) return
      })
      .on('end', (event) => {
        if (!event.sourceEvent) return
        if (!event.selection) return

        const [x0, x1] = event.selection as [number, number]
        const newStart = x.invert(x0)
        const newEnd = x.invert(x1)

        setDateRange({ start: newStart, end: newEnd })
      })

    const brushGroup = svg.append('g').attr('class', 'brush').call(brush)

    if (dateRange) {
      brushGroup.call(brush.move, [x(dateRange.start), x(dateRange.end)])
    }

    svg
      .selectAll('.selection')
      .attr('fill', brushFillColor)
      .attr('stroke', brushHandleColor)

    svg
      .selectAll('.handle')
      .attr('fill', brushHandleColor)
      .attr('stroke', brushHandleColor)
      .attr('stroke-width', 0.5)

    const resetButton = container
      .append('button')
      .attr('class', 'reset-button')
      .style('position', 'absolute')
      .style('top', '10px')
      .style('right', '40px')
      .style('background-color', theme === 'dark' ? '#374151' : '#f3f4f6') // gray-700 : gray-100
      .style('border', `1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'}`) // gray-600 : gray-300
      .style('border-radius', '4px')
      .style('padding', '2px 8px')
      .style('font-size', '10px')
      .style('cursor', 'pointer')
      .style('color', theme === 'dark' ? '#e5e7eb' : 'inherit') // gray-200 : default
      .text('Reset Zoom')
      .on('click', () => {
        setDateRange({ start: fullDateRange[0], end: fullDateRange[1] })
      })
  }, [brushRef, dateRange, theme])

  useEffect(() => {
    renderChart()
    renderBrush()
  }, [renderChart, renderBrush])

  const getSentimentColor = (
    sentiment: string,
    currentTheme: string = 'light'
  ): string => {
    // Slightly adjust colors for dark mode to ensure visibility
    if (currentTheme === 'dark') {
      switch (sentiment) {
        case '-2':
          return '#63ccfa' // Brighter blue
        case '-1':
          return '#af8fe0' // Brighter purple
        case '0':
          return '#f3f4f6' // Light gray
        case '+1':
          return '#ffc069' // Brighter orange
        case '+2':
          return '#ff9f7b' // Brighter coral
        default:
          return '#f3f4f6' // Light gray
      }
    } else {
      switch (sentiment) {
        case '-2':
          return '#4fc3f7'
        case '-1':
          return '#9575cd'
        case '0':
          return '#e0e0e0'
        case '+1':
          return '#ffb74d'
        case '+2':
          return '#ff8a65'
        default:
          return '#e0e0e0'
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 w-full">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
        Sentiment Analysis by Category
      </h2>

      {loading && !skipLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-gray-500 dark:text-gray-400">
            Loading sentiment data...
          </p>
        </div>
      ) : (
        <>
          <div ref={chartRef} className="w-full relative"></div>

          <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 mb-1 ml-1">
            Drag to select date range:
          </div>

          <div ref={brushRef} className="w-full h-[65px] relative mt-2"></div>
        </>
      )}
    </div>
  )
}

export default SentimentChart
