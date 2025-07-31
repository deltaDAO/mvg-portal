import { useState } from 'react'
import styles from './index.module.css'
import MinimizeIcon from '@images/minimize.svg'
import ExpandIcon from '@images/expand.svg'

interface Service {
  id: string
  name: string
  title: string
  description: string
  type: string
  duration: string
  price: string
  symbol: string
  checked?: boolean
}

interface Dataset {
  id: string
  name: string
  services: Service[]
  expanded?: boolean
  checked?: boolean
}

const ServiceSelector = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: '1',
      name: 'Dataset 1',
      expanded: true,
      checked: true,
      services: [
        {
          id: '1-1',
          name: 'Service 1',
          title: 'Service 1',
          description: 'Test data set with SSI credentials',
          type: 'Access',
          duration: 'Forever',
          price: '1',
          symbol: 'OCEAN',
          checked: true
        },
        {
          id: '1-2',
          name: 'Service 2',
          title: 'Service 2',
          description: 'Another test service',
          type: 'Access',
          duration: 'Forever',
          price: '2',
          symbol: 'OCEAN',
          checked: false
        }
      ]
    },
    {
      id: '2',
      name: 'Dataset 2',
      expanded: false,
      checked: false,
      services: [
        {
          id: '2-1',
          name: 'Service 1',
          title: 'Service 1',
          description: 'Test data set with SSI credentials',
          type: 'Access',
          duration: 'Forever',
          price: '1',
          symbol: 'OCEAN',
          checked: true
        },
        {
          id: '2-2',
          name: 'Service 2',
          title: 'Service 2',
          description: 'Another test service',
          type: 'Access',
          duration: 'Forever',
          price: '2',
          symbol: 'OCEAN',
          checked: false
        }
      ]
    },
    {
      id: '3',
      name: 'Dataset 3',
      expanded: false,
      checked: false,
      services: [
        {
          id: '3-1',
          name: 'Service 1',
          title: 'title 1',
          description: 'Test data set with SSI credentials',
          type: 'Access',
          duration: 'Forever',
          price: '1',
          symbol: 'OCEAN',
          checked: true
        },
        {
          id: '3-2',
          name: 'Service 2',
          title: 'Service 2',
          description: 'Another test service',
          type: 'Access',
          duration: 'Forever',
          price: '2',
          symbol: 'OCEAN',
          checked: false
        }
      ]
    }
  ])

  const toggleDataset = (datasetId: string) => {
    setDatasets(
      datasets.map((dataset) =>
        dataset.id === datasetId
          ? { ...dataset, expanded: !dataset.expanded }
          : dataset
      )
    )
  }

  const toggleDatasetCheckbox = (datasetId: string) => {
    setDatasets(
      datasets.map((dataset) => {
        if (dataset.id === datasetId) {
          const newCheckedState = !dataset.checked
          return {
            ...dataset,
            checked: newCheckedState,
            services: dataset.services.map((service) => ({
              ...service,
              checked: newCheckedState
            }))
          }
        }
        return dataset
      })
    )
  }

  const toggleService = (datasetId: string, serviceId: string) => {
    setDatasets(
      datasets.map((dataset) => {
        if (dataset.id === datasetId) {
          const updatedServices = dataset.services.map((service) =>
            service.id === serviceId
              ? { ...service, checked: !service.checked }
              : service
          )

          // Update dataset checked state based on services
          const allServicesChecked = updatedServices.every((s) => s.checked)
          const someServicesChecked = updatedServices.some((s) => s.checked)

          return {
            ...dataset,
            services: updatedServices,
            checked: allServicesChecked
              ? true
              : someServicesChecked
              ? undefined
              : false
          }
        }
        return dataset
      })
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Select Services</h1>

      {/* Header row */}
      <div className={styles.boxModel}>
        <div className={styles.header}>
          <div className={styles.checkboxColumn}></div>
          <div className={styles.servicesColumn}>SERVICES</div>
          <div className={styles.titleColumn}>TITLE</div>
          <div className={styles.descriptionColumn}>DESCRIPTION</div>
          <div className={styles.typeColumn}>TYPE</div>
          <div className={styles.durationColumn}>DURATION</div>
          <div className={styles.priceColumn}>PRICE</div>
        </div>

        {/* Datasets and services */}
        {datasets.map((dataset) => (
          <div key={dataset.id} className={styles.dataset}>
            <div className={styles.datasetRow}>
              <div className={styles.checkboxColumn}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={dataset.checked || false}
                  onChange={() => toggleDatasetCheckbox(dataset.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div
                className={styles.expandCollapseIcon}
                onClick={() => toggleDataset(dataset.id)}
              >
                {dataset.expanded ? (
                  <MinimizeIcon className={styles.expandedIcon} />
                ) : (
                  <ExpandIcon />
                )}
              </div>
              <div
                className={styles.datasetName}
                onClick={() => toggleDataset(dataset.id)}
              >
                {dataset.name}
              </div>
              {/* Empty cells to align with header */}
              <div className={styles.titleColumn}></div>
              <div className={styles.descriptionColumn}></div>
              <div className={styles.typeColumn}></div>
              <div className={styles.durationColumn}></div>
              <div className={styles.priceColumn}></div>
            </div>

            {dataset.expanded && (
              <div className={styles.servicesContainer}>
                {dataset.services.map((service) => (
                  <div key={service.id} className={styles.service}>
                    <div className={styles.checkboxColumn}>
                      <input
                        type="checkbox"
                        className={styles.checkboxInput}
                        checked={service.checked || false}
                        onChange={() => toggleService(dataset.id, service.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className={styles.servicesColumn}>{service.name}</div>
                    <div className={styles.titleColumn}>{service.title}</div>
                    <div className={styles.descriptionColumn}>
                      {service.description}
                    </div>
                    <div className={styles.typeColumn}>{service.type}</div>
                    <div className={styles.durationColumn}>
                      {service.duration}
                    </div>
                    <div className={styles.priceColumn}>
                      {service.price}{' '}
                      <span className={styles.symbol}>{service.symbol}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ServiceSelector
