import dynamic from 'next/dynamic'
import { ReactElement, useRef, useState } from 'react'
import JobList from './JobList'
import styles from './index.module.css'

import { TextAnalysisUseCaseData } from '../../@context/UseCases/models/TextAnalysis.model'

// Dynamically import the VizHub component
const VizHub = dynamic(() => import('./viz-hub/src/app/page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
})

export default function TextAnalysisViz(): ReactElement {
  const [textAnalysisData, setTextAnalysisData] = useState<
    TextAnalysisUseCaseData[]
  >([])

  return (
    <div className="flex flex-col gap-6">
      <JobList setTextAnalysisData={setTextAnalysisData} />
      {textAnalysisData.length > 0 && (
        <div className="w-full">
          <VizHub data={textAnalysisData} />
        </div>
      )}
    </div>
  )
}
