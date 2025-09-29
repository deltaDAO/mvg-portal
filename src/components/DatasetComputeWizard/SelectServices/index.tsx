import { useEffect, useState, useCallback } from 'react'
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

export interface AlgorithmDataset {
  did: string
  name: string
  description: string
  services: Service[]
  expanded?: boolean
  checked?: boolean
}

type FormValues = {
  selectedAlgorithm?: any
  selectedAsset?: any
  algorithm?: string
}

const ServiceSelector = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [datasets, setDatasets] = useState<AlgorithmDataset[]>([])

  // Normalize algorithm dataset from Formik values
  const normalizeDataset = useCallback((algo: any): AlgorithmDataset[] => {
    if (!algo || !algo.did) return []

    return [
      {
        did: algo.did || '',
        name: algo.name || 'Unnamed Algorithm',
        description: algo.description || 'No description available',
        expanded: true,
        checked: true,
        services: (algo.services || []).map((s: any, index: number) => ({
          id: s?.serviceId || `service-${index}`,
          name: s?.serviceName || 'Unnamed Service',
          title: s?.serviceType || 'Access',
          serviceDescription:
            s?.serviceDescription || 'No description available',
          type: s?.serviceType || 'Access',
          duration: s?.serviceDuration ?? 0,
          price: String(s?.price ?? algo?.datasetPrice ?? 0),
          symbol: s?.tokenSymbol || 'OCEAN',
          checked: index === 0 // first service selected by default
        }))
      }
    ]
  }, [])

  // Initialize datasets when selectedAlgorithm changes
  useEffect(() => {
    if (values.selectedAlgorithm) {
      const normalized = normalizeDataset(values.selectedAlgorithm)
      setDatasets(normalized)

      if (normalized.length > 0 && normalized[0].services.length > 0) {
        const selectedAlgo = normalized[0]
        const selectedService = selectedAlgo.services.find((s) => s.checked)

        setFieldValue('selectedAlgorithm', selectedAlgo)
        setFieldValue('selectedAsset', selectedService)
        setFieldValue(
          'algorithm',
          JSON.stringify({
            algoDid: selectedAlgo.did,
            serviceId: selectedService?.id || ''
          })
        )
      }
    }
  }, [values.selectedAlgorithm, normalizeDataset, setFieldValue])

  // Handle service selection (only one at a time)
  const toggleService = (datasetDid: string, serviceId: string) => {
    const updated = datasets.map((dataset) => {
      if (dataset.did === datasetDid) {
        const updatedServices = dataset.services.map((service) => ({
          ...service,
          checked: service.id === serviceId // only one true
        }))
        return { ...dataset, services: updatedServices, checked: true }
      }
      return { ...dataset, checked: false }
    })

    setDatasets(updated)

    const selectedAlgo = updated.find((d) => d.checked)
    const selectedService = selectedAlgo?.services.find((s) => s.checked)

    setFieldValue('selectedAlgorithm', selectedAlgo)
    setFieldValue('selectedAsset', selectedService)
    setFieldValue(
      'algorithm',
      selectedAlgo && selectedService
        ? JSON.stringify({
            algoDid: selectedAlgo.did,
            serviceId: selectedService.id
          })
        : ''
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Select Algorithm & Service</h1>

      <div className={styles.boxModel}>
        <div className={styles.header}>
          <div className={styles.servicesColumn}>SERVICES</div>
          <div className={styles.titleColumn}>TITLE</div>
          <div className={styles.descriptionColumn}>DESCRIPTION</div>
          <div className={styles.typeColumn}>TYPE</div>
          <div className={styles.durationColumn}>DURATION</div>
          <div className={styles.priceColumn}>PRICE</div>
        </div>

        {datasets.length === 0 ? (
          <div className={styles.empty}>No algorithm selected.</div>
        ) : (
          datasets.map((dataset, index) => (
            <div
              key={dataset.did || `algo-${index}`}
              className={styles.dataset}
            >
              <div className={styles.datasetRow}>
                <div
                  className={styles.expandCollapseIcon}
                  onClick={() =>
                    setDatasets((prev) =>
                      prev.map((d) =>
                        d.did === dataset.did
                          ? { ...d, expanded: !d.expanded }
                          : d
                      )
                    )
                  }
                >
                  {dataset.expanded ? (
                    <MinimizeIcon className={styles.expandedIcon} />
                  ) : (
                    <ExpandIcon />
                  )}
                </div>
                <div
                  className={styles.datasetName}
                  onClick={() =>
                    setDatasets((prev) =>
                      prev.map((d) =>
                        d.did === dataset.did
                          ? { ...d, expanded: !d.expanded }
                          : d
                      )
                    )
                  }
                >
                  {dataset.name}
                </div>
              </div>

              {dataset.expanded && (
                <div className={styles.servicesContainer}>
                  {dataset.services.map((service, idx) => (
                    <div
                      key={service.id || `${dataset.did}-service-${idx}`}
                      className={styles.service}
                    >
                      <div className={styles.checkboxColumn}>
                        <input
                          type="radio"
                          name={`service-${dataset.did}`}
                          className={styles.checkboxInput}
                          checked={service.checked || false}
                          onChange={() =>
                            toggleService(dataset.did, service.id)
                          }
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
          ))
        )}
      </div>
    </div>
  )
}

export default ServiceSelector
