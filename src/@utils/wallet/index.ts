'use client'

import { LoggerInstance } from '@oceanprotocol/lib'
import { createConfig } from 'wagmi'
import { erc20Abi } from 'viem'
import { localhost, type Chain } from 'wagmi/chains'
import {
  ethers,
  Contract,
  Signer,
  formatEther,
  JsonRpcProvider,
  Provider
} from 'ethers'
import { getDefaultConfig } from 'connectkit'
import { getNetworkDisplayName } from '@hooks/useNetworkMetadata'
import { getOceanConfig } from '../ocean'
import { getSupportedChains } from './chains'
import { chainIdsSupported } from '../../../app.config.cjs'

export async function getDummySigner(chainId: number): Promise<Signer> {
  if (typeof chainId !== 'number') {
    throw new Error('Chain ID must be a number')
  }

  const config = getOceanConfig(chainId)
  if (!config) {
    console.error(`[DEBUG] No Ocean config found for chainId ${chainId}`)
    throw new Error(`No Ocean config found for chainId ${chainId}`)
  }

  try {
    const privateKey =
      '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

    if (!config.nodeUri) {
      console.error('[DEBUG] Node URI missing in config')
      throw new Error('Missing nodeUri in Ocean config')
    }

    const provider = new JsonRpcProvider(config.nodeUri)
    const wallet = new ethers.Wallet(privateKey, provider)
    return wallet
  } catch (error: any) {
    console.error('[DEBUG] Failed to create dummy signer:', error)
    throw new Error(`Failed to create dummy signer: ${error.message}`)
  }
}

/* -----------------------------------------
   WAGMI CHAINS — FIXED AS A TUPLE
------------------------------------------ */
function getWagmiChains(): readonly [Chain, ...Chain[]] {
  const baseChains: Chain[] = [...getSupportedChains(chainIdsSupported)]

  if (process.env.NEXT_PUBLIC_MARKET_DEVELOPMENT === 'true') {
    baseChains.push({ ...localhost, id: 11155420 })
  }

  if (baseChains.length === 0) {
    throw new Error('No supported chains found for Wagmi config.')
  }

  return baseChains as unknown as readonly [Chain, ...Chain[]]
}

/* -----------------------------------------
   WAGMI CLIENT — SSR SAFE LAZY INITIALIZER
------------------------------------------ */
let client: any = null

export function getWagmiClient() {
  if (client) return client
  if (typeof window === 'undefined') return null
  const chains = getWagmiChains()
  client = getDefaultConfig({
    appName: 'Ocean Protocol Enterprise Market',
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains
  })
  return client
}

// ConnectKit CSS overrides
// https://docs.family.co/connectkit/theming#theme-variables
export const connectKitTheme = {
  '--ck-font-family': 'var(--font-family-base)',
  '--ck-border-radius': 'var(--border-radius)',
  '--ck-overlay-background': 'var(--background-body-transparent)',
  '--ck-modal-box-shadow': '0 0 20px 20px var(--box-shadow-color)',
  '--ck-body-background': 'var(--background-body)',
  '--ck-body-color': '#000000',
  '--ck-primary-button-border-radius': 'var(--border-radius)',
  '--ck-primary-button-color': 'var(--font-color-heading)',
  '--ck-primary-button-background': 'var(--background-content)',
  '--ck-secondary-button-border-radius': 'var(--border-radius)',
  '--ck-body-color-muted': '#333333',
  '--ck-body-color-danger': '#ff3333'
}

export function accountTruncate(account: string): string {
  if (!account || account === '') return
  const middle = account.substring(6, 38)
  const truncated = account.replace(middle, '…')
  return truncated
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
  } catch (switchError: any) {
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

export async function getTokenBalance(
  accountId: string,
  decimals: number,
  tokenAddress: string,
  web3Provider: Provider
): Promise<string> {
  if (!web3Provider || !accountId || !tokenAddress) return

  try {
    const token = new Contract(tokenAddress, erc20Abi, web3Provider)
    const balance = await token.balanceOf(accountId)
    const balanceString = balance.toString()
    const adjustedDecimalsBalance = `${balanceString}${'0'.repeat(
      18 - decimals
    )}`

    return formatEther(adjustedDecimalsBalance)
  } catch (e: any) {
    LoggerInstance.error(`ERROR: Failed to get the balance: ${e.message}`)
  }
}

export function getTokenBalanceFromSymbol(
  balance: UserBalance,
  symbol: string
): string {
  if (!symbol) return

  return (
    balance?.[symbol.toLocaleLowerCase()] ||
    balance?.approved?.[symbol.toLocaleLowerCase()] ||
    '0'
  )
}

export async function getTokenInfo(
  tokenAddress: string,
  web3Provider: Provider
): Promise<TokenInfo> {
  if (!web3Provider || !tokenAddress)
    return { address: tokenAddress, name: '', symbol: '', decimals: undefined }

  try {
    const tokenContract = new Contract(tokenAddress, erc20Abi, web3Provider)
    const name = await tokenContract.name()
    const symbol = await tokenContract.symbol()
    const decimals = Number(await tokenContract.decimals())
    return { address: tokenAddress, name, symbol, decimals }
  } catch (error: any) {
    LoggerInstance.error(
      `[getTokenInfo] Failed to fetch token info for ${tokenAddress}: ${error.message}`
    )
    return { address: tokenAddress, name: '', symbol: '', decimals: undefined }
  }
}
