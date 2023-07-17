import React, { ChangeEvent, useEffect, useState } from 'react'
import Alert from '@components/@shared/atoms/Alert'
import Loader from '@components/@shared/atoms/Loader'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import { useField, useFormikContext } from 'formik'
import InputElement from '@shared/FormInput/InputElement'
import { ComputeDatasetForm } from '@components/Asset/AssetActions/Compute/_constants'

export default function ComputeEnvSelection({
  computeEnvs
}: {
  computeEnvs?: ComputeEnvironment[]
}) {
  const [field] = useField('computeEnv')
  const { values, setFieldValue } = useFormikContext<ComputeDatasetForm>()
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    if (!computeEnvs || computeEnvs.length === 0) return

    const computeEvnIds = computeEnvs?.map((env) => env.id)
    if (values?.computeEnv === '') computeEvnIds.unshift('')

    setOptions(computeEvnIds)
  }, [computeEnvs, values?.computeEnv])

  return (
    <div>
      {computeEnvs?.length === 0 ? (
        <Alert
          state="warning"
          title="No Compute Environment available"
          text="It's not possible to start a compute job for this asset"
        />
      ) : computeEnvs ? (
        <InputElement
          {...field}
          name="computeEnv"
          type="select"
          options={options}
          value={values?.computeEnv || ''}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setFieldValue('computeEnv', e.target.value)
          }}
          sortOptions
        />
      ) : (
        <Loader message="Loading Available Compute Environments" />
      )}
    </div>
  )
}
