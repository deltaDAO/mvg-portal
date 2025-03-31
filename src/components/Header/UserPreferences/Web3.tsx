import { ReactElement } from 'react'
import Input from '@shared/FormInput'
import { useWagmiClient } from '@context/WagmiClient'

export default function Web3(): ReactElement {
  const { isWagmiAllowed, setIsWagmiAllowed } = useWagmiClient()

  return (
    <Input
      label="Web3"
      help="Load content from external sources in the assets' description."
      name="web3"
      type="checkbox"
      options={['Allow web3']}
      checked={isWagmiAllowed === true}
      onChange={() => setIsWagmiAllowed(!isWagmiAllowed)}
    />
  )
}
