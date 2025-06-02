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

export interface SentimentCategory {
  name: string
  values: [string, number][]
}

export interface Sentiment extends Array<SentimentCategory> {}

export interface WordCloud {
  value: string
  count: number
}

export interface TextAnalysisResult {
  wordcloud?: WordCloud
  sentiment?: Sentiment
  dataDistribution?: string
  emailDistribution?: string
  documentSummary?: DocumentSummary
}
