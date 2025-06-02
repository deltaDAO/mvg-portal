export interface DateDistribution {
  time: string
  count: number
  emails_per_day?: number
}

export interface EmailDistribution {
  emails_per_day: number
}

export interface FrequentWord {
  word: string
  count: number
}

export interface DocumentSummary {
  totalDocuments: number
  totalWords: number
  uniqueWords: number
  vocabularyDensity: number
  readabilityIndex: number
  wordsPerSentence: number
  frequentWords: FrequentWord[]
  created: string
}

export interface Sentiment {
  name: string
  values: [string, number][]
}

export interface WordCloud {
  value: string
  count: number
}

export interface TextAnalysisResult {
  dataDistribution?: string
  emailDistribution?: string
  documentSummary?: DocumentSummary
  sentiment?: Sentiment
  wordcloud?: { wordCloudData: WordCloud[] }
}
