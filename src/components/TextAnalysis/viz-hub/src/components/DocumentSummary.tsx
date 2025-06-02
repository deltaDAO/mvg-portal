'use client'

import { useEffect, useState } from 'react'
import ChartError from './ChartError'

interface DocumentSummary {
  totalDocuments: number
  totalWords: number
  uniqueWords: number
  vocabularyDensity: number
  readabilityIndex: number
  wordsPerSentence: number
  frequentWords: Array<{ word: string; count: number }>
  created: string
}

interface DocumentSummaryProps {
  skipLoading?: boolean
  data: DocumentSummary
}

const DocumentSummary = ({
  skipLoading = false,
  data
}: DocumentSummaryProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Process data when it changes
  useEffect(() => {
    if (data) {
      setIsLoading(false)
      setError(null)
    } else {
      setError('No data available')
      setIsLoading(false)
    }
  }, [data])

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">
        Document Summary
      </h2>
      <div className="w-full bg-gray-50 rounded p-6 overflow-auto">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center py-8">
            <p className="text-gray-500">Loading document summary...</p>
          </div>
        ) : error ? (
          <ChartError message={error} onRetry={() => {}} />
        ) : data ? (
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              This corpus has {data.totalDocuments.toLocaleString()} document
              {data.totalDocuments !== 1 ? 's' : ''} with{' '}
              {data.totalWords.toLocaleString()} total words and{' '}
              {data.uniqueWords.toLocaleString()} unique word forms. Created{' '}
              {data.created}.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-1">
                  Vocabulary Density:
                </h3>
                <p className="text-xl font-bold text-indigo-600">
                  {data.vocabularyDensity.toFixed(3)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-1">Readability Index:</h3>
                <p className="text-xl font-bold text-blue-600">
                  {data.readabilityIndex.toFixed(3)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-1">
                  Average Words Per Sentence:
                </h3>
                <p className="text-xl font-bold text-green-600">
                  {data.wordsPerSentence.toFixed(1)}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  Most frequent words in the corpus:
                </h3>
                <ul className="list-disc list-inside space-y-1 pl-4">
                  {data.frequentWords.map((item, index) => (
                    <li key={index} className="text-gray-700">
                      <span className="font-medium text-yellow-600">
                        {item.word}
                      </span>{' '}
                      ({item.count.toLocaleString()})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500">No document summary available.</p>
        )}
      </div>
    </div>
  )
}

export default DocumentSummary
