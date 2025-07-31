import styles from './index.module.css'

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

const PreviewSelectedServices = () => {
  const selectedDatasets: Dataset[] = [
    {
      id: '1',
      name: 'Dataset 1',
      address: '0x5C56...8f24',
      description: 'FIWARE is an open-source...',
      services: [
        {
          id: '1-1',
          name: 'Service 1',
          title: 'Service 1',
          description: 'No description',
          type: 'Access',
          duration: 'Forever'
        },
        {
          id: '1-2',
          name: 'Service 2',
          title: 'Service 2',
          description: 'No description',
          type: 'Access',
          duration: 'Forever'
        }
      ]
    },
    {
      id: '1',
      name: 'Dataset 2',
      address: '0x5C56...8f24',
      description: 'FIWARE is an open-source...',
      services: [
        {
          id: '1-1',
          name: 'Service 1',
          title: 'Service 1',
          description: 'No description',
          type: 'Access',
          duration: 'Forever'
        },
        {
          id: '1-2',
          name: 'Service 2',
          title: 'Service 2',
          description: 'No description',
          type: 'Access',
          duration: 'Forever'
        }
      ]
    },
    {
      id: '1',
      name: 'Dataset 3',
      address: '0x5C56...8f24',
      description: 'FIWARE is an open-source.',
      services: [
        {
          id: '1-1',
          name: 'Service 1',
          title: 'Service 1',
          description: 'No description',
          type: 'Access',
          duration: 'Forever'
        },
        {
          id: '1-2',
          name: 'Service 2',
          title: 'Service 2',
          description: 'No description',
          type: 'Access',
          duration: 'Forever'
        }
      ]
    }
    // Add more datasets as needed
  ]

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Preview Selected Datasets & Services</h1>

      <div className={styles.previewContainer}>
        {selectedDatasets.map((dataset) => (
          <div key={dataset.id} className={styles.datasetContainer}>
            <div className={styles.datasetHeader}>
              <h2 className={styles.datasetName}>{dataset.name}</h2>
              <p className={styles.datasetAddress}>{dataset.address}</p>
              <p className={styles.datasetDescription}>{dataset.description}</p>
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
