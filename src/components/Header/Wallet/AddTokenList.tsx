import React, { ReactElement } from 'react'
import AddToken from '@components/@shared/AddToken'
import { useWeb3 } from '@context/Web3'
import EUROeLogo from '@images/EUROe_Symbol_Black.svg'
import OceanLogo from '@images/logo.svg'

const tokenLogos = {
  EUROe: {
    image: <EUROeLogo />,
    url: 'https://dev.euroe.com/img/EUROe_Symbol_Black.svg'
  },
  OCEAN: {
    image: <OceanLogo />,
    url: 'https://raw.githubusercontent.com/oceanprotocol/art/main/logo/token.png'
  }
}

export default function AddTokenList(): ReactElement {
  const { approvedBaseTokens } = useWeb3()

  return (
    <div>
      {approvedBaseTokens?.map((token) => (
        <AddToken
          key={token.address}
          address={token.address}
          symbol={token.symbol}
          decimals={token.decimals}
          logo={tokenLogos?.[token.symbol]}
        />
      ))}
    </div>
  )
}
