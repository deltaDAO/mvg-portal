import { ReactElement, useState, useEffect, useCallback } from 'react'
import { useFormikContext } from 'formik'
import { useAccount } from 'wagmi'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import StepTitle from '@shared/StepTitle'
import EnvironmentSelection from '@shared/FormInput/InputElement/EnvironmentSelection'
import { FormComputeData } from '../_types'
import styles from './index.module.css'
import { getComputeEnvironments } from '@utils/provider'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'

export default function SelectEnvironment({
  service,
  asset
}: {
  asset?: AssetExtended
  service?: Service
}): ReactElement {
  const { address: accountId } = useAccount()
  const { values, setFieldValue } = useFormikContext<FormComputeData>()
  const [selectedEnvId, setSelectedEnvId] = useState<string>()
  const [computeEnvs, setComputeEnvs] = useState<ComputeEnvironment[]>()

  const initializeComputeEnvironment = useCallback(async () => {
    const computeEnvs = await getComputeEnvironments(
      service.serviceEndpoint,
      asset.credentialSubject?.chainId
    )
    setComputeEnvs(computeEnvs || [])
  }, [asset, service])

  useEffect(() => {
    initializeComputeEnvironment()
  }, [initializeComputeEnvironment])

  // Initialize selected environment from form values
  useEffect(() => {
    if (values.computeEnv?.id) {
      setSelectedEnvId(values.computeEnv.id)
    }
  }, [values.computeEnv])

  const handleEnvironmentSelect = (envId: string) => {
    setSelectedEnvId(envId)
    const selectedEnv = computeEnvs.find((env) => env.id === envId)
    setFieldValue('computeEnv', selectedEnv)
  }

  return (
    <>
      <StepTitle title="Select C2D Environment" />

      <div className={styles.environmentSelection}>
        <EnvironmentSelection
          environments={computeEnvs}
          selected={selectedEnvId}
          onChange={handleEnvironmentSelect}
        />
      </div>
    </>
  )
}
