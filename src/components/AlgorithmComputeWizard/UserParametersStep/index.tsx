'use client'

import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import { DatasetItem, UserParameter } from '../types/DatasetSelection'

interface FormValues {
  datasets?: DatasetItem[]
  dataset?: string[]
  userParametersDataset?: boolean
  userUpdatedParameters?: any[]
}

const PreviewUserParameters = () => {
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
    setFieldValue('userParametersDataset', anyParams)
  }, [values.datasets, setFieldValue])

  useEffect(() => {
    if (!datasetsWithParams.length) return
    if (values.userUpdatedParameters?.length) {
      setLocalParams(values.userUpdatedParameters)
    } else {
      const initial = datasetsWithParams.flatMap((dataset) =>
        dataset.services.map((service) => ({
          did: dataset.did,
          serviceId: service.serviceId,
          userParameters: service.userParameters.map((p) => ({ ...p }))
        }))
      )
      setLocalParams(initial)
      setFieldValue('userUpdatedParameters', initial)
    }
  }, [datasetsWithParams, setFieldValue, values.userUpdatedParameters])

  const handleParamChange = (
    datasetDid: string,
    serviceId: string,
    paramIndex: number,
    field: keyof UserParameter,
    value: string | boolean
  ) => {
    setLocalParams((prev) => {
      const updated = prev.map((item) => {
        if (item.did === datasetDid && item.serviceId === serviceId) {
          const newParams = [...item.userParameters]
          newParams[paramIndex] = {
            ...newParams[paramIndex],
            [field]: value
          }
          return { ...item, userParameters: newParams }
        }
        return item
      })
      setFieldValue('userUpdatedParameters', updated)
      return updated
    })
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Edit User Parameters</h1>

      {datasetsWithParams.length === 0 && (
        <p className={styles.noParamsText}>
          No user parameters found for selected datasets.
        </p>
      )}

      <div className={styles.datasetsContainer}>
        {datasetsWithParams.map((dataset) =>
          dataset.services.map((service) => {
            const updatedService = localParams.find(
              (u) => u.did === dataset.did && u.serviceId === service.serviceId
            ) ?? { userParameters: service.userParameters }

            return (
              <div
                key={`${dataset.did}-${service.serviceId}`}
                className={styles.card}
              >
                <h2 className={styles.cardHeader}>
                  <span className={styles.datasetName}>{dataset.name}</span>
                  <span className={styles.separator}> | </span>
                  <span className={styles.serviceName}>
                    {service.serviceName}
                  </span>
                </h2>

                {updatedService.userParameters.map(
                  (param: UserParameter, index: number) => (
                    <div key={index} className={styles.paramGroup}>
                      <h3 className={styles.paramTitle}>
                        Parameter {index + 1}
                      </h3>
                      <div className={styles.paramFields}>
                        {[
                          'name',
                          'label',
                          'description',
                          'type',
                          'default'
                        ].map((fieldKey) => (
                          <div
                            key={fieldKey}
                            className={styles.paramFieldContainer}
                          >
                            <label className={styles.paramLabel}>
                              {fieldKey.charAt(0).toUpperCase() +
                                fieldKey.slice(1)}
                            </label>
                            <input
                              className={styles.paramInput}
                              type="text"
                              value={(param as any)[fieldKey] ?? ''}
                              onChange={(e) =>
                                handleParamChange(
                                  dataset.did,
                                  service.serviceId,
                                  index,
                                  fieldKey as keyof UserParameter,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))}

                        <div className={styles.paramFieldContainer}>
                          <label className={styles.paramLabel}>Required</label>
                          <input
                            type="checkbox"
                            checked={param.required ?? false}
                            onChange={(e) =>
                              handleParamChange(
                                dataset.did,
                                service.serviceId,
                                index,
                                'required',
                                e.target.checked
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default PreviewUserParameters
