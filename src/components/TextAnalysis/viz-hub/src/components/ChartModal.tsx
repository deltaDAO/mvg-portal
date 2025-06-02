'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

// Data types
type TimeDataPoint = {
  time: Date | null
  count: number
}

type EmailDataPoint = {
  emails_per_day?: number
  [key: string]: number | undefined
}

type ChartData = TimeDataPoint[] | EmailDataPoint[]

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  chartData: ChartData
  chartType: 'date' | 'email'
}

type MarginType = {
  top: number
  right: number
  bottom: number
  left: number
}

// D3 specific types
type D3ZoomBehavior = d3.ZoomBehavior<SVGSVGElement, unknown>
type D3Selection = d3.Selection<SVGSVGElement, unknown, null, undefined>

const ChartModal = ({
  isOpen,
  onClose,
  title,
  chartData,
  chartType
}: ChartModalProps) => {
  const modalChartRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<D3ZoomBehavior | null>(null)
  const marginRef = useRef<MarginType | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    if (
      !isOpen ||
      !modalChartRef.current ||
      !chartData ||
      chartData.length === 0
    )
      return

    const container = modalChartRef.current
    const margin = { top: 40, right: 60, bottom: 80, left: 70 }
    const width = container.clientWidth - margin.left - margin.right
    const height = container.clientHeight - margin.top - margin.bottom

    // Clear any existing chart
    d3.select(container).selectAll('*').remove()

    // Create base SVG
    const baseSvg = d3
      .select(container)
      .append('svg')
      .attr('width', container.clientWidth)
      .attr('height', container.clientHeight)

    const chartGroup = baseSvg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Set initial transform
    const initialScale = 0.85 // Slightly zoomed out to show all labels
    const initialX = margin.left
    const initialY = margin.top - 20 // Move up slightly to show bottom labels better

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        chartGroup.attr(
          'transform',
          `translate(${margin.left + event.transform.x},${
            margin.top + event.transform.y
          }) scale(${event.transform.k})`
        )
        setZoomLevel(event.transform.k)
      })

    // Store zoom behavior and margins in ref for external control
    zoomRef.current = zoom
    marginRef.current = margin

    // Apply zoom behavior
    baseSvg
      .call(zoom)
      .on('dblclick.zoom', null)
      .style('cursor', 'grab')
      .on('mousedown', function () {
        d3.select(this).style('cursor', 'grabbing')
      })
      .on('mouseup', function () {
        d3.select(this).style('cursor', 'grab')
      })

    // Apply initial transform
    baseSvg.call(
      zoom.transform,
      d3.zoomIdentity.translate(initialX, initialY).scale(initialScale)
    )

    // Update zoom level display
    setZoomLevel(initialScale)

    if (chartType === 'date') {
      // Date distribution chart
      const formattedData = (chartData as TimeDataPoint[]).filter(
        (d) => d.time !== null
      )

      // Set up scales
      const timeExtent = d3.extent(formattedData, (d) => d.time)
      const xDomain: [Date, Date] = [
        timeExtent[0] ? new Date(timeExtent[0]) : new Date(),
        timeExtent[1] ? new Date(timeExtent[1]) : new Date()
      ]

      const x = d3.scaleTime().domain(xDomain).range([0, width])

      const maxCount = d3.max(formattedData, (d) => Number(d.count)) || 10
      const y = d3.scaleLinear().domain([0, maxCount]).nice().range([height, 0])

      // Add X axis with more space for labels
      const xAxis = chartGroup
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
        .attr('dy', '1em')

      // Add Y axis
      chartGroup.append('g').call(d3.axisLeft(y))

      // Sort data by date for smoother line
      formattedData.sort((a, b) => a.time!.getTime() - b.time!.getTime())

      // Add area under the line with gradient
      const areaGradient = chartGroup
        .append('defs')
        .append('linearGradient')
        .attr('id', 'area-gradient')
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
        .area<TimeDataPoint>()
        .defined((d) => !isNaN(d.count))
        .x((d) => x(d.time!))
        .y0(height)
        .y1((d) => y(d.count))
        .curve(d3.curveCatmullRom.alpha(0.5)) // Smoother curve

      // Add the area
      chartGroup
        .append('path')
        .datum(formattedData)
        .attr('fill', 'url(#area-gradient)')
        .attr('d', area)

      // Add line with smoother curve
      const line = d3
        .line<TimeDataPoint>()
        .defined((d) => !isNaN(d.count))
        .x((d) => x(d.time!))
        .y((d) => y(d.count))
        .curve(d3.curveCatmullRom.alpha(0.5)) // Smoother curve

      chartGroup
        .append('path')
        .datum(formattedData)
        .attr('fill', 'none')
        .attr('stroke', '#4F46E5') // Indigo color for line
        .attr('stroke-width', 2.5)
        .attr('d', line)

      // Add points with hover effect
      const dots = chartGroup
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

      // Add tooltip
      const tooltip = d3
        .select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 10)
        .style('box-shadow', '0 2px 10px rgba(0,0,0,0.2)')
        .style('max-width', '200px')
        .style('transition', 'opacity 0.2s')

      // Add hover effects
      dots
        .on(
          'mouseover',
          function (
            this: SVGCircleElement,
            event: MouseEvent,
            d: TimeDataPoint
          ) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', 6)
              .attr('opacity', 1)

            const date = d.time!.toLocaleDateString()
            const svgRect = container.getBoundingClientRect()
            const circleRect = this.getBoundingClientRect()

            const tooltipX = circleRect.right - svgRect.left + 5
            const tooltipY = circleRect.top - svgRect.top - 10

            const tooltipWidth = 150 // Approximate width
            if (tooltipX + tooltipWidth > svgRect.width) {
              tooltip
                .style(
                  'left',
                  circleRect.left - svgRect.left - tooltipWidth - 5 + 'px'
                )
                .style('top', tooltipY + 'px')
            } else {
              tooltip
                .style('left', tooltipX + 'px')
                .style('top', tooltipY + 'px')
            }

            tooltip
              .html(`Date: ${date}<br>Count: ${d.count}`)
              .style('opacity', 1)
          }
        )
        .on('mouseout', function () {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 3)
            .attr('opacity', 0.8)

          tooltip.style('opacity', 0)
        })

      // Add labels
      chartGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Date')
        .attr('class', 'text-sm text-gray-600')

      chartGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Count')
        .attr('class', 'text-sm text-gray-600')
    } else if (chartType === 'email') {
      // Emails per day histogram
      const getEmailValue = (d: EmailDataPoint): number => {
        if ('emails_per_day' in d) {
          return +d.emails_per_day!
        }
        const firstKey = Object.keys(d)[0]
        return +d[firstKey]!
      }

      const values = (chartData as EmailDataPoint[])
        .map(getEmailValue)
        .filter((v) => !isNaN(v))

      if (values.length === 0) {
        console.error('No valid email count values found')
        container.innerHTML =
          '<p class="text-red-500 text-center">Error: Could not parse email count data</p>'
        return
      }

      // Create histogram data
      const maxValue = Number(d3.max(values)) || 10
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

      // Add X axis with more space for labels
      chartGroup
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(Math.min(maxValue + 1, 15))
            .tickFormat(d3.format('d'))
        )
        .selectAll('text')
        .style('text-anchor', 'middle')
        .attr('dy', '1em')

      // Add Y axis
      chartGroup.append('g').call(d3.axisLeft(y).ticks(5))

      // Add gradient for bars
      const barGradient = chartGroup
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

      // Add tooltip
      const tooltip = d3
        .select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 10)
        .style('box-shadow', '0 2px 10px rgba(0,0,0,0.2)')
        .style('max-width', '200px')
        .style('transition', 'opacity 0.2s')

      // Add bars with hover effect and tooltip
      const bars = chartGroup
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

      // Add hover effect with tooltip
      bars
        .on(
          'mouseover',
          function (
            this: SVGRectElement,
            event: MouseEvent,
            d: d3.Bin<number, number>
          ) {
            d3.select(this).transition().duration(200).attr('opacity', 1)

            const [mouseX, mouseY] = d3.pointer(event, container)

            tooltip
              .html(`Emails: ${d.x0} - ${d.x1}<br>Count: ${d.length}`)
              .style('left', mouseX + 10 + 'px')
              .style('top', mouseY - 25 + 'px')
              .style('opacity', 1)
          }
        )
        .on('mouseout', function () {
          d3.select(this).transition().duration(200).attr('opacity', 0.9)

          tooltip.style('opacity', 0)
        })

      // Add labels
      chartGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Emails per Day')
        .attr('class', 'text-sm text-gray-600')

      chartGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -height / 2)
        .text('Frequency')
        .attr('class', 'text-sm text-gray-600')
    }
  }, [isOpen, chartData, chartType, title])

  // Handle zoom in
  const handleZoomIn = () => {
    if (zoomRef.current && modalChartRef.current) {
      const baseSvg = d3
        .select(modalChartRef.current)
        .select('svg') as D3Selection
      const currentTransform = d3.zoomTransform(baseSvg.node() as SVGSVGElement)
      baseSvg.call(
        zoomRef.current.transform as unknown as (
          selection: D3Selection,
          transform: d3.ZoomTransform
        ) => void,
        currentTransform.scale(currentTransform.k * 1.2)
      )
    }
  }

  // Handle zoom out
  const handleZoomOut = () => {
    if (zoomRef.current && modalChartRef.current) {
      const baseSvg = d3
        .select(modalChartRef.current)
        .select('svg') as D3Selection
      const currentTransform = d3.zoomTransform(baseSvg.node() as SVGSVGElement)
      baseSvg.call(
        zoomRef.current.transform as unknown as (
          selection: D3Selection,
          transform: d3.ZoomTransform
        ) => void,
        currentTransform.scale(currentTransform.k * 0.8)
      )
    }
  }

  // Handle reset zoom
  const handleResetZoom = () => {
    if (zoomRef.current && modalChartRef.current && marginRef.current) {
      const baseSvg = d3
        .select(modalChartRef.current)
        .select('svg') as D3Selection
      const margin = marginRef.current
      baseSvg.call(
        zoomRef.current.transform as unknown as (
          selection: D3Selection,
          transform: d3.ZoomTransform
        ) => void,
        d3.zoomIdentity.translate(margin.left, margin.top - 20).scale(0.85)
      )
    }
  }

  // Toggle tips visibility
  const toggleTips = () => {
    const tipElement = document.getElementById('chart-tip')
    if (tipElement) {
      tipElement.classList.toggle('hidden')

      // Update button text
      const tipButton = document.querySelector('[data-tip-button]')
      if (tipButton) {
        tipButton.textContent = tipElement.classList.contains('hidden')
          ? 'Show Tips'
          : 'Hide Tips'
      }
    }
  }

  if (!isOpen) return null

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-[1400px] h-[700px] flex flex-col overflow-hidden">
            {/* Header - Made more compact */}
            <div className="flex justify-between items-center px-8 py-3 bg-gray-50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-medium text-gray-800">{title}</h2>
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                  Zoom: {Math.round(zoomLevel * 100)}%
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center justify-center"
                title="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Main content area */}
            <div className="relative flex-grow overflow-hidden">
              <div
                ref={modalChartRef}
                className="absolute inset-0 bg-white px-8 py-6"
              >
                {/* Chart will be rendered here */}
              </div>

              {/* Zoom controls - Moved to top right */}
              <div className="absolute top-4 right-8 flex items-center gap-2 z-10">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-gray-50 rounded-md transition-colors text-gray-600 hover:text-gray-800 cursor-pointer"
                  title="Zoom In"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-gray-50 rounded-md transition-colors text-gray-600 hover:text-gray-800 cursor-pointer"
                  title="Zoom Out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 hover:bg-gray-50 rounded-md transition-colors text-gray-600 hover:text-gray-800 cursor-pointer"
                  title="Reset Zoom"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Footer with Tips */}
            <div className="px-8 py-3 bg-gray-50 flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700 flex items-center relative">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Chart Navigation
                {/* Popup Tips */}
                <div
                  id="chart-tip"
                  className="hidden absolute bottom-8 left-0 text-xs text-gray-700 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64 z-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-800">
                      Chart Navigation Tips
                    </div>
                    <button
                      onClick={toggleTips}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Drag to pan around the chart</li>
                    <li>Use mouse wheel to zoom in and out</li>
                    <li>Use the + and - buttons for precise zoom control</li>
                    <li>Click the home button to reset the view</li>
                    <li>Hover over data points for detailed information</li>
                  </ul>
                  <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-200"></div>
                </div>
              </div>

              <div>
                <button
                  onClick={toggleTips}
                  data-tip-button
                  className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                >
                  Show Tips
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChartModal
