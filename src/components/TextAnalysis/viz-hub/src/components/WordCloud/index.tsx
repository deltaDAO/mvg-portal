'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useWordCloudVisualization } from './useWordCloudVisualization'
import OptionsModal from './modals/OptionsModal'
import ListEditModal from './modals/ListEditModal'
import WordDetailPanel from './WordDetailPanel'
import ChartError from '../ChartError'
import debounce from 'lodash/debounce'
import { WordCloudOptions, ColorScheme } from './types'
import { Language } from './useStoplistManager'

interface WordCloudData {
  wordCloudData: Array<{ value: string; count: number }>
}

interface WordCloudProps {
  skipLoading?: boolean
  data: WordCloudData
}

const WordCloud: React.FC<WordCloudProps> = ({ skipLoading = false, data }) => {
  // Local state
  const [words, setWords] = useState<Array<{ value: string; count: number }>>(
    []
  )
  const [filteredWords, setFilteredWords] = useState<
    Array<{ value: string; count: number }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [minFrequency, setMinFrequency] = useState(1)
  const [maxWords, setMaxWords] = useState(100)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [selectedWord, setSelectedWord] = useState<{
    value: string
    count: number
  } | null>(null)
  const [isPanelVisible, setIsPanelVisible] = useState(false)
  const [isWordSelectionAction, setIsWordSelectionAction] = useState(false)
  const [options, setOptions] = useState<WordCloudOptions>({
    fontFamily: 'Palatino',
    colorSelection: 'random',
    applyGlobally: true
  })
  const [tempOptions, setTempOptions] = useState<WordCloudOptions>(options)
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)
  const [isStopwordsModalOpen, setIsStopwordsModalOpen] = useState(false)
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false)
  const [stopwordsEditText, setStopwordsEditText] = useState('')
  const [whitelistEditText, setWhitelistEditText] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english')
  const [stoplistActive, setStoplistActive] = useState(false)
  const [whitelistActive, setWhitelistActive] = useState(false)
  const [shouldUpdateLayout, setShouldUpdateLayout] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // References for controlling the wordcloud visualization
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedWordRef = useRef(selectedWord)
  const isPanelVisibleRef = useRef(isPanelVisible)
  const shouldUpdateLayoutRef = useRef(shouldUpdateLayout)
  const modalsOpenRef = useRef(
    isOptionsModalOpen || isStopwordsModalOpen || isWhitelistModalOpen
  )
  const isWordSelectionActionRef = useRef<boolean>(false)

  // Track the last render timestamp to prevent duplicate renders
  const lastRenderTimestampRef = useRef<number>(0)
  const RENDER_DEBOUNCE_MS = 500

  // Keep refs in sync with state
  useEffect(() => {
    shouldUpdateLayoutRef.current = shouldUpdateLayout
  }, [shouldUpdateLayout])

  useEffect(() => {
    selectedWordRef.current = selectedWord
  }, [selectedWord])

  useEffect(() => {
    isPanelVisibleRef.current = isPanelVisible
  }, [isPanelVisible])

  useEffect(() => {
    modalsOpenRef.current =
      isOptionsModalOpen || isStopwordsModalOpen || isWhitelistModalOpen
  }, [isOptionsModalOpen, isStopwordsModalOpen, isWhitelistModalOpen])

  useEffect(() => {
    isWordSelectionActionRef.current = isWordSelectionAction
  }, [isWordSelectionAction])

  // Process data when it changes
  useEffect(() => {
    if (data && data.wordCloudData) {
      const validData = data.wordCloudData.filter(
        (word) =>
          word &&
          typeof word.value === 'string' &&
          typeof word.count === 'number'
      )

      if (validData.length === 0) {
        setError('No valid word data available')
        setIsLoading(false)
        return
      }

      setWords(validData)
      setFilteredWords(validData)
      setIsLoading(false)
    } else {
      setError('No data available')
      setIsLoading(false)
    }
  }, [data])

  // Filter words based on search term and frequency
  useEffect(() => {
    if (!words || words.length === 0) {
      setFilteredWords([])
      return
    }

    try {
      const filtered = words
        .filter((word) => {
          // Type guard to ensure word has required properties
          if (
            !word ||
            typeof word.value !== 'string' ||
            typeof word.count !== 'number'
          ) {
            console.warn('Invalid word data:', word)
            return false
          }

          const matchesSearch =
            !searchTerm ||
            word.value.toLowerCase().includes(searchTerm.toLowerCase())
          const matchesFrequency = word.count >= minFrequency

          return matchesSearch && matchesFrequency
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, maxWords)

      setFilteredWords(filtered)
    } catch (error) {
      console.error('Error filtering words:', error)
      setError('Error processing word data')
    }
  }, [words, searchTerm, minFrequency, maxWords])

  // Word cloud visualization hook
  const { resetZoom, debouncedUpdate } = useWordCloudVisualization({
    svgRef,
    words: filteredWords,
    dimensions,
    fontFamily: options.fontFamily,
    colorSelection: options.colorSelection,
    isLoading,
    selectedWordRef,
    isPanelVisibleRef,
    shouldUpdateLayoutRef,
    modalsOpenRef,
    isWordSelectionActionRef,
    onWordSelect: (word) => {
      setSelectedWord(word)
      console.log('Word selected:', word.value)
    }
  })

  // Update dimensions when window size changes
  useEffect(() => {
    const handleResize = debounce(() => {
      const container = svgRef.current?.parentElement
      if (!container) return

      // Calculate dimensions based on container size
      const containerWidth = container.clientWidth
      const containerHeight =
        container.clientHeight || Math.min(550, window.innerHeight * 0.6)

      // Set new dimensions to use the full width and height available
      // Remove the padding subtraction (-32) to ensure the SVG fills the container
      const newWidth = containerWidth
      const newHeight = containerHeight

      // Update dimensions in store
      setDimensions({
        width: newWidth,
        height: newHeight
      })

      console.log(`Dimensions updated: ${newWidth}x${newHeight}`)
    }, 250)

    // Only add resize listener on client side
    if (typeof window !== 'undefined') {
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [setDimensions])

  // Reset zoom when search/filter changes
  useEffect(() => {
    // If this is a slider change, we DO want to reset zoom
    const isSliderChange = shouldUpdateLayout === true

    // Skip zoom reset if:
    // - This is a panel state change (isPanelVisible changed)
    // - OR a word selection/deselection
    // BUT don't skip for slider changes or search term changes
    if (
      !isSliderChange &&
      (selectedWord !== null || isWordSelectionAction || !shouldUpdateLayout)
    ) {
      return
    }

    // Reset zoom when filtered words change (search, filter, etc.)
    resetZoom()
  }, [
    filteredWords,
    minFrequency,
    maxWords,
    searchTerm,
    resetZoom,
    selectedWord,
    isWordSelectionAction,
    shouldUpdateLayout
  ])

  // Fetch data on initial load
  useEffect(() => {
    // If skipLoading is true, do not execute fetchData
    if (!skipLoading) {
      // Placeholder for fetchData function
    }
  }, [skipLoading])

  // Single unified effect to handle all word cloud updates
  useEffect(() => {
    // Only proceed if we have the SVG reference and words to display
    if (!svgRef.current || !filteredWords.length) {
      return
    }

    // Skip updates when loading or modals are open
    if (isLoading || modalsOpenRef.current) {
      console.log('Skipping word cloud update: loading or modal open')
      return
    }

    console.log('Word cloud update triggered', {
      wordCount: filteredWords.length,
      shouldUpdateLayout,
      isWordSelectionAction,
      timestamp: new Date().toISOString()
    })

    // Set the layout flag based on current state
    shouldUpdateLayoutRef.current = shouldUpdateLayout

    // Add a small delay for initial render to ensure SVG is ready
    const delay = 100

    // Use setTimeout to prevent React 18 double-rendering issues in dev mode
    const timerId = setTimeout(() => {
      debouncedUpdate(filteredWords)
    }, delay)

    return () => clearTimeout(timerId)
  }, [
    // Dependencies that should trigger an update
    filteredWords,
    isLoading,
    shouldUpdateLayout,
    // Don't add isWordSelectionAction as dependency
    // to prevent unnecessary renders from panel interactions
    debouncedUpdate
  ])

  // Min/max count for sliders - initialize with defaults for SSR
  const minCount =
    words.length > 0
      ? Math.min(...words.map((w: { count: number }) => w.count))
      : 0

  const maxCount =
    words.length > 0
      ? Math.max(...words.map((w: { count: number }) => w.count))
      : 100

  // Initialize minFrequency based on data available at render time
  useEffect(() => {
    if (words.length > 0 && minFrequency === 0) {
      // Only set if not already set and we have data
      setMinFrequency(minCount)
    }
  }, [words.length, minCount, minFrequency, setMinFrequency])

  // Handle panel close with smooth transition
  const handlePanelClose = () => {
    // Let the store handle the state updates
    // The store will set isWordSelectionAction to true, preventing layout
    setSelectedWord(null)

    // Record panel close in console for debugging
    console.log('Panel closed with smooth transition')
  }

  // When panel state changes (appearing or disappearing),
  // ensure the container adjusts properly but doesn't trigger relayout
  useEffect(() => {
    const container = svgRef.current?.parentElement?.parentElement
    if (!container) return

    // Force container to adjust its size without triggering wordcloud relayout
    const adjustContainerSize = () => {
      requestAnimationFrame(() => {
        // Just accessing clientWidth can sometimes trigger reflow
        // without causing full recalculation
        const _ = container.clientWidth
      })
    }

    adjustContainerSize()

    // After transition completes (300ms is our transition duration)
    const timer = setTimeout(() => {
      adjustContainerSize()
    }, 350)

    return () => clearTimeout(timer)
  }, [isPanelVisible])

  // Handle filtering to a selected word
  const handleFilterToWord = (word: string) => {
    // This is explicitly NOT a word selection action
    // but rather a search action, so we need to:
    // 1. Make sure isWordSelectionAction is reset
    // 2. Force layout update since we're filtering to a specific word

    // Close the panel first
    handlePanelClose()

    // Short delay to ensure panel close is registered
    setTimeout(() => {
      // Now set search term with force update
      shouldUpdateLayoutRef.current = true

      // Reset word selection flag via store action
      // This ensures the layout is fully recomputed
      setShouldUpdateLayout(true)

      // Set the search term to filter to this word
      setSearchTerm(word)

      console.log('Filtering to word:', word)
    }, 50)
  }

  useEffect(() => {
    if (!svgRef.current) return

    const handleWordClick = (event: MouseEvent) => {
      if (!isWordSelectionAction) {
        // Handle word click
      }
    }

    svgRef.current.addEventListener('click', handleWordClick)
    return () => {
      svgRef.current?.removeEventListener('click', handleWordClick)
    }
  }, [isWordSelectionAction])

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 pb-2">Word Cloud</h2>
        <button
          onClick={() => setIsOptionsModalOpen(true)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer"
        >
          Options
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search terms
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              if (e.target.value === '') {
                setSearchTerm('')
              } else {
                setSearchTerm(e.target.value)
              }
            }}
            placeholder="Filter words..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 h-10 text-sm transition-colors"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum frequency:{' '}
            {typeof window !== 'undefined' ? minFrequency : ''}
          </label>
          <div className="flex items-center h-10">
            {typeof window !== 'undefined' && (
              <input
                type="range"
                min={minCount}
                max={maxCount}
                value={minFrequency}
                onChange={(e) => {
                  const newValue = Number(e.target.value)
                  setMinFrequency(newValue)
                }}
                className="w-full cursor-pointer"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max words to display:{' '}
            {typeof window !== 'undefined' ? maxWords : ''}
          </label>
          <div className="flex items-center h-10">
            {typeof window !== 'undefined' && (
              <input
                type="range"
                min={10}
                // Calculate a reasonable maximum: either 500 or double the total words count, whichever is smaller
                max={words.length}
                value={maxWords}
                onChange={(e) => {
                  // Update max words in store when slider changes
                  // This will automatically save to localStorage via the store action
                  setMaxWords(Number(e.target.value))
                }}
                className="w-full cursor-pointer"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Main container - using CSS Grid for smoother transitions */}
        <div
          className={`grid transition-all duration-300 ease-in-out gap-4 ${
            isPanelVisible ? 'grid-cols-[1fr_auto]' : 'grid-cols-[1fr]'
          }`}
          style={{ width: '100%' }}
        >
          {/* Word cloud visualization - will automatically adjust with CSS Grid */}
          <div className="h-[550px] bg-gray-50 rounded flex items-center justify-center p-4 overflow-hidden relative wordcloud-container">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="text-gray-500">Loading...</span>
                </div>
              </div>
            )}

            {error ? (
              <ChartError message={error} onRetry={() => {}} />
            ) : isUpdating ? (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="text-gray-500">Updating...</span>
                </div>
              </div>
            ) : (
              <>
                {!isLoading && filteredWords.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-5 bg-white shadow-inner rounded">
                    <div className="text-gray-600 text-center p-6 max-w-md bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-14 w-14 mx-auto mb-3 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      <h3 className="text-xl font-semibold mb-2">
                        No Words to Display
                      </h3>
                      <p className="mb-4 text-gray-500">
                        Your current filters don't match any words.
                      </p>

                      <div className="space-y-3 text-left">
                        {searchTerm && (
                          <div className="p-3 bg-purple-50 rounded-md text-purple-700 text-sm">
                            <span className="font-semibold block mb-1">
                              Search term has no matches
                            </span>
                            Your search term "{searchTerm}" doesn't match any
                            words.
                          </div>
                        )}

                        {minFrequency > minCount && (
                          <div className="p-3 bg-amber-50 rounded-md text-amber-700 text-sm">
                            <span className="font-semibold block mb-1">
                              Frequency threshold too high
                            </span>
                            Minimum frequency is set to {minFrequency}. Try
                            lowering it.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    cursor: 'grab'
                  }}
                  className={isUpdating ? 'opacity-50' : 'opacity-100'}
                />
              </>
            )}

            <style jsx>{`
              .wordcloud-container svg:active {
                cursor: grabbing;
              }
              .cloud-word {
                user-select: none;
              }
            `}</style>
          </div>

          {/* Word details panel - conditional rendering with CSS Grid */}
          {selectedWord && (
            <WordDetailPanel
              selectedWord={selectedWord}
              onClose={handlePanelClose}
              onFilterToWord={handleFilterToWord}
              maxCount={maxCount}
              allWords={words}
            />
          )}
        </div>
      </div>

      {/* Word frequency summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div>
            {typeof window !== 'undefined' ? (
              <>
                Showing {filteredWords.length} of {words.length} words.
                {filteredWords.length > 0 && (
                  <span>
                    {' '}
                    Frequency range:{' '}
                    {Math.min(
                      ...filteredWords.map((w: { count: number }) => w.count)
                    )}{' '}
                    to{' '}
                    {Math.max(
                      ...filteredWords.map((w: { count: number }) => w.count)
                    )}
                  </span>
                )}
              </>
            ) : (
              <>Loading word statistics...</>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs">
            {stoplistActive ? (
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                {selectedLanguage === 'custom'
                  ? 'Custom Stopwords'
                  : `${selectedLanguage} Stopwords`}
              </span>
            ) : null}

            {whitelistActive ? (
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">
                Whitelist Active
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Options Modal */}
      <OptionsModal
        isOpen={isOptionsModalOpen}
        tempOptions={tempOptions}
        setTempOptions={(newOptions) => {
          setTempOptions(newOptions)
        }}
        onClose={() => setIsOptionsModalOpen(false)}
        onSave={() => {}}
        selectedLanguage={selectedLanguage}
        stoplistActive={stoplistActive}
        whitelistActive={whitelistActive}
        setLanguage={(language: Language) => setSelectedLanguage(language)}
        toggleStoplist={() => setStoplistActive(!stoplistActive)}
        toggleWhitelist={() => setWhitelistActive(!whitelistActive)}
        onOpenStopwordsModal={() => setIsStopwordsModalOpen(true)}
        onOpenWhitelistModal={() => setIsWhitelistModalOpen(true)}
      />

      {/* Stopwords Edit Modal */}
      <ListEditModal
        isOpen={isStopwordsModalOpen}
        onClose={() => setIsStopwordsModalOpen(false)}
        title="Edit Stoplist"
        value={stopwordsEditText}
        onChange={(value) => setStopwordsEditText(value)}
        onSave={() => {}}
        language={selectedLanguage}
      />

      {/* Whitelist Edit Modal */}
      <ListEditModal
        isOpen={isWhitelistModalOpen}
        onClose={() => setIsWhitelistModalOpen(false)}
        title="Edit Whitelist"
        value={whitelistEditText}
        onChange={(value) => setWhitelistEditText(value)}
        onSave={() => {}}
      />
    </div>
  )
}

export default WordCloud
