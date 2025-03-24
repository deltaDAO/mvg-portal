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
  verifierSessionId: string
  setVerifierSessionId: (id: string) => void
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
  const [verifierSessionId, setVerifierSessionId] = useState<string>()
  const [ssiWalletCache, setSsiWalletCache] = useState<SsiWalletCache>(
    new SsiWalletCache()
  )
  const [cachedCredentials, setCachedCredentials] = useState<
    SsiVerifiableCredential[]
  >([])

  useEffect(() => {
    try {
      const token = localStorage.getItem(sessionTokenStorage)
      setSessionToken(JSON.parse(token))
    } catch (error) {
      setSessionToken(undefined)
    }
    const token = localStorage.getItem(verifierSessionIdStorage)
    if (token) {
      setVerifierSessionId(token)
    } else {
      setVerifierSessionId(undefined)
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
    if (verifierSessionId) {
      localStorage.setItem(verifierSessionIdStorage, verifierSessionId)
    } else {
      localStorage.removeItem(verifierSessionIdStorage)
    }
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
          verifierSessionId,
          setVerifierSessionId,
          ssiWalletCache,
          setSsiWalletCache,
          cachedCredentials,
          setCachedCredentials
        } as SsiWalletContext
      }
    >
      {children}
    </SsiWalletContext.Provider>
  )
}

export const useSsiWallet = (): SsiWalletContext => useContext(SsiWalletContext)
