import { create } from 'zustand'
import { WordData, WordCloudOptions } from './types'
import { ENGLISH_STOPWORDS, CUSTOM_COLORS } from './constants'
import { Language } from './useStoplistManager'

// Define the store type
interface WordCloudStore {
  // Data states
  words: WordData[]
  filteredWords: WordData[]
  isLoading: boolean
  error: string | null

  // UI states
  searchTerm: string
  minFrequency: number
  maxWords: number
  dimensions: { width: number; height: number }

  // Selected word states
  selectedWord: WordData | null
  isPanelVisible: boolean
  isWordSelectionAction: boolean

  // Options states
  options: WordCloudOptions
  tempOptions: WordCloudOptions

  // Modal states
  isOptionsModalOpen: boolean
  isStopwordsModalOpen: boolean
  isWhitelistModalOpen: boolean

  // List edit states
  stopwordsEditText: string
  whitelistEditText: string
  originalStopwordsText: string
  originalWhitelistText: string

  // Stoplist/Whitelist management
  selectedLanguage: Language
  stoplistActive: boolean
  whitelistActive: boolean
  customStopwords: string[]
  customWhitelist: string[]
  autoDetectedStopwords: string[]

  // Refs equivalents (flags)
  shouldUpdateLayout: boolean
  isUpdating: boolean
  modalsOpen: boolean

  // Random word colors map
  wordColors: Record<string, string>

  // Actions
  setWords: (words: WordData[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setFilteredWords: (filteredWords: WordData[]) => void
  setSearchTerm: (term: string) => void
  setMinFrequency: (frequency: number) => void
  setMaxWords: (maxWords: number) => void
  setDimensions: (dimensions: { width: number; height: number }) => void
  setSelectedWord: (word: WordData | null) => void
  setShouldUpdateLayout: (shouldUpdate: boolean) => void
  setIsUpdating: (isUpdating: boolean) => void

  // Modal actions
  openOptionsModal: () => void
  closeOptionsModal: () => void
  saveOptions: () => void
  openStopwordsModal: () => void
  closeStopwordsModal: () => void
  saveStopwords: () => void
  openWhitelistModal: () => void
  closeWhitelistModal: () => void
  saveWhitelist: () => void

  // Stoplist/Whitelist actions
  setLanguage: (language: Language) => void
  toggleStoplist: () => void
  toggleWhitelist: () => void

  // Utility actions
  updateTempOptions: <K extends keyof WordCloudOptions>(
    key: K,
    value: WordCloudOptions[K]
  ) => void
  resetOptionsToDefaults: () => void
  setStopwordsEditText: (text: string) => void
  setWhitelistEditText: (text: string) => void
  filterWords: () => void
  autoDetectStopwords: () => void
  getActiveStopwords: () => string[]
  getActiveWhitelist: () => string[]
  getWordColor: (word: string) => string
  fetchData: () => Promise<void>

  // Cache for filtering operations
  filterCacheKey: string
  lastFilterOperation: number
}

// Local storage keys
const STORAGE_KEYS = {
  LANGUAGE: 'wordcloud_language',
  CUSTOM_STOPLIST: 'wordcloud_custom_stoplist',
  STOPLIST_ACTIVE: 'wordcloud_stoplist_active',
  WHITELIST: 'wordcloud_whitelist',
  WHITELIST_ACTIVE: 'wordcloud_whitelist_active',
  MIN_FREQUENCY: 'wordcloud_min_frequency',
  MAX_WORDS: 'wordcloud_max_words' // Controls the maximum number of words displayed in the visualization
}

// Helper function to safely parse JSON from localStorage
const safeJsonParse = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window === 'undefined') return defaultValue
    const storedValue = localStorage.getItem(key)
    return storedValue ? (JSON.parse(storedValue) as T) : defaultValue
  } catch (error: unknown) {
    console.error(
      `Error parsing JSON from localStorage for key "${key}":`,
      error
    )
    return defaultValue
  }
}

// Create the store
export const useWordCloudStore = create<WordCloudStore>((set, get) => ({
  // Initial states
  words: [],
  filteredWords: [],
  isLoading: true,
  error: null,

  searchTerm: '',
  minFrequency:
    typeof window !== 'undefined'
      ? Number(localStorage.getItem(STORAGE_KEYS.MIN_FREQUENCY) || 0)
      : 0,
  // Default to 100 words and load from localStorage if available
  maxWords:
    typeof window !== 'undefined'
      ? Number(localStorage.getItem(STORAGE_KEYS.MAX_WORDS) || 100)
      : 100,
  dimensions: { width: 800, height: 500 },

  selectedWord: null,
  isPanelVisible: false,
  isWordSelectionAction: false,

  options: {
    fontFamily: 'Palatino',
    colorSelection: 'random',
    applyGlobally: true
  },
  tempOptions: {
    fontFamily: 'Palatino',
    colorSelection: 'random',
    applyGlobally: true
  },

  isOptionsModalOpen: false,
  isStopwordsModalOpen: false,
  isWhitelistModalOpen: false,

  stopwordsEditText: '',
  whitelistEditText: '',
  originalStopwordsText: '',
  originalWhitelistText: '',

  // Initialize stoplist/whitelist from localStorage
  selectedLanguage:
    (typeof window !== 'undefined'
      ? (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language)
      : 'english') || 'english',
  stoplistActive:
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.STOPLIST_ACTIVE) !== 'false'
      : true,
  whitelistActive:
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEYS.WHITELIST_ACTIVE) === 'true'
      : false,
  customStopwords: safeJsonParse<string[]>(STORAGE_KEYS.CUSTOM_STOPLIST, []),
  customWhitelist: safeJsonParse<string[]>(STORAGE_KEYS.WHITELIST, []),
  autoDetectedStopwords: [],

  shouldUpdateLayout: false,
  isUpdating: false,
  modalsOpen: false,

  wordColors: {},

  // Cache for memoizing filter operations
  filterCacheKey: '',
  lastFilterOperation: 0,

  // Basic setters
  setWords: (words) => set({ words }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Improved setFilteredWords with shallow equality check to prevent unnecessary updates
  setFilteredWords: (filteredWords) => {
    const currentFiltered = get().filteredWords

    // Only update if the array references are different AND
    // either the lengths differ or the first/last elements differ
    // This avoids unnecessary renders when the filter produces the same results
    if (
      currentFiltered !== filteredWords &&
      (currentFiltered.length !== filteredWords.length ||
        (filteredWords.length > 0 &&
          currentFiltered.length > 0 &&
          (currentFiltered[0].value !== filteredWords[0].value ||
            currentFiltered[currentFiltered.length - 1].value !==
              filteredWords[filteredWords.length - 1].value)))
    ) {
      set({ filteredWords })
    }
  },

  setSearchTerm: (searchTerm) => {
    const currentSearchTerm = get().searchTerm

    // Skip if the search term hasn't changed
    if (currentSearchTerm === searchTerm) {
      return
    }

    // Set flag to force update layout on search term change
    // and ALWAYS reset word selection action flag
    set({
      searchTerm,
      shouldUpdateLayout: true,
      isWordSelectionAction: false // Always reset for search changes
    })

    // After setting search term, filter words
    setTimeout(() => {
      get().filterWords()
    }, 0)
  },
  setMinFrequency: (minFrequency) => {
    set({
      minFrequency,
      shouldUpdateLayout: true,
      isWordSelectionAction: false
    })

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MIN_FREQUENCY, minFrequency.toString())
    }

    setTimeout(() => {
      get().filterWords()
    }, 0)
  },
  setMaxWords: (maxWords) => {
    set({
      maxWords,
      shouldUpdateLayout: true,
      isWordSelectionAction: false
    })

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MAX_WORDS, maxWords.toString())
    }

    setTimeout(() => {
      get().filterWords()
    }, 0)
  },
  setDimensions: (dimensions) => set({ dimensions }),
  setSelectedWord: (selectedWord) => {
    // When selecting a word or closing panel, mark this as a word selection action
    // This flag helps prevent layout updates during panel interactions
    set({
      selectedWord,
      isPanelVisible: selectedWord !== null,
      shouldUpdateLayout: false,
      isWordSelectionAction: true // Always flag this as a word selection action, even when closing panel
    })
  },
  setShouldUpdateLayout: (shouldUpdateLayout) =>
    set({
      shouldUpdateLayout,
      isWordSelectionAction: false // Reset word selection flag
    }),
  setIsUpdating: (isUpdating) => set({ isUpdating }),

  // Modal actions
  openOptionsModal: () => {
    const { options } = get()
    set({
      isOptionsModalOpen: true,
      tempOptions: { ...options },
      modalsOpen: true
    })
  },
  closeOptionsModal: () => {
    set({
      isOptionsModalOpen: false,
      modalsOpen: false
    })
  },
  saveOptions: () => {
    const { tempOptions, options } = get()

    // Check if options actually changed
    const optionsChanged =
      JSON.stringify(tempOptions) !== JSON.stringify(options)

    // Font family change requires layout update
    const requiresLayoutUpdate = tempOptions.fontFamily !== options.fontFamily

    // Apply the new settings
    set({
      options: { ...tempOptions },
      isOptionsModalOpen: false,
      modalsOpen: false,
      shouldUpdateLayout: requiresLayoutUpdate
    })

    // Handle filter updates if options changed
    if (optionsChanged) {
      setTimeout(() => {
        get().filterWords()
      }, 50)
    }
  },
  openStopwordsModal: () => {
    const { customStopwords, selectedLanguage, autoDetectedStopwords } = get()

    // Prepare text content for the modal
    let currentText = ''

    if (selectedLanguage === 'custom' && customStopwords.length > 0) {
      currentText = customStopwords.join('\n')
    } else if (selectedLanguage === 'english') {
      currentText = ENGLISH_STOPWORDS.join('\n')
    } else if (selectedLanguage === 'auto-detect') {
      currentText = autoDetectedStopwords.join('\n')
    } else {
      // Default example if no specific stopwords are selected
      currentText = [
        'a',
        'an',
        'the',
        'and',
        'or',
        'but',
        'if',
        'then',
        'else',
        'when',
        'to',
        'at',
        'in',
        'on',
        'by'
      ].join('\n')
    }

    set({
      stopwordsEditText: currentText,
      originalStopwordsText: currentText,
      isStopwordsModalOpen: true,
      modalsOpen: true
    })
  },
  closeStopwordsModal: () => {
    set({
      isStopwordsModalOpen: false,
      modalsOpen: false
    })
  },
  saveStopwords: () => {
    const {
      stopwordsEditText,
      originalStopwordsText,
      searchTerm,
      selectedWord
    } = get()

    // Only process if changes were made
    const changesWereMade = stopwordsEditText !== originalStopwordsText

    if (changesWereMade) {
      // Close the panel first if it's open
      if (selectedWord) {
        set({
          selectedWord: null,
          isPanelVisible: false
        })
      }

      // Parse the new stopwords from text
      const newStopwords = stopwordsEditText
        .split('\n')
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 0)

      // Update custom stopwords and change language to custom
      set({
        customStopwords: newStopwords,
        selectedLanguage: 'custom',
        stoplistActive: true,
        shouldUpdateLayout: true,
        isStopwordsModalOpen: false,
        modalsOpen: false,
        isWordSelectionAction: false // Ensure this is not treated as a word selection
      })

      // Save to localStorage
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_STOPLIST,
        JSON.stringify(newStopwords)
      )
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, 'custom')
      localStorage.setItem(STORAGE_KEYS.STOPLIST_ACTIVE, 'true')

      // Save current search term to reapply it
      const currentSearchTerm = searchTerm

      // Force update after modal closes
      setTimeout(() => {
        // Temporarily clear search term to ensure stopwords filter is applied
        if (currentSearchTerm) {
          set({ searchTerm: '' })

          // Then reapply the search term after a brief delay
          setTimeout(() => {
            set({ searchTerm: currentSearchTerm })
            get().filterWords()
          }, 100)
        } else {
          get().filterWords()
        }
      }, 100) // Increased delay to ensure panel closes first
    } else {
      // Just close the modal without changes
      set({
        isStopwordsModalOpen: false,
        modalsOpen: false
      })
    }
  },
  openWhitelistModal: () => {
    const { customWhitelist } = get()

    // Show some example entries if whitelist is empty
    let currentText = ''
    if (customWhitelist.length === 0) {
      // Example whitelist terms
      currentText = ['important', 'keyword', 'significant', 'relevant'].join(
        '\n'
      )
    } else {
      currentText = customWhitelist.join('\n')
    }

    set({
      whitelistEditText: currentText,
      originalWhitelistText: currentText,
      isWhitelistModalOpen: true,
      modalsOpen: true
    })
  },
  closeWhitelistModal: () => {
    set({
      isWhitelistModalOpen: false,
      modalsOpen: false
    })
  },
  saveWhitelist: () => {
    const {
      whitelistEditText,
      originalWhitelistText,
      searchTerm,
      selectedWord
    } = get()

    // Only process if changes were made
    const changesWereMade = whitelistEditText !== originalWhitelistText

    if (changesWereMade) {
      // Close the panel first if it's open
      if (selectedWord) {
        set({
          selectedWord: null,
          isPanelVisible: false
        })
      }

      // Parse the new whitelist from text
      const newWhitelist = whitelistEditText
        .split('\n')
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 0)

      // Update whitelist settings
      set({
        customWhitelist: newWhitelist,
        whitelistActive: true,
        shouldUpdateLayout: true,
        isWhitelistModalOpen: false,
        modalsOpen: false,
        isWordSelectionAction: false, // Ensure this is not treated as a word selection
        // Force a complete refiltering by invalidating the cache
        filterCacheKey: String(Date.now())
      })

      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.WHITELIST, JSON.stringify(newWhitelist))
      localStorage.setItem(STORAGE_KEYS.WHITELIST_ACTIVE, 'true')

      // Save current search term to reapply it
      const currentSearchTerm = searchTerm

      // Handle search term separately if needed
      if (currentSearchTerm) {
        // Temporarily clear search term
        set({ searchTerm: '' })

        // Wait a tiny amount of time and reapply search term
        // This helps ensure the whitelist filter is properly applied first
        setTimeout(() => {
          set({ searchTerm: currentSearchTerm })
          get().filterWords() // Update filtered words after search term is reapplied
        }, 10)
      } else {
        // If no search term, apply filtering immediately
        get().filterWords()
      }
    } else {
      // Just close the modal without changes
      set({
        isWhitelistModalOpen: false,
        modalsOpen: false
      })
    }
  },

  // Language selection and toggles for stoplist/whitelist
  setLanguage: (language) => {
    // Close the panel first if it's open
    const { selectedWord } = get()
    if (selectedWord) {
      set({
        selectedWord: null,
        isPanelVisible: false
      })
    }

    // Set new language with layout update flag
    set({
      selectedLanguage: language,
      shouldUpdateLayout: true,
      isWordSelectionAction: false // Ensure this is not treated as a word selection
    })

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language)

    // Update filters immediately without setTimeout
    get().filterWords()
  },

  toggleStoplist: () => {
    // Get current state
    const { stoplistActive, selectedWord } = get()

    // Close the panel first if it's open
    if (selectedWord) {
      set({
        selectedWord: null,
        isPanelVisible: false
      })
    }

    // Calculate new value
    const newValue = !stoplistActive

    // Update state directly without nested setTimeout
    // This ensures that state changes are immediately applied
    set({
      stoplistActive: newValue,
      shouldUpdateLayout: true, // Force layout update to ensure rerendering
      isWordSelectionAction: false, // Ensure this is not treated as a word selection
      modalsOpen: false // Ensure modals aren't blocking filter updates
    })

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.STOPLIST_ACTIVE, String(newValue))

    // Apply filtering immediately
    // This direct call ensures that filteredWords is updated right after state change
    get().filterWords()
  },

  toggleWhitelist: () => {
    // Get current state
    const { whitelistActive, customWhitelist, searchTerm, selectedWord } = get()

    // Close the panel first if it's open
    if (selectedWord) {
      set({
        selectedWord: null,
        isPanelVisible: false
      })
    }

    // Calculate new value
    const newWhitelistActive = !whitelistActive

    // If turning on whitelist and it's empty, populate with example values
    let updatedWhitelist = customWhitelist
    if (newWhitelistActive && customWhitelist.length === 0) {
      // Add default example values
      updatedWhitelist = ['important', 'keyword', 'significant', 'relevant']
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEYS.WHITELIST,
        JSON.stringify(updatedWhitelist)
      )
      localStorage.setItem(
        STORAGE_KEYS.WHITELIST_ACTIVE,
        String(newWhitelistActive)
      )
    }

    // Update state
    set({
      whitelistActive: newWhitelistActive,
      customWhitelist: updatedWhitelist,
      shouldUpdateLayout: true,
      isWordSelectionAction: false,
      modalsOpen: false,
      filterCacheKey: String(Date.now())
    })

    // Handle search term separately if needed
    if (searchTerm) {
      // Temporarily clear search term
      set({ searchTerm: '' })

      // Reapply search term after a short delay
      setTimeout(() => {
        set({ searchTerm: searchTerm })
        get().filterWords() // Update filtered words after search term is reapplied
      }, 10)
    } else {
      // Apply filtering immediately when no search term is present
      get().filterWords()
    }
  },

  // Utility actions
  updateTempOptions: (key, value) => {
    set({
      tempOptions: {
        ...get().tempOptions,
        [key]: value
      }
    })
  },
  resetOptionsToDefaults: () => {
    set({
      tempOptions: {
        fontFamily: 'Palatino',
        colorSelection: 'random',
        applyGlobally: true
      }
    })
  },
  setStopwordsEditText: (text) => set({ stopwordsEditText: text }),
  setWhitelistEditText: (text) => set({ whitelistEditText: text }),

  // Helper function to get active stopwords based on current option
  getActiveStopwords: (): string[] => {
    const {
      selectedLanguage,
      autoDetectedStopwords,
      customStopwords,
      stoplistActive
    } = get()

    // If stoplist is not active, return empty list
    if (!stoplistActive) return []

    switch (selectedLanguage) {
      case 'auto-detect':
        return autoDetectedStopwords
      case 'english':
        return ENGLISH_STOPWORDS
      case 'custom':
        return customStopwords
      default:
        // For other languages (like spanish), this would come from an API
        // but for now we'll just return the English list
        return ENGLISH_STOPWORDS
    }
  },

  // Helper function to get active whitelist based on current option
  getActiveWhitelist: (): string[] => {
    const { customWhitelist, whitelistActive } = get()

    // If whitelist is not active, return empty list
    if (!whitelistActive) return []

    return customWhitelist
  },

  // Main word filtering function with memoization
  filterWords: () => {
    const state = get()
    const {
      words,
      searchTerm,
      minFrequency,
      maxWords,
      filterCacheKey,
      lastFilterOperation
    } = state

    // Don't bother filtering if we have no words
    if (words.length === 0) {
      console.log('No words to filter')
      // 确保设置空数组，而不是保留旧数据
      set({ filteredWords: [] })
      return
    }

    // Create a cache key based on filter parameters
    const newCacheKey = JSON.stringify({
      searchTerm,
      minFrequency,
      maxWords,
      stoplistActive: state.stoplistActive,
      whitelistActive: state.whitelistActive,
      wordCount: words.length,
      timestamp: Date.now()
    })

    // Check if we need to recompute or can use cached results
    const now = Date.now()
    const cacheStillValid = filterCacheKey === newCacheKey
    const withinThrottleWindow = now - lastFilterOperation < 300 // 300ms throttle window

    if (cacheStillValid && withinThrottleWindow) {
      console.log('Using cached filter results - skipping filter operation')
      return
    }

    console.log('Computing new filtered words')

    // Update cache info
    set({
      filterCacheKey: newCacheKey,
      lastFilterOperation: now
    })

    // Get active stoplist and whitelist
    const stopwords = state.getActiveStopwords()
    const whitelist = state.getActiveWhitelist()

    // Apply all filters (search, frequency, stoplist/whitelist)
    let filtered = [...words]

    // Apply search filter if needed
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((word) =>
        word.value.toLowerCase().includes(term)
      )
    }

    // Apply frequency filter
    filtered = filtered.filter((word) => word.count >= minFrequency)

    // Apply whitelist if active
    if (state.whitelistActive && whitelist.length > 0) {
      const whitelistFiltered = filtered.filter((word) =>
        whitelist.includes(word.value.toLowerCase())
      )

      // If whitelist is active but no words match, we should show an empty set
      filtered = whitelistFiltered

      // Force a layout update if filtering resulted in empty set
      if (filtered.length === 0) {
        set({ shouldUpdateLayout: true })
      }
    }

    // Apply stoplist if active
    if (state.stoplistActive && stopwords.length > 0) {
      filtered = filtered.filter(
        (word) => !stopwords.includes(word.value.toLowerCase())
      )
    }

    // Limit to max words (sort by frequency first)
    if (filtered.length > maxWords) {
      filtered = [...filtered]
        .sort((a, b) => b.count - a.count)
        .slice(0, maxWords)
    }

    // Log the filter results
    if (filtered.length === 0) {
      console.log('No words match the current filters')
    } else {
      console.log(
        `Filtered words: ${filtered.length} words remain after applying filters`
      )
    }

    // Update filtered words - always update, even if empty (important for clearing visualizations)
    set({ filteredWords: filtered })

    // If filtering resulted in no words, make sure we reset any selected word
    if (filtered.length === 0 && state.selectedWord !== null) {
      set({
        selectedWord: null,
        isPanelVisible: false
      })
    }
  },

  // Auto-detect stopwords based on word frequencies
  autoDetectStopwords: () => {
    const { words } = get()

    if (words.length > 10) {
      // Find common words that likely are stopwords based on frequency analysis
      const totalWords = words.reduce((sum, word) => sum + word.count, 0)
      const averageFrequency = totalWords / words.length

      const excludedWords = ['name', 'year', 'data', 'info']

      // Words that appear much more frequently than average might be stopwords
      const potentialStopwords = words
        .filter(
          (word) =>
            word.count > averageFrequency * 3 && // Much more frequent than average
            word.value.length <= 4 && // Short words are often stopwords
            !excludedWords.includes(word.value.toLowerCase()) // Exclude common meaningful short words
        )
        .map((word) => word.value.toLowerCase())

      set({ autoDetectedStopwords: potentialStopwords })
    }
  },

  // Get color for a word
  getWordColor: (word) => {
    const { options, wordColors, filteredWords } = get()

    // For random colors, ensure consistency by storing in state
    if (options.colorSelection === 'random') {
      if (!wordColors[word]) {
        // Create a new colors object to avoid mutating state directly
        const newColors = { ...wordColors }
        newColors[word] =
          CUSTOM_COLORS[Math.floor(Math.random() * CUSTOM_COLORS.length)]
        set({ wordColors: newColors })
      }
      return wordColors[word] || '#333333'
    }

    // For other color schemes, find the word data to get its count
    const wordData = filteredWords.find((w) => w.value === word)
    if (!wordData) return '#333333'

    const maxCount = Math.max(...filteredWords.map((w) => w.count))
    const ratio = wordData.count / maxCount

    switch (options.colorSelection) {
      case 'monochrome':
        return `rgba(0, 0, 255, ${0.3 + ratio * 0.7})`
      case 'category': {
        // Use the selected color palette for categorical coloring
        const colorIndex = Math.floor(ratio * CUSTOM_COLORS.length)
        return CUSTOM_COLORS[Math.min(colorIndex, CUSTOM_COLORS.length - 1)]
      }
      default:
        return wordColors[word] || '#333333'
    }
  },

  // Fetch word cloud data
  fetchData: async () => {
    set({ isLoading: true, error: null })

    try {
      // Import the dataStore
      const { fetchWordCloudData } = await import(
        '../../../store/dataStore'
      ).then((module) => module.useDataStore.getState())

      // Fetch data from the API
      const data = await fetchWordCloudData([])

      // Calculate the minimum frequency in the dataset
      const minCount = Math.min(
        ...data.wordCloudData.map((w: WordData) => w.count)
      )

      // Get current min frequency
      const { minFrequency } = get()

      // Check if we have a stored whitelist state in localStorage
      const storedWhitelistActive =
        typeof window !== 'undefined'
          ? localStorage.getItem(STORAGE_KEYS.WHITELIST_ACTIVE) === 'true'
          : false

      // If minFrequency is 0, set it to the minimum value from the dataset
      const newMinFrequency = minFrequency === 0 ? minCount : minFrequency

      // Set the words data but DON'T immediately set filtered words,
      // instead we'll use filterWords to properly apply filters
      set({
        words: data.wordCloudData,
        minFrequency: newMinFrequency,
        // Use stored whitelist state instead of forcing it to false
        whitelistActive: storedWhitelistActive,
        isLoading: false
      })

      // Save min frequency to localStorage if it was updated
      if (newMinFrequency !== minFrequency && typeof window !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEYS.MIN_FREQUENCY,
          newMinFrequency.toString()
        )
      }

      // Auto-detect stopwords and apply filters
      setTimeout(() => {
        get().autoDetectStopwords()
        get().filterWords()
      }, 0)
    } catch (error: unknown) {
      console.error('Error fetching word cloud data:', error)
      set({
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false
      })
    }
  }
}))
