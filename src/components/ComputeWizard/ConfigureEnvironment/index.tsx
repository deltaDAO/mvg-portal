import { ReactElement } from 'react'
import DatasetConfigureEnvironment from '@components/DatasetComputeWizard/ConfigureEnvironment'
import AlgorithmConfigureEnvironment from '@components/AlgorithmComputeWizard/ConfigureEnvironment'

type Flow = 'dataset' | 'algorithm'

interface ConfigureEnvironmentProps {
  flow: Flow
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function ConfigureEnvironment({
  flow,
  ...rest
}: ConfigureEnvironmentProps): ReactElement {
  if (flow === 'algorithm') {
    return <AlgorithmConfigureEnvironment {...(rest as any)} />
  }

  return <DatasetConfigureEnvironment {...(rest as any)} />
}
