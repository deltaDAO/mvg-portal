import Dexie, { IndexableType, Table } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { ReactElement, ReactNode, createContext, useContext } from 'react'
import { DATABASE_NAME, DATABASE_VERSION } from './_contants'
import {
  TEXT_ANALYSIS_TABLE,
  TextAnalysisUseCaseData
} from './models/TextAnalysis.model'
import { LoggerInstance } from '@oceanprotocol/lib'

export class UseCaseDB extends Dexie {
  textAnalysises!: Table<TextAnalysisUseCaseData>
  constructor() {
    super(DATABASE_NAME)

    // TESTLOG
    console.log('Initializing UseCaseDB with name:', DATABASE_NAME)
    console.log('Current database version:', DATABASE_VERSION)

    this.version(DATABASE_VERSION).stores({
      ...TEXT_ANALYSIS_TABLE
    })

    // TESTLOG
    console.log('Database tables:', this.tables)
    console.log('TEXT_ANALYSIS_TABLE config:', TEXT_ANALYSIS_TABLE)
  }
}

export const database = new UseCaseDB()

interface UseCasesValue {
  createOrUpdateTextAnalysis: (
    textAnalysis: TextAnalysisUseCaseData
  ) => Promise<IndexableType>
  textAnalysisList: TextAnalysisUseCaseData[]
  updateTextAnalysis: (
    textAnalysiseses: TextAnalysisUseCaseData[]
  ) => Promise<IndexableType>
  deleteTextAnalysis: (id: number) => Promise<void>
  clearTextAnalysis: () => Promise<void>
}

const UseCasesContext = createContext(null)

function UseCasesProvider({ children }: { children: ReactNode }): ReactElement {
  const textAnalysisList = useLiveQuery(() => database.textAnalysises.toArray())

  // TESTLOG
  console.log('Database instance:', database)
  console.log('TextAnalysis table:', database.textAnalysises)
  console.log('TextAnalysisList from useLiveQuery:', textAnalysisList)

  const createOrUpdateTextAnalysis = async (
    textAnalysis: TextAnalysisUseCaseData
  ) => {
    // TESTLOG
    console.log('Creating/Updating text analysis:', textAnalysis)

    if (
      !textAnalysis.job ||
      !textAnalysis.job.jobId ||
      !textAnalysis.result ||
      textAnalysis.result.length < 1
    ) {
      LoggerInstance.error(
        `[UseCases] cannot insert without job or result data!`
      )
      return
    }

    const exists = textAnalysisList.find(
      (row) => textAnalysis.job.jobId === row.job.jobId
    )

    const updated = await database.textAnalysises.put(
      {
        ...textAnalysis
      },
      exists?.id
    )

    LoggerInstance.log(`[UseCases]: create or update textAnalysis table`, {
      textAnalysis,
      updated
    })

    return updated
  }

  const updateTextAnalysis = async (
    textAnalysises: TextAnalysisUseCaseData[]
  ): Promise<IndexableType> => {
    const updated = await database.textAnalysises.bulkPut(textAnalysises)

    LoggerInstance.log(`[UseCases]: update textAnalysis table`, {
      textAnalysises,
      updated
    })

    return updated
  }

  const deleteTextAnalysis = async (id: number) => {
    await database.textAnalysises.delete(id)

    LoggerInstance.log(`[UseCases]: deleted #${id} from textAnalysis table`)
  }

  const clearTextAnalysis = async () => {
    await database.textAnalysises.clear()

    LoggerInstance.log(`[UseCases]: cleared textAnalysis table`)
  }

  return (
    <UseCasesContext.Provider
      value={
        {
          createOrUpdateTextAnalysis,
          textAnalysisList,
          updateTextAnalysis,
          deleteTextAnalysis,
          clearTextAnalysis
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
