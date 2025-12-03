import { ReactElement } from 'react'
import DatasetReview from '@components/DatasetComputeWizard/Review'
import AlgorithmReview from '@components/AlgorithmComputeWizard/Review'

type Flow = 'dataset' | 'algorithm'

interface ReviewProps {
  flow: Flow
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function Review({ flow, ...rest }: ReviewProps): ReactElement {
  if (flow === 'algorithm') {
    return <AlgorithmReview {...(rest as any)} />
  }

  return <DatasetReview {...(rest as any)} />
}
