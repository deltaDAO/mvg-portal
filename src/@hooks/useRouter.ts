import { useEffect, useState } from 'react'
import { Router as FactoryRouter } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'
import { useNetwork, useProvider, useSigner } from 'wagmi'
import { ethers } from 'ethers'
import { Fees, TokenDetails } from '../@types/factoryRouter/FactoryRouter.type'
import { OpcFee } from '@context/MarketMetadata/_types'
import { getTokenInfo } from '@utils/wallet'

function useFactoryRouter() {
  const { chain } = useNetwork()
  const { data: signer } = useSigner()
  const [factoryRouter, setFactoryRouter] = useState<FactoryRouter>()
  const [approvedTokens, setApprovedTokens] = useState<TokenDetails[]>([])
  const [fees, setFees] = useState<Fees>({
    swapOceanFee: '0',
    swapNonOceanFee: '0',
    consumeFee: '0',
    providerFee: '0'
  })

  const web3provider = useProvider()

  // Helper to fetch token details
  const fetchTokenDetails = async (tokenAddress: string) => {
    const tokenAbi = [
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function name() view returns (string)'
    ]
    const tokenContract = new ethers.Contract(
      tokenAddress,
      tokenAbi,
      signer?.provider
    )

    const [decimals, symbol, name] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.symbol(),
      tokenContract.name()
    ])

    return { address: tokenAddress, decimals, symbol, name }
  }

  // Fetch fees with try/catch
  const fetchFees = async (router: FactoryRouter) => {
    try {
      const [opcFees, consumeFee, providerFee] = await Promise.all([
        router.contract.getOPCFees(),
        router.contract.getOPCConsumeFee(),
        router.contract.getOPCProviderFee()
      ])
      const { oceanTokenAddress } = getOceanConfig(chain?.id)
      const tokenDetails = await getTokenInfo(oceanTokenAddress, web3provider)
      return {
        swapOceanFee: ethers.utils.formatUnits(
          opcFees[0],
          tokenDetails.decimals
        ),
        swapNonOceanFee: ethers.utils.formatUnits(
          opcFees[1],
          tokenDetails.decimals
        ),
        consumeFee: ethers.utils.formatUnits(consumeFee, tokenDetails.decimals),
        providerFee: ethers.utils.formatUnits(
          providerFee,
          tokenDetails.decimals
        )
      }
    } catch (error: any) {
      console.error('Error fetching fees:', error)
      if (error.code === 'NETWORK_ERROR') {
        console.warn('Network changed detected, reloading page...')
        window.location.reload() // Reload the page to reset state
      }
      return {
        swapOceanFee: '0',
        swapNonOceanFee: '0',
        consumeFee: '0',
        providerFee: '0'
      }
    }
  }

  // Initialize FactoryRouter when signer or chain changes
  useEffect(() => {
    if (!signer || !chain?.id) return
    const config = getOceanConfig(chain.id)
    if (!config) return

    try {
      setFactoryRouter(
        new FactoryRouter(config?.routerFactoryAddress, signer, config.chainId)
      )
    } catch (error: any) {
      console.error('Error initializing FactoryRouter:', error)
      if (error.code === 'NETWORK_ERROR') {
        window.location.reload()
      }
    }
  }, [signer, chain?.id])

  // Fetch fees whenever factoryRouter changes
  useEffect(() => {
    if (!factoryRouter) return
    const fetchData = async () => {
      const result = await fetchFees(factoryRouter)
      setFees(result)
    }
    fetchData()
  }, [factoryRouter])

  // Fetch approved tokens
  useEffect(() => {
    if (!factoryRouter) return
    const fetchApprovedTokens = async () => {
      try {
        const approvedTokensAddresses =
          await factoryRouter.contract.getApprovedTokens()
        const tokenDetails = await Promise.all(
          approvedTokensAddresses.map((tokenAddress) =>
            fetchTokenDetails(tokenAddress)
          )
        )
        setApprovedTokens(tokenDetails)
      } catch (error: any) {
        console.error('Error fetching approved tokens:', error)
        if (error.code === 'NETWORK_ERROR') window.location.reload()
      }
    }
    fetchApprovedTokens()
  }, [factoryRouter])

  const getOpcData = async (chainIds: number[]) => {
    if (!factoryRouter) return []

    const validChainIds = chainIds.filter((chainId) => {
      const config = getOceanConfig(chainId)
      return !!config?.routerFactoryAddress
    })

    const opcData: OpcFee[] = await Promise.all(
      validChainIds.map(async (chainId) => {
        const currentFees = await fetchFees(factoryRouter)
        const approvedTokensAddresses =
          await factoryRouter.contract.getApprovedTokens()
        const tokenDetails: TokenDetails[] = await Promise.all(
          approvedTokensAddresses.map((tokenAddress) =>
            fetchTokenDetails(tokenAddress)
          )
        )
        return {
          chainId,
          approvedTokens: tokenDetails.map((token) => token.address),
          swapApprovedFee: currentFees.swapOceanFee,
          swapNotApprovedFee: currentFees.swapNonOceanFee
        }
      })
    )
    return opcData
  }

  return { approvedTokens, fees, signer, getOpcData }
}

export default useFactoryRouter
