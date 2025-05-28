import Dexie, { IndexableType, Table } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { ReactElement, ReactNode, createContext, useContext } from 'react'
import { DATABASE_NAME, DATABASE_VERSION } from './_contants'
import {
  ROAD_DAMAGE_TABLE,
  RoadDamageUseCaseData
} from './models/RoadDamage.model'
import { LoggerInstance } from '@oceanprotocol/lib'

export class UseCaseDB extends Dexie {
  roadDamages!: Table<RoadDamageUseCaseData>
  constructor() {
    super(DATABASE_NAME)
    this.version(DATABASE_VERSION).stores({
      ...ROAD_DAMAGE_TABLE
    })
  }
}

export const database = new UseCaseDB()

interface UseCasesValue {
  createOrUpdateRoadDamage: (
    roadDamage: RoadDamageUseCaseData
  ) => Promise<IndexableType>
  roadDamageList: RoadDamageUseCaseData[]
  updateRoadDamages: (
    roadDamages: RoadDamageUseCaseData[]
  ) => Promise<IndexableType>
  deleteRoadDamage: (id: number) => Promise<void>
  clearRoadDamages: () => Promise<void>
}

const UseCasesContext = createContext(null)

function UseCasesProvider({ children }: { children: ReactNode }): ReactElement {
  const roadDamageList = useLiveQuery(() => database.roadDamages.toArray())

  const createOrUpdateRoadDamage = async (
    roadDamage: RoadDamageUseCaseData
  ) => {
    if (
      !roadDamage.job ||
      !roadDamage.job.jobId ||
      !roadDamage.result ||
      roadDamage.result.length < 1
    ) {
      LoggerInstance.error(
        `[UseCases] cannot insert without job or result data!`
      )
      return
    }

    const exists = roadDamageList.find(
      (row) => roadDamage.job.jobId === row.job.jobId
    )

    const updated = await database.roadDamages.put(
      {
        ...roadDamage
      },
      exists?.id
    )

    LoggerInstance.log(`[UseCases]: create or update roadDamages table`, {
      roadDamage,
      updated
    })

    return updated
  }

  const updateRoadDamages = async (
    roadDamages: RoadDamageUseCaseData[]
  ): Promise<IndexableType> => {
    const updated = await database.roadDamages.bulkPut(roadDamages)

    LoggerInstance.log(`[UseCases]: update roadDamages table`, {
      roadDamages,
      updated
    })

    return updated
  }

  const deleteRoadDamage = async (id: number) => {
    await database.roadDamages.delete(id)

    LoggerInstance.log(`[UseCases]: deleted #${id} from roadDamages table`)
  }

  const clearRoadDamages = async () => {
    await database.roadDamages.clear()

    LoggerInstance.log(`[UseCases]: cleared roadDamages table`)
  }

  return (
    <UseCasesContext.Provider
      value={
        {
          createOrUpdateRoadDamage,
          roadDamageList,
          updateRoadDamages,
          deleteRoadDamage,
          clearRoadDamages
        } satisfies UseCasesValue
      }
    >
      {children}
    </UseCasesContext.Provider>
  )
}

// Helper hook to access the provider values
const useUseCases = (): UseCasesValue => useContext(UseCasesContext)

export { UseCasesProvider, useUseCases }
