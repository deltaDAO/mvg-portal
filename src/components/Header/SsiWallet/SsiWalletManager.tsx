import { useState } from 'react'
import { useSigner } from 'wagmi'
import { useSsiWallet } from '@context/SsiWallet'
import { useUserPreferences } from '@context/UserPreferences'
import {
  connectToWallet,
  setSsiWalletApiOverride,
  STORAGE_KEY
} from '@utils/wallet/ssiWallet'
import appConfig from 'app.config.cjs'
import { LoggerInstance } from '@oceanprotocol/lib'
import SsiApiModal from '../Wallet/SsiApiModal'

export default function SsiWalletManager() {
  const { showSsiWalletModule, setShowSsiWalletModule } = useUserPreferences()
  const { data: signer } = useSigner()
  const {
    setSessionToken,
    ssiWalletCache,
    setCachedCredentials,
    clearVerifierSessionCache
  } = useSsiWallet()

  const [overrideApi, setOverrideApi] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) || appConfig.ssiWalletApi
  })

  async function handleSsiConnect() {
    try {
      ssiWalletCache.clearCredentials()
      setCachedCredentials(undefined)
      clearVerifierSessionCache()
      setSsiWalletApiOverride(overrideApi)
      const session = await connectToWallet(signer!)
      setSessionToken(session)
      setShowSsiWalletModule(false)
    } catch (error) {
      LoggerInstance.error(error)
    }
  }

  return showSsiWalletModule ? (
    <SsiApiModal
      apiValue={overrideApi}
      onChange={setOverrideApi}
      onConnect={handleSsiConnect}
      onClose={() => setShowSsiWalletModule(false)}
    />
  ) : null
}
