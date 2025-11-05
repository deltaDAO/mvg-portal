'use client'

import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'

interface Service {
  id: string
  name: string
  title: string
  serviceDescription: string
  type: string
  duration: string | number
  price: string
  symbol: string
  checked?: boolean
}

interface Dataset {
  id: string
  name: string
  description: string
  services: Service[]
}

interface FormValues {
  datasets: any[]
  dataset: string[]
}

const PreviewSelectedServices = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([])
  useEffect(() => {
    if (!values.datasets) return

    const preview: Dataset[] = values.datasets
      .map((d: any) => ({
        id: d.id || d.did,
        name: d.name,
        description: d.description,
        services: (d.services ?? [])
          .filter((s: any) => s.checked)
          .map((s: any) => ({
            id: s.id || s.serviceId,
            name: s.name || s.serviceName || 'Unnamed Service',
            title: s.name || s.serviceName,
            serviceDescription: s.serviceDescription || 'No description',
            type: s.type || s.serviceType,
            duration: s.duration ?? s.serviceDuration ?? 0,
            price: String(s.price ?? d.datasetPrice ?? 0),
            symbol: s.symbol || s.tokenSymbol || 'OCEAN',
            checked: s.checked ?? false
          }))
      }))
      .filter((d) => d.services.length > 0)

    setSelectedDatasets(preview)

    const pairs = preview.flatMap((d) =>
      d.services.map((s) => `${d.id}|${s.id}`)
    )
    setFieldValue('dataset', pairs)
  }, [values.datasets, setFieldValue])

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Preview Selected Datasets & Services</h1>

      <div className={styles.previewContainer}>
        {selectedDatasets.map((dataset) => (
          <div key={dataset.id} className={styles.datasetContainer}>
            <div className={styles.datasetHeader}>
              <h2 className={styles.datasetName}>{dataset.name}</h2>
              <p className={styles.datasetAddress}>{dataset.id}</p>
              <p className={styles.datasetDescription}>
                {dataset.description.slice(0, 40)}
                {dataset.description.length > 40 ? '...' : ''}
              </p>
            </div>

            <div className={styles.servicesList}>
              {dataset.services.map((service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <div className={styles.serviceHeader}>
                    <h3 className={styles.serviceName}>{service.name}</h3>
                  </div>

                  <p className={styles.serviceDescription}>
                    {service.serviceDescription.slice(0, 40)}
                    {service.serviceDescription.length > 40 ? '...' : ''}
                  </p>

                  <div className={styles.serviceDetails}>
                    <p>
                      <strong>Type:</strong> {service.type}
                    </p>
                  </div>

                  <div className={styles.serviceDetails}>
                    <p>
                      <strong>Access duration:</strong>{' '}
                      {Number(service.duration) === 0 ||
                      isNaN(Number(service.duration))
                        ? 'Forever'
                        : `${Math.floor(
                            Number(service.duration) / (60 * 60 * 24)
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
