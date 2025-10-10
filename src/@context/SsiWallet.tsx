import { set } from 'date-fns'
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

export interface SsiWalletContext {
  sessionToken?: SsiWalletSession
  setSessionToken: (token?: SsiWalletSession) => void
  selectedWallet?: SsiWalletDesc
  setSelectedWallet: (wallet?: SsiWalletDesc) => void
  selectedKey?: SsiKeyDesc
  setSelectedKey: (key?: SsiKeyDesc) => void
  lookupVerifierSessionId: (did: string, serviceId: string) => string
  lookupVerifierSessionIdSkip: (did: string, serviceId: string) => string
  cacheVerifierSessionId: (
    did: string,
    serviceId: string,
    sessionId: string,
    skipCheck?: boolean
  ) => void
  clearVerifierSessionCache: () => void
  verifierSessionCache: Record<string, string>
  ssiWalletCache: SsiWalletCache
  setSsiWalletCache: (cache: SsiWalletCache) => void
  cachedCredentials: SsiVerifiableCredential[]
  setCachedCredentials: (credentials: SsiVerifiableCredential[]) => void
  selectedDid?: string
  setSelectedDid: (did?: string) => void
}

const SessionTokenStorage = 'sessionToken'
const VerifierSessionIdStorage = 'verifierSessionId'

const SsiWalletContext = createContext(null)

export function SsiWalletProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const [sessionToken, setSessionToken] = useState<SsiWalletSession>()
  const [selectedWallet, setSelectedWallet] = useState<SsiWalletDesc>()
  const [selectedKey, setSelectedKey] = useState<SsiKeyDesc>()
  const [ssiWalletCache, setSsiWalletCache] = useState<SsiWalletCache>(
    new SsiWalletCache()
  )
  const [cachedCredentials, setCachedCredentials] = useState<
    SsiVerifiableCredential[]
  >([])

  const [verifierSessionCache, setVerifierSessionCache] = useState<
    Record<string, string>
  >({})

  const [selectedDid, setSelectedDid] = useState<string>()

  useEffect(() => {
    try {
      const token = localStorage.getItem(SessionTokenStorage)
      setSessionToken(JSON.parse(token))
    } catch (error) {
      setSessionToken(undefined)
    }

    try {
      const storageString = localStorage.getItem(VerifierSessionIdStorage)
      let sessions = JSON.parse(storageString) as Record<string, string>
      if (!sessions) {
        sessions = {}
      }
      setVerifierSessionCache(sessions)
    } catch (error) {
      setVerifierSessionCache({})
    }
  }, [])

  useEffect(() => {
    if (!sessionToken) {
      setSelectedWallet(undefined)
      setSelectedKey(undefined)
      setSelectedDid(undefined)
    }
    localStorage.setItem(SessionTokenStorage, JSON.stringify(sessionToken))
  }, [sessionToken])

  function lookupVerifierSessionId(did: string, serviceId: string): string {
    return verifierSessionCache?.[`${did}_${serviceId}`]
  }

  function lookupVerifierSessionIdSkip(did: string, serviceId: string): string {
    return verifierSessionCache?.[`${did}_${serviceId}_skip`]
  }

  function cacheVerifierSessionId(
    did: string,
    serviceId: string,
    sessionId: string,
    skipCheck?: boolean
  ) {
    let storageString = localStorage.getItem(VerifierSessionIdStorage)
    let sessions
    try {
      sessions = storageString ? JSON.parse(storageString) : {}
    } catch {
      sessions = {}
    }
    const key = skipCheck ? `${did}_${serviceId}_skip` : `${did}_${serviceId}`
    sessions[key] = sessionId
    storageString = JSON.stringify(sessions)
    localStorage.setItem(VerifierSessionIdStorage, storageString)
    setVerifierSessionCache(sessions)
  }

  function clearVerifierSessionCache() {
    localStorage.removeItem(VerifierSessionIdStorage)
    setVerifierSessionCache({})
  }

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
          lookupVerifierSessionId,
          lookupVerifierSessionIdSkip,
          cacheVerifierSessionId,
          clearVerifierSessionCache,
          verifierSessionCache,
          ssiWalletCache,
          setSsiWalletCache,
          cachedCredentials,
          setCachedCredentials,
          selectedDid,
          setSelectedDid
        } as SsiWalletContext
      }
    >
      {children}
    </SsiWalletContext.Provider>
  )
}

export const useSsiWallet = (): SsiWalletContext => useContext(SsiWalletContext)
