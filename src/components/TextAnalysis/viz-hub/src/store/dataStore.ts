import { create } from 'zustand'
import { TextAnalysisUseCaseData } from '@/@context/UseCases/models/TextAnalysis.model'
import {
  WordCloud,
  DateDistribution,
  EmailDistribution,
  SentimentCategory,
  SentimentData,
  DocumentSummary
} from '@/components/TextAnalysis/_types'

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
export interface DateDistributionData extends DateDistribution {}
export interface EmailDistributionData extends EmailDistribution {}
export interface SentimentDataArray extends Array<SentimentData> {}
export interface DocumentSummaryData extends DocumentSummary {}
export interface WordCloudData {
  wordCloudData: WordCloud[]
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
  checkDataStatus: (data: TextAnalysisUseCaseData[]) => void

  // Data fetching functions for components
  fetchEmailDistribution: (
    data: TextAnalysisUseCaseData[]
  ) => Promise<EmailDistributionData[]>
  fetchDateDistribution: (
    data: TextAnalysisUseCaseData[]
  ) => Promise<DateDistributionData[]>
  fetchSentimentData: (
    data: TextAnalysisUseCaseData[]
  ) => Promise<SentimentDataArray>
  fetchWordCloudData: (
    data: TextAnalysisUseCaseData[]
  ) => Promise<WordCloudData>
  fetchDocumentSummary: (
    data: TextAnalysisUseCaseData[]
  ) => Promise<DocumentSummaryData>

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
  checkDataStatus: (data: TextAnalysisUseCaseData[]) => {
    if (!data || data.length === 0) {
      set({
        dataStatus: {
          wordCloudData: false,
          dateDistributionData: false,
          emailDistributionData: false,
          sentimentData: false,
          documentSummaryData: false
        }
      })
      return
    }

    const hasWordCloud = data.some((item) =>
      item.result.some((result) => result.wordcloud)
    )
    const hasDateDistribution = data.some((item) =>
      item.result.some((result) => result.dataDistribution)
    )
    const hasEmailDistribution = data.some((item) =>
      item.result.some((result) => result.emailDistribution)
    )
    const hasSentiment = data.some((item) =>
      item.result.some((result) => result.sentiment)
    )
    const hasDocumentSummary = data.some((item) =>
      item.result.some((result) => result.documentSummary)
    )

    set({
      dataStatus: {
        wordCloudData: hasWordCloud,
        dateDistributionData: hasDateDistribution,
        emailDistributionData: hasEmailDistribution,
        sentimentData: hasSentiment,
        documentSummaryData: hasDocumentSummary
      }
    })
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
    const state = get()
    return state.dataStatus[dataType as keyof DataStatus] || false
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
  fetchEmailDistribution: async (data: TextAnalysisUseCaseData[]) => {
    const emailDistributionData: EmailDistributionData[] = []

    data.forEach((item) => {
      item.result.forEach((result) => {
        if (result.emailDistribution) {
          try {
            const rows = result.emailDistribution.trim().split('\n')
            const parsedData = rows
              .slice(1)
              .map((row) => ({
                emails_per_day: parseInt(row.trim())
              }))
              .filter((item) => !isNaN(item.emails_per_day))

            emailDistributionData.push(...parsedData)
          } catch (error) {
            console.error('Error parsing email distribution data:', error)
          }
        }
      })
    })

    return emailDistributionData
  },

  fetchDateDistribution: async (data: TextAnalysisUseCaseData[]) => {
    const dateDistributionData: DateDistributionData[] = []

    data.forEach((item) => {
      item.result.forEach((result) => {
        if (result.dataDistribution) {
          try {
            const rows = result.dataDistribution.trim().split('\n')
            const headers = rows[0].split(',')
            const parsedData = rows
              .slice(1)
              .map((row) => {
                const values = row.split(',')
                return {
                  time: values[0].trim(),
                  count: parseInt(values[1])
                }
              })
              .filter((item) => item.time && !isNaN(item.count))

            dateDistributionData.push(...parsedData)
          } catch (error) {
            console.error('Error parsing date distribution data:', error)
          }
        }
      })
    })

    return dateDistributionData
  },

  fetchSentimentData: async (data: TextAnalysisUseCaseData[]) => {
    const sentimentData: SentimentDataArray = []

    data.forEach((item) => {
      item.result.forEach((result) => {
        if (result.sentiment) {
          const sentimentArray = Array.isArray(result.sentiment)
            ? result.sentiment
            : [result.sentiment]

          sentimentArray.forEach((sentiment) => {
            const category = sentiment as SentimentCategory
            sentimentData.push({
              name: category.name,
              values: category.values
            })
          })
        }
      })
    })

    return sentimentData
  },

  fetchWordCloudData: async (data: TextAnalysisUseCaseData[]) => {
    console.log('Starting fetchWordCloudData with input:', data)
    let wordCloudData: WordCloudData = { wordCloudData: [] }

    data.forEach((item) => {
      item.result.forEach((result) => {
        console.log('Checking result:', result)
        if (result.wordcloud) {
          console.log('Found wordcloud data:', result.wordcloud)
          try {
            // If wordcloud is a string, parse it as JSON
            if (typeof result.wordcloud === 'string') {
              console.log('Parsing string wordcloud data')
              const parsed = JSON.parse(result.wordcloud)
              console.log('Parsed wordcloud data:', parsed)
              wordCloudData = {
                wordCloudData: Array.isArray(parsed) ? parsed : []
              }
            } else {
              // If wordcloud is already an array, use it directly
              console.log('Using direct wordcloud data:', result.wordcloud)
              wordCloudData = {
                wordCloudData: Array.isArray(result.wordcloud)
                  ? result.wordcloud
                  : []
              }
            }
            console.log('Final wordCloudData:', wordCloudData)
          } catch (error) {
            console.error('Error processing wordcloud data:', error)
          }
        }
      })
    })

    return wordCloudData
  },

  fetchDocumentSummary: async (data: TextAnalysisUseCaseData[]) => {
    let documentSummary: DocumentSummaryData | null = null

    data.forEach((item) => {
      item.result.forEach((result) => {
        if (result.documentSummary) {
          documentSummary = result.documentSummary
        }
      })
    })

    if (!documentSummary) {
      throw new Error('No document summary data found')
    }

    return documentSummary
  }
}))
