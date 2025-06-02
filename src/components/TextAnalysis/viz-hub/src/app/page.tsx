'use client'

import { useEffect, useState } from 'react'
import SentimentChartV2 from '../components/SentimentChart_v2'
import DataDistribution from '../components/DataDistribution'
import WordCloud from '../components/WordCloud'
import DocumentSummary from '../components/DocumentSummary'
import Logo from '../components/Logo'
import { TextAnalysisUseCaseData } from '@/@context/UseCases/models/TextAnalysis.model'

// Empty state component
const EmptyState = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
    <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 mb-1">No data available.</p>
  </div>
)

export interface TextAnalysisProps {
  data: TextAnalysisUseCaseData[]
}

export default function Home({ data }: TextAnalysisProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [processedData, setProcessedData] = useState<{
    emailDistribution?: {
      time: string
      count: number
      emails_per_day?: number
    }[]
    dateDistribution?: {
      time: string
      count: number
      emails_per_day?: number
    }[]
    sentiment?: { name: string; values: [string, number][] }
    wordCloud?: { wordCloudData: { value: string; count: number }[] }
    documentSummary?: {
      totalDocuments: number
      totalWords: number
      uniqueWords: number
      vocabularyDensity: number
      readabilityIndex: number
      wordsPerSentence: number
      frequentWords: Array<{ word: string; count: number }>
      created: string
    }
  }>({})

  useEffect(() => {
    if (data && data.length > 0) {
      const newProcessedData: any = {}

      // Process each item from the data
      data.forEach((item) => {
        // Process each result in the item's result array
        item.result.forEach((result) => {
          try {
            if (result.wordcloud) {
              newProcessedData.wordCloud = result.wordcloud
            }
            if (result.sentiment) {
              newProcessedData.sentiment = result.sentiment
            }
            if (result.dataDistribution) {
              // Parse CSV data as a whole
              const rows = result.dataDistribution.trim().split('\n')
              const headers = rows[0].split(',')
              const data = rows
                .slice(1)
                .map((row) => {
                  const values = row.split(',')
                  // Ensure date is in YYYY-MM-DD format
                  const dateStr = values[0].trim()
                  const date = new Date(dateStr)
                  const formattedDate = date.toISOString().split('T')[0] // Convert to YYYY-MM-DD
                  return {
                    time: formattedDate,
                    count: parseInt(values[1])
                  }
                })
                .filter((item) => item.time && !isNaN(item.count))
              newProcessedData.dateDistribution = data
            }
            if (result.emailDistribution) {
              // Parse CSV data as a whole
              const rows = result.emailDistribution.trim().split('\n')
              const data = rows
                .slice(1)
                .map((row) => {
                  const value = parseInt(row.trim())
                  return {
                    emails_per_day: value
                  }
                })
                .filter((item) => !isNaN(item.emails_per_day))
              newProcessedData.emailDistribution = data
            }
            if (result.documentSummary) {
              newProcessedData.documentSummary = result.documentSummary
            }
          } catch (error) {
            console.error('Error processing result:', error)
          }
        })
      })

      setProcessedData(newProcessedData)
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {processedData.emailDistribution ? (
            <DataDistribution
              title="Data Distribution on Email Counts"
              description="Shows the distribution of email counts over time"
              type="email"
              skipLoading={true}
              data={processedData.emailDistribution}
            />
          ) : (
            <EmptyState title="Email Distribution" />
          )}

          {processedData.dateDistribution ? (
            <DataDistribution
              title="Data Distribution on Date"
              description="Shows the distribution of emails by date"
              type="date"
              skipLoading={true}
              data={processedData.dateDistribution}
            />
          ) : (
            <EmptyState title="Date Distribution" />
          )}
        </div>

        <div className="mb-6">
          {processedData.sentiment ? (
            <SentimentChartV2
              skipLoading={true}
              data={processedData.sentiment}
            />
          ) : (
            <EmptyState title="Sentiment Analysis" />
          )}
        </div>

        <div className="mb-6">
          {processedData.wordCloud ? (
            <WordCloud data={processedData.wordCloud} />
          ) : (
            <EmptyState title="Word Cloud" />
          )}
        </div>

        <div className="mb-6">
          {processedData.documentSummary ? (
            <DocumentSummary
              skipLoading={true}
              data={processedData.documentSummary}
            />
          ) : (
            <EmptyState title="Document Summary" />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">
            Further more ...
          </h2>
          <p className="text-gray-600">
            Additional visualizations and analysis tools will be added here.
          </p>
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
