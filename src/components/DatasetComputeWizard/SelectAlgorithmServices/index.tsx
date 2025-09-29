import { useCallback, useEffect, useState } from 'react'
import styles from './index.module.css'
import MinimizeIcon from '@images/minimize.svg'
import ExpandIcon from '@images/expand.svg'
import { useFormikContext } from 'formik'
import StepTitle from '@shared/StepTitle'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import { Asset } from 'src/@types/Asset'
import Loader from '@shared/atoms/Loader'

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
  algorithmServices?: AlgorithmService[]
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
  console.log('values!!! ', values)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)

  const getAlgorithmAsset = useCallback(
    (
      algo: string
    ): {
      algorithmAsset: Asset | null
      serviceIndexAlgo: number | null
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

      let assetDdo: Asset | null = null
      let serviceIndexAlgo: number | null = null

      ddoListAlgorithms.forEach((ddo: Asset) => {
        if (ddo.id === algorithmId) {
          assetDdo = ddo
          if (serviceId && ddo.credentialSubject?.services) {
            const index = ddo.credentialSubject.services.findIndex(
              (svc: any) => svc.id === serviceId
            )
            serviceIndexAlgo = index !== -1 ? index : null
          }
        }
      })

      return { algorithmAsset: assetDdo, serviceIndexAlgo, serviceId }
    },
    [ddoListAlgorithms]
  )

  useEffect(() => {
    if (selectedAlgorithm) return

    if (selectedAlgorithmAsset) {
      const algorithmServices: AlgorithmService[] =
        selectedAlgorithmAsset.credentialSubject?.services?.map(
          (service: Service, i: number) => ({
            id: service.id,
            name: extractString(service.name) || service.type,
            title: extractString(service.name) || service.type,
            serviceDescription:
              extractString(service.description) ||
              `Service for ${service.type}`,
            type: service.type,
            duration: service.timeout || 0,
            price: service.price,
            symbol: 'OCEAN',
            checked: i === (selectedAlgorithmAsset.serviceIndex ?? 0)
          })
        ) || []

      const newAlgorithm = {
        id: selectedAlgorithmAsset.id,
        name:
          extractString(
            selectedAlgorithmAsset.credentialSubject?.metadata?.name
          ) || 'Selected Algorithm',
        description:
          extractString(
            selectedAlgorithmAsset.credentialSubject?.metadata?.description
          ) || 'Algorithm services for compute',
        expanded: true,
        checked: algorithmServices.some((s) => s.checked),
        services: algorithmServices
      }

      setSelectedAlgorithm(newAlgorithm)
      setFieldValue('algorithms', {
        ...newAlgorithm,
        services: algorithmServices.filter((s) => s.checked)
      })
      return
    }

    if (values.algorithm && ddoListAlgorithms && ddoListAlgorithms.length > 0) {
      setIsLoading(true)
      const fetchAlgorithmAssetExtended = async () => {
        try {
          const { algorithmAsset, serviceIndexAlgo, serviceId } =
            getAlgorithmAsset(values.algorithm)

          if (!algorithmAsset) {
            setIsLoading(false)
            return
          }

          if (
            !algorithmAsset.credentialSubject?.services ||
            algorithmAsset.credentialSubject.services.length === 0
          ) {
            console.log('🔍 Algorithm asset has no services!')
            setIsLoading(false)
            return
          }

          const extendedAlgoAsset: AssetExtended = {
            ...algorithmAsset,
            serviceIndex: serviceIndexAlgo
          }

          const algorithmServices: AlgorithmService[] =
            extendedAlgoAsset.credentialSubject?.services?.map(
              (service: Service) => ({
                id: service.id,
                name: extractString(service.name) || service.type,
                title: extractString(service.name) || service.type,
                serviceDescription:
                  extractString(service.description) ||
                  `Service for ${service.type}`,
                type: service.type,
                duration: service.timeout || 0,
                price: service.price,
                symbol: 'OCEAN',
                checked: serviceId ? service.id === serviceId : false
              })
            ) || []

          const newAlgorithm = {
            id: extendedAlgoAsset.id,
            name: extractString(
              extendedAlgoAsset.credentialSubject?.metadata?.name
            ),
            description: extractString(
              extendedAlgoAsset.credentialSubject?.metadata?.description
            ),
            expanded: true,
            checked: algorithmServices.some((s) => s.checked),
            services: algorithmServices
          }

          setSelectedAlgorithm(newAlgorithm)
          setFieldValue('algorithms', {
            ...newAlgorithm,
            services: algorithmServices.filter((s) => s.checked)
          })
        } catch (error) {
          console.error('🔍 Error fetching algorithm asset:', error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchAlgorithmAssetExtended()
    }
  }, [
    selectedAlgorithmAsset,
    selectedAlgorithm,
    values.algorithm,
    ddoListAlgorithms,
    getAlgorithmAsset,
    setFieldValue
  ])

  const syncWithFormik = (_updated: Algorithm) => {}

  const toggleAlgorithm = () => {
    if (selectedAlgorithm) {
      const updatedAlgorithm = {
        ...selectedAlgorithm,
        expanded: !selectedAlgorithm.expanded
      }
      setSelectedAlgorithm(updatedAlgorithm)
      setFieldValue('algorithms', {
        ...updatedAlgorithm,
        services: updatedAlgorithm.services.filter((s) => s.checked)
      })
    }
  }

  const toggleAlgorithmCheckbox = () => {
    if (selectedAlgorithm) {
      const newCheckedState = !selectedAlgorithm.checked
      const updatedAlgorithm = {
        ...selectedAlgorithm,
        checked: newCheckedState,
        services: selectedAlgorithm.services.map((service, i) => ({
          ...service,
          checked: newCheckedState && i === 0
        }))
      }
      setSelectedAlgorithm(updatedAlgorithm)
      setFieldValue('algorithms', {
        ...updatedAlgorithm,
        services: updatedAlgorithm.services.filter((s) => s.checked)
      })
      syncWithFormik(updatedAlgorithm)
    }
  }

  const toggleService = (serviceId: string) => {
    if (selectedAlgorithm) {
      const updatedServices = selectedAlgorithm.services.map((service) => ({
        ...service,
        checked: service.id === serviceId
      }))

      const updatedAlgorithm = {
        ...selectedAlgorithm,
        services: updatedServices,
        checked: updatedServices.some((s) => s.checked)
      }

      setSelectedAlgorithm(updatedAlgorithm)
      setFieldValue('algorithms', {
        ...updatedAlgorithm,
        services: updatedServices.filter((s) => s.checked)
      })
      syncWithFormik(updatedAlgorithm)
    }
  }

  if (!selectedAlgorithm) {
    if (isLoading) {
      return (
        <div className={styles.container}>
          <StepTitle title="Select Algorithm Services" />
          <Loader message="Loading algorithm services..." />
        </div>
      )
    }

    return (
      <div className={styles.container}>
        <StepTitle title="Select Algorithm Services" />
        <p>Please select an algorithm first</p>
      </div>
    )
  }

  if (!selectedAlgorithm.services || selectedAlgorithm.services.length === 0) {
    return (
      <div className={styles.container}>
        <StepTitle title="Select Algorithm Services" />
        <p>No services available for the selected algorithm</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <StepTitle title="Select Algorithm Services" />

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
