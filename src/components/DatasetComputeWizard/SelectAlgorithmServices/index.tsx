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

// Helper function to extract string from LanguageValueObject
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
  const { values } = useFormikContext<FormValues>()
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)

  // Function to get algorithm asset from ddoListAlgorithms
  const getAlgorithmAsset = useCallback(
    (
      algo: string
    ): {
      algorithmAsset: Asset | null
      serviceIndexAlgo: number | null
    } => {
      let algorithmId: string
      let serviceId: string = ''
      try {
        const parsed = JSON.parse(algo)
        algorithmId = parsed?.algoDid || algo
        serviceId = parsed?.serviceId || ''
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

      return { algorithmAsset: assetDdo, serviceIndexAlgo }
    },
    [ddoListAlgorithms]
  )

  // Initialize from selectedAlgorithmAsset prop or fetch from form values
  useEffect(() => {
    // reduced verbose logging

    if (selectedAlgorithm) return

    // If we have selectedAlgorithmAsset, use it directly
    if (selectedAlgorithmAsset) {
      // initialize from provided asset

      // Transform real algorithm asset to our component format
      const algorithmServices: AlgorithmService[] =
        selectedAlgorithmAsset.credentialSubject?.services?.map(
          (service: Service) => ({
            id: service.id,
            name: extractString(service.name) || service.type,
            title: extractString(service.name) || service.type,
            serviceDescription:
              extractString(service.description) ||
              `Service for ${service.type}`,
            type: service.type,
            duration: service.timeout || 0,
            price: '0', // Price will be determined during compute
            symbol: 'OCEAN',
            checked: true // Default to checked
          })
        ) || []

      setSelectedAlgorithm({
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
        checked: true,
        services: algorithmServices
      })
      return
    }

    // If no selectedAlgorithmAsset but we have algorithm in form values, fetch it
    if (values.algorithm && ddoListAlgorithms && ddoListAlgorithms.length > 0) {
      // initialize from form values

      setIsLoading(true)
      const fetchAlgorithmAssetExtended = async () => {
        try {
          const { algorithmAsset, serviceIndexAlgo } = getAlgorithmAsset(
            values.algorithm
          )

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

          // Transform algorithm asset to our component format
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
                price: '0', // Price will be determined during compute
                symbol: 'OCEAN',
                checked: true // Default to checked
              })
            ) || []

          setSelectedAlgorithm({
            id: extendedAlgoAsset.id,
            name:
              extractString(
                extendedAlgoAsset.credentialSubject?.metadata?.name
              ) || 'Selected Algorithm',
            description:
              extractString(
                extendedAlgoAsset.credentialSubject?.metadata?.description
              ) || 'Algorithm services for compute',
            expanded: true,
            checked: true,
            services: algorithmServices
          })
        } catch (error) {
          console.error('🔍 Error fetching algorithm asset:', error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchAlgorithmAssetExtended()
    } else {
      console.log('🔍 Cannot fetch algorithm because:', {
        hasValuesAlgorithm: !!values.algorithm,
        hasDdoListAlgorithms: !!ddoListAlgorithms,
        ddoListAlgorithmsLength: ddoListAlgorithms?.length || 0
      })
    }
  }, [
    selectedAlgorithmAsset,
    selectedAlgorithm,
    values.algorithm,
    ddoListAlgorithms,
    getAlgorithmAsset
  ])

  // keep selection local; do not write to form until used elsewhere
  const syncWithFormik = (_updated: Algorithm) => {}

  const toggleAlgorithm = () => {
    if (selectedAlgorithm) {
      setSelectedAlgorithm({
        ...selectedAlgorithm,
        expanded: !selectedAlgorithm.expanded
      })
    }
  }

  const toggleAlgorithmCheckbox = () => {
    if (selectedAlgorithm) {
      const newCheckedState = !selectedAlgorithm.checked
      const updatedAlgorithm = {
        ...selectedAlgorithm,
        checked: newCheckedState,
        services: selectedAlgorithm.services.map((service) => ({
          ...service,
          checked: newCheckedState
        }))
      }
      setSelectedAlgorithm(updatedAlgorithm)
      syncWithFormik(updatedAlgorithm)
    }
  }

  const toggleService = (serviceId: string) => {
    if (selectedAlgorithm) {
      const updatedServices = selectedAlgorithm.services.map((service) =>
        service.id === serviceId
          ? { ...service, checked: !service.checked }
          : service
      )

      const allServicesChecked = updatedServices.every((s) => s.checked)
      const someServicesChecked = updatedServices.some((s) => s.checked)

      const updatedAlgorithm = {
        ...selectedAlgorithm,
        services: updatedServices,
        checked: allServicesChecked
          ? true
          : someServicesChecked
          ? undefined
          : false
      }
      setSelectedAlgorithm(updatedAlgorithm)
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

  // Only show services if there are actual services from the algorithm
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
            {/* Empty cells to align with header */}
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
