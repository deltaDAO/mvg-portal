import { useState, useEffect } from 'react'
import type { VizHubData } from './viz-hub'
import { TextAnalysisUseCaseData } from '../../@context/UseCases/models/TextAnalysis.model'

export interface DataLoadingState {
  data: VizHubData | null
  isLoading: boolean
  error: string | null
}

/**
 * Custom hook for loading and transforming text analysis data from local database
 * Converts TextAnalysisUseCaseData into VizHubData format for visualizations
 * Includes:
 * - Email distribution patterns
 * - Date-based communication trends
 * - Sentiment analysis results
 * - Word frequency and cloud data
 * - Document summary statistics
 */
export function useDataLoader(
  textAnalysisData: TextAnalysisUseCaseData[] = []
): DataLoadingState {
  const [state, setState] = useState<DataLoadingState>({
    data: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const transformData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        // Handle empty database
        if (!textAnalysisData || textAnalysisData.length === 0) {
          setState({
            data: null,
            isLoading: false,
            error: null
          })
          return
        }

        // Aggregate data from all text analysis results
        const aggregatedData: VizHubData = {
          emailDistribution: [],
          dateDistribution: [],
          sentiment: [],
          wordCloud: { wordCloudData: [] },
          documentSummary: undefined
        }

        // Process each text analysis record
        for (const record of textAnalysisData) {
          if (!record.result || record.result.length === 0) {
            continue
          }

          for (const result of record.result) {
            // Process word cloud data
            if (result.wordcloud) {
              // Handle different possible structures
              let wordCloudArray = null

              if (Array.isArray(result.wordcloud)) {
                // If wordcloud is directly an array
                wordCloudArray = result.wordcloud
              } else if (
                (result.wordcloud as any).wordCloudData &&
                Array.isArray((result.wordcloud as any).wordCloudData)
              ) {
                // If wordcloud is an object with wordCloudData property
                wordCloudArray = (result.wordcloud as any).wordCloudData
              }

              if (wordCloudArray && wordCloudArray.length > 0) {
                const wordCloudData = wordCloudArray.map((item) => {
                  const anyItem = item as any // Type assertion to handle different formats
                  return {
                    value: anyItem.value || anyItem.word || anyItem.text || '',
                    count:
                      anyItem.count || anyItem.frequency || anyItem.freq || 0
                  }
                })
                aggregatedData.wordCloud.wordCloudData.push(...wordCloudData)
              }
            }

            // Process sentiment data
            if (result.sentiment && Array.isArray(result.sentiment)) {
              aggregatedData.sentiment.push(...result.sentiment)
            }

            // Process document summary (use the latest one)
            if (result.documentSummary) {
              aggregatedData.documentSummary = result.documentSummary
            }

            // Process email distribution data
            if (result.emailDistribution) {
              try {
                let emailData
                if (typeof result.emailDistribution === 'string') {
                  // Parse CSV-like string data
                  const lines = result.emailDistribution.trim().split('\n')
                  emailData = lines
                    .slice(1) // Skip header
                    .map((line) => ({ emails_per_day: parseInt(line.trim()) }))
                    .filter((item) => !isNaN(item.emails_per_day))
                } else if (Array.isArray(result.emailDistribution)) {
                  emailData = result.emailDistribution
                }

                if (emailData && emailData.length > 0) {
                  aggregatedData.emailDistribution.push(...emailData)
                }
              } catch (error) {
                console.warn('Error processing email distribution data:', error)
              }
            }

            // Process date distribution data
            if (result.dataDistribution) {
              try {
                let dateData
                if (typeof result.dataDistribution === 'string') {
                  // Parse CSV-like string data
                  const lines = result.dataDistribution.trim().split('\n')
                  dateData = lines
                    .slice(1) // Skip header
                    .map((line) => {
                      const [time, count] = line.split(',')
                      return {
                        time: time?.trim() || '',
                        count: parseInt(count?.trim() || '0')
                      }
                    })
                    .filter((item) => item.time && !isNaN(item.count))
                } else if (Array.isArray(result.dataDistribution)) {
                  dateData = result.dataDistribution
                }

                if (dateData && dateData.length > 0) {
                  aggregatedData.dateDistribution.push(...dateData)
                }
              } catch (error) {
                console.warn('Error processing date distribution data:', error)
              }
            }
          }
        }

        // Clean up aggregated data - remove duplicates and validate
        if (aggregatedData.wordCloud.wordCloudData.length > 0) {
          // Merge duplicate words by summing their counts
          const wordMap = new Map()
          aggregatedData.wordCloud.wordCloudData.forEach((item) => {
            const existing = wordMap.get(item.value) || 0
            wordMap.set(item.value, existing + item.count)
          })
          aggregatedData.wordCloud.wordCloudData = Array.from(
            wordMap.entries()
          ).map(([value, count]) => ({ value, count }))
        }

        // Remove empty arrays to avoid empty visualizations
        if (aggregatedData.emailDistribution.length === 0) {
          delete aggregatedData.emailDistribution
        }
        if (aggregatedData.dateDistribution.length === 0) {
          delete aggregatedData.dateDistribution
        }
        if (aggregatedData.sentiment.length === 0) {
          delete aggregatedData.sentiment
        }
        if (aggregatedData.wordCloud.wordCloudData.length === 0) {
          delete aggregatedData.wordCloud
        }

        setState({
          data: aggregatedData,
          isLoading: false,
          error: null
        })
      } catch (err) {
        console.error('Error transforming text analysis data:', err)
        setState({
          data: null,
          isLoading: false,
          error:
            err instanceof Error
              ? err.message
              : 'Unknown error occurred while processing data'
        })
      }
    }

    transformData()
  }, [textAnalysisData])

  return state
}
