import { useState, useEffect } from 'react'
import type { VizHubData } from './viz-hub'

export interface DataLoadingState {
  data: VizHubData | null
  isLoading: boolean
  error: string | null
}

/**
 * Custom hook for loading sample data for text analysis use case
 * Demonstrates email data analysis capabilities including:
 * - Email distribution patterns
 * - Date-based communication trends
 * - Sentiment analysis results
 * - Word frequency and cloud data
 * - Document summary statistics
 */
export function useDataLoader(): DataLoadingState {
  const [state, setState] = useState<DataLoadingState>({
    data: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        // Load all sample data files in parallel for demonstration
        const [
          wordCloudResponse,
          sentimentResponse,
          documentSummaryResponse,
          emailDistributionResponse,
          dateDistributionResponse
        ] = await Promise.all([
          fetch('/samples/wordcloud.json'),
          fetch('/samples/sentiment.json'),
          fetch('/samples/document_summary.json'),
          fetch('/samples/email_distribution.csv'),
          fetch('/samples/date_distribution.csv')
        ])

        // Validate that all data sources are available
        const responses = [
          { response: wordCloudResponse, name: 'Word Cloud Data' },
          { response: sentimentResponse, name: 'Sentiment Analysis' },
          { response: documentSummaryResponse, name: 'Document Summary' },
          { response: emailDistributionResponse, name: 'Email Distribution' },
          { response: dateDistributionResponse, name: 'Date Distribution' }
        ]

        const failedRequests = responses.filter(({ response }) => !response.ok)
        if (failedRequests.length > 0) {
          const failedNames = failedRequests.map(({ name }) => name).join(', ')
          throw new Error(`Failed to load data sources: ${failedNames}`)
        }

        // Parse JSON data
        const [wordCloudData, sentimentData, documentSummaryData] =
          await Promise.all([
            wordCloudResponse.json(),
            sentimentResponse.json(),
            documentSummaryResponse.json()
          ])

        // Parse CSV data for distribution analysis
        const [emailDistributionText, dateDistributionText] = await Promise.all(
          [emailDistributionResponse.text(), dateDistributionResponse.text()]
        )

        // Process email distribution CSV
        const emailDistributionLines = emailDistributionText.trim().split('\n')
        const emailDistribution = emailDistributionLines
          .slice(1) // Skip header
          .map((line) => ({ emails_per_day: parseInt(line.trim()) }))
          .filter((item) => !isNaN(item.emails_per_day))

        // Process date distribution CSV
        const dateDistributionLines = dateDistributionText.trim().split('\n')
        const dateDistribution = dateDistributionLines
          .slice(1) // Skip header
          .map((line) => {
            const [time, count] = line.split(',')
            return { time: time.trim(), count: parseInt(count.trim()) }
          })
          .filter((item) => item.time && !isNaN(item.count))

        // Validate processed data
        if (emailDistribution.length === 0 || dateDistribution.length === 0) {
          throw new Error('Invalid data format in CSV files')
        }

        // Assemble complete dataset for visualization
        const completeData: VizHubData = {
          emailDistribution,
          dateDistribution,
          sentiment: sentimentData,
          wordCloud: wordCloudData,
          documentSummary: documentSummaryData
        }

        setState({
          data: completeData,
          isLoading: false,
          error: null
        })
      } catch (err) {
        console.error('Error loading use case data:', err)
        setState({
          data: null,
          isLoading: false,
          error:
            err instanceof Error
              ? err.message
              : 'Unknown error occurred while loading data'
        })
      }
    }

    loadData()
  }, [])

  return state
}
