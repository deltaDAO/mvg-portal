import { useEffect, useState } from 'react'
import { EnterpriseFeeCollectorContract } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'
import { useChainId } from 'wagmi'
import { formatUnits } from 'ethers'
import { getTokenInfo } from '@utils/wallet'
import { Fees } from 'src/@types/feeCollector/FeeCollector.type'
import { OpcFee } from '@context/MarketMetadata/_types'
import { useEthersSigner } from './useEthersSigner'

function useEnterpriseFeeColletor() {
  const chainId = useChainId()
  const signer = useEthersSigner()
  const [enterpriseFeeCollector, setEnterpriseFeeCollector] = useState<
    EnterpriseFeeCollectorContract | undefined
  >(undefined)
  const [fees, setFees] = useState<Fees | undefined>(undefined)

  const fetchFees = async (
    enterpriseFeeColletor: EnterpriseFeeCollectorContract
  ): Promise<Fees> => {
    try {
      const config = getOceanConfig(chainId)
      const isTokenApproved =
        await enterpriseFeeColletor.contract.isTokenAllowed(
          config.oceanTokenAddress
        )
      if (isTokenApproved) {
        const fees = await enterpriseFeeColletor.contract.getToken(
          config.oceanTokenAddress
        )
        const { oceanTokenAddress } = getOceanConfig(chainId)
        const tokenDetails = await getTokenInfo(
          oceanTokenAddress,
          signer!.provider
        )
        return {
          approved: fees[0], // boolean
          feePercentage: formatUnits(fees[1], '18'),
          maxFee: formatUnits(fees[2], tokenDetails.decimals),
          minFee: formatUnits(fees[3], tokenDetails.decimals),
          tokenAddress: config.oceanTokenAddress
        }
      } else {
        return {
          approved: false,
          feePercentage: '0',
          maxFee: '0',
          minFee: '0',
          tokenAddress: config.oceanTokenAddress
        }
      }
    } catch (error: any) {
      console.error('Error fetching fees:', error)
      if (error.code === 'NETWORK_ERROR') {
        console.warn('Network change detected, reloading page...')
        window.location.reload()
      }
      return {
        approved: false,
        feePercentage: '0',
        maxFee: '0',
        minFee: '0',
        tokenAddress: ''
      }
    }
  }

  useEffect(() => {
    if (!signer || !chainId) return
    const config = getOceanConfig(chainId)
    if (!config || !config.EnterpriseFeeCollector) return

    try {
      setEnterpriseFeeCollector(
        new EnterpriseFeeCollectorContract(
          config.EnterpriseFeeCollector,
          signer,
          config.chainId
        )
      )
    } catch (error: any) {
      console.error('Error initializing EnterpriseFeeCollectorContract:', error)
      if (error.code === 'NETWORK_ERROR') {
        window.location.reload()
      }
    }
  }, [signer, chainId])

  useEffect(() => {
    if (!enterpriseFeeCollector) return
    const fetchData = async () => {
      const result = await fetchFees(enterpriseFeeCollector)
      setFees(result)
    }
    fetchData()
  }, [enterpriseFeeCollector])

  const getOpcData = async (chainIds: number[]) => {
    if (!enterpriseFeeCollector) return []

    const validChainIds = chainIds.filter((chainId) => {
      const config = getOceanConfig(chainId)
      return !!config?.routerFactoryAddress
    })

    const opcData: OpcFee[] = await Promise.all(
      validChainIds.map(async (chainId) => {
        const currentFees = await fetchFees(enterpriseFeeCollector)
        console.log('current fee', currentFees)
        return {
          chainId,
          approvedTokens: [currentFees.tokenAddress],
          feePercentage: currentFees.feePercentage,
          maxFee: currentFees.maxFee,
          minFee: currentFees.minFee
        }
      })
    )
    return opcData
  }

  return { fees, signer, getOpcData }
}

export default useEnterpriseFeeColletor
