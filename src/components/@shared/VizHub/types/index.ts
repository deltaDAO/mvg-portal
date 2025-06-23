// VizHub component data types
export interface EmailDistributionData {
  emails_per_day: number
}

export interface DateDistributionData {
  time: string
  count: number
}

export interface SentimentData {
  name: string
  values: [string, number][]
}

export interface WordCloudData {
  wordCloudData: Array<{ value: string; count: number }>
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

// Main data interface for VizHub
export interface VizHubData {
  emailDistribution?: EmailDistributionData[]
  dateDistribution?: DateDistributionData[]
  sentiment?: SentimentData[]
  wordCloud?: WordCloudData
  documentSummary?: DocumentSummaryData
}

// Use case specific configuration
export interface UseCaseConfig {
  /**
   * The use case name - used for data storage keys and identification
   */
  useCaseName: string

  /**
   * Algorithm DIDs mapping for different chains
   */
  algoDids: Record<number, string>

  /**
   * Result ZIP file configuration
   */
  resultZip: {
    fileName: string
    metadataFileName: string
    detectionsFileName: string
    imagesFolderName: string
  }
}

// Configuration interface for controlling which visualizations to show
export interface VizHubConfig {
  showEmailDistribution?: boolean
  showDateDistribution?: boolean
  showSentiment?: boolean
  showWordCloud?: boolean
  showDocumentSummary?: boolean
  showFutureFeatures?: boolean
}

// Main VizHub component props
export interface VizHubProps {
  data?: VizHubData
  config?: VizHubConfig
  useCaseConfig: UseCaseConfig
  className?: string
  theme?: 'light' | 'dark'
}

// Default configuration
export const DEFAULT_VIZHUB_CONFIG: VizHubConfig = {
  showEmailDistribution: true,
  showDateDistribution: true,
  showSentiment: true,
  showWordCloud: true,
  showDocumentSummary: true,
  showFutureFeatures: true
}
