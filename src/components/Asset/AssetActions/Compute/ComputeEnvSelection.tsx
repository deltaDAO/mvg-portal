import React from 'react'
import Input, { InputProps } from '@components/@shared/FormInput'
import Alert from '@components/@shared/atoms/Alert'
import Loader from '@components/@shared/atoms/Loader'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import { Field } from 'formik'
import styles from './ComputeEnvSelection.module.css'

export default function ComputeEnvSelection({
  computeEnvs,
  ...props
}: InputProps & {
  computeEnvs: ComputeEnvironment[]
}) {
  return (
    <div key={props.name} className={styles.computeEnvironmentSelector}>
      {computeEnvs?.length === 0 ? (
        <Alert
          state="warning"
          title="No Compute Environment available"
          text="It's not possible to start a compute job for this asset"
        />
      ) : computeEnvs ? (
        <Field
          {...props}
          options={computeEnvs?.map((environment) => environment.id)}
          component={Input}
        />
      ) : (
        <Loader message="Loading Available Compute Environments" />
      )}
    </div>
  )
}
