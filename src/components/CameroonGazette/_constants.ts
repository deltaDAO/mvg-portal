import type { UseCaseConfig } from '../@shared/VizHub/types'

/**
 * Mapping of { chainId: useCaseAlgorithmDID }
 * TODO: Update with correct CameroonGazette algorithm DID
 */
export const CAMEROON_GAZETTE_ALGO_DIDS = {
  32456:
    'did:op:81d57f431deebbd2e74561eac4875da42276afa3cbcf910d27ee8b2425193b0f'
}

export const CAMEROON_GAZETTE_USECASE_NAME = 'cameroonGazette'

export const CAMEROON_GAZETTE_RESULT_ZIP = {
  fileName: 'result.zip',
  metadataFileName: 'metadata.json',
  detectionsFileName: 'detections.json',
  imagesFolderName: 'images'
}

/**
 * Configuration for Cameroon Gazette use case
 */
export const CAMEROON_GAZETTE_CONFIG: UseCaseConfig = {
  useCaseName: CAMEROON_GAZETTE_USECASE_NAME,
  algoDids: CAMEROON_GAZETTE_ALGO_DIDS,
  resultZip: CAMEROON_GAZETTE_RESULT_ZIP
}

/**
 * VizHub configuration for Cameroon Gazette - demonstrating different needs
 */
export const CAMEROON_GAZETTE_VIZHUB_CONFIG = {
  // Component visibility - different from TextAnalysis
  components: {
    dateDistribution: true,
    documentSummary: true,
    wordCloud: true,
    sentiment: false,
    emailDistribution: true,
    futureFeatures: false
  },

  // Customization for gazette-specific terminology
  customization: {
    dateDistribution: {
      title: 'Gazette Publication Timeline',
      xAxisLabel: 'Publication Date',
      yAxisLabel: 'Number of Gazettes'
    },
    emailDistribution: {
      title: 'Gazette Volume Distribution',
      xAxisLabel: 'Gazettes per Day',
      yAxisLabel: 'Publication Frequency',
      unit: 'gazette publications'
    }
  }
}
