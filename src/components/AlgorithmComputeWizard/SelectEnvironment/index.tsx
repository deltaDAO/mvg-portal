import { ReactElement, useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { useAccount } from 'wagmi'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import StepTitle from '@shared/StepTitle'
import EnvironmentSelection from '@shared/FormInput/InputElement/EnvironmentSelection'
import { FormComputeData } from '../_types'
import styles from './index.module.css'

interface SelectEnvironmentProps {
  computeEnvs: ComputeEnvironment[]
}

export default function SelectEnvironment({
  computeEnvs
}: SelectEnvironmentProps): ReactElement {
  const { address: accountId } = useAccount()
  const { values, setFieldValue } = useFormikContext<FormComputeData>()
  const [selectedEnvId, setSelectedEnvId] = useState<string>()

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
