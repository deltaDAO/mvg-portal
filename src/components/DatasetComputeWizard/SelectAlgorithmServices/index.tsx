'use client'

import { useCallback, useEffect, useState } from 'react'
import styles from './index.module.css'
import MinimizeIcon from '@images/minimize.svg'
import ExpandIcon from '@images/expand.svg'
import { useFormikContext } from 'formik'
import StepTitle from '@shared/StepTitle'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import { Asset } from 'src/@types/Asset'

interface AlgorithmService {
  id: string
  name: string
  title: string
  serviceDescription: string
  type: string
  duration: string | number
  price: string
  symbol: string
  checked?: boolean
  userParameters?: any
}

const extractString = (
  value: string | { '@value': string } | undefined
): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && '@value' in value)
    return value['@value']
  return ''
}

interface Algorithm {
  id: string
  name: string
  description: string
  services: AlgorithmService[]
  expanded?: boolean
  checked?: boolean
}

interface FormValues {
  algorithm?: string
  algorithms?: Algorithm
  serviceSelected?: boolean
}

interface SelectAlgorithmServicesProps {
  selectedAlgorithmAsset?: AssetExtended
  ddoListAlgorithms?: Asset[]
}

const SelectAlgorithmServices = ({
  selectedAlgorithmAsset,
  ddoListAlgorithms = []
}: SelectAlgorithmServicesProps) => {
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)

  const getAlgorithmAsset = useCallback(
    (
      algo: string
    ): {
      algorithmAsset: Asset | null
      serviceId: string | null
    } => {
      let algorithmId: string
      let serviceId: string | null = null
      try {
        const parsed = JSON.parse(algo)
        algorithmId = parsed?.algoDid || algo
        serviceId = parsed?.serviceId || null
      } catch (e) {
        algorithmId = algo
      }

      const assetDdo =
        ddoListAlgorithms.find((ddo) => ddo.id === algorithmId) || null

      return { algorithmAsset: assetDdo, serviceId }
    },
    [ddoListAlgorithms]
  )

  useEffect(() => {
    if (!values.algorithm || selectedAlgorithm) return

    const fetchAlgorithm = async () => {
      setIsLoading(true)
      try {
        const { algorithmAsset, serviceId } = getAlgorithmAsset(
          values.algorithm
        )
        if (!algorithmAsset || !serviceId) {
          setIsLoading(false)
          return
        }

        const service = algorithmAsset.credentialSubject?.services?.find(
          (svc: Service) => svc.id === serviceId
        )

        if (!service) {
          setIsLoading(false)
          return
        }

        const algoService: AlgorithmService = {
          id: service.id,
          name: extractString(service.name) || service.type,
          title: extractString(service.name) || service.type,
          serviceDescription:
            extractString(service.description) || `Service for ${service.type}`,
          type: service.type,
          duration: service.timeout || 0,
          price: service.price,
          symbol: 'OCEAN',
          checked: true,
          userParameters: service.consumerParameters
        }

        const newAlgorithm: Algorithm = {
          id: algorithmAsset.id,
          name:
            extractString(algorithmAsset.credentialSubject?.metadata?.name) ||
            'Selected Algorithm',
          description:
            extractString(
              algorithmAsset.credentialSubject?.metadata?.description
            ) || 'Algorithm service',
          expanded: true,
          checked: true,
          services: [algoService] // only keep the single service
        }

        setSelectedAlgorithm(newAlgorithm)
        setFieldValue('algorithms', newAlgorithm)
        setFieldValue('serviceSelected', true)
      } catch (err) {
        console.error('Error fetching algorithm service:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlgorithm()
  }, [values.algorithm, selectedAlgorithm, getAlgorithmAsset, setFieldValue])

  const toggleAlgorithm = () => {
    if (!selectedAlgorithm) return
    const updated = {
      ...selectedAlgorithm,
      expanded: !selectedAlgorithm.expanded
    }
    setSelectedAlgorithm(updated)
    setFieldValue('algorithms', updated)
  }

  const toggleAlgorithmCheckbox = () => {
    if (!selectedAlgorithm) return
    const newChecked = !selectedAlgorithm.checked
    const updatedAlgorithm = {
      ...selectedAlgorithm,
      checked: newChecked,
      services: selectedAlgorithm.services.map((s, i) => ({
        ...s,
        checked: newChecked && i === 0
      }))
    }
    setSelectedAlgorithm(updatedAlgorithm)
    setFieldValue('algorithms', updatedAlgorithm)
    setFieldValue(
      'serviceSelected',
      updatedAlgorithm.services.some((s) => s.checked)
    )
  }

  const toggleService = (serviceId: string) => {
    if (!selectedAlgorithm) return
    const updatedServices = selectedAlgorithm.services.map((s) => ({
      ...s,
      checked: s.id === serviceId
    }))
    const updatedAlgorithm = {
      ...selectedAlgorithm,
      services: updatedServices,
      checked: updatedServices.some((s) => s.checked)
    }
    setSelectedAlgorithm(updatedAlgorithm)
    setFieldValue('algorithms', updatedAlgorithm)
    setFieldValue(
      'serviceSelected',
      updatedServices.some((s) => s.checked)
    )
  }

  if (!selectedAlgorithm) {
    return (
      <div className={styles.container}>
        <StepTitle title="Select Algorithm Services" />
        {isLoading ? (
          <p>Loading service...</p>
        ) : (
          <p>Please select an algorithm first</p>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <StepTitle title="Select Algorithm Services" />
      <div className={styles.boxModel}>
        <div className={styles.header}>
          <div className={styles.checkboxColumn}></div>
          <div className={styles.servicesColumn}>SERVICE</div>
          <div className={styles.titleColumn}>TITLE</div>
          <div className={styles.descriptionColumn}>DESCRIPTION</div>
          <div className={styles.typeColumn}>TYPE</div>
          <div className={styles.durationColumn}>DURATION</div>
          <div className={styles.priceColumn}>PRICE</div>
        </div>

        <div className={styles.algorithm}>
          <div className={styles.algorithmRow}>
            <div className={styles.checkboxColumn}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={selectedAlgorithm.checked || false}
                onChange={toggleAlgorithmCheckbox}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div
              className={styles.expandCollapseIcon}
              onClick={toggleAlgorithm}
            >
              {selectedAlgorithm.expanded ? (
                <MinimizeIcon className={styles.expandedIcon} />
              ) : (
                <ExpandIcon />
              )}
            </div>
            <div className={styles.algorithmName} onClick={toggleAlgorithm}>
              {selectedAlgorithm.name}
            </div>
            <div className={styles.titleColumn}></div>
            <div className={styles.descriptionColumn}></div>
            <div className={styles.typeColumn}></div>
            <div className={styles.durationColumn}></div>
            <div className={styles.priceColumn}></div>
          </div>

          {selectedAlgorithm.expanded && (
            <div className={styles.servicesContainer}>
              {selectedAlgorithm.services.map((service) => (
                <div key={service.id} className={styles.service}>
                  <div className={styles.checkboxColumn}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={service.checked || false}
                      onChange={() => toggleService(service.id)}
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
      </div>
    </div>
  )
}

export default SelectAlgorithmServices
