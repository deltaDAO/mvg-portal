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
  dataset: Dataset[]
}

const PreviewSelectedServices = () => {
  const { values } = useFormikContext<FormValues>()
  const [selectedDatasets, setSelectedDatasets] = useState<any[]>([])

  // Normalize incoming Formik values → local state
  useEffect(() => {
    if (!values.dataset || selectedDatasets.length > 0) return // only initialize once

    const normalized = values.dataset.map((d: Dataset) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      expanded: d.expanded ?? false,
      checked: d.checked ?? false,
      services: d.services.map((s: any) => ({
        id: s.id,
        name: s.name || 'Unnamed Service',
        title: s.name || 'Unnamed Service',
        serviceDescription: s.serviceDescription || 'No description available',
        type: s.type || 'Access',
        duration: s.duration || 'Forever',
        price: String(s.price ?? d.datasetPrice ?? 0),
        symbol: s.symbol || 'OCEAN',
        checked: s.checked ?? false
      }))
    }))

    setSelectedDatasets(normalized)
  }, [values.dataset])
  // const selectedDatasets: Dataset[] = [
  //   {
  //     id: '1',
  //     name: 'Dataset 1',
  //     address: '0x5C56...8f24',
  //     description: 'FIWARE is an open-source...',
  //     services: [
  //       {
  //         id: '1-1',
  //         name: 'Service 1',
  //         title: 'Service 1',
  //         description: 'No description',
  //         type: 'Access',
  //         duration: 'Forever'
  //       },
  //       {
  //         id: '1-2',
  //         name: 'Service 2',
  //         title: 'Service 2',
  //         description: 'No description',
  //         type: 'Access',
  //         duration: 'Forever'
  //       }
  //     ]
  //   },
  //   {
  //     id: '1',
  //     name: 'Dataset 2',
  //     address: '0x5C56...8f24',
  //     description: 'FIWARE is an open-source...',
  //     services: [
  //       {
  //         id: '1-1',
  //         name: 'Service 1',
  //         title: 'Service 1',
  //         description: 'No description',
  //         type: 'Access',
  //         duration: 'Forever'
  //       },
  //       {
  //         id: '1-2',
  //         name: 'Service 2',
  //         title: 'Service 2',
  //         description: 'No description',
  //         type: 'Access',
  //         duration: 'Forever'
  //       }
  //     ]
  //   },
  //   {
  //     id: '1',
  //     name: 'Dataset 3',
  //     address: '0x5C56...8f24',
  //     description: 'FIWARE is an open-source.',
  //     services: [
  //       {
  //         id: '1-1',
  //         name: 'Service 1',
  //         title: 'Service 1',
  //         description: 'No description',
  //         type: 'Access',
  //         duration: 'Forever'
  //       },
  //       {
  //         id: '1-2',
  //         name: 'Service 2',
  //         title: 'Service 2',
  //         description: 'No description',
  //         type: 'Access',
  //         duration: 'Forever'
  //       }
  //     ]
  //   }
  //   // Add more datasets as needed
  // ]

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
