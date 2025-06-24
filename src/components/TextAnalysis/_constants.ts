import type { UseCaseConfig } from '../@shared/VizHub/types'

/**
 * Mapping of { chainId: useCaseAlgorithmDID }
 */
export const TEXT_ANALYSIS_ALGO_DIDS = {
  32456:
    'did:op:9e5f592ef426caea54471829d11262171f207a608adb5cdd1d1046b50540e651'
}

export const TEXT_ANALYSIS_USECASE_NAME = 'textAnalysises'

export const TEXT_ANALYSIS_RESULT_ZIP = {
  fileName: 'result.zip',
  metadataFileName: 'metadata.json',
  detectionsFileName: 'detections.json',
  imagesFolderName: 'images'
}

/**
 * Configuration for Text Analysis use case
 */
export const TEXT_ANALYSIS_CONFIG: UseCaseConfig = {
  useCaseName: TEXT_ANALYSIS_USECASE_NAME,
  algoDids: TEXT_ANALYSIS_ALGO_DIDS,
  resultZip: TEXT_ANALYSIS_RESULT_ZIP
}

/**
 * VizHub configuration for Text Analysis - demonstrating new flexibility
 */
export const TEXT_ANALYSIS_VIZHUB_CONFIG = {
  // Component visibility
  components: {
    wordCloud: true,
    sentiment: true,
    emailDistribution: true,
    dateDistribution: true,
    documentSummary: true,
    futureFeatures: false
  },

  // Customization for distribution charts
  customization: {
    dateDistribution: {
      title: 'Email Count Over Time',
      xAxisLabel: 'Date',
      yAxisLabel: 'Count'
    },
    emailDistribution: {
      title: 'Email Analysis Distribution',
      xAxisLabel: 'Emails per Day',
      yAxisLabel: 'Frequency',
      unit: 'email analysis results'
    }
  }
}
