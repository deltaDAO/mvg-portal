import { ReactElement, useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { useAccount } from 'wagmi'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import StepTitle from '@shared/StepTitle'
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

  // Debug information
  console.log('SelectEnvironment - computeEnvs:', computeEnvs)
  console.log('SelectEnvironment - current values:', values)
  console.log('SelectEnvironment - selectedEnvId:', selectedEnvId)

  const handleEnvironmentSelect = (envId: string) => {
    console.log('SelectEnvironment - selecting environment:', envId)
    setSelectedEnvId(envId)
    const selectedEnv = computeEnvs.find((env) => env.id === envId)
    console.log('SelectEnvironment - selectedEnv:', selectedEnv)
    setFieldValue('computeEnv', selectedEnv)
  }

  return (
    <div className={styles.container}>
      <StepTitle title="Select C2D Environment" />
      <p>Choose a compute environment for your job</p>

      <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
        <strong>Debug Info:</strong>
        <pre>
          {JSON.stringify(
            {
              computeEnvsCount: computeEnvs?.length,
              selectedEnvId,
              currentComputeEnv: values.computeEnv?.id
            },
            null,
            2
          )}
        </pre>
      </div>

      <div className={styles.environmentList}>
        {computeEnvs?.map((env) => {
          const isSelected = selectedEnvId === env.id
          const freeAvailable = !!env.free
          const hasPaid = env.fees && Object.keys(env.fees).length > 0

          return (
            <div key={env.id} className={styles.environmentItem}>
              <label className={styles.environmentLabel}>
                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => handleEnvironmentSelect(env.id)}
                  className={styles.radioInput}
                />
                <div className={styles.environmentInfo}>
                  <span className={styles.envId}>{env.id}</span>
                  <p className={styles.description}>
                    {env.description ||
                      'Workspace configured for testing and running C2D processes.'}
                  </p>
                  <div className={styles.tags}>
                    {freeAvailable && (
                      <span className={styles.freeTag}>Free</span>
                    )}
                    {hasPaid && <span className={styles.paidTag}>Paid</span>}
                  </div>
                </div>
              </label>
            </div>
          )
        })}
      </div>
    </div>
  )
}
