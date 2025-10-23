import styles from './index.module.css'
import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'

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
  datasetPrice?: string
  description: string
  services: Service[]
  expanded?: boolean
  checked?: boolean
}
interface FormValues {
  datasets: Dataset[]
  dataset: string[]
}

const PreviewSelectedServices = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [selectedDatasets, setSelectedDatasets] = useState<any[]>([])

  // Normalize incoming Formik values → local state
  useEffect(() => {
    if (!values.datasets) return

    const normalized = values.datasets.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      expanded: d.expanded ?? false,
      checked: d.checked ?? false,
      services: (d.services ?? []).map((s) => ({
        id: s.id,
        name: s.name || 'Unnamed Service',
        title: s.name || 'Unnamed Service',
        serviceDescription: s.serviceDescription || 'No description available',
        type: s.type,
        duration: s.duration,
        price: String(s.price ?? d.datasetPrice ?? 0),
        symbol: s.symbol || 'OCEAN',
        checked: s.checked ?? false
      }))
    }))

    setSelectedDatasets(normalized)

    // Build dataset array in "datasetId|serviceId" format
    const datasetIdServicePairs: string[] = normalized.flatMap((d) =>
      (d.services ?? []).filter((s) => s.checked).map((s) => `${d.id}|${s.id}`)
    )

    setFieldValue('dataset', datasetIdServicePairs)
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
                {dataset.description.length > 40 ? '...' : ''}{' '}
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
                      {Number(service.duration) === 0
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
