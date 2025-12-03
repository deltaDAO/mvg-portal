import { ReactElement } from 'react'
import DatasetTitle from '@components/DatasetComputeWizard/Title'
import AlgorithmTitle from '@components/AlgorithmComputeWizard/Title'

type Flow = 'dataset' | 'algorithm'

interface TitleProps {
  flow: Flow
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function Title({ flow, ...rest }: TitleProps): ReactElement {
  if (flow === 'algorithm') {
    return <AlgorithmTitle {...(rest as any)} />
  }

  return <DatasetTitle {...(rest as any)} />
}
