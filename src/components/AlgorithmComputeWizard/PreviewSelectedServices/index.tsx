'use client'

import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import { DatasetItem, DatasetService } from '../types/DatasetSelection'
import { Service } from 'src/@types/ddo/Service'

interface FormValues {
  datasets?: DatasetItem[]
  dataset?: string[]
  isUserParameters?: boolean
  userUpdatedParameters?: any[]
  algoServiceParams?: any
}

const PreviewSelectedServices = ({ service }: { service: Service }) => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [selectedDatasets, setSelectedDatasets] = useState<DatasetItem[]>([])
  console.log('PreviewSelectedServices values ', values)
  useEffect(() => {
    if (!values.datasets) return

    const preview: DatasetItem[] = values.datasets
      .map((d: DatasetItem) => {
        const selectedServices: DatasetService[] = (d.services ?? [])
          .filter((s) => s.checked)
          .map((s) => ({
            serviceId: s.serviceId,
            serviceName: s.serviceName || 'Unnamed Service',
            serviceDescription: s.serviceDescription || 'No description',
            serviceType: s.serviceType,
            serviceDuration: Number(s.serviceDuration ?? 0),
            price: Number(s.price ?? d.datasetPrice ?? 0),
            tokenSymbol: s.tokenSymbol || 'OCEAN',
            checked: s.checked ?? false,
            isAccountIdWhitelisted: !!s.isAccountIdWhitelisted,
            datetime: s.datetime || new Date().toISOString(),
            userParameters: s.userParameters || []
          }))

        return {
          did: d.did,
          name: d.name,
          symbol: d.symbol,
          description: d.description ?? '',
          datasetPrice: Number(d.datasetPrice ?? 0),
          expanded: d.expanded ?? false,
          checked: d.checked ?? false,
          services: selectedServices
        }
      })
      .filter((d) => d.services.length > 0)

    setSelectedDatasets(preview)

    const pairs = preview.flatMap((d) =>
      d.services.map((s) => `${d.did}|${s.serviceId}`)
    )
    const anyUserParameters = preview.some((d) =>
      d.services.some((s) => s.userParameters && s.userParameters.length > 0)
    )
    const isAlgoServiceParams = !!values.algoServiceParams

    const setUserParameterTrue = isAlgoServiceParams || anyUserParameters

    if (setUserParameterTrue) {
      setFieldValue('isUserParameters', true)
    } else {
      setFieldValue('isUserParameters', false)
    }
    setFieldValue('dataset', pairs)
  }, [values.datasets, setFieldValue])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Preview Selected Datasets & Services</h1>

      <div className={styles.previewContainer}>
        {selectedDatasets.map((dataset) => (
          <div key={dataset.did} className={styles.datasetContainer}>
            <div className={styles.datasetHeader}>
              <h2 className={styles.datasetName}>{dataset.name}</h2>
              <p className={styles.datasetAddress}>{dataset.did}</p>
              <p className={styles.datasetDescription}>
                {dataset.description?.slice(0, 40)}
                {dataset.description && dataset.description.length > 40
                  ? '...'
                  : ''}
              </p>
            </div>

            <div className={styles.servicesList}>
              {dataset.services.map((service) => (
                <div key={service.serviceId} className={styles.serviceItem}>
                  <div className={styles.serviceHeader}>
                    <h3 className={styles.serviceName}>
                      {service.serviceName}
                    </h3>
                  </div>

                  <p className={styles.serviceDescription}>
                    {service.serviceDescription.slice(0, 40)}
                    {service.serviceDescription.length > 40 ? '...' : ''}
                  </p>

                  <div className={styles.serviceDetails}>
                    <p>
                      <strong>Type:</strong> {service.serviceType}
                    </p>
                  </div>

                  <div className={styles.serviceDetails}>
                    <p>
                      <strong>Access duration:</strong>{' '}
                      {Number(service.serviceDuration) === 0 ||
                      isNaN(Number(service.serviceDuration))
                        ? 'Forever'
                        : `${Math.floor(
                            Number(service.serviceDuration) / (60 * 60 * 24)
                          )} days`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PreviewSelectedServices
