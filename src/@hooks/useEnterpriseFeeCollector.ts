import { useEffect, useState } from 'react'
import { EnterpriseFeeCollectorContract } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'
import { useChainId, useWalletClient, usePublicClient } from 'wagmi'
import { formatUnits, BrowserProvider, BigNumberish } from 'ethers'
import { getTokenInfo } from '@utils/wallet'
import { Fees } from 'src/@types/feeCollector/FeeCollector.type'
import { OpcFee } from '@context/MarketMetadata/_types'

function useEnterpriseFeeColletor() {
  const chainId = useChainId()
  const { data: walletClient } = useWalletClient()
  const viemPublicClient = usePublicClient({ chainId })
  const web3provider = viemPublicClient
    ? new BrowserProvider(
        // viem client exposes transport with a request method compatible with EIP-1193
        {
          request: viemPublicClient.request.bind(viemPublicClient)
        } as any
      )
    : undefined

  const [enterpriseFeeCollector, setEnterpriseFeeCollector] = useState<
    EnterpriseFeeCollectorContract | undefined
  >(undefined)
  const [fees, setFees] = useState<Fees | undefined>(undefined)

  const fetchFees = async (
    enterpriseFeeColletor: EnterpriseFeeCollectorContract
  ): Promise<Fees> => {
    if (!web3provider || !chainId) {
      console.error('Ethers Provider or Chain ID not available.')
      return {
        approved: false,
        feePercentage: '0',
        maxFee: '0',
        minFee: '0',
        tokenAddress: ''
      }
    }

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
          web3provider as any
        )

        return {
          approved: fees[0], // boolean
          feePercentage: formatUnits(fees[1] as BigNumberish, '18'),
          maxFee: formatUnits(fees[2] as BigNumberish, tokenDetails.decimals),
          minFee: formatUnits(fees[3] as BigNumberish, tokenDetails.decimals),
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
    if (!walletClient || !chainId) return
    const config = getOceanConfig(chainId)
    if (!config) return

    const provider = new BrowserProvider(walletClient.transport as any)
    // walletClient.account.address is available in wagmi v2
    const init = async () => {
      try {
        const signer = await provider.getSigner(walletClient.account.address)

        setEnterpriseFeeCollector(
          new EnterpriseFeeCollectorContract(
            config.EnterpriseFeeCollector,
            signer as any,
            config.chainId
          )
        )
      } catch (error: any) {
        console.error(
          'Error initializing EnterpriseFeeCollectorContract:',
          error
        )
        if (error.code === 'NETWORK_ERROR') {
          window.location.reload()
        }
      }
    }
    init()
  }, [walletClient, chainId])

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

  return { fees, signer: walletClient, getOpcData }
}

export default useEnterpriseFeeColletor
