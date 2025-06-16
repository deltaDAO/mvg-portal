import { TextAnalysisResult } from '../../../components/TextAnalysis/_types'

export interface TextAnalysisUseCaseData {
  id?: number
  job: ComputeJobMetaData
  result: TextAnalysisResult[]
}

export const TEXT_ANALYSIS_TABLE = {
  textAnalysises: '++id, job, result'
}
