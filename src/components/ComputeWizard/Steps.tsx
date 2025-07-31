import { ReactElement, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { FormComputeData } from './_types'
import { useAccount, useNetwork } from 'wagmi'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import { datasetSteps, algorithmSteps } from './_constants'
import SelectAlgorithm from './SelectAlgorithm'
import SelectServices from './SelectServices'
import PreviewSelectedServices from './PreviewSelectedServices'
import SelectEnvironment from './SelectEnvironment'
import ConfigureEnvironment from './ConfigureEnvironment'
import Review from './Review'

export default function Steps({
  algorithms,
  computeEnvs,
  isAlgorithm
}: {
  algorithms: AssetSelectionAsset[]
  computeEnvs: ComputeEnvironment[]
  isAlgorithm: boolean
}): ReactElement {
  const { address: accountId } = useAccount()
  const { chain } = useNetwork()
  const { values, setFieldValue } = useFormikContext<FormComputeData>()

  useEffect(() => {
    if (!chain?.id || !accountId) return
    setFieldValue('user.chainId', chain?.id)
    setFieldValue('user.accountId', accountId)
  }, [chain?.id, accountId, setFieldValue])

  const currentStep = values.user.stepCurrent
  const steps = isAlgorithm ? algorithmSteps : datasetSteps

  // For dataset flow
  if (!isAlgorithm) {
    switch (currentStep) {
      case 1:
        return <SelectAlgorithm algorithms={algorithms} />
      case 2:
        return <SelectEnvironment computeEnvs={computeEnvs} />
      case 3:
        return <ConfigureEnvironment />
      case 4:
        return <Review />
      default:
        return <div>Invalid step</div>
    }
  }

  // For algorithm flow
  switch (currentStep) {
    case 1:
      return steps[0].component
    case 2:
      return <SelectServices />
    case 3:
      return <PreviewSelectedServices />
    case 4:
      return steps[3].component
    case 5:
      return steps[4].component
    case 6:
      return steps[5].component
    default:
      return <div>Invalid step</div>
  }
}
