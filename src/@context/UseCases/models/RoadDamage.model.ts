import { RoadDamageResultWithImage } from '../../../components/RoadDamage/_types'

/**
 * Table config
 */
export interface RoadDamageUseCaseData {
  id?: number
  job: ComputeJobMetaData
  result: RoadDamageResultWithImage[]
}

export const ROAD_DAMAGE_TABLE = {
  roadDamages: '++id, job, result'
}
