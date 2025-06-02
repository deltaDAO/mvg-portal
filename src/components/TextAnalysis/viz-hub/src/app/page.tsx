'use client'

import { useEffect, useState } from 'react'
import SentimentChartV2 from '../components/SentimentChart_v2'
import DataDistribution from '../components/DataDistribution'
import WordCloud from '../components/WordCloud'
import DocumentSummary from '../components/DocumentSummary'
import Logo from '../components/Logo'
import { TextAnalysisUseCaseData } from '@/@context/UseCases/models/TextAnalysis.model'

// define interfaces
interface WordCloudData {
  wordCloudData: Array<{ value: string; count: number }>
}

interface SentimentData {
  name: string
  values: [string, number][]
}

interface DocumentSummaryData {
  totalDocuments: number
  totalWords: number
  uniqueWords: number
  vocabularyDensity: number
  readabilityIndex: number
  wordsPerSentence: number
  frequentWords: Array<{ word: string; count: number }>
  created: string
}

interface DistributionData {
  time: string
  count: number
}

export interface TextAnalysisProps {
  data: TextAnalysisUseCaseData[]
}

export default function Home({ data }: TextAnalysisProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [wordCloudData, setWordCloudData] = useState<WordCloudData | null>(null)
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null)
  const [dateDistributionData, setDateDistributionData] = useState<
    DistributionData[] | null
  >(null)
  const [emailDistributionData, setEmailDistributionData] = useState<
    DistributionData[] | null
  >(null)
  const [documentSummaryData, setDocumentSummaryData] =
    useState<DocumentSummaryData | null>(null)

  useEffect(() => {
    if (data && data.length > 0) {
      // Process each file from the data
      data.forEach((item) => {
        const filename = item.job.results[0].filename.toLowerCase()
        const content = item.job.results[0].content

        try {
          if (
            filename.includes('wordcloud') ||
            filename.includes('word_cloud')
          ) {
            setWordCloudData(JSON.parse(content) as WordCloudData)
          } else if (filename.includes('sentiment')) {
            setSentimentData(JSON.parse(content) as SentimentData)
          } else if (
            filename.includes('date_distribution') ||
            filename.includes('date')
          ) {
            setDateDistributionData(JSON.parse(content) as DistributionData[])
          } else if (
            filename.includes('email_distribution') ||
            filename.includes('email')
          ) {
            setEmailDistributionData(JSON.parse(content) as DistributionData[])
          } else if (
            filename.includes('document_summary') ||
            filename.includes('summary')
          ) {
            setDocumentSummaryData(JSON.parse(content) as DocumentSummaryData)
          }
        } catch (error) {
          console.error(`Error parsing ${filename}:`, error)
        }
      })
    }
    setIsLoading(false)
  }, [data])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Empty state component
  const EmptyState = ({ title }: { title: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600 mb-1">No data available to display.</p>
    </div>
  )

  // Render the dashboard with visualizations or empty states
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Text Analysis Visualization Hub
        </h1>
        <p className="text-gray-600 mb-6">
          Interactive analysis developed by ClioX
        </p>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Word Cloud */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Word Cloud
            </h2>
            <WordCloud />
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Sentiment Analysis
            </h2>
            <SentimentChartV2 />
          </div>

          {/* Data Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Data Distribution
            </h2>
            <DataDistribution
              title="Data Distribution"
              type="date"
              description="Shows the distribution of data over time"
            />
          </div>

          {/* Document Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Document Summary
            </h2>
            <DocumentSummary />
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2">
          <Logo darkMode={false} size="small" />
          <p>© {new Date().getFullYear()} ClioX</p>
        </div>
      </footer>
    </div>
  )
}
