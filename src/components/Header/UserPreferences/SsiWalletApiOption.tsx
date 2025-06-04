import { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import Input from '@shared/FormInput'

export default function SsiWalletApiOption(): ReactElement {
  const { showSsiWalletModule, setShowSsiWalletModule } = useUserPreferences()

  return (
    <Input
      label="Ssi Wallet API"
      help="Set a new SSI wallet API."
      name="ssiWalletApi"
      type="checkbox"
      options={['Update SSI Wallet API']}
      checked={showSsiWalletModule}
      onChange={() => setShowSsiWalletModule(!showSsiWalletModule)}
    />
  )
}
