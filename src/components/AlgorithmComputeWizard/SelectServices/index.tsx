import { useEffect, useState } from 'react'
import styles from './index.module.css'
import MinimizeIcon from '@images/minimize.svg'
import ExpandIcon from '@images/expand.svg'
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

export interface Dataset {
  id: string
  name: string
  description: string
  services: Service[]
  expanded?: boolean
  checked?: boolean
}
type FormValues = {
  datasets?: string[]
  dataset?: string[]
}

const ServiceSelector = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [datasets, setDatasets] = useState<Dataset[]>([])

  // Normalize incoming Formik values → local state
  useEffect(() => {
    if (!values.datasets || datasets.length > 0) return // only initialize once

    const normalized = values.datasets.map((d: any) => ({
      id: d.did,
      name: d.name,
      description: d.description,
      expanded: d.expanded ?? false,
      checked: d.checked ?? false,
      services: d.services.map((s: any) => ({
        id: s.serviceId,
        name: s.serviceName || 'Unnamed Service',
        title: s.serviceName,
        serviceDescription: s.serviceDescription || 'No description available',
        type: s.serviceType,
        duration: s.serviceDuration,
        price: String(s.price ?? d.datasetPrice ?? 0),
        symbol: s.tokenSymbol || 'OCEAN',
        checked: s.checked ?? false
      }))
    }))

    setDatasets(normalized)
  }, [values.datasets])

  // Helper: push current datasets state → Formik
  const syncWithFormik = (updated: Dataset[]) => {
    const selectedDatasets = updated
      .map((d) => ({
        ...d,
        services: d.services.filter((s) => s.checked)
      }))
      .filter((d) => d.services.length > 0) // keep only datasets with selected services

    setFieldValue('datasets', selectedDatasets)
  }

  const toggleDataset = (datasetId: string) => {
    const updated = datasets.map((dataset) =>
      dataset.id === datasetId
        ? { ...dataset, expanded: !dataset.expanded }
        : dataset
    )
    setDatasets(updated)
    syncWithFormik(updated)
  }

  const toggleDatasetCheckbox = (datasetId: string) => {
    const updated = datasets.map((dataset) => {
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
    setDatasets(updated)
    syncWithFormik(updated)
  }

  const toggleService = (datasetId: string, serviceId: string) => {
    const updated = datasets.map((dataset) => {
      if (dataset.id === datasetId) {
        const updatedServices = dataset.services.map((service) =>
          service.id === serviceId
            ? { ...service, checked: !service.checked }
            : service
        )

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
    setDatasets(updated)
    syncWithFormik(updated)
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
        {datasets.map((dataset, index) => (
          <div
            key={dataset.id || `dataset-${index}`}
            className={styles.dataset}
          >
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
                {dataset.services.map((service, index) => (
                  <div
                    key={service.id || `${dataset.id}-service-${index}`}
                    className={styles.service}
                  >
                    <div className={styles.checkboxColumn}>
                      <input
                        type="checkbox"
                        className={styles.checkboxInput}
                        checked={service.checked || false}
                        onChange={() => toggleService(dataset.id, service.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className={styles.servicesColumn}>
                      {service.name.slice(0, 15)}
                      {service.name.length > 15 ? '...' : ''}
                    </div>
                    <div className={styles.titleColumn}>{service.title}</div>
                    <div className={styles.descriptionColumn}>
                      {service.serviceDescription.slice(0, 15)}
                      {service.serviceDescription.length > 15 ? '...' : ''}
                    </div>
                    <div className={styles.typeColumn}>{service.type}</div>
                    <div className={styles.durationColumn}>
                      {Number(service.duration) === 0
                        ? 'Forever'
                        : `${Math.floor(
                            Number(service.duration) / (60 * 60 * 24)
                          )} days`}
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
