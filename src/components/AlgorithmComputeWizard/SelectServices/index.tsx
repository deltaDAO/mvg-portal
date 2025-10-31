'use client'

import { useEffect, useState, useRef, FC } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import MinimizeIcon from '@images/minimize.svg'
import ExpandIcon from '@images/expand.svg'

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
  checked?: boolean | undefined
}

type FormValues = {
  datasets?: Dataset[]
  dataset?: string[]
}

const DatasetRow: FC<{
  dataset: Dataset
  onToggleExpand: (id: string) => void
  onToggleDataset: (id: string) => void
}> = ({ dataset, onToggleExpand, onToggleDataset }) => {
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = dataset.checked === undefined
    }
  }, [dataset.checked])

  return (
    <div className={styles.datasetRow}>
      <div className={styles.checkboxColumn}>
        <input
          ref={checkboxRef}
          type="checkbox"
          className={styles.checkboxInput}
          checked={dataset.checked === true}
          onChange={() => onToggleDataset(dataset.id)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div
        className={styles.expandCollapseIcon}
        onClick={() => onToggleExpand(dataset.id)}
      >
        {dataset.expanded ? (
          <MinimizeIcon className={styles.expandedIcon} />
        ) : (
          <ExpandIcon />
        )}
      </div>

      <div
        className={styles.datasetName}
        onClick={() => onToggleExpand(dataset.id)}
      >
        {dataset.name}
      </div>

      <div className={styles.titleColumn} />
      <div className={styles.descriptionColumn} />
      <div className={styles.typeColumn} />
      <div className={styles.durationColumn} />
      <div className={styles.priceColumn} />
    </div>
  )
}

const ServiceSelector = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [datasets, setDatasets] = useState<Dataset[]>([])

  useEffect(() => {
    if (!values.datasets || datasets.length > 0) return

    const normalized: Dataset[] = values.datasets.map((d: any) => {
      const services: Service[] = d.services.map((s: any) => ({
        id: s.serviceId || s.id,
        name: s.serviceName || s.name || 'Unnamed Service',
        title: s.serviceName || s.name,
        serviceDescription: s.serviceDescription || 'No description',
        type: s.serviceType || s.type,
        duration: s.serviceDuration ?? s.duration ?? 0,
        price: String(s.price ?? d.datasetPrice ?? 0),
        symbol: s.tokenSymbol || s.symbol || 'OCEAN',
        checked: s.checked ?? false
      }))

      const allChecked = services.every((s) => s.checked)
      const someChecked = services.some((s) => s.checked)

      return {
        id: d.did || d.id,
        name: d.name,
        description: d.description,
        expanded: d.expanded ?? false,
        services,
        checked: allChecked ? true : someChecked ? undefined : false
      }
    })

    setDatasets(normalized)
  }, [values.datasets, datasets.length])

  const syncWithFormik = (updated: Dataset[]) => {
    setFieldValue('datasets', updated)
  }

  const toggleDataset = (datasetId: string) => {
    const updated = datasets.map((ds) =>
      ds.id === datasetId ? { ...ds, expanded: !ds.expanded } : ds
    )
    setDatasets(updated)
    syncWithFormik(updated)
  }

  const toggleDatasetCheckbox = (datasetId: string) => {
    const updated = datasets.map((ds) => {
      if (ds.id !== datasetId) return ds
      const newChecked = !ds.checked
      return {
        ...ds,
        checked: newChecked,
        services: ds.services.map((s) => ({ ...s, checked: newChecked }))
      }
    })
    setDatasets(updated)
    syncWithFormik(updated)
  }

  const toggleService = (datasetId: string, serviceId: string) => {
    const updated = datasets.map((ds) => {
      if (ds.id !== datasetId) return ds

      const newServices = ds.services.map((s) =>
        s.id === serviceId ? { ...s, checked: !s.checked } : s
      )
      const all = newServices.every((s) => s.checked)
      const some = newServices.some((s) => s.checked)

      return {
        ...ds,
        services: newServices,
        checked: all ? true : some ? undefined : false
      }
    })
    setDatasets(updated)
    syncWithFormik(updated)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Select Services</h1>

      <div className={styles.boxModel}>
        <div className={styles.header}>
          <div className={styles.checkboxColumn} />
          <div className={styles.servicesColumn}>SERVICES</div>
          <div className={styles.titleColumn}>TITLE</div>
          <div className={styles.descriptionColumn}>DESCRIPTION</div>
          <div className={styles.typeColumn}>TYPE</div>
          <div className={styles.durationColumn}>DURATION</div>
          <div className={styles.priceColumn}>PRICE</div>
        </div>

        {datasets.map((dataset) => (
          <div key={dataset.id} className={styles.dataset}>
            <DatasetRow
              dataset={dataset}
              onToggleExpand={toggleDataset}
              onToggleDataset={toggleDatasetCheckbox}
            />

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
                      {Number(service.duration) === 0 ||
                      isNaN(Number(service.duration))
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
