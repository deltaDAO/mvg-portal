import { create } from 'zustand'

// Storage keys for different data types
export const STORAGE_KEYS = {
  WORD_CLOUD: 'wordCloudData',
  DATE_DISTRIBUTION: 'dateDistributionData',
  EMAIL_DISTRIBUTION: 'emailDistributionData',
  SENTIMENT: 'sentimentData',
  DOCUMENT_SUMMARY: 'documentSummaryData'
} as const

// Define the types for our store
interface DataStatus {
  wordCloudData: boolean
  dateDistributionData: boolean
  emailDistributionData: boolean
  sentimentData: boolean
  documentSummaryData: boolean
}

export type ProcessingStatus = 'ready' | 'not_ready' | 'error'

// Data types for each visualization
export interface WordCloudData {
  wordCloudData: Array<{ value: string; count: number }>
}

export interface DateDistributionData {
  time: string
  count: number
}

export interface EmailDistributionData {
  emails_per_day: number
}

export interface SentimentData {
  name: string
  values: [string, number][]
}

export interface DocumentSummaryData {
  totalDocuments: number
  totalWords: number
  uniqueWords: number
  vocabularyDensity: number
  readabilityIndex: number
  wordsPerSentence: number
  frequentWords: Array<{ word: string; count: number }>
  created: string
}

// Helper functions to check and get data from localStorage
const isDataAvailable = (dataType: string): boolean => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(dataType)
}

// Helper function to parse user data based on file type
const parseUserData = (dataType: string): unknown => {
  if (typeof window === 'undefined') return null

  const data = localStorage.getItem(dataType)
  const fileType = localStorage.getItem(`${dataType}FileType`)

  if (!data) return null

  try {
    if (fileType?.includes('json')) {
      return JSON.parse(data)
    } else if (fileType?.includes('csv') || fileType?.includes('text')) {
      return data // Return raw CSV/text data
    } else {
      console.error('Unsupported file type:', fileType)
      return null
    }
  } catch (error) {
    console.error(`Error parsing ${dataType}:`, error)
    return null
  }
}

// Generate document summary from text
const generateDocumentSummaryFromText = (
  text: string,
  fileName: string
): DocumentSummaryData => {
  const words = text.split(/\s+/).filter((w) => w.length > 0)
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()))
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  // Count word frequencies
  const wordCounts: Record<string, number> = {}
  words.forEach((word) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '')
    if (cleanWord.length > 2) {
      wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1
    }
  })

  // Get most frequent words
  const frequentWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))

  const today = new Date().toISOString().split('T')[0]

  return {
    totalDocuments: 1,
    totalWords: words.length,
    uniqueWords: uniqueWords.size,
    vocabularyDensity: uniqueWords.size / words.length,
    readabilityIndex: 8.5, // Mock value
    wordsPerSentence:
      sentences.length > 0 ? words.length / sentences.length : 0,
    frequentWords,
    created: `${today} from ${fileName}`
  }
}

// Generate word cloud from text
const generateWordCloudFromText = (text: string): WordCloudData => {
  // Split text into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2)

  // Count word frequencies
  const wordCounts: Record<string, number> = {}
  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1
  })

  // Convert to word cloud format
  const wordCloudData = Object.entries(wordCounts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 100)

  return { wordCloudData }
}

interface DataStore {
  // Data status for each component
  dataStatus: DataStatus
  setDataStatus: (dataType: string, status: boolean) => void

  // Global processing status
  processingStatus: ProcessingStatus
  setProcessingStatus: (status: ProcessingStatus) => void

  // Status message
  statusMessage: string
  setStatusMessage: (message: string) => void

  // Check data status
  checkDataStatus: () => void

  // Data fetching functions for components
  fetchEmailDistribution: () => Promise<string>
  fetchDateDistribution: () => Promise<string>
  fetchSentimentData: () => Promise<SentimentData[]>
  fetchWordCloudData: () => Promise<WordCloudData>
  fetchDocumentSummary: () => Promise<DocumentSummaryData>

  // Save data functions
  saveData: (
    dataType: string,
    data: string,
    fileName: string,
    fileType: string
  ) => void

  // Check if data is available
  hasData: (dataType: string) => boolean
  clearAllData: () => void
}

export const useDataStore = create<DataStore>((set, get) => ({
  // Initial data status
  dataStatus: {
    wordCloudData: false,
    dateDistributionData: false,
    emailDistributionData: false,
    sentimentData: false,
    documentSummaryData: false
  },

  // Set status for a data type
  setDataStatus: (dataType: string, status: boolean) =>
    set((state) => ({
      dataStatus: {
        ...state.dataStatus,
        [dataType]: status
      }
    })),

  // Global processing status
  processingStatus: 'ready',
  setProcessingStatus: (status: ProcessingStatus) =>
    set({ processingStatus: status }),

  // Status message
  statusMessage: '',
  setStatusMessage: (message: string) => set({ statusMessage: message }),

  // Check data status
  checkDataStatus: () => {
    const dataStatus = {
      wordCloudData: isDataAvailable(STORAGE_KEYS.WORD_CLOUD),
      dateDistributionData: isDataAvailable(STORAGE_KEYS.DATE_DISTRIBUTION),
      emailDistributionData: isDataAvailable(STORAGE_KEYS.EMAIL_DISTRIBUTION),
      sentimentData: isDataAvailable(STORAGE_KEYS.SENTIMENT),
      documentSummaryData: isDataAvailable(STORAGE_KEYS.DOCUMENT_SUMMARY)
    }

    set({ dataStatus })
  },

  // Save data to localStorage
  saveData: (
    dataType: string,
    data: string,
    fileName: string,
    fileType: string
  ) => {
    if (typeof window === 'undefined') return

    localStorage.setItem(dataType, data)
    localStorage.setItem(`${dataType}FileName`, fileName)
    localStorage.setItem(`${dataType}FileType`, fileType)
    localStorage.setItem(`${dataType}Timestamp`, Date.now().toString())

    // Update data status
    set((state) => ({
      dataStatus: {
        ...state.dataStatus,
        [dataType]: true
      }
    }))
  },

  // Check if data is available
  hasData: (dataType: string) => {
    return isDataAvailable(dataType)
  },

  // Clear all data
  clearAllData: () => {
    if (typeof window === 'undefined') return

    // Clear all data from localStorage
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
      localStorage.removeItem(`${key}FileName`)
      localStorage.removeItem(`${key}FileType`)
      localStorage.removeItem(`${key}Timestamp`)
    })

    // Reset data status
    set({
      dataStatus: {
        wordCloudData: false,
        dateDistributionData: false,
        emailDistributionData: false,
        sentimentData: false,
        documentSummaryData: false
      }
    })
  },

  // Data fetching functions for components
  fetchEmailDistribution: async () => {
    if (isDataAvailable(STORAGE_KEYS.EMAIL_DISTRIBUTION)) {
      const data = localStorage.getItem(STORAGE_KEYS.EMAIL_DISTRIBUTION)
      if (data) return data
    }

    throw new Error(
      'No email distribution data available. Please upload data first.'
    )
  },

  fetchDateDistribution: async () => {
    if (isDataAvailable(STORAGE_KEYS.DATE_DISTRIBUTION)) {
      const data = localStorage.getItem(STORAGE_KEYS.DATE_DISTRIBUTION)
      if (data) return data
    }

    throw new Error(
      'No date distribution data available. Please upload data first.'
    )
  },

  fetchSentimentData: async () => {
    if (isDataAvailable(STORAGE_KEYS.SENTIMENT)) {
      const data = localStorage.getItem(STORAGE_KEYS.SENTIMENT)
      if (data) {
        try {
          return JSON.parse(data) as SentimentData[]
        } catch (e) {
          console.error('Error parsing sentiment data:', e)
          throw new Error(
            'Invalid sentiment data format. Please upload data again.'
          )
        }
      }
    }

    throw new Error('No sentiment data available. Please upload data first.')
  },

  fetchWordCloudData: async () => {
    if (isDataAvailable(STORAGE_KEYS.WORD_CLOUD)) {
      const data = localStorage.getItem(STORAGE_KEYS.WORD_CLOUD)
      if (data) {
        try {
          return JSON.parse(data) as WordCloudData
        } catch (e) {
          console.error('Error parsing word cloud data:', e)
          // If data is text, try to generate word cloud from it
          return generateWordCloudFromText(data)
        }
      }
    }

    throw new Error('No word cloud data available. Please upload data first.')
  },

  fetchDocumentSummary: async () => {
    if (isDataAvailable(STORAGE_KEYS.DOCUMENT_SUMMARY)) {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENT_SUMMARY)
      const fileName =
        localStorage.getItem(`${STORAGE_KEYS.DOCUMENT_SUMMARY}FileName`) ||
        'user_data.txt'

      if (data) {
        try {
          return JSON.parse(data) as DocumentSummaryData
        } catch (e) {
          console.error('Error parsing document summary data:', e)
          // If data is text, try to generate document summary from it
          return generateDocumentSummaryFromText(data, fileName)
        }
      }
    }

    throw new Error(
      'No document summary data available. Please upload data first.'
    )
  }
}))
