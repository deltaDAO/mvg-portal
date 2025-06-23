import type { UseCaseConfig } from '../@shared/VizHub/types'

/**
 * Mapping of { chainId: useCaseAlgorithmDID }
 */
export const TEXT_ANALYSIS_ALGO_DIDS = {
  32456:
    'did:op:9e5f592ef426caea54471829d11262171f207a608adb5cdd1d1046b50540e651'
}

export const TEXT_ANALYSIS_USECASE_NAME = 'cameroonGazette'

export const TEXT_ANALYSIS_RESULT_ZIP = {
  fileName: 'result.zip',
  metadataFileName: 'metadata.json',
  detectionsFileName: 'detections.json',
  imagesFolderName: 'images'
}

/**
 * Configuration for Cameroon Gazette use case
 */
export const CAMEROON_GAZETTE_CONFIG: UseCaseConfig = {
  useCaseName: TEXT_ANALYSIS_USECASE_NAME,
  algoDids: TEXT_ANALYSIS_ALGO_DIDS,
  resultZip: TEXT_ANALYSIS_RESULT_ZIP
}
