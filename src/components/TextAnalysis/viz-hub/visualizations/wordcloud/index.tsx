'use client'

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useWordCloudVisualization } from './useWordCloudVisualization'
import OptionsModal from './modals/OptionsModal'
import ListEditModal from './modals/ListEditModal'
import WordDetailPanel from './WordDetailPanel'
import ChartError from '../../ui/common/ChartError'
import debounce from 'lodash/debounce'
import { useWordCloudStore } from './store'
import { useTheme } from '../../store/themeStore'

interface WordCloudProps {
  skipLoading?: boolean
}

const WordCloud: React.FC<WordCloudProps> = ({ skipLoading = false }) => {
  // Get theme from context
  const { theme } = useTheme()

  // Get state and actions from store
  const {
    // Data states
    words,
    filteredWords,
    isLoading,
    error,

    // UI states
    searchTerm,
    minFrequency,
    maxWords,
    dimensions,
    selectedWord,
    isPanelVisible,
    isWordSelectionAction,

    // Options and modal states
    options,
    tempOptions,
    isOptionsModalOpen,
    isStopwordsModalOpen,
    isWhitelistModalOpen,

    // List edit states
    stopwordsEditText,
    whitelistEditText,

    // Stoplist/Whitelist states
    selectedLanguage,
    stoplistActive,
    whitelistActive,

    // Flags
    shouldUpdateLayout,
    isUpdating,

    // Actions
    setSearchTerm,
    setMinFrequency,
    setMaxWords,
    setDimensions,
    setSelectedWord,
    setShouldUpdateLayout,
    setIsUpdating,

    // Modal actions
    openOptionsModal,
    closeOptionsModal,
    saveOptions,
    openStopwordsModal,
    closeStopwordsModal,
    saveStopwords,
    openWhitelistModal,
    closeWhitelistModal,
    saveWhitelist,

    // Stoplist/Whitelist actions
    setLanguage,
    toggleStoplist,
    toggleWhitelist,

    // Option actions
    updateTempOptions,
    setStopwordsEditText,
    setWhitelistEditText,

    // Data actions
    fetchData
  } = useWordCloudStore()

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

  // Keep refs in sync with store state
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

  // Word cloud visualization hook (using our store state through refs)
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
      fetchData()
    }
  }, [fetchData, skipLoading])

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Word Cloud
        </h2>
        <button
          onClick={openOptionsModal}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium cursor-pointer"
        >
          Options
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-700 dark:bg-gray-700 dark:text-gray-200 h-10 text-sm transition-colors"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                className="w-full cursor-pointer accent-blue-500 dark:accent-blue-300"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max words to display:{' '}
            {typeof window !== 'undefined' ? maxWords : ''}
          </label>
          <div className="flex items-center h-10">
            {typeof window !== 'undefined' && (
              <input
                type="range"
                min={10}
                max={words.length}
                value={maxWords}
                onChange={(e) => {
                  setMaxWords(Number(e.target.value))
                }}
                className="w-full cursor-pointer accent-blue-500 dark:accent-blue-300"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div
          className={`grid transition-all duration-300 ease-in-out gap-4 ${
            isPanelVisible ? 'grid-cols-[1fr_auto]' : 'grid-cols-[1fr]'
          }`}
          style={{ width: '100%' }}
        >
          <div className="h-[550px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center p-4 overflow-hidden relative wordcloud-container">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-blue-400"></div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Loading...
                  </span>
                </div>
              </div>
            )}

            {error ? (
              <ChartError message={error} onRetry={fetchData} />
            ) : isUpdating ? (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-blue-400"></div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Updating...
                  </span>
                </div>
              </div>
            ) : (
              <>
                {!isLoading && filteredWords.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-5 bg-white dark:bg-gray-800 shadow-inner rounded">
                    <div className="text-gray-600 dark:text-gray-300 text-center p-6 max-w-md bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-14 w-14 mx-auto mb-3 text-gray-400 dark:text-gray-500"
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
                      <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                        No Words to Display
                      </h3>
                      <p className="mb-4 text-gray-500 dark:text-gray-400">
                        Your current filters don't match any words.
                      </p>

                      <div className="space-y-3 text-left">
                        {searchTerm && (
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-md text-purple-700 dark:text-purple-300 text-sm">
                            <span className="font-semibold block mb-1">
                              Search term has no matches
                            </span>
                            Your search term "{searchTerm}" doesn't match any
                            words.
                          </div>
                        )}

                        {minFrequency > minCount && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-md text-amber-700 dark:text-amber-300 text-sm">
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
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
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
              <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full">
                {selectedLanguage === 'custom'
                  ? 'Custom Stopwords'
                  : `${selectedLanguage} Stopwords`}
              </span>
            ) : null}

            {whitelistActive ? (
              <span className="px-2 py-1 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full">
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
          Object.entries(newOptions).forEach(([key, value]) => {
            updateTempOptions(key as keyof typeof options, value)
          })
        }}
        onClose={closeOptionsModal}
        onSave={saveOptions}
        selectedLanguage={selectedLanguage}
        stoplistActive={stoplistActive}
        whitelistActive={whitelistActive}
        setLanguage={setLanguage}
        toggleStoplist={toggleStoplist}
        toggleWhitelist={toggleWhitelist}
        onOpenStopwordsModal={openStopwordsModal}
        onOpenWhitelistModal={openWhitelistModal}
      />

      {/* Stopwords Edit Modal */}
      <ListEditModal
        isOpen={isStopwordsModalOpen}
        onClose={closeStopwordsModal}
        title="Edit Stoplist"
        value={stopwordsEditText}
        onChange={setStopwordsEditText}
        onSave={saveStopwords}
        language={selectedLanguage}
      />

      {/* Whitelist Edit Modal */}
      <ListEditModal
        isOpen={isWhitelistModalOpen}
        onClose={closeWhitelistModal}
        title="Edit Whitelist"
        value={whitelistEditText}
        onChange={setWhitelistEditText}
        onSave={saveWhitelist}
      />
    </div>
  )
}

export default WordCloud
