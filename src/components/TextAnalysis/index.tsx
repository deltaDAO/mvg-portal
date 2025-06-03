import { ReactElement, useState } from 'react'
import JobList from './JobList'
import { VizHub } from './viz-hub'
import { useDataLoader } from './useDataLoader'
import { TextAnalysisUseCaseData } from '../../@context/UseCases/models/TextAnalysis.model'

export default function TextAnalysisViz(): ReactElement {
  const [textAnalysisData, setTextAnalysisData] = useState<
    TextAnalysisUseCaseData[]
  >([])

  const { data, isLoading, error } = useDataLoader(textAnalysisData)

  return (
    <div className="flex flex-col gap-6">
      <JobList setTextAnalysisData={setTextAnalysisData} />
      {data ? (
        <div className="bg-gray-50 rounded-lg shadow-sm">
          <VizHub
            data={data}
            config={{
              showEmailDistribution: true,
              showDateDistribution: true,
              showSentiment: true,
              showWordCloud: true,
              showDocumentSummary: true,
              showFutureFeatures: true
            }}
            theme="light"
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">
              {isLoading
                ? 'Loading data...'
                : 'No visualization data available'}
            </div>
            <div className="text-gray-400 text-sm">
              {error
                ? `Error: ${error}`
                : 'Add some text analysis jobs to see visualizations here.'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
