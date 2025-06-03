import { useState, useCallback, useEffect } from 'react'
import { WordData } from './types'
import { useDataStore } from '../../../store/dataStore'
import { TextAnalysisUseCaseData } from '@context/UseCases/models/TextAnalysis.model'

interface UseWordCloudDataProps {
  data: TextAnalysisUseCaseData[]
}

export const useWordCloudData = ({ data }: UseWordCloudDataProps) => {
  const [words, setWords] = useState<WordData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { fetchWordCloudData } = useDataStore()

  // Define fetchData as a component method for reuse
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await fetchWordCloudData(data)
      setWords(result.wordCloudData)
    } catch (error) {
      console.error('Error fetching word cloud data:', error)
      setError(
        error instanceof Error ? error.message : 'An unknown error occurred'
      )
    } finally {
      setIsLoading(false)
    }
  }, [fetchWordCloudData, data])

  // Fetch data only once on initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    words,
    isLoading,
    error,
    fetchData
  }
}
