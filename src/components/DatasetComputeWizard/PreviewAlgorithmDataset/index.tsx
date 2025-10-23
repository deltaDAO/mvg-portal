import styles from './index.module.css'
import { useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import StepTitle from '@shared/StepTitle'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'

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
  algorithms?: any
  algorithmServices?: AlgorithmService[]
}

const PreviewAlgorithmDataset = ({
  selectedAlgorithmAsset
}: {
  selectedAlgorithmAsset?: AssetExtended
}) => {
  const { values } = useFormikContext<FormValues>()
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(
    null
  )

  // Helper to extract plain string from LanguageValueObject
  const extractString = (
    value: string | { '@value': string } | undefined
  ): string => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && '@value' in value)
      return value['@value']
    return ''
  }
  console.log('selected algo asset ', selectedAlgorithmAsset)
  console.log('selected algo asset ', values)

  // Initialize from selectedAlgorithmAsset if provided, otherwise from form value
  useEffect(() => {
    if (selectedAlgorithm) return

    if (selectedAlgorithmAsset) {
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
            price: '0',
            symbol: 'OCEAN',
            checked: true
          })
        ) || []

      setSelectedAlgorithm(values.algorithms)
      return
    }

    if (!values.algorithm) return

    try {
      const parsed = JSON.parse(values.algorithm)
      const algorithmId = parsed?.algoDid || values.algorithm

      setSelectedAlgorithm({
        id: algorithmId,
        name: 'Selected Algorithm',
        description: 'Algorithm services for compute',
        expanded: true,
        checked: true,
        services: [
          {
            id: 'compute-service',
            name: 'Compute Service',
            title: 'Compute Service',
            serviceDescription: 'Service for running compute jobs',
            type: 'compute',
            duration: '3600',
            price: '0',
            symbol: 'OCEAN',
            checked: true
          }
        ]
      })
    } catch (e) {
      // ignore
    }
  }, [values.algorithm, selectedAlgorithm, selectedAlgorithmAsset])

  if (!selectedAlgorithm) {
    return (
      <div className={styles.container}>
        <StepTitle title="Preview Algorithm & Dataset" />
        <p>Please select an algorithm first</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <StepTitle title="Preview Algorithm & Dataset" />

      <div className={styles.previewContainer}>
        {/* Algorithm Section */}
        <div className={styles.algorithmContainer}>
          <div className={styles.algorithmHeader}>
            <h2 className={styles.algorithmName}>{values.algorithms.name}</h2>
            <p className={styles.algorithmAddress}>{selectedAlgorithm.id}</p>
            <p className={styles.algorithmDescription}>
              {values.algorithms.description.slice(0, 40)}
              {values.algorithms.description.length > 40 ? '...' : ''}{' '}
            </p>
          </div>

          <div className={styles.servicesList}>
            {selectedAlgorithm.services.map((service) => (
              <div key={service.id} className={styles.serviceItem}>
                <div className={styles.serviceHeader}>
                  <h3 className={styles.serviceName}>
                    {values.algorithms?.services[0].name}
                  </h3>
                </div>
                <p className={styles.serviceDescription}>
                  {values.algorithms?.services[0].serviceDescription.slice(
                    0,
                    40
                  )}
                  {values.algorithms?.services[0].serviceDescription.length > 40
                    ? '...'
                    : ''}
                </p>
                <div className={styles.serviceDetails}>
                  <p>
                    <strong>Type:</strong> {values.algorithms?.services[0].type}
                  </p>
                </div>
                <div className={styles.serviceDetails}>
                  <p>
                    <strong>Access duration:</strong>{' '}
                    {Number(values.algorithms?.services[0].duration) === 0
                      ? 'Forever'
                      : `${Math.floor(
                          Number(values.algorithms?.services[0].duration) /
                            (60 * 60 * 24)
                        )} days`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreviewAlgorithmDataset
