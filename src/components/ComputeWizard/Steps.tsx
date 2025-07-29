import { ReactElement, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { wizardSteps } from './_constants'
import { FormComputeData } from './_types'
import { useAccount, useNetwork } from 'wagmi'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import SelectAlgorithm from './SelectAlgorithm'
import SelectEnvironment from './SelectEnvironment'
import ConfigureEnvironment from './ConfigureEnvironment'
import Review from './Review'

export default function Steps({
  algorithms,
  computeEnvs
}: {
  algorithms: AssetSelectionAsset[]
  computeEnvs: ComputeEnvironment[]
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
