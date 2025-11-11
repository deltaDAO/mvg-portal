'use client'

import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import { DatasetItem, UserParameter } from '../types/DatasetSelection'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import Tooltip from '@shared/atoms/Tooltip'

interface FormValues {
  datasets?: DatasetItem[]
  dataset?: string[]
  isUserParameters?: boolean
  userUpdatedParameters?: any[]
  algorithmServiceParams?: any[]
}

const PreviewUserParameters = ({
  asset,
  service
}: {
  asset?: AssetExtended
  service?: Service
}) => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [datasetsWithParams, setDatasetsWithParams] = useState<DatasetItem[]>(
    []
  )
  const [localParams, setLocalParams] = useState<any[]>([])

  // 1️⃣ Filter datasets with user params
  useEffect(() => {
    if (!values.datasets) return

    const filtered = values.datasets
      .map((d) => ({
        ...d,
        services: (d.services ?? []).filter(
          (s) => s.checked && s.userParameters?.length > 0
        )
      }))
      .filter((d) => d.services.length > 0)

    setDatasetsWithParams(filtered)

    const anyUserParameters = filtered.some((d) =>
      d.services.some((s) => s.userParameters && s.userParameters.length > 0)
    )
    const isAlgoServiceParams =
      values.algorithmServiceParams && values.algorithmServiceParams.length > 0

    setFieldValue('isUserParameters', anyUserParameters || isAlgoServiceParams)
  }, [values.datasets, values.algorithmServiceParams, setFieldValue])

  useEffect(() => {
    if (!datasetsWithParams.length && !values.algorithmServiceParams?.length)
      return

    const existingParams = values.userUpdatedParameters ?? []

    const datasetParams = datasetsWithParams.flatMap((dataset) =>
      dataset.services.map((srv) => {
        const existing = existingParams.find(
          (p) => p.did === dataset.did && p.serviceId === srv.serviceId
        )

        if (existing) return existing

        return {
          did: dataset.did,
          serviceId: srv.serviceId,
          userParameters: srv.userParameters.map((p) => ({
            ...p,
            value: p.default ?? ''
          }))
        }
      })
    )

    const algoParams =
      values.algorithmServiceParams?.map((entry) => {
        const existing = existingParams.find(
          (p) => p.did === entry.did && p.serviceId === entry.serviceId
        )
        if (existing) return existing

        return {
          did: entry.did,
          serviceId: entry.serviceId,
          userParameters: entry.userParameters.map((p) => ({
            ...p,
            value: p.value ?? p.default ?? ''
          }))
        }
      }) ?? []

    const combined = [...datasetParams, ...algoParams]

    setLocalParams(combined)
    setFieldValue('userUpdatedParameters', combined)
  }, [datasetsWithParams, values.algorithmServiceParams, setFieldValue])

  // 3️⃣ Handle input change
  const handleParamChange = (
    did: string,
    serviceId: string,
    index: number,
    value: string
  ) => {
    setLocalParams((prev) => {
      const updated = prev.map((entry) => {
        if (entry.did === did && entry.serviceId === serviceId) {
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

  // 4️⃣ Render input
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
            {((param.options as Record<string, string>[]) ?? []).map((opt) => {
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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Parameters</h1>

      {values.algorithmServiceParams?.length > 0 &&
        localParams
          .filter((p) =>
            values.algorithmServiceParams.some(
              (a) => a.did === p.did && a.serviceId === p.serviceId
            )
          )
          .map((entry) => (
            <div key={entry.did + entry.serviceId} className={styles.card}>
              <h2 className={styles.cardHeader}>
                <span className={styles.datasetName}>
                  {asset?.credentialSubject?.metadata?.name ?? 'Algorithm'}
                </span>
                <span className={styles.separator}> | </span>
                <span className={styles.serviceName}>
                  {service?.name ?? 'Service'}
                </span>
              </h2>
              {entry.userParameters.map((param: UserParameter, i: number) => (
                <div key={i} className={styles.paramRow}>
                  <label className={styles.paramLabel}>
                    {param.label}
                    {param.required && (
                      <span className={styles.requiredMark}>*</span>
                    )}
                    {param.description && (
                      <Tooltip content={param.description} />
                    )}
                  </label>
                  {renderInputField(param, (v) =>
                    handleParamChange(entry.did, entry.serviceId, i, v)
                  )}
                </div>
              ))}
            </div>
          ))}

      {datasetsWithParams.length === 0 && (
        <p className={styles.noParamsText}>
          No user parameters found for selected datasets.
        </p>
      )}

      {datasetsWithParams.map((dataset) =>
        dataset.services.map((srv) => {
          const matched = localParams.find(
            (u) => u.did === dataset.did && u.serviceId === srv.serviceId
          )
          const params =
            matched?.userParameters ??
            srv.userParameters.map((p) => ({ ...p, value: p.default ?? '' }))

          return (
            <div
              key={`${dataset.did}-${srv.serviceId}`}
              className={styles.card}
            >
              <h2 className={styles.cardHeader}>
                <span className={styles.datasetName}>{dataset.name}</span>
                <span className={styles.separator}> | </span>
                <span className={styles.serviceName}>
                  {srv.serviceName ?? 'Service'}
                </span>
              </h2>

              {params.map((param: UserParameter, i: number) => (
                <div key={i} className={styles.paramRow}>
                  <label className={styles.paramLabel}>
                    {param.label}
                    {param.required && (
                      <span className={styles.requiredMark}>*</span>
                    )}
                    {param.description && (
                      <Tooltip content={param.description} />
                    )}
                  </label>
                  {renderInputField(param, (v) =>
                    handleParamChange(dataset.did, srv.serviceId, i, v)
                  )}
                </div>
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}

export default PreviewUserParameters
