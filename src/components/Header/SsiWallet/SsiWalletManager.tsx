import { useEffect, useState } from 'react'
import { useAccount, useSigner } from 'wagmi'
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
  const { isConnected } = useAccount()
  const { data: signer } = useSigner()
  const { sessionToken, setSessionToken } = useSsiWallet()

  const [overrideApi, setOverrideApi] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) || appConfig.ssiWalletApi
  })

  useEffect(() => {
    const storedApi = sessionStorage.getItem(STORAGE_KEY)

    if (isConnected && signer && appConfig.ssiEnabled && !sessionToken) {
      if (storedApi) {
        connectToWallet(signer)
          .then(setSessionToken)
          .catch(LoggerInstance.error)
      } else {
        setShowSsiWalletModule(false)
      }
    }
  }, [
    isConnected,
    signer,
    sessionToken,
    showSsiWalletModule,
    setShowSsiWalletModule,
    setSessionToken
  ])

  async function handleSsiConnect() {
    try {
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
