import dynamic from 'next/dynamic'
import { ReactElement, useRef, useState } from 'react'
import JobList from './JobList'
import styles from './index.module.css'

import { TextAnalysisUseCaseData } from '../../@context/UseCases/models/TextAnalysis.model'

export default function TextAnalysisViz(): ReactElement {
  const [textAnalysisData, setTextAnalysisData] = useState<
    TextAnalysisUseCaseData[]
  >([])

  return (
    <div>
      <JobList setTextAnalysisData={setTextAnalysisData} />
    </div>
  )
}
