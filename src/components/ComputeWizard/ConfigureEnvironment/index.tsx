import { ReactElement, useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { Datatoken } from '@oceanprotocol/lib'
import { useNetwork, useSigner } from 'wagmi'
import StepTitle from '@shared/StepTitle'
import { FormComputeData } from '../_types'
import styles from './index.module.css'

interface ResourceValues {
  cpu: number
  ram: number
  disk: number
  jobDuration: number
}

export default function ConfigureEnvironment(): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormComputeData>()
  const { chain } = useNetwork()
  const { data: signer } = useSigner()

  const [mode, setMode] = useState<'free' | 'paid'>('free')
  const [symbolMap, setSymbolMap] = useState<{ [address: string]: string }>({})

  // Separate state for free and paid values
  const [freeValues, setFreeValues] = useState<ResourceValues>({
    cpu: values.cpu || 1,
    ram: values.ram || 8,
    disk: values.disk || 100,
    jobDuration: values.jobDuration || 3600
  })

  const [paidValues, setPaidValues] = useState<ResourceValues>({
    cpu: values.cpu || 1,
    ram: values.ram || 8,
    disk: values.disk || 100,
    jobDuration: values.jobDuration || 3600
  })

  const formatMB = (bytes: number) => Math.floor(bytes / 1_000_000)
  const formatMinutes = (seconds: number) => Math.floor(seconds / 60)

  const fetchSymbol = async (address: string) => {
    if (symbolMap[address]) return symbolMap[address]
    if (!signer || !chain?.id) return '...'
    const datatoken = new Datatoken(signer, chain.id)
    const sym = await datatoken.getSymbol(address)
    setSymbolMap((prev) => ({ ...prev, [address]: sym }))
    return sym
  }

  // Update form values when mode changes
  useEffect(() => {
    const currentValues = mode === 'free' ? freeValues : paidValues
    setFieldValue('cpu', currentValues.cpu)
    setFieldValue('ram', currentValues.ram)
    setFieldValue('disk', currentValues.disk)
    setFieldValue('jobDuration', currentValues.jobDuration)
  }, [mode, freeValues, paidValues, setFieldValue])

  if (!values.computeEnv) {
    return (
      <div className={styles.container}>
        <StepTitle title="C2D Environment Configuration" />
        <p>Please select an environment first</p>
      </div>
    )
  }

  const env = values.computeEnv
  const chainId = chain?.id?.toString() || '11155111'
  const fee = env.fees?.[chainId]?.[0]
  const freeAvailable = !!env.free
  const tokenAddress = fee?.feeToken
  const tokenSymbol = symbolMap[tokenAddress] || '...'

  if (tokenAddress) fetchSymbol(tokenAddress)

  const getLimits = (id: string, isFree: boolean) => {
    const resourceLimits = isFree ? env.free?.resources : env.resources
    return resourceLimits?.find((r) => r.id === id) ?? { max: 0, min: 0 }
  }

  const updateResource = (
    type: 'cpu' | 'ram' | 'disk' | 'jobDuration',
    value: number,
    isFree: boolean
  ) => {
    if (isFree) {
      setFreeValues((prev) => ({ ...prev, [type]: value }))
    } else {
      setPaidValues((prev) => ({ ...prev, [type]: value }))
    }
  }

  const calculatePrice = () => {
    if (mode === 'free') return 0
    if (!fee?.prices) return 0

    let totalPrice = 0
    for (const p of fee.prices) {
      const units =
        p.id === 'cpu'
          ? paidValues.cpu
          : p.id === 'ram'
          ? paidValues.ram
          : p.id === 'disk'
          ? paidValues.disk
          : 0
      totalPrice += units * p.price
    }
    return totalPrice * formatMinutes(paidValues.jobDuration)
  }

  const renderResourceRow = (
    resourceId: string,
    label: string,
    unit: string,
    isFree: boolean
  ) => {
    const { minValue, maxValue } = getLimits(resourceId, isFree)
    const currentValue = isFree
      ? freeValues[resourceId]
      : paidValues[resourceId]

    return (
      <div
        key={`${resourceId}-${isFree ? 'free' : 'paid'}`}
        className={styles.resourceRow}
      >
        <div className={styles.resourceLabel}>{label}</div>
        <div className={styles.sliderSection}>
          <span className={styles.minLabel}>min</span>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min={minValue}
              max={maxValue}
              value={currentValue}
              onChange={(e) =>
                updateResource(
                  resourceId as any,
                  Number(e.target.value),
                  isFree
                )
              }
              className={styles.customSlider}
            />
            <div className={styles.sliderLine}></div>
          </div>
          <span className={styles.maxLabel}>max</span>
        </div>
        <div className={styles.inputSection}>
          <input
            type="text"
            value={currentValue}
            onChange={(e) =>
              updateResource(resourceId as any, Number(e.target.value), isFree)
            }
            className={`${styles.input} ${styles.inputSmall}`}
            placeholder="value..."
          />
          <span className={styles.unit}>{unit}</span>
        </div>
        {!isFree && (
          <div className={styles.resourcePriceSection}>
            <span className={styles.priceLabel}>price per time unit</span>
            <input
              type="text"
              className={`${styles.input} ${styles.inputSmall}`}
              placeholder="value..."
              readOnly
              value={fee?.prices?.find((p) => p.id === resourceId)?.price || 0}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <StepTitle title="C2D Environment Configuration" />

      {/* Free Compute Resources Section */}
      <div className={styles.resourceSection}>
        <div className={styles.sectionHeader}>
          <input
            type="radio"
            id="free-resources"
            checked={mode === 'free'}
            onChange={() => setMode('free')}
            className={styles.radioButton}
          />
          <label htmlFor="free-resources" className={styles.sectionTitle}>
            Free compute resources
          </label>
        </div>

        <div className={styles.resourceContent}>
          {renderResourceRow('cpu', 'CPU', 'Units', true)}
          {renderResourceRow('ram', 'RAM', 'MB', true)}
          {renderResourceRow('disk', 'DISK', 'MB', true)}
          {renderResourceRow('jobDuration', 'JOB DURATION', 'Minutes', true)}
        </div>
      </div>

      {/* Paid Compute Resources Section */}
      <div className={styles.resourceSection}>
        <div className={styles.sectionHeader}>
          <input
            type="radio"
            id="paid-resources"
            checked={mode === 'paid'}
            onChange={() => setMode('paid')}
            className={styles.radioButton}
          />
          <label htmlFor="paid-resources" className={styles.sectionTitle}>
            Paid compute resources
          </label>
        </div>

        <div className={styles.resourceContent}>
          {renderResourceRow('cpu', 'CPU', '', false)}
          {renderResourceRow('ram', 'RAM', '', false)}
          {renderResourceRow('disk', 'DISK', '', false)}
          {renderResourceRow('jobDuration', 'JOB DURATION', '', true)}
        </div>
      </div>

      {/* C2D Environment Price Section */}
      <div className={styles.priceSection}>
        <h3 className={styles.priceTitle}>C2D Environment Price</h3>
        <div className={styles.priceDisplay}>
          <input
            type="text"
            value={calculatePrice()}
            readOnly
            className={`${styles.input} ${styles.inputLarge}`}
            placeholder="0"
          />
          <div className={styles.priceInfo}>
            <span>
              Calculated based on the unit price for each resource and the Job
              duration selected
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
