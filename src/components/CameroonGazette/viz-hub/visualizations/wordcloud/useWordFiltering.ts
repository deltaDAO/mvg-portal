import { useEffect, useState, useCallback } from 'react'
import { WordData, StopwordsOption, WhitelistOption } from './types'
import { ENGLISH_STOPWORDS, DEFAULT_CUSTOM_STOPWORDS } from './constants'

interface UseWordFilteringProps {
  words: WordData[]
  searchTerm: string
  minFrequency: number
  maxWords: number
  stopwordsOption: StopwordsOption
  whitelistOption: WhitelistOption
  modalsOpen: boolean
}

export const useWordFiltering = ({
  words,
  searchTerm,
  minFrequency,
  maxWords,
  stopwordsOption,
  whitelistOption,
  modalsOpen
}: UseWordFilteringProps) => {
  const [filteredWords, setFilteredWords] = useState<WordData[]>([])
  const [customStopwords, setCustomStopwords] = useState<string[]>(
    DEFAULT_CUSTOM_STOPWORDS
  )
  const [customWhitelist, setCustomWhitelist] = useState<string[]>([])
  const [autoDetectedStopwords, setAutoDetectedStopwords] = useState<string[]>(
    []
  )

  // Auto-detect stopwords based on word frequencies
  useEffect(() => {
    if (words.length > 10) {
      // Find common words that likely are stopwords based on frequency analysis
      const totalWords = words.reduce((sum, word) => sum + word.count, 0)
      const averageFrequency = totalWords / words.length

      // Words that appear much more frequently than average might be stopwords
      const potentialStopwords = words
        .filter(
          (word) =>
            word.count > averageFrequency * 3 && // Much more frequent than average
            word.value.length <= 4 && // Short words are often stopwords
            !['name', 'year', 'data', 'info'].includes(word.value.toLowerCase()) // Exclude common meaningful short words
        )
        .map((word) => word.value.toLowerCase())

      setAutoDetectedStopwords(potentialStopwords)
    }
  }, [words])

  // Helper function to get active stopwords based on current option
  const getActiveStopwords = useCallback((): string[] => {
    switch (stopwordsOption) {
      case 'Auto-detect':
        return autoDetectedStopwords
      case 'English':
        return ENGLISH_STOPWORDS
      case 'Custom':
        return customStopwords
      case 'None':
      default:
        return []
    }
  }, [stopwordsOption, autoDetectedStopwords, customStopwords])

  // Helper function to get active whitelist based on current option
  const getActiveWhitelist = useCallback((): string[] => {
    switch (whitelistOption) {
      case 'Custom':
        return customWhitelist
      case 'None':
      default:
        return []
    }
  }, [whitelistOption, customWhitelist])

  // Filter words
  useEffect(() => {
    // Skip filtering if modals are open
    if (modalsOpen) return

    let filtered = [...words]

    if (searchTerm) {
      filtered = filtered.filter((word) =>
        word.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply stopwords filter
    const stopwords = getActiveStopwords()
    if (stopwords.length > 0) {
      filtered = filtered.filter(
        (word) => !stopwords.includes(word.value.toLowerCase())
      )
    }

    // Apply whitelist filter
    const whitelist = getActiveWhitelist()
    if (whitelist.length > 0) {
      filtered = filtered.filter((word) =>
        whitelist.includes(word.value.toLowerCase())
      )
    }

    filtered = filtered
      .filter((word) => word.count >= minFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords)

    setFilteredWords(filtered)
  }, [
    words,
    searchTerm,
    minFrequency,
    maxWords,
    getActiveStopwords,
    getActiveWhitelist,
    modalsOpen
  ])

  return {
    filteredWords,
    customStopwords,
    setCustomStopwords,
    customWhitelist,
    setCustomWhitelist,
    autoDetectedStopwords,
    getActiveStopwords,
    getActiveWhitelist
  }
}
