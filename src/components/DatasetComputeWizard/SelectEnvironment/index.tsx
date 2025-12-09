import { ReactElement, useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { ComputeEnvironment, ProviderInstance } from '@oceanprotocol/lib'
import StepTitle from '@shared/StepTitle'
import EnvironmentSelection from '@shared/FormInput/InputElement/EnvironmentSelection'
import { FormComputeData } from '../_types'
import styles from './index.module.css'
import { customProviderUrl } from 'app.config.cjs'

interface SelectEnvironmentProps {
  computeEnvs: ComputeEnvironment[]
}

export default function SelectEnvironment({
  computeEnvs
}: SelectEnvironmentProps): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormComputeData>()
  const [selectedEnvId, setSelectedEnvId] = useState<string>()
  // Initialize selected environment from form values
  useEffect(() => {
    if (values.computeEnv?.id) {
      setSelectedEnvId(values.computeEnv.id)
    }
  }, [values.computeEnv])

  const handleEnvironmentSelect = async (envId: string) => {
    setSelectedEnvId(envId)
    const allComputeEnvs = await ProviderInstance.getComputeEnvironments(
      customProviderUrl
    )
    const selectedEnv = allComputeEnvs.find((env) => env.id === envId)
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
