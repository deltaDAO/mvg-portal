import { ReactElement } from 'react'
import DatasetNavigation from '@components/DatasetComputeWizard/Navigation'
import AlgorithmNavigation from '@components/AlgorithmComputeWizard/Navigation'

type Flow = 'dataset' | 'algorithm'

interface NavigationProps {
  flow: Flow
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export default function Navigation({
  flow,
  ...rest
}: NavigationProps): ReactElement {
  if (flow === 'algorithm') {
    return <AlgorithmNavigation {...(rest as any)} />
  }

  return <DatasetNavigation {...(rest as any)} />
}
