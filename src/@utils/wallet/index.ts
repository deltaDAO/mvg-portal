import { LoggerInstance } from '@oceanprotocol/lib'
import { createConfig, http, usePublicClient } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import { Chain } from 'wagmi/chains'
import { ethers, Contract, Signer } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { getDefaultConfig } from 'connectkit'
import { getNetworkDisplayName } from '@hooks/useNetworkMetadata'
import { getOceanConfig } from '../ocean'
import { getSupportedChains } from './chains'
import { chainIdsSupported } from '../../../app.config'

export async function getDummySigner(chainId: number): Promise<Signer> {
  if (typeof chainId !== 'number') {
    throw new Error('Chain ID must be a number')
  }

  // Get config from ocean lib
  const config = getOceanConfig(chainId)
  try {
    const privateKey =
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    const provider = new ethers.providers.JsonRpcProvider(config.nodeUri)
    return new ethers.Wallet(privateKey, provider)
  } catch (error) {
    throw new Error(`Failed to create dummy signer: ${error.message}`)
  }
}

// Wagmi client
export const wagmiClient = createConfig(
  getDefaultConfig({
    appName: 'Pontus-X',
    // TODO: mapping between appConfig.chainIdsSupported and wagmi chainId
    chains: getSupportedChains(chainIdsSupported) as unknown as readonly [
      Chain,
      ...Chain[]
    ],
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    /* transports: {
      // Configure providers based on your ConnectKit version
      // For example:
      [chainId]: http(
        `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`
      )
    } */
  })
)

// ConnectKit CSS overrides
// https://docs.family.co/connectkit/theming#theme-variables
export const connectKitTheme = {
  '--ck-font-family': 'var(--font-family-base)',
  '--ck-border-radius': 'var(--border-radius)',
  '--ck-overlay-background': 'var(--background-body-transparent)',
  '--ck-modal-box-shadow': '0 0 20px 20px var(--box-shadow-color)',
  '--ck-body-background': 'var(--background-body)',
  '--ck-body-color': 'var(--font-color-text)',
  '--ck-primary-button-border-radius': 'var(--border-radius)',
  '--ck-primary-button-color': 'var(--font-color-heading)',
  '--ck-primary-button-background': 'var(--background-content)',
  '--ck-secondary-button-border-radius': 'var(--border-radius)'
}

export function accountTruncate(
  account: string,
  begin: number = 6,
  end: number = 38
): string {
  if (!account || account === '') return
  const middle = account.substring(begin, end)
  const truncated = account.replace(middle, '…')
  return truncated // for example 0xb9A3...941d
}

export async function addTokenToWallet(
  address: string,
  symbol: string,
  decimals?: number,
  logo?: string
): Promise<void> {
  const image =
    logo ||
    'https://raw.githubusercontent.com/oceanprotocol/art/main/logo/token.png'

  const tokenMetadata = {
    type: 'ERC20',
    options: { address, symbol, image, decimals: decimals || 18 }
  }

  ;(window?.ethereum.request as any)(
    {
      method: 'wallet_watchAsset',
      params: tokenMetadata,
      id: Math.round(Math.random() * 100000)
    },
    (err: { code: number; message: string }, added: any) => {
      if (err || 'error' in added) {
        LoggerInstance.error(
          `Couldn't add ${tokenMetadata.options.symbol} (${
            tokenMetadata.options.address
          }) to MetaMask, error: ${err.message || added.error}`
        )
      } else {
        LoggerInstance.log(
          `Added ${tokenMetadata.options.symbol} (${tokenMetadata.options.address}) to MetaMask`
        )
      }
    }
  )
}

export async function addCustomNetwork(
  web3Provider: any,
  network: EthereumListsChain
): Promise<void> {
  // Always add explorer URL from ocean.js first, as it's null sometimes
  // in network data
  const blockExplorerUrls = [
    getOceanConfig(network.networkId).explorerUri,
    network.explorers && network.explorers[0].url
  ]

  const newNetworkData = {
    chainId: `0x${network.chainId.toString(16)}`,
    chainName: getNetworkDisplayName(network),
    nativeCurrency: network.nativeCurrency,
    rpcUrls: network.rpc,
    blockExplorerUrls
  }
  try {
    await web3Provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: newNetworkData.chainId }]
    })
  } catch (switchError) {
    if (switchError.code === 4902) {
      await web3Provider.request(
        {
          method: 'wallet_addEthereumChain',
          params: [newNetworkData]
        },
        (err: string, added: any) => {
          if (err || 'error' in added) {
            LoggerInstance.error(
              `Couldn't add ${network.name} (0x${
                network.chainId
              }) network to MetaMask, error: ${err || added.error}`
            )
          } else {
            LoggerInstance.log(
              `Added ${network.name} (0x${network.chainId}) network to MetaMask`
            )
          }
        }
      )
    } else {
      LoggerInstance.error(
        `Couldn't add ${network.name} (0x${network.chainId}) network to MetaMask, error: ${switchError}`
      )
    }
  }
  LoggerInstance.log(
    `Added ${network.name} (0x${network.chainId}) network to MetaMask`
  )
}

export function getAdjustDecimalsValue(
  value: number,
  decimals: number
): string {
  const adjustedDecimalsValue = `${value}${'0'.repeat(18 - decimals)}`
  return formatEther(adjustedDecimalsValue)
}

export async function getTokenBalance(
  accountId: `0x${string}`,
  decimals: number,
  tokenAddress: `0x${string}`,
  web3Provider: ReturnType<typeof usePublicClient>
): Promise<string> {
  if (!web3Provider || !accountId || !tokenAddress) return '0'

  try {
    const code = await web3Provider.getBytecode({ address: tokenAddress })
    if (!code || code === '0x') {
      LoggerInstance.warn(`No contract found at address: ${tokenAddress}`)
      return '0'
    }

    const rawBalance = await web3Provider.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [accountId]
    })

    if (rawBalance === null || rawBalance === undefined) {
      LoggerInstance.warn(
        `Contract at ${tokenAddress} returned no data for balanceOf`
      )
      return '0'
    }

    const balance = formatUnits(rawBalance, decimals)
    return balance
  } catch (e) {
    LoggerInstance.error(
      `ERROR: Failed to get the balance for token ${tokenAddress}: ${e.message}`
    )
    return '0'
  }
}

export function getApprovedTokenBalanceFromSymbol(
  balance: UserBalance,
  symbol: string
): string {
  if (!symbol) return
  const { approved } = balance
  const baseTokenBalance = approved?.[symbol.toLocaleLowerCase()]
  return baseTokenBalance || '0'
}
