'use client'

import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import Tooltip from '@shared/atoms/Tooltip'
import { truncateDid } from '@utils/string'

interface UserParameter {
  name?: string
  label?: string
  description?: string
  type?: string
  default?: string
  required?: boolean
  value?: string
  options?: Record<string, string>[]
}

interface ServiceParams {
  did?: string
  serviceId: string
  userParameters: UserParameter[]
}

interface AlgorithmService {
  id: string
  name: string
  userParameters: UserParameter[]
}

interface Algorithm {
  id: string
  name: string
  services: AlgorithmService[]
}

interface FormValues {
  algorithms?: Algorithm
  isUserParameters?: boolean
  userUpdatedParameters?: ServiceParams[]
  dataServiceParams?: ServiceParams[]
}

const PreviewAlgorithmParameters = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [localParams, setLocalParams] = useState<ServiceParams[]>([])

  useEffect(() => {
    if (!values.algorithms) return

    const service = values.algorithms.services?.[0]

    if (!service) {
      setLocalParams([])
      setFieldValue('userUpdatedParameters', [])
      setFieldValue('isUserParameters', false)
      return
    }

    const existingParams = values.userUpdatedParameters ?? []

    const algoParams: ServiceParams = existingParams.find(
      (p) => p.serviceId === service.id && !p.did
    ) || {
      serviceId: service.id,
      userParameters: (service.userParameters ?? []).map((p) => ({
        ...p,
        value: p.value ?? p.default ?? ''
      }))
    }

    const datasetParams: ServiceParams[] =
      values.dataServiceParams?.map((entry) => {
        const existing = existingParams.find(
          (p) => p.did === entry.did && p.serviceId === entry.serviceId
        )
        if (existing) return existing

        return {
          ...entry,
          userParameters: entry.userParameters.map((p) => ({
            ...p,
            value: p.value ?? p.default ?? ''
          }))
        }
      }) ?? []

    const combined = [algoParams, ...datasetParams]

    const isChanged =
      JSON.stringify(existingParams) !== JSON.stringify(combined)

    if (isChanged) {
      setLocalParams(combined)
      setFieldValue('userUpdatedParameters', combined)
    } else {
      setLocalParams(existingParams)
    }

    setFieldValue(
      'isUserParameters',
      !!(service.userParameters?.length || datasetParams.length)
    )
  }, [
    values.algorithms,
    values.dataServiceParams,
    values.userUpdatedParameters?.length,
    setFieldValue
  ])

  const handleParamChange = (
    did: string | undefined,
    serviceId: string,
    index: number,
    value: string
  ) => {
    setLocalParams((prev) => {
      const updated = prev.map((entry) => {
        if (entry.serviceId === serviceId && entry.did === did) {
          const userParameters = [...entry.userParameters]
          userParameters[index] = { ...userParameters[index], value }
          return { ...entry, userParameters }
        }
        return entry
      })
      setFieldValue('userUpdatedParameters', updated)
      return updated
    })
  }

  const renderInputField = (
    param: UserParameter,
    onChange: (v: string) => void
  ) => {
    switch (param.type) {
      case 'number':
        return (
          <input
            type="number"
            className={styles.paramInput}
            value={param.value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      case 'boolean':
        return (
          <select
            className={styles.paramInput}
            value={param.value ?? 'true'}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        )
      case 'select':
        return (
          <select
            className={styles.paramInput}
            value={param.value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {param.options?.map((opt) => {
              const key = Object.keys(opt)[0]
              return (
                <option key={key} value={key}>
                  {opt[key]}
                </option>
              )
            })}
          </select>
        )
      default:
        return (
          <input
            type="text"
            className={styles.paramInput}
            value={param.value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )
    }
  }

  if (!values.algorithms) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>User Parameters</h1>
        <p className={styles.noParamsText}>Please select an algorithm first</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit User Parameters</h1>

      {localParams.map((entry) => (
        <div key={entry.serviceId + (entry.did ?? '')} className={styles.card}>
          <h2 className={styles.cardHeader}>
            <span className={styles.datasetName}>
              {entry.did ? 'Dataset' : 'Algorithm'}
            </span>
            <span className={styles.separator}> | </span>
            <span className={styles.serviceName}>
              {entry.did
                ? truncateDid(entry.did)
                : values.algorithms.services?.[0].name ?? 'Algorithm'}
            </span>
          </h2>

          {entry.userParameters.map((param, i) => (
            <div key={i} className={styles.paramRow}>
              <label className={styles.paramLabel}>
                {param.label}
                {param.required && (
                  <span className={styles.requiredMark}>*</span>
                )}
                {param.description && <Tooltip content={param.description} />}
              </label>
              {renderInputField(param, (v) =>
                handleParamChange(entry.did, entry.serviceId, i, v)
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default PreviewAlgorithmParameters
