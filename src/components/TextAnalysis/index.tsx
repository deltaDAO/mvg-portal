import { ReactElement, useState } from 'react'
import JobList from './JobList'
import { VizHub } from './viz-hub'
import { useDataLoader } from './useDataLoader'
import { TextAnalysisUseCaseData } from '../../@context/UseCases/models/TextAnalysis.model'

export default function TextAnalysisViz(): ReactElement {
  const { data, isLoading, error } = useDataLoader()

  const [textAnalysisData, setTextAnalysisData] = useState<
    TextAnalysisUseCaseData[]
  >([])

  return (
    <div className="flex flex-col gap-6">
      <JobList setTextAnalysisData={setTextAnalysisData} />
      {data && (
        <div className="bg-white rounded-lg shadow-sm p-6">
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
      )}
    </div>
  )
}
