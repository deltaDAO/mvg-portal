'use client'

import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import {
  DatasetItem,
  DatasetService,
  UserParameter
} from '../types/DatasetSelection'

interface FormValues {
  datasets?: DatasetItem[]
  dataset?: string[]
  userParametersDataset?: boolean
}

const PreviewUserParameters = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [datasetsWithParams, setDatasetsWithParams] = useState<DatasetItem[]>(
    []
  )
  const [expandedParams, setExpandedParams] = useState<{
    [key: string]: boolean
  }>({})

  useEffect(() => {
    if (!values.datasets) return

    const filteredDatasets = values.datasets
      .map((d) => {
        const servicesWithParams = (d.services ?? []).filter(
          (s) => s.checked && s.userParameters && s.userParameters.length > 0
        )
        return { ...d, services: servicesWithParams }
      })
      .filter((d) => d.services.length > 0)

    setDatasetsWithParams(filteredDatasets)

    const anyUserParameters = filteredDatasets.some((d) =>
      d.services.some((s) => s.userParameters && s.userParameters.length > 0)
    )
    setFieldValue('userParametersDataset', anyUserParameters)

    const datasetPairs = filteredDatasets.flatMap((d) =>
      d.services.map((s) => `${d.did}|${s.serviceId}`)
    )
    setFieldValue('dataset', datasetPairs)
  }, [values.datasets, setFieldValue])

  const toggleParam = (key: string) => {
    setExpandedParams((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Preview User Parameters</h1>

      <div className={styles.previewContainer}>
        {datasetsWithParams.map((dataset) =>
          dataset.services.map((service) => (
            <div
              key={`${dataset.did}-${service.serviceId}`}
              className={styles.datasetServiceCard}
            >
              <h2 className={styles.datasetServiceTitle}>
                <span className={styles.datasetName}>
                  Dataset: {dataset.name}
                </span>
                <span className={styles.separator}> | </span>
                <span className={styles.serviceName}>
                  Service: {service.serviceName}
                </span>
              </h2>

              <div className={styles.parametersList}>
                {service.userParameters.map(
                  (param: UserParameter, index: number) => {
                    const key = `${dataset.did}-${service.serviceId}-${param.name}`
                    const isExpanded = !!expandedParams[key]

                    return (
                      <div key={key} className={styles.parameterItem}>
                        <button
                          type="button"
                          className={styles.parameterButton}
                          onClick={() => toggleParam(key)}
                        >
                          {`Parameter ${index + 1}`} {/* <-- Updated line */}
                          <span className={styles.arrow}>
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </button>

                        {isExpanded && (
                          <table className={styles.parameterTable}>
                            <tbody>
                              <tr>
                                <td>
                                  <strong>Name</strong>
                                </td>
                                <td>{param.name}</td>
                              </tr>
                              <tr>
                                <td>
                                  <strong>Label</strong>
                                </td>
                                <td>{param.label}</td>
                              </tr>
                              <tr>
                                <td>
                                  <strong>Description</strong>
                                </td>
                                <td>{param.description}</td>
                              </tr>
                              <tr>
                                <td>
                                  <strong>Type</strong>
                                </td>
                                <td>{param.type}</td>
                              </tr>
                              <tr>
                                <td>
                                  <strong>Default</strong>
                                </td>
                                <td>{param.default}</td>
                              </tr>
                              <tr>
                                <td>
                                  <strong>Required</strong>
                                </td>
                                <td>{param.required ? 'Yes' : 'No'}</td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PreviewUserParameters
