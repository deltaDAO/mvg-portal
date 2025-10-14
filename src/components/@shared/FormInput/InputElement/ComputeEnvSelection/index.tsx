import { Datatoken } from '@oceanprotocol/lib'
import { useEffect, useState } from 'react'
import { ResourceType } from 'src/@types/ResourceType'
import { useNetwork, useSigner } from 'wagmi'

export default function ComputeEnvSelection({
  computeEnvs,
  setAllResourceValues
}: {
  computeEnvs: ComputeEnvironmentExtended[]
  setAllResourceValues?: React.Dispatch<
    React.SetStateAction<{ [envId: string]: ResourceType }>
  >
}): JSX.Element {
  const [selectedEnvId, setSelectedEnvId] = useState<string>()
  const { chain } = useNetwork()
  const { data: signer } = useSigner()

  const [mode, setMode] = useState<'free' | 'paid'>('free')
  const [resourceValues, setResourceValues] = useState<{
    [envId: string]: ResourceType
  }>({})
  const [symbolMap, setSymbolMap] = useState<{ [address: string]: string }>({})

  const formatMinutes = (seconds: number) => Math.floor(seconds / 60)

  const fetchSymbol = async (address: string) => {
    if (symbolMap[address]) return symbolMap[address]
    if (!signer || !chain?.id) return '...'
    const datatoken = new Datatoken(signer, chain.id)
    const sym = await datatoken.getSymbol(address)
    setSymbolMap((prev) => ({ ...prev, [address]: sym }))
    return sym
  }

  useEffect(() => {
    if (computeEnvs?.length === 1) {
      setSelectedEnvId(computeEnvs[0].id)
    }
  }, [computeEnvs])

  useEffect(() => {
    const reset: { [envId: string]: any } = {}
    for (const env of computeEnvs ?? []) {
      const getDefault = (id: string) => {
        if (mode === 'free') return 0
        const r = env.resources?.find((r) => r.id === id)
        return r?.min ?? 0
      }
      reset[env.id] = {
        cpu: getDefault('cpu'),
        ram: getDefault('ram'),
        disk: getDefault('disk'),
        jobDuration: 0,
        price: 0,
        mode
      }
    }
    setResourceValues(reset)
    if (setAllResourceValues) setAllResourceValues(reset)
  }, [mode, computeEnvs])

  return (
    <div>
      {computeEnvs?.map((env) => {
        const chainId = '11155111'
        const fee = env.fees?.[chainId]?.[0]
        const freeAvailable = !!env.free
        const isSelected = selectedEnvId === env.id
        const tokenAddress = fee?.feeToken
        const tokenSymbol = symbolMap[tokenAddress] || '...'
        if (tokenAddress) fetchSymbol(tokenAddress)

        const currentRes = resourceValues[env.id] ?? {
          cpu: 0,
          ram: 0,
          disk: 0,
          jobDuration: 0,
          price: 0,
          mode
        }

        const resourceLimits =
          mode === 'free' ? env.free?.resources : env.resources
        const getLimits = (id: string) =>
          resourceLimits?.find((r) => r.id === id) ?? { max: 0, min: 0 }

        const maxDurationSec =
          mode === 'free' ? env.free?.maxJobDuration : env.maxJobDuration

        const updateRes = (
          type: 'cpu' | 'ram' | 'disk' | 'jobDuration',
          value: number
        ) => {
          setResourceValues((prev) => {
            const prevRes = prev[env.id] ?? {
              cpu: 0,
              ram: 0,
              disk: 0,
              jobDuration: 0,
              price: 0,
              mode
            }
            const newRes = { ...prevRes, [type]: value, mode }

            let newPrice = 0
            if (mode === 'paid' && fee?.prices) {
              for (const p of fee.prices) {
                const units =
                  p.id === 'cpu'
                    ? newRes.cpu
                    : p.id === 'ram'
                    ? newRes.ram
                    : p.id === 'disk'
                    ? newRes.disk
                    : 0
                newPrice += units * p.price
              }
              newPrice *= formatMinutes(newRes.jobDuration)
            }

            const updated = {
              ...prev,
              [env.id]: { ...newRes, price: mode === 'free' ? 0 : newPrice }
            }

            if (setAllResourceValues) setAllResourceValues(updated)
            return updated
          })
        }

        return (
          <div
            key={env.id}
            style={{ border: '1px solid #ccc', margin: '1em', padding: '1em' }}
          >
            <label title={env.id}>
              <input
                type="radio"
                checked={isSelected}
                onChange={() => setSelectedEnvId(env.id)}
              />
              <span
                style={{
                  display: 'inline-block',
                  maxWidth: '300px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {env.id}
              </span>
            </label>

            {freeAvailable && (
              <div style={{ marginTop: '0.5em' }}>
                <label>
                  <input
                    type="radio"
                    checked={mode === 'free'}
                    onChange={() => setMode('free')}
                  />{' '}
                  Free
                </label>
                <label style={{ marginLeft: '1em' }}>
                  <input
                    type="radio"
                    checked={mode === 'paid'}
                    onChange={() => setMode('paid')}
                  />{' '}
                  Paid
                </label>
              </div>
            )}

            <div>
              <label>CPU: </label>
              <input
                type="range"
                min={getLimits('cpu').min}
                max={getLimits('cpu').max}
                step={0.1}
                value={currentRes.cpu}
                onChange={(e) => updateRes('cpu', Number(e.target.value))}
              />
              <span>{currentRes.cpu} cores</span>
            </div>

            <div>
              <label>RAM: </label>
              <input
                type="range"
                min={getLimits('ram').min}
                max={getLimits('ram').max}
                step={0.1}
                value={currentRes.ram}
                onChange={(e) => updateRes('ram', Number(e.target.value))}
              />
              <span>{currentRes.ram} GB</span>
            </div>

            <div>
              <label>DISK: </label>
              <input
                type="range"
                min={getLimits('disk').min}
                max={getLimits('disk').max}
                step={0.1}
                value={currentRes.disk}
                onChange={(e) => updateRes('disk', Number(e.target.value))}
              />
              <span>{currentRes.disk} GB</span>
            </div>

            <div>
              <label>Job Duration: </label>
              <input
                type="range"
                min={60}
                max={maxDurationSec}
                step={60}
                value={currentRes.jobDuration}
                onChange={(e) =>
                  updateRes('jobDuration', Number(e.target.value))
                }
              />
              <span>{formatMinutes(currentRes.jobDuration)} minutes</span>
            </div>

            {mode === 'paid' && fee && (
              <>
                {fee.prices?.map((p) => (
                  <div key={p.id}>
                    <strong>Price:</strong> {p.price} {tokenSymbol} / {p.id}
                  </div>
                ))}
                <div>
                  <strong>Total Cost:</strong> {currentRes.price.toFixed(2)}{' '}
                  {tokenSymbol}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
