import { ReactElement, ReactNode } from 'react'
import ExplorerLink from '.'

// Used to determine explorer path for token links
const oasisNewtorks = [23294, 32456, 32457]
const blockscoutNetworks = [1287, 2021000, 2021001, 44787, 246, 1285]

const getPath = (tokenAddress: string, chainId: number): string => {
  const isOasisNetwork = oasisNewtorks.includes(chainId)
  const isBlockscoutExplorer = blockscoutNetworks.includes(chainId)

  return isOasisNetwork
    ? `address/${tokenAddress}`
    : isBlockscoutExplorer
    ? `tokens/${tokenAddress}`
    : `token/${tokenAddress}`
}

export default function ExplorerTokenLink({
  tokenAddress,
  networkId,
  children,
  className
}: {
  tokenAddress: string
  networkId: number
  children: ReactNode
  className?: string
}): ReactElement {
  return (
    <ExplorerLink
      networkId={networkId}
      path={getPath(tokenAddress, networkId)}
      className={className}
    >
      {children}
    </ExplorerLink>
  )
}
