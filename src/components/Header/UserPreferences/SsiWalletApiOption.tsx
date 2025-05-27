import { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import Input from '@shared/FormInput'

export default function SsiWalletApiOption(): ReactElement {
  const { showSsiWalletModule, setShowSsiWalletModule } = useUserPreferences()

  return (
    <Input
      label="Ssi Wallet API"
      help="Show the onboarding tutorial module on the homepage."
      name="ssiWalletApi"
      type="checkbox"
      options={['Update Ssi Wallet API']}
      checked={showSsiWalletModule}
      onChange={() => setShowSsiWalletModule(!showSsiWalletModule)}
    />
  )
}
