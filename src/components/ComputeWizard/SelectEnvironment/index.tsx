import { ReactElement } from 'react'
import DatasetSelectEnvironment from '@components/DatasetComputeWizard/SelectEnvironment'
import AlgorithmSelectEnvironment from '@components/AlgorithmComputeWizard/SelectEnvironment'

type Flow = 'dataset' | 'algorithm'

interface SelectEnvironmentProps {
  flow: Flow
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function SelectEnvironment({
  flow,
  ...rest
}: SelectEnvironmentProps): ReactElement {
  if (flow === 'algorithm') {
    return <AlgorithmSelectEnvironment {...(rest as any)} />
  }

  return <DatasetSelectEnvironment {...(rest as any)} />
}
