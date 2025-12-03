import { ReactElement } from 'react'
import DatasetSteps from '@components/DatasetComputeWizard/Steps'
import AlgorithmSteps from '@components/AlgorithmComputeWizard/Steps'

type Flow = 'dataset' | 'algorithm'

interface StepsProps {
  flow: Flow
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function Steps({ flow, ...rest }: StepsProps): ReactElement {
  if (flow === 'algorithm') {
    return <AlgorithmSteps {...(rest as any)} />
  }

  return <DatasetSteps {...(rest as any)} />
}
