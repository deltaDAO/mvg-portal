'use client'

import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import { DatasetItem, UserParameter } from '../types/DatasetSelection'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'

interface FormValues {
  datasets?: DatasetItem[]
  dataset?: string[]
  isUserParameters?: boolean
  userUpdatedParameters?: any[]
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

  useEffect(() => {
    if (!values.datasets) return

    const filtered = values.datasets
      .map((d) => {
        const servicesWithParams = (d.services ?? []).filter(
          (s) => s.checked && s.userParameters && s.userParameters.length > 0
        )
        return { ...d, services: servicesWithParams }
      })
      .filter((d) => d.services.length > 0)

    setDatasetsWithParams(filtered)

    const anyParams = filtered.some((d) =>
      d.services.some((s) => s.userParameters?.length > 0)
    )
    const isUserParameters = service.consumerParameters?.length > 0
    const setUserParameterTrue = isUserParameters || anyParams
    setFieldValue('isUserParameters', setUserParameterTrue)
  }, [values.datasets, setFieldValue])

  useEffect(() => {
    if ((!datasetsWithParams.length && !service) || localParams.length) return

    let initial: any[] = []

    // Dataset-level params
    if (datasetsWithParams.length) {
      const datasetParams = datasetsWithParams.flatMap((dataset) =>
        dataset.services.map((srv) => ({
          did: dataset.did,
          serviceId: srv.serviceId,
          userParameters: srv.userParameters.map((p) => ({
            ...p,
            value: p.value ?? p.default ?? ''
          }))
        }))
      )
      initial = [...initial, ...datasetParams]
    }

    // Algorithm-level params
    if (asset && service?.consumerParameters?.length) {
      const consumerParams = service.consumerParameters.map(
        (p: any): UserParameter => ({
          name: p.name,
          label: p.label ?? p.name,
          description: p.description,
          type: p.type ?? 'text',
          default: p.default,
          required: p.required ?? false,
          options: p.options ?? [],
          value: p.default ?? ''
        })
      )

      const algoParams = {
        did: asset.id,
        serviceId: service.id,
        userParameters: consumerParams
      }

      initial = [...initial, algoParams]
    }

    // Only set Formik & localParams if they are empty
    if (!values.userUpdatedParameters?.length && initial.length) {
      setLocalParams(initial)
      setFieldValue('userUpdatedParameters', initial)
      setFieldValue('isUserParameters', true)
    }
  }, [
    datasetsWithParams,
    asset,
    service,
    setFieldValue,
    values.userUpdatedParameters,
    localParams.length
  ])

  const handleParamChange = (
    datasetDid: string,
    serviceId: string,
    paramIndex: number,
    value: string
  ) => {
    setLocalParams((prev) => {
      const existing = [...prev]
      const targetIndex = existing.findIndex(
        (item) => item.did === datasetDid && item.serviceId === serviceId
      )

      if (targetIndex !== -1) {
        const newParams = [...existing[targetIndex].userParameters]
        newParams[paramIndex] = { ...newParams[paramIndex], value }
        existing[targetIndex] = {
          ...existing[targetIndex],
          userParameters: newParams
        }
      } else {
        const dataset = values.datasets?.find((d) => d.did === datasetDid)
        const service = dataset?.services.find((s) => s.serviceId === serviceId)

        if (service) {
          const newParams = service.userParameters.map((p, i) => ({
            ...p,
            value: i === paramIndex ? value : p.value ?? p.default ?? ''
          }))
          existing.push({
            did: datasetDid,
            serviceId,
            userParameters: newParams
          })
        }
      }

      setFieldValue('userUpdatedParameters', existing)
      return existing
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
            {((param.options as Record<string, string>[]) ?? []).map((opt) => {
              const key = Object.keys(opt)[0]
              const val = opt[key]
              return (
                <option key={key} value={key}>
                  {val}
                </option>
              )
            })}
          </select>
        )
      default:
        return (
          <input
            type={param.type || 'text'}
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

      {/* Algorithm-level parameters */}
      {asset && service && (
        <div className={styles.card}>
          <h2 className={styles.cardHeader}>
            <span className={styles.datasetName}>Algorithm:</span>
            <span className={styles.serviceName}>
              {asset.credentialSubject?.metadata?.name ?? asset.id}
            </span>
          </h2>

          {(
            localParams.find(
              (p) => p.did === asset.id && p.serviceId === service.id
            )?.userParameters ?? []
          ).map((param: UserParameter, index: number) => (
            <div key={index} className={styles.paramRow}>
              <label className={styles.paramLabel}>
                {param.label}
                {param.required && (
                  <span className={styles.requiredMark}>*</span>
                )}
                <span
                  className={styles.infoIcon}
                  title={param.description ?? 'No description available'}
                >
                  ℹ️
                </span>
              </label>
              {renderInputField(param, (v) =>
                handleParamChange(asset.id, service.id, index, v)
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dataset-level parameters */}
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
            srv.userParameters.map((p) => ({
              ...p,
              value: p.default ?? ''
            }))

          return (
            <div
              key={`${dataset.did}-${srv.serviceId}`}
              className={styles.card}
            >
              <h2 className={styles.cardHeader}>
                <span className={styles.datasetName}>{dataset.name}</span>
                <span className={styles.separator}> | </span>
                <span className={styles.serviceName}>{srv.serviceName}</span>
              </h2>

              {params.map((param: UserParameter, index: number) => (
                <div key={index} className={styles.paramRow}>
                  <label className={styles.paramLabel}>
                    {param.label}
                    {param.required && (
                      <span className={styles.requiredMark}>*</span>
                    )}
                    <span
                      className={styles.infoIcon}
                      title={param.description ?? 'No description available'}
                    >
                      ℹ️
                    </span>
                  </label>
                  {renderInputField(param, (v) =>
                    handleParamChange(dataset.did, srv.serviceId, index, v)
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
