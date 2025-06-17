import { useEffect, useRef } from 'react'
import { useDataStore } from '../store/dataStore'
import type { VizHubData, VizHubConfig } from '../types'
import { DEFAULT_VIZHUB_CONFIG } from '../types'

/**
 * Convert array data to CSV format for distribution charts
 */
const convertToCSV = (data: any[], headers: string[]): string => {
  const csvRows = [headers.join(',')]
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header === 'emails_per_day' ? 'emails_per_day' : header]
      return typeof value === 'string' ? value : String(value)
    })
    csvRows.push(values.join(','))
  })
  return csvRows.join('\n')
}

/**
 * Custom hook to handle VizHub data injection and processing
 * This hook manages the integration between external props data and localStorage
 * so that existing visualization components work without modification
 */
export function useVizHubData(
  externalData?: VizHubData,
  config?: VizHubConfig
) {
  const { checkDataStatus, dataStatus, processingStatus, statusMessage } =
    useDataStore()

  // Keep track of whether we've injected external data
  const hasInjectedData = useRef(false)
  const lastExternalDataRef = useRef<VizHubData | undefined>()

  // Merge with default configuration
  const effectiveConfig = { ...DEFAULT_VIZHUB_CONFIG, ...config }

  // Inject external data into localStorage when it changes
  useEffect(() => {
    if (!externalData || typeof window === 'undefined') {
      return
    }

    // Check if data has actually changed to avoid unnecessary injections
    const dataChanged =
      JSON.stringify(externalData) !==
      JSON.stringify(lastExternalDataRef.current)

    if (!dataChanged && hasInjectedData.current) {
      return
    }

    // Clear existing data first if we're switching to external data
    if (!hasInjectedData.current) {
      ;[
        'wordCloudData',
        'dateDistributionData',
        'emailDistributionData',
        'sentimentData',
        'documentSummaryData'
      ].forEach((key) => {
        localStorage.removeItem(key)
        localStorage.removeItem(`${key}FileName`)
        localStorage.removeItem(`${key}FileType`)
        localStorage.removeItem(`${key}Timestamp`)
      })
    }

    // Inject external data into localStorage
    const timestamp = Date.now().toString()

    // Email distribution data - convert to CSV format
    if (externalData.emailDistribution) {
      const csvData = convertToCSV(externalData.emailDistribution, [
        'emails_per_day'
      ])
      localStorage.setItem('emailDistributionData', csvData)
      localStorage.setItem('emailDistributionDataFileName', 'external_data.csv')
      localStorage.setItem('emailDistributionDataFileType', 'text/csv')
      localStorage.setItem('emailDistributionDataTimestamp', timestamp)
    }

    // Date distribution data - convert to CSV format
    if (externalData.dateDistribution) {
      const csvData = convertToCSV(externalData.dateDistribution, [
        'time',
        'count'
      ])
      localStorage.setItem('dateDistributionData', csvData)
      localStorage.setItem('dateDistributionDataFileName', 'external_data.csv')
      localStorage.setItem('dateDistributionDataFileType', 'text/csv')
      localStorage.setItem('dateDistributionDataTimestamp', timestamp)
    }

    // Sentiment data - keep as JSON
    if (externalData.sentiment) {
      localStorage.setItem(
        'sentimentData',
        JSON.stringify(externalData.sentiment)
      )
      localStorage.setItem('sentimentDataFileName', 'external_data.json')
      localStorage.setItem('sentimentDataFileType', 'application/json')
      localStorage.setItem('sentimentDataTimestamp', timestamp)
    }

    // Word cloud data - keep as JSON
    if (externalData.wordCloud) {
      localStorage.setItem(
        'wordCloudData',
        JSON.stringify(externalData.wordCloud)
      )
      localStorage.setItem('wordCloudDataFileName', 'external_data.json')
      localStorage.setItem('wordCloudDataFileType', 'application/json')
      localStorage.setItem('wordCloudDataTimestamp', timestamp)
    }

    // Document summary data - keep as JSON
    if (externalData.documentSummary) {
      localStorage.setItem(
        'documentSummaryData',
        JSON.stringify(externalData.documentSummary)
      )
      localStorage.setItem('documentSummaryDataFileName', 'external_data.json')
      localStorage.setItem('documentSummaryDataFileType', 'application/json')
      localStorage.setItem('documentSummaryDataTimestamp', timestamp)
    }

    // Mark that we've injected data and store the reference
    hasInjectedData.current = true
    lastExternalDataRef.current = externalData

    // Update data status after injection
    checkDataStatus()
  }, [externalData, checkDataStatus])

  // Check data status on component mount
  useEffect(() => {
    checkDataStatus()
  }, [checkDataStatus])

  // Return useful state and computed values
  return {
    dataStatus,
    processingStatus,
    statusMessage,
    config: effectiveConfig,
    // Computed helpers
    hasAnyData: Object.values(dataStatus).some((status) => status),
    dataSourceInfo: {
      usingExternalData: !!externalData && hasInjectedData.current,
      usingLocalStorage:
        !externalData && Object.values(dataStatus).some((status) => status)
    }
  }
}
