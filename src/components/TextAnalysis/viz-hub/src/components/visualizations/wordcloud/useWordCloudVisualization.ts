import {
  useEffect,
  useRef,
  useCallback,
  MutableRefObject,
  useState
} from 'react'
import * as d3 from 'd3'
import cloud from 'd3-cloud'
import debounce from 'lodash/debounce'
import { WordData, CloudWord, Word, Dimensions, ColorScheme } from './types'
import { TRANSITION_DURATION, DEBOUNCE_DELAY, CUSTOM_COLORS } from './constants'
import { useTheme } from '../../../store/themeStore'

interface UseWordCloudVisualizationProps {
  svgRef: MutableRefObject<SVGSVGElement | null>
  words: WordData[]
  dimensions: Dimensions
  fontFamily: string
  colorSelection: ColorScheme
  isLoading: boolean
  selectedWordRef: MutableRefObject<WordData | null>
  isPanelVisibleRef: MutableRefObject<boolean>
  shouldUpdateLayoutRef: MutableRefObject<boolean>
  modalsOpenRef: MutableRefObject<boolean>
  isWordSelectionActionRef: MutableRefObject<boolean>
  onWordSelect: (word: WordData) => void
}

interface WordCloudData {
  text: string
  value: number
  size: number
  color?: string
  x?: number
  y?: number
  rotate?: number
}

interface CloudWord extends WordCloudData {
  x: number
  y: number
  rotate: number
}

// Convert WordData to WordCloudData
const convertToWordCloudData = (word: WordData): WordCloudData => ({
  text: word.value,
  value: word.count,
  size: Math.max(20, Math.min(60, word.count * 2)), // Scale size based on count
  color: undefined // Will be set by the theme
})

export const useWordCloudVisualization = ({
  svgRef,
  words,
  dimensions,
  fontFamily,
  colorSelection,
  isLoading,
  selectedWordRef,
  isPanelVisibleRef,
  shouldUpdateLayoutRef,
  modalsOpenRef,
  isWordSelectionActionRef,
  onWordSelect
}: UseWordCloudVisualizationProps) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const wordColorsRef = useRef<Record<string, string>>({})
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const svgInitializedRef = useRef(false)
  const previousWordsRef = useRef<CloudWord[]>([])
  const dimensionsRef = useRef({
    width: dimensions.width,
    height: dimensions.height,
    lastUpdate: 0
  })

  // Get theme information
  const { theme } = useTheme()

  // Add a ref to track the last update time to prevent duplicate renders
  const lastUpdateTimeRef = useRef<number>(0)
  // Add a cache key to identify unique render requests
  const renderRequestRef = useRef<string>('')
  // Minimum time between full renders in milliseconds
  const RENDER_THROTTLE_MS = 300

  // Use a ref to track if a render is in progress
  const renderInProgressRef = useRef<boolean>(false)
  // Track render count for debugging
  const renderCountRef = useRef<number>(0)

  // Get color for a word
  const getWordColor = useCallback(
    (d: CloudWord) => {
      // For random colors, ensure consistency by storing in ref
      if (colorSelection === 'random') {
        if (!wordColorsRef.current[d.text]) {
          wordColorsRef.current[d.text] =
            CUSTOM_COLORS[Math.floor(Math.random() * CUSTOM_COLORS.length)]
        }
        return wordColorsRef.current[d.text]
      }

      const maxCount = Math.max(...words.map((w) => w.count))
      const ratio = (d.originalData?.count || 0) / maxCount

      switch (colorSelection) {
        case 'monochrome':
          return `rgba(0, 0, 255, ${0.3 + ratio * 0.7})`
        case 'category':
          // Use the selected color palette for categorical coloring
          const colorIndex = Math.floor(ratio * CUSTOM_COLORS.length)
          return CUSTOM_COLORS[Math.min(colorIndex, CUSTOM_COLORS.length - 1)]
        default:
          return wordColorsRef.current[d.text] || '#333333'
      }
    },
    [colorSelection, words]
  )

  // Create word cloud layout
  const createWordCloudLayout = useCallback(
    (words: WordData[]): Promise<CloudWord[]> => {
      return new Promise((resolve) => {
        // Make sure we have valid dimensions before creating layout
        const width = dimensions?.width || 500
        const height = dimensions?.height || 400

        const fontScale = d3
          .scaleLog()
          .domain([
            Math.min(...words.map((w) => w.count)),
            Math.max(...words.map((w) => w.count))
          ])
          .range([12, 50])

        const layout = cloud<Word>()
          .size([width, height])
          .words(
            words.map((w) => ({
              text: w.value,
              size: fontScale(w.count),
              originalData: w
            }))
          )
          .padding(3)
          .rotate((d: Word) => {
            // Only use 90-degree multiples for rotation (0, 90, 270)
            // Long words (more than 5 characters) always display horizontally (0 degrees)
            if (d.text.length > 5) return 0

            // For short words, randomly select one of the 90-degree multiples
            const rotations = [0, 90, 270]
            return rotations[Math.floor(Math.random() * rotations.length)]
          })
          .font(fontFamily)
          .fontSize((d: Word) => d.size)

        layout.on('end', resolve)
        layout.start()
      })
    },
    [dimensions, fontFamily]
  )

  // Update word cloud when words change
  const debouncedUpdate = useCallback(
    debounce((words: WordData[]) => {
      if (!svgRef.current || words.length === 0) return

      const svg = d3.select(svgRef.current)
      const wordsGroup = svg.select('.words-group')

      // Clear previous words
      wordsGroup.selectAll('*').remove()

      // Convert words to WordCloudData
      const cloudWords = words.map(convertToWordCloudData)

      // Create word cloud layout
      const layout = cloud()
        .size([dimensions.width, dimensions.height])
        .words(cloudWords)
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .font('Inter')
        .fontSize((d) => (d as WordCloudData).size || 0)
        .on('end', (words: CloudWord[]) => {
          // Draw words
          wordsGroup
            .selectAll('text')
            .data(words)
            .enter()
            .append('text')
            .style('font-size', (d) => `${d.size}px`)
            .style('font-family', 'Inter')
            .style('fill', (d) => d.color || '#000')
            .attr('text-anchor', 'middle')
            .attr(
              'transform',
              (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`
            )
            .text((d) => d.text)
            .style('cursor', 'pointer')
            .on('mouseover', function (event, d) {
              d3.select(this)
                .transition()
                .duration(200)
                .style('font-weight', 'bold')
                .style('fill', d.color || '#000')
            })
            .on('mouseout', function (event, d) {
              d3.select(this)
                .transition()
                .duration(200)
                .style('font-weight', 'normal')
                .style('fill', d.color || '#000')
            })
            .on('click', (event, d) => {
              if (onWordSelect) {
                // Convert back to WordData for the callback
                onWordSelect({
                  value: d.text,
                  count: d.value
                })
              }
            })
        })

      // Start the layout
      layout.start()
    }, 100),
    [dimensions, onWordSelect]
  )

  // Initialize SVG with responsive container
  useEffect(() => {
    if (!svgRef.current) return

    // Avoid repeated initialization of SVG structure when not needed
    if (
      svgInitializedRef.current &&
      // Only reinitialize if dimensions actually changed significantly
      Math.abs(dimensions.width - svgRef.current.width.baseVal.value) < 5 &&
      Math.abs(dimensions.height - svgRef.current.height.baseVal.value) < 5
    ) {
      return
    }

    svgInitializedRef.current = true

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    // Theme-aware colors
    const bgColorStart = theme === 'dark' ? '#1f2937' : '#f8f9fa' // gray-800 : gray-100
    const bgColorEnd = theme === 'dark' ? '#111827' : '#e9ecef' // gray-900 : gray-200
    const textColor = theme === 'dark' ? '#e5e7eb' : '#555' // gray-200 : dark gray
    const controlsBgColor =
      theme === 'dark' ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.7)' // gray-800 : white with opacity
    const controlsBorderColor = theme === 'dark' ? '#4b5563' : '#ccc' // gray-600 : light gray
    const buttonFillColor = theme === 'dark' ? '#374151' : '#ffffff80' // gray-700 : white with opacity
    const buttonStrokeColor = theme === 'dark' ? '#6b7280' : '#aaa' // gray-500 : light gray
    const buttonHoverFill = theme === 'dark' ? '#4b5563' : '#f8f8f8' // gray-600 : near white
    const buttonHoverStroke = theme === 'dark' ? '#9ca3af' : '#666' // gray-400 : dark gray
    const buttonActiveColor = theme === 'dark' ? '#374151' : '#e8e8e8' // gray-700 : light gray

    // Add gradient background
    const defs = svg.append('defs')
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'cloud-background')
      .attr('gradientTransform', 'rotate(45)')

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', bgColorStart)
    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', bgColorEnd)

    // Add background rect
    svg
      .append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#cloud-background)')

    // Create words container
    const wordsContainer = svg
      .append('g')
      .attr('class', 'words-container')
      .attr('width', '100%')
      .attr('height', '100%')

    // Create words group
    wordsContainer
      .append('g')
      .attr('class', 'words-group')
      .attr(
        'transform',
        `translate(${dimensions.width / 2},${dimensions.height / 2})`
      )

    // Initialize zoom behavior
    zoomRef.current = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        const wordsGroup = svg.select('.words-group')
        wordsGroup.attr('transform', event.transform.toString())
      })

    // Apply zoom behavior to SVG
    svg.call(zoomRef.current)

    // Initial zoom transform
    const initialTransform = d3.zoomIdentity
      .translate(dimensions.width / 2, dimensions.height / 2)
      .scale(0.87)
      .translate(-dimensions.width / 2, -dimensions.height / 2)

    svg.call(zoomRef.current.transform, initialTransform)

    // Update dimensions ref
    dimensionsRef.current = {
      width: dimensions.width,
      height: dimensions.height,
      lastUpdate: Date.now()
    }

    // If we have words, trigger an update
    if (words.length > 0) {
      debouncedUpdate(words)
    }
  }, [dimensions, theme, words, debouncedUpdate])

  // Reset zoom when search/filter changes
  const resetZoom = useCallback(() => {
    if (zoomRef.current && svgRef.current && typeof window !== 'undefined') {
      const svg = d3.select(svgRef.current)

      // Small delay to ensure words are rendered before transform
      setTimeout(() => {
        const width = parseInt(svg.style('width'))
        const height = parseInt(svg.style('height'))
        svg
          .transition()
          .duration(300)
          .call(
            zoomRef.current!.transform,
            d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(0.87)
              .translate(-width / 2, -height / 2)
          )
      }, 50)
    }
  }, [svgRef])

  // Update SVG when dimensions change
  useEffect(() => {
    // Skip if no SVG ref available
    if (!svgRef.current) return

    // Skip if dimensions haven't changed substantially
    if (
      dimensionsRef.current.width === dimensions.width &&
      dimensionsRef.current.height === dimensions.height
    ) {
      return
    }

    console.log(
      `Dimensions updated to ${dimensions.width}x${dimensions.height}, adjusting SVG`
    )

    // Update the SVG dimensions
    const svg = d3.select(svgRef.current)
    svg
      .attr('width', '100%') // Use 100% to ensure SVG fills container
      .attr('height', '100%') // Use 100% to ensure SVG fills container
      .style('width', `${dimensions.width}px`)
      .style('height', `${dimensions.height}px`)

    // Update dimensions ref
    dimensionsRef.current = {
      width: dimensions.width,
      height: dimensions.height,
      lastUpdate: Date.now()
    }

    // Force layout update if we have words
    if (words.length > 0 && !modalsOpenRef.current) {
      shouldUpdateLayoutRef.current = true
      debouncedUpdate(words)
    }
  }, [
    dimensions,
    words,
    debouncedUpdate,
    svgRef,
    modalsOpenRef,
    shouldUpdateLayoutRef
  ])

  // Monitor panel visibility changes and recenter visualization when needed
  useEffect(() => {
    if (!svgRef.current || !svgRef.current.parentElement) return

    // Use a MutationObserver to detect container size changes
    // This will handle cases like panel opening/closing
    const container = svgRef.current.parentElement
    const observer = new ResizeObserver(() => {
      // Only proceed if we have words already and it's not during initial load
      if (
        previousWordsRef.current.length === 0 ||
        isLoading ||
        modalsOpenRef.current
      ) {
        return
      }

      // Update centering without relayout
      const svg = d3.select(svgRef.current!)
      const wordsContainer = svg.select('.words-container')

      if (!wordsContainer.empty()) {
        const wordsGroup = wordsContainer.select('.words-group')

        if (!wordsGroup.empty()) {
          // Get current size
          const svgWidth = parseInt(svg.style('width'))
          const svgHeight = parseInt(svg.style('height'))

          // Smoothly transition to new center
          wordsGroup
            .transition()
            .duration(300)
            .attr('transform', `translate(${svgWidth / 2},${svgHeight / 2})`)

          console.log('Container resized, recentering words')
        }
      }
    })

    // Start observing the container
    observer.observe(container)

    // Clean up
    return () => {
      observer.disconnect()
    }
  }, [isLoading, svgRef, modalsOpenRef])

  return {
    isUpdating,
    zoomRef,
    resetZoom,
    debouncedUpdate
  }
}
