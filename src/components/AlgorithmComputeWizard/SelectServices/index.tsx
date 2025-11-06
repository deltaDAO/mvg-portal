'use client'

import { useEffect, useState, useRef, FC } from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'
import MinimizeIcon from '@images/minimize.svg'
import ExpandIcon from '@images/expand.svg'
import { DatasetItem, DatasetService } from '../types/DatasetSelection' // ✅ adjust path as needed

type FormValues = {
  datasets?: DatasetItem[]
  dataset?: string[]
  serviceSelected?: boolean
}

const DatasetRow: FC<{
  dataset: DatasetItem
  onToggleExpand: (did: string) => void
  onToggleDataset: (did: string) => void
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
          onChange={() => onToggleDataset(dataset.did)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div
        className={styles.expandCollapseIcon}
        onClick={() => onToggleExpand(dataset.did)}
      >
        {dataset.expanded ? (
          <MinimizeIcon className={styles.expandedIcon} />
        ) : (
          <ExpandIcon />
        )}
      </div>

      <div
        className={styles.datasetName}
        onClick={() => onToggleExpand(dataset.did)}
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
  const [datasets, setDatasets] = useState<DatasetItem[]>([])

  console.log('selected datasets! ', JSON.stringify(values.datasets, null, 2))

  useEffect(() => {
    if (!values.datasets || datasets.length > 0) return

    const normalized: DatasetItem[] = values.datasets.map((d: any) => {
      const services: DatasetService[] = d.services.map((s: any) => ({
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

      const allChecked = services.every((s) => s.checked)
      const someChecked = services.some((s) => s.checked)

      return {
        did: d.did,
        name: d.name,
        symbol: d.symbol,
        description: d.description,
        datasetPrice: Number(d.datasetPrice ?? 0),
        expanded: d.expanded ?? false,
        checked: allChecked ? true : someChecked ? undefined : false,
        services
      }
    })

    setDatasets(normalized)
  }, [values.datasets, datasets.length])

  const syncWithFormik = (updated: DatasetItem[]) => {
    setFieldValue('datasets', updated)
  }

  const toggleDatasetExpand = (did: string) => {
    const updated = datasets.map((ds) =>
      ds.did === did ? { ...ds, expanded: !ds.expanded } : ds
    )
    setDatasets(updated)
    syncWithFormik(updated)
  }

  const toggleDatasetCheckbox = (did: string) => {
    const updated = datasets.map((ds) => {
      if (ds.did !== did) return ds
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

  const toggleService = (did: string, serviceId: string) => {
    const updated = datasets.map((ds) => {
      if (ds.did !== did) return ds

      const newServices = ds.services.map((s) =>
        s.serviceId === serviceId ? { ...s, checked: !s.checked } : s
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

  useEffect(() => {
    if (datasets.length === 0) return
    const anyServiceSelected = datasets.some((ds) =>
      ds.services.some((s) => s.checked)
    )
    setFieldValue('serviceSelected', anyServiceSelected)
  }, [datasets, setFieldValue])

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
          <div key={dataset.did} className={styles.dataset}>
            <DatasetRow
              dataset={dataset}
              onToggleExpand={toggleDatasetExpand}
              onToggleDataset={toggleDatasetCheckbox}
            />

            {dataset.expanded && (
              <div className={styles.servicesContainer}>
                {dataset.services.map((service) => (
                  <div key={service.serviceId} className={styles.service}>
                    <div className={styles.checkboxColumn}>
                      <input
                        type="checkbox"
                        className={styles.checkboxInput}
                        checked={service.checked || false}
                        onChange={() =>
                          toggleService(dataset.did, service.serviceId)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className={styles.servicesColumn}>
                      {service.serviceName.slice(0, 15)}
                      {service.serviceName.length > 15 ? '...' : ''}
                    </div>
                    <div className={styles.titleColumn}>
                      {service.serviceName}
                    </div>
                    <div className={styles.descriptionColumn}>
                      {service.serviceDescription.slice(0, 15)}
                      {service.serviceDescription.length > 15 ? '...' : ''}
                    </div>
                    <div className={styles.typeColumn}>
                      {service.serviceType}
                    </div>
                    <div className={styles.durationColumn}>
                      {Number(service.serviceDuration) === 0 ||
                      isNaN(Number(service.serviceDuration))
                        ? 'Forever'
                        : `${Math.floor(
                            Number(service.serviceDuration) / (60 * 60 * 24)
                          )} days`}
                    </div>
                    <div className={styles.priceColumn}>
                      {service.price}{' '}
                      <span className={styles.symbol}>
                        {service.tokenSymbol}
                      </span>
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
