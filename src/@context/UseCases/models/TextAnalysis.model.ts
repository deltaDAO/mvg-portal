// import { RoadDamageResultWithImage } from '../../../components/TextAnalysis/_types'

// /**
//  * Table config
//  */
// export interface RoadDamageUseCaseData {
//   id?: number
//   job: ComputeJobMetaData
//   result: RoadDamageResultWithImage[]
// }

// export const ROAD_DAMAGE_TABLE = {
//   roadDamages: '++id, job, result'
// }

// src/@context/UseCases/models/TextAnalysis.model.ts
import { TextAnalysisResult } from '../../../components/TextAnalysis/_types'

export interface TextAnalysisUseCaseData {
  id?: number
  job: ComputeJobMetaData
}

export const TEXT_ANALYSIS_TABLE = {
  textAnalysises: '++id, job'
}
