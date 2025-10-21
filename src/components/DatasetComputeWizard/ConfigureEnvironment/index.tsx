import { ReactElement, useState, useEffect, useCallback } from 'react'
import { useFormikContext } from 'formik'
import { Datatoken } from '@oceanprotocol/lib'
import { ResourceType } from 'src/@types/ResourceType'
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

interface ResourceRowProps {
  resourceId: string
  label: string
  unit: string
  isFree: boolean
  freeValues: ResourceValues
  paidValues: ResourceValues
  getLimits: (
    id: string,
    isFree: boolean
  ) => { minValue: number; maxValue: number; step?: number }
  updateResource: (
    type: 'cpu' | 'ram' | 'disk' | 'jobDuration',
    value: number | string,
    isFree: boolean
  ) => void
  fee?: { prices?: { id: string; price: number }[] }
}

function ResourceRow({
  resourceId,
  label,
  unit,
  isFree,
  freeValues,
  paidValues,
  getLimits,
  updateResource,
  fee
}: ResourceRowProps): ReactElement {
  const { minValue, maxValue, step = 1 } = getLimits(resourceId, isFree)
  const currentValue = isFree
    ? freeValues[resourceId as keyof ResourceValues]
    : paidValues[resourceId as keyof ResourceValues]
  const [inputValue, setInputValue] = useState<string | number>(currentValue)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setInputValue(currentValue)
    setError(null)
  }, [currentValue])

  const handleBlur = () => {
    if (inputValue === '') {
      setError(
        `Value cannot be empty. Please enter a number between ${minValue} and ${maxValue}.`
      )
      setInputValue(currentValue)
      return
    }

    const numValue = Number(inputValue)
    if (isNaN(numValue)) {
      setError(
        `Please enter a valid number between ${minValue} and ${maxValue}.`
      )
      setInputValue(currentValue)
      return
    }

    if (numValue < minValue || numValue > maxValue) {
      setError(`Please enter a value between ${minValue} and ${maxValue}.`)
      setInputValue(currentValue)
      return
    }

    updateResource(
      resourceId as 'cpu' | 'ram' | 'disk' | 'jobDuration',
      numValue,
      isFree
    )
    setError(null)
  }

  const handleCloseError = () => {
    setError(null)
    setInputValue(currentValue)
  }

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
            step={step}
            value={currentValue}
            onChange={(e) =>
              updateResource(
                resourceId as 'cpu' | 'ram' | 'disk' | 'jobDuration',
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
          type="number"
          min={minValue}
          max={maxValue}
          step={step}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setError(null)
          }}
          onBlur={handleBlur}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleBlur()
            }
          }}
          className={`${styles.input} ${styles.inputSmall} ${
            error ? styles.inputError : ''
          }`}
          placeholder="value..."
        />
        <span className={styles.unit}>{unit}</span>
      </div>
      {error && (
        <div className={styles.errorOverlay}>
          <div className={styles.errorPopup}>
            <span className={styles.errorMessage}>{error}</span>
            <button className={styles.closeButton} onClick={handleCloseError}>
              &times;
            </button>
          </div>
        </div>
      )}
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

export default function ConfigureEnvironment({
  allResourceValues,
  setAllResourceValues
}: {
  allResourceValues?: {
    [envId: string]: ResourceType
  }
  setAllResourceValues?: (values: Record<string, any>) => void
}): ReactElement {
  const { values, setFieldValue } = useFormikContext<FormComputeData>()
  const { chain } = useNetwork()
  const { data: signer } = useSigner()

  const [mode, setMode] = useState<'free' | 'paid'>(() => {
    if (values.computeEnv && allResourceValues) {
      const env = values.computeEnv
      const envId = typeof env === 'string' ? env : env.id
      const paidValues = allResourceValues[`${envId}_paid`]
      const freeValues = allResourceValues[`${envId}_free`]

      if (paidValues?.mode === 'paid') return 'paid'
      if (freeValues?.mode === 'free') return 'free'
    }
    return values.mode || (values.computeEnv?.free ? 'free' : 'paid')
  })

  useEffect(() => {
    setFieldValue('mode', mode)
  }, [mode, setFieldValue])

  const [symbolMap, setSymbolMap] = useState<{ [address: string]: string }>({})

  const getEnvResourceValues = useCallback(
    (isFree: boolean = true) => {
      const env = values.computeEnv
      if (!env) return { cpu: 0, ram: 0, disk: 0, jobDuration: 0 }

      const envId = typeof env === 'string' ? env : env.id
      const modeKey = isFree ? 'free' : 'paid'
      const envResourceValues = allResourceValues?.[`${envId}_${modeKey}`]

      return {
        cpu: isFree
          ? envResourceValues?.cpu || 0
          : envResourceValues?.cpu && envResourceValues.cpu > 0
          ? envResourceValues.cpu
          : env.resources?.find((r) => r.id === 'cpu')?.min || 1,
        ram: isFree
          ? envResourceValues?.ram || 0
          : envResourceValues?.ram && envResourceValues.ram > 0
          ? envResourceValues.ram
          : env.resources?.find((r) => r.id === 'ram')?.min || 1,
        disk: isFree
          ? envResourceValues?.disk || 0
          : envResourceValues?.disk && envResourceValues.disk > 0
          ? envResourceValues.disk
          : env.resources?.find((r) => r.id === 'disk')?.min || 0,
        jobDuration: isFree
          ? envResourceValues?.jobDuration || 0
          : envResourceValues?.jobDuration && envResourceValues.jobDuration > 0
          ? envResourceValues.jobDuration
          : 1
      }
    },
    [values.computeEnv, allResourceValues]
  )

  const [freeValues, setFreeValues] = useState<ResourceValues>(() =>
    getEnvResourceValues(true)
  )
  const [paidValues, setPaidValues] = useState<ResourceValues>(() =>
    getEnvResourceValues(false)
  )

  const getLimits = (id: string, isFree: boolean) => {
    const env = values.computeEnv
    if (!env) return { minValue: 0, maxValue: 0 }

    if (id === 'jobDuration') {
      const maxDuration = isFree ? env.free?.maxJobDuration : env.maxJobDuration
      return {
        minValue: 1,
        maxValue: Math.floor((maxDuration || 3600) / 60),
        step: 1
      }
    }

    const resourceLimits = isFree ? env.free?.resources : env.resources
    const resource = resourceLimits?.find((r) => r.id === id)
    if (!resource) return { minValue: 0, maxValue: 0 }

    const available = Math.max(0, (resource.max || 0) - (resource.inUse || 0))

    return {
      minValue: resource.min ?? 0,
      maxValue: available,
      step: id === 'ram' || id === 'disk' ? 0.1 : 1
    }
  }

  const calculatePrice = useCallback(() => {
    if (mode === 'free') return 0
    if (!values.computeEnv) return 0

    const env = values.computeEnv
    const chainId = chain?.id?.toString() || '11155111'
    const fee = env.fees?.[chainId]?.[0]

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
    const rawPrice = totalPrice * paidValues.jobDuration
    return Math.round(rawPrice * 100) / 100
  }, [mode, values.computeEnv, chain?.id, paidValues])

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val))

  useEffect(() => {
    const env = values.computeEnv
    if (!env) return

    const envId = typeof env === 'string' ? env : env.id
    const freeExistingValues = allResourceValues?.[`${envId}_free`]
    const paidExistingValues = allResourceValues?.[`${envId}_paid`]

    const freeEnvValues = getEnvResourceValues(true)
    const paidEnvValues = getEnvResourceValues(false)

    const freeRaw = {
      cpu:
        freeExistingValues?.cpu && freeExistingValues.cpu > 0
          ? freeExistingValues.cpu
          : freeEnvValues.cpu,
      ram:
        freeExistingValues?.ram && freeExistingValues.ram > 0
          ? freeExistingValues.ram
          : freeEnvValues.ram,
      disk:
        freeExistingValues?.disk && freeExistingValues.disk > 0
          ? freeExistingValues.disk
          : freeEnvValues.disk,
      jobDuration:
        freeExistingValues?.jobDuration && freeExistingValues.jobDuration > 0
          ? freeExistingValues.jobDuration
          : freeEnvValues.jobDuration
    }

    const paidRaw = {
      cpu:
        paidExistingValues?.cpu && paidExistingValues.cpu > 0
          ? paidExistingValues.cpu
          : paidEnvValues.cpu,
      ram:
        paidExistingValues?.ram && paidExistingValues.ram > 0
          ? paidExistingValues.ram
          : paidEnvValues.ram,
      disk:
        paidExistingValues?.disk && paidExistingValues.disk > 0
          ? paidExistingValues.disk
          : paidEnvValues.disk,
      jobDuration:
        paidExistingValues?.jobDuration && paidExistingValues.jobDuration > 0
          ? paidExistingValues.jobDuration
          : paidEnvValues.jobDuration
    }

    const freeLimits = {
      cpu: getLimits('cpu', true),
      ram: getLimits('ram', true),
      disk: getLimits('disk', true),
      jobDuration: getLimits('jobDuration', true)
    }

    const paidLimits = {
      cpu: getLimits('cpu', false),
      ram: getLimits('ram', false),
      disk: getLimits('disk', false),
      jobDuration: getLimits('jobDuration', false)
    }

    setFreeValues({
      cpu: clamp(freeRaw.cpu, freeLimits.cpu.minValue, freeLimits.cpu.maxValue),
      ram: clamp(freeRaw.ram, freeLimits.ram.minValue, freeLimits.ram.maxValue),
      disk: clamp(
        freeRaw.disk,
        freeLimits.disk.minValue,
        freeLimits.disk.maxValue
      ),
      jobDuration: clamp(
        freeRaw.jobDuration,
        freeLimits.jobDuration.minValue,
        freeLimits.jobDuration.maxValue
      )
    })

    setPaidValues({
      cpu: clamp(paidRaw.cpu, paidLimits.cpu.minValue, paidLimits.cpu.maxValue),
      ram: clamp(paidRaw.ram, paidLimits.ram.minValue, paidLimits.ram.maxValue),
      disk: clamp(
        paidRaw.disk,
        paidLimits.disk.minValue,
        paidLimits.disk.maxValue
      ),
      jobDuration: clamp(
        paidRaw.jobDuration,
        paidLimits.jobDuration.minValue,
        paidLimits.jobDuration.maxValue
      )
    })
  }, [values.computeEnv, allResourceValues, getEnvResourceValues])

  const fetchSymbol = async (address: string) => {
    if (symbolMap[address]) return symbolMap[address]
    if (!signer || !chain?.id) return '...'
    const datatoken = new Datatoken(signer, chain.id)
    const sym = await datatoken.getSymbol(address)
    setSymbolMap((prev) => ({ ...prev, [address]: sym }))
    return sym
  }

  useEffect(() => {
    const env = values.computeEnv
    if (env) {
      const chainId = chain?.id?.toString() || '11155111'
      const fee = env.fees?.[chainId]?.[0]
      const tokenAddress = fee?.feeToken
      if (tokenAddress) {
        fetchSymbol(tokenAddress)
      }
    }
  }, [values.computeEnv, chain?.id])

  useEffect(() => {
    const currentValues = mode === 'free' ? freeValues : paidValues
    if (!currentValues) return

    setFieldValue('cpu', currentValues.cpu)
    setFieldValue('ram', currentValues.ram)
    setFieldValue('disk', currentValues.disk)
    setFieldValue('jobDuration', currentValues.jobDuration)
  }, [
    mode,
    freeValues.cpu,
    freeValues.ram,
    freeValues.disk,
    freeValues.jobDuration,
    paidValues.cpu,
    paidValues.ram,
    paidValues.disk,
    paidValues.jobDuration,
    setFieldValue
  ])

  useEffect(() => {
    if (!setAllResourceValues || !values.computeEnv) return

    const env = values.computeEnv
    const envId = typeof env === 'string' ? env : env.id
    const modeKey = mode === 'free' ? 'free' : 'paid'
    const currentValues = mode === 'free' ? freeValues : paidValues

    let currentPrice = 0
    if (mode === 'paid') {
      const chainId = chain?.id?.toString() || '11155111'
      const fee = env.fees?.[chainId]?.[0]

      if (fee?.prices) {
        let totalPrice = 0
        for (const p of fee.prices) {
          const units =
            p.id === 'cpu'
              ? currentValues.cpu
              : p.id === 'ram'
              ? currentValues.ram
              : p.id === 'disk'
              ? currentValues.disk
              : 0
          totalPrice += units * p.price
        }
        currentPrice = totalPrice * currentValues.jobDuration
      }
    }

    setAllResourceValues((prev) => ({
      ...prev,
      [`${envId}_${modeKey}`]: {
        ...prev[`${envId}_${modeKey}`],
        cpu: currentValues.cpu,
        ram: currentValues.ram,
        disk: currentValues.disk,
        jobDuration: currentValues.jobDuration,
        mode,
        price: currentPrice.toString()
      }
    }))
  }, [
    mode,
    values.computeEnv,
    chain?.id,
    freeValues.cpu,
    freeValues.ram,
    freeValues.disk,
    freeValues.jobDuration,
    paidValues.cpu,
    paidValues.ram,
    paidValues.disk,
    paidValues.jobDuration,
    setAllResourceValues
  ])

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

  const updateResource = (
    type: 'cpu' | 'ram' | 'disk' | 'jobDuration',
    value: number | string,
    isFree: boolean
  ) => {
    const { minValue, maxValue, step } = getLimits(type, isFree)

    if (value === '' || isNaN(Number(value))) return

    const validatedValue = clamp(Number(value), minValue, maxValue)

    const adjustedValue =
      step && (type === 'ram' || type === 'disk')
        ? Number(validatedValue.toFixed(1))
        : Math.floor(validatedValue)

    if (isFree) {
      setFreeValues((prev) => ({ ...prev, [type]: adjustedValue }))
    } else {
      setPaidValues((prev) => ({ ...prev, [type]: adjustedValue }))
    }
  }

  return (
    <div className={styles.container}>
      <StepTitle title="C2D Environment Configuration" />

      {freeAvailable && (
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
            <ResourceRow
              resourceId="cpu"
              label="CPU"
              unit="Units"
              isFree={true}
              freeValues={freeValues}
              paidValues={paidValues}
              getLimits={getLimits}
              updateResource={updateResource}
              fee={fee}
            />
            <ResourceRow
              resourceId="ram"
              label="RAM"
              unit="GB"
              isFree={true}
              freeValues={freeValues}
              paidValues={paidValues}
              getLimits={getLimits}
              updateResource={updateResource}
              fee={fee}
            />
            <ResourceRow
              resourceId="disk"
              label="DISK"
              unit="GB"
              isFree={true}
              freeValues={freeValues}
              paidValues={paidValues}
              getLimits={getLimits}
              updateResource={updateResource}
              fee={fee}
            />
            <ResourceRow
              resourceId="jobDuration"
              label="JOB DURATION"
              unit="Minutes"
              isFree={true}
              freeValues={freeValues}
              paidValues={paidValues}
              getLimits={getLimits}
              updateResource={updateResource}
              fee={fee}
            />
          </div>
        </div>
      )}

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
          <ResourceRow
            resourceId="cpu"
            label="CPU"
            unit="Units"
            isFree={false}
            freeValues={freeValues}
            paidValues={paidValues}
            getLimits={getLimits}
            updateResource={updateResource}
            fee={fee}
          />
          <ResourceRow
            resourceId="ram"
            label="RAM"
            unit="GB"
            isFree={false}
            freeValues={freeValues}
            paidValues={paidValues}
            getLimits={getLimits}
            updateResource={updateResource}
            fee={fee}
          />
          <ResourceRow
            resourceId="disk"
            label="DISK"
            unit="GB"
            isFree={false}
            freeValues={freeValues}
            paidValues={paidValues}
            getLimits={getLimits}
            updateResource={updateResource}
            fee={fee}
          />
          <ResourceRow
            resourceId="jobDuration"
            label="JOB DURATION"
            unit="Minutes"
            isFree={false}
            freeValues={freeValues}
            paidValues={paidValues}
            getLimits={getLimits}
            updateResource={updateResource}
            fee={fee}
          />
        </div>
      </div>

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
          {/* {mode === 'paid' && (
            <span className={styles.unit}>{tokenSymbol}</span>
          )} */}
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
