import { useState, useEffect, useCallback } from 'react'
import { ENGLISH_STOPWORDS } from './constants'

// Define language options
export type Language =
  | 'english'
  | 'spanish'
  | 'french'
  | 'german'
  | 'custom'
  | 'auto-detect'

// StoplistManager interface
interface StoplistManagerState {
  // The currently selected language
  selectedLanguage: Language
  // The actual stopwords list currently in use
  currentStoplist: string[]
  // Custom stopwords list edited by the user
  customStoplist: string[]
  // Whether the stoplist is active
  isActive: boolean
  // Loading state for API calls
  isLoading: boolean
  // Error state
  error: string | null
}

interface WhitelistState {
  // The whitelist words
  whitelist: string[]
  // Whether the whitelist is active
  isActive: boolean
}

// Hook return type
interface UseStoplistManagerReturn {
  // Stoplist state
  stoplist: StoplistManagerState
  // Whitelist state
  whitelist: WhitelistState
  // Set the language
  setLanguage: (language: Language) => Promise<void>
  // Toggle stoplist active state
  toggleStoplist: () => void
  // Toggle whitelist active state
  toggleWhitelist: () => void
  // Update custom stoplist
  updateCustomStoplist: (words: string[]) => void
  // Update whitelist
  updateWhitelist: (words: string[]) => void
  // Filter words using current stoplist and whitelist
  filterWords: <T extends { value: string }>(words: T[]) => T[]
}

const STORAGE_KEYS = {
  LANGUAGE: 'wordcloud_language',
  CUSTOM_STOPLIST: 'wordcloud_custom_stoplist',
  STOPLIST_ACTIVE: 'wordcloud_stoplist_active',
  WHITELIST: 'wordcloud_whitelist',
  WHITELIST_ACTIVE: 'wordcloud_whitelist_active'
}

export const useStoplistManager = (): UseStoplistManagerReturn => {
  // Initialize state with values from localStorage or defaults
  const [stoplist, setStoplist] = useState<StoplistManagerState>({
    selectedLanguage:
      (typeof window !== 'undefined'
        ? (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language)
        : 'english') || 'english',
    currentStoplist: ENGLISH_STOPWORDS,
    customStoplist:
      typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_STOPLIST) || '[]')
        : [],
    isActive:
      typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEYS.STOPLIST_ACTIVE) !== 'false'
        : true,
    isLoading: false,
    error: null
  })

  const [whitelist, setWhitelist] = useState<WhitelistState>({
    whitelist:
      typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem(STORAGE_KEYS.WHITELIST) || '[]')
        : [],
    isActive:
      typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEYS.WHITELIST_ACTIVE) === 'true'
        : false
  })

  // Function to fetch stoplist from API based on language
  const fetchStoplist = useCallback(
    async (language: Language): Promise<string[]> => {
      // Return the English stoplist directly for now
      if (language === 'english') {
        return ENGLISH_STOPWORDS
      }

      // For custom, use the stored custom list
      if (language === 'custom') {
        return stoplist.customStoplist
      }

      // For other languages, we'll need to call the API
      // This is a placeholder for future implementation
      try {
        setStoplist((prev) => ({ ...prev, isLoading: true, error: null }))

        // TODO: Implement API call to fetch stoplist for other languages
        // Placeholder implementation:
        // const response = await fetch(`/api/stoplist/${language}`);
        // if (!response.ok) throw new Error(`Failed to fetch ${language} stoplist`);
        // const data = await response.json();
        // return data.stopwords;

        // For now, just return the English list with a delay to simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        setStoplist((prev) => ({ ...prev, isLoading: false }))
        return ENGLISH_STOPWORDS
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unknown error fetching stoplist'
        setStoplist((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }))
        return []
      }
    },
    [stoplist.customStoplist]
  )

  // Set the language and fetch the appropriate stoplist
  const setLanguage = useCallback(
    async (language: Language): Promise<void> => {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, language)

      // Update state immediately with the pending change
      setStoplist((prev) => ({
        ...prev,
        selectedLanguage: language,
        isLoading: true
      }))

      // Fetch the appropriate stoplist
      const newStoplist = await fetchStoplist(language)

      // Update state with the fetched stoplist
      setStoplist((prev) => ({
        ...prev,
        currentStoplist: newStoplist,
        isLoading: false
      }))
    },
    [fetchStoplist]
  )

  // Toggle stoplist active state
  const toggleStoplist = useCallback((): void => {
    setStoplist((prev) => {
      const newIsActive = !prev.isActive
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.STOPLIST_ACTIVE, String(newIsActive))
      return { ...prev, isActive: newIsActive }
    })
  }, [])

  // Toggle whitelist active state
  const toggleWhitelist = useCallback((): void => {
    setWhitelist((prev) => {
      const newIsActive = !prev.isActive
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.WHITELIST_ACTIVE, String(newIsActive))
      return { ...prev, isActive: newIsActive }
    })
  }, [])

  // Update custom stoplist
  const updateCustomStoplist = useCallback((words: string[]): void => {
    // Normalize words (lowercase, trim)
    const normalizedWords = words
      .map((word) => word.toLowerCase().trim())
      .filter((word) => word.length > 0)

    // Save to localStorage
    localStorage.setItem(
      STORAGE_KEYS.CUSTOM_STOPLIST,
      JSON.stringify(normalizedWords)
    )

    // Update state
    setStoplist((prev) => {
      const newState = {
        ...prev,
        customStoplist: normalizedWords
      }

      // Also update current stoplist if custom is selected
      if (prev.selectedLanguage === 'custom') {
        newState.currentStoplist = normalizedWords
      }

      return newState
    })
  }, [])

  // Update whitelist
  const updateWhitelist = useCallback((words: string[]): void => {
    // Normalize words (lowercase, trim)
    const normalizedWords = words
      .map((word) => word.toLowerCase().trim())
      .filter((word) => word.length > 0)

    // Save to localStorage
    localStorage.setItem(
      STORAGE_KEYS.WHITELIST,
      JSON.stringify(normalizedWords)
    )

    // Update state
    setWhitelist((prev) => ({
      ...prev,
      whitelist: normalizedWords
    }))
  }, [])

  // Load initial stoplist based on selected language
  useEffect(() => {
    const initializeStoplist = async (): Promise<void> => {
      const language = stoplist.selectedLanguage
      const newStoplist = await fetchStoplist(language)

      setStoplist((prev) => ({
        ...prev,
        currentStoplist: newStoplist
      }))
    }

    initializeStoplist()
  }, [fetchStoplist, stoplist.selectedLanguage])

  // Filter words using current stoplist and whitelist
  const filterWords = useCallback(
    <T extends { value: string }>(words: T[]): T[] => {
      if (!words.length) return words

      let filtered = [...words]

      // Apply stoplist filter if active
      if (stoplist.isActive && stoplist.currentStoplist.length > 0) {
        const stoplistSet = new Set(
          stoplist.currentStoplist.map((word) => word.toLowerCase())
        )
        filtered = filtered.filter(
          (word) => !stoplistSet.has(word.value.toLowerCase())
        )
      }

      // Apply whitelist filter if active
      if (whitelist.isActive && whitelist.whitelist.length > 0) {
        const whitelistSet = new Set(
          whitelist.whitelist.map((word) => word.toLowerCase())
        )
        filtered = filtered.filter((word) =>
          whitelistSet.has(word.value.toLowerCase())
        )
      }

      return filtered
    },
    [
      stoplist.isActive,
      stoplist.currentStoplist,
      whitelist.isActive,
      whitelist.whitelist
    ]
  )

  return {
    stoplist,
    whitelist,
    setLanguage,
    toggleStoplist,
    toggleWhitelist,
    updateCustomStoplist,
    updateWhitelist,
    filterWords
  }
}
