import {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react'
import {
  SsiKeyDesc,
  SsiVerifiableCredential,
  SsiWalletCache,
  SsiWalletDesc,
  SsiWalletSession
} from 'src/@types/SsiWallet'

const verifierSessionIdStorage = 'verifierSessionId'
const sessionTokenStorage = 'sessionToken'

export interface SsiWalletContext {
  sessionToken: SsiWalletSession
  setSessionToken: (token: SsiWalletSession) => void
  selectedWallet: SsiWalletDesc
  setSelectedWallet: (wallet: SsiWalletDesc) => void
  selectedKey: SsiKeyDesc
  setSelectedKey: (key: SsiKeyDesc) => void
  getVerifierSessionId: (did: string, serviceId: string) => string
  setVerifierSessionId: (session: {
    did: string
    serviceId: string
    sessionId: string
  }) => void
  clearVerifierSessionIdCache: () => void
  ssiWalletCache: SsiWalletCache
  setSsiWalletCache: (cache: SsiWalletCache) => void
  cachedCredentials: SsiVerifiableCredential[]
  setCachedCredentials: (credentials: SsiVerifiableCredential[]) => void
}

const SsiWalletContext = createContext(null)

export function SsiWalletProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const [sessionToken, setSessionToken] = useState<SsiWalletSession>()
  const [selectedWallet, setSelectedWallet] = useState<SsiWalletDesc>()
  const [selectedKey, setSelectedKey] = useState<SsiKeyDesc>()
  const [verifierSessionId, setVerifierSessionId] = useState<{
    did: string
    serviceId: string
    sessionId: string
  }>()
  const [ssiWalletCache, setSsiWalletCache] = useState<SsiWalletCache>(
    new SsiWalletCache()
  )
  const [cachedCredentials, setCachedCredentials] = useState<
    SsiVerifiableCredential[]
  >([])

  function getVerifierSessionId(did: string, serviceId: string) {
    const storageString = localStorage.getItem(verifierSessionIdStorage)
    let sessions
    try {
      sessions = JSON.parse(storageString) as Record<string, string>
      if (!sessions) {
        sessions = {}
      }
    } catch (error) {
      sessions = {}
    }
    return sessions[`${did}_${serviceId}`]
  }

  function clearVerifierSessionIdCache() {
    localStorage.removeItem(verifierSessionIdStorage)
  }

  useEffect(() => {
    try {
      const token = localStorage.getItem(sessionTokenStorage)
      setSessionToken(JSON.parse(token))
    } catch (error) {
      setSessionToken(undefined)
    }
  }, [])

  useEffect(() => {
    if (!sessionToken) {
      setSelectedWallet(undefined)
      setSelectedKey(undefined)
    }
    localStorage.setItem(sessionTokenStorage, JSON.stringify(sessionToken))
  }, [sessionToken])

  useEffect(() => {
    console.log(verifierSessionId)
    if (!verifierSessionId) {
      return
    }

    let storageString = localStorage.getItem(verifierSessionIdStorage)
    let sessions
    try {
      sessions = JSON.parse(storageString) as Record<string, string>
      if (!sessions) {
        sessions = {}
      }
    } catch (error) {
      sessions = {}
    }
    sessions[`${verifierSessionId.did}_${verifierSessionId.serviceId}`] =
      verifierSessionId.sessionId
    storageString = JSON.stringify(sessions)
    localStorage.setItem(verifierSessionIdStorage, storageString)
  }, [verifierSessionId])

  return (
    <SsiWalletContext.Provider
      value={
        {
          sessionToken,
          setSessionToken,
          selectedWallet,
          setSelectedWallet,
          selectedKey,
          setSelectedKey,
          getVerifierSessionId,
          setVerifierSessionId,
          ssiWalletCache,
          setSsiWalletCache,
          cachedCredentials,
          setCachedCredentials,
          clearVerifierSessionIdCache
        } as SsiWalletContext
      }
    >
      {children}
    </SsiWalletContext.Provider>
  )
}

export const useSsiWallet = (): SsiWalletContext => useContext(SsiWalletContext)
