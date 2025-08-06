import styles from './index.module.css'
import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'

interface Service {
  id: string
  name: string
  title: string
  description: string
  type: string
  duration: string
}

interface Dataset {
  id: string
  name: string
  address: string
  description: string
  services: Service[]
}
interface FormValues {
  dataset: Dataset[]
}

const PreviewSelectedServices = () => {
  const { values } = useFormikContext<FormValues>()
  const [selectedDatasets, setSelectedDatasets] = useState<any[]>([])
  console.log('Form values', values)

  // Normalize incoming Formik values → local state
  useEffect(() => {
    if (!values.dataset || selectedDatasets.length > 0) return // only initialize once

    const normalized = values.dataset.map((d: any) => ({
      id: d.id,
      name: d.name,
      expanded: d.expanded ?? false,
      checked: d.checked ?? false,
      services: d.services.map((s: any) => ({
        id: s.id,
        name: s.name || 'Unnamed Service',
        title: s.name || 'Unnamed Service',
        description: s.description || 'No description available',
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
                {dataset.description || 'Not available'}{' '}
              </p>
            </div>

            <div className={styles.servicesList}>
              {dataset.services.map((service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <div className={styles.serviceHeader}>
                    <h3 className={styles.serviceName}>{service.name}</h3>
                  </div>
                  <p className={styles.serviceDescription}>
                    {service.description}
                  </p>
                  <div className={styles.serviceDetails}>
                    <p>
                      <strong>Type:</strong> {service.type}
                    </p>
                  </div>
                  <div className={styles.serviceDetails}>
                    <p>
                      <strong>Access duration:</strong> {service.duration}
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
