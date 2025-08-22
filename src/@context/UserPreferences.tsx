import {
  createContext,
  useContext,
  ReactElement,
  ReactNode,
  useState,
  useEffect
} from 'react'
import { LoggerInstance, LogLevel } from '@oceanprotocol/lib'
import { useMarketMetadata } from './MarketMetadata'
import { AUTOMATION_MODES } from './Automation/AutomationProvider'
import {
  deleteCookie,
  getCookieValue,
  SESSION_COOKIE_OPTIONS,
  setCookie,
  TWO_MONTHS_COOKIE_OPTIONS
} from '@utils/cookies'

interface UserPreferencesValue {
  debug: boolean
  setDebug: (value: boolean) => void
  currency: string
  setCurrency: (value: string) => void
  chainIds: number[]
  privacyPolicySlug: string
  showPPC: boolean
  setChainIds: (chainIds: number[]) => void
  bookmarks: string[]
  addBookmark: (did: string) => void
  removeBookmark: (did: string) => void
  setPrivacyPolicySlug: (slug: string) => void
  setShowPPC: (value: boolean) => void
  allowExternalContent: boolean
  setAllowExternalContent: (value: boolean) => void
  locale: string
  automationWalletJSON: string
  setAutomationWalletJSON: (encryptedWallet: string) => void
  automationWalletMode: AUTOMATION_MODES
  setAutomationWalletMode: (mode: AUTOMATION_MODES) => void
  showOnboardingModule: boolean
  setShowOnboardingModule: (value: boolean) => void
  onboardingStep: number
  setOnboardingStep: (step: number) => void
}

const UserPreferencesContext = createContext(null)

function UserPreferencesProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const { appConfig } = useMarketMetadata()
  // Set default values from localStorage
  const [debug, setDebug] = useState<boolean>(
    getCookieValue('debug') === 'true'
  )
  const [currency, setCurrency] = useState<string>(
    localStorage?.currency || 'EUR'
  )
  const [locale, setLocale] = useState<string>()
  const [bookmarks, setBookmarks] = useState(
    getCookieValue('bookmarks')?.split(',') || []
  )
  const [chainIds, setChainIds] = useState(
    getCookieValue('chainIds')?.split(',').map(Number) || appConfig.chainIds
  )
  const {
    defaultPrivacyPolicySlug,
    showOnboardingModuleByDefault,
    automationConfig
  } = appConfig

  const [privacyPolicySlug, setPrivacyPolicySlug] = useState<string>(
    getCookieValue('privacyPolicySlug') || defaultPrivacyPolicySlug
  )

  const [showPPC, setShowPPC] = useState<boolean>(
    getCookieValue('showPPC') !== 'false'
  )

  const [allowExternalContent, setAllowExternalContent] = useState<boolean>(
    getCookieValue('allowExternalContent') === 'true'
  )

  const [automationWallet, setAutomationWallet] = useState<string>(
    typeof getCookieValue('automationWallet') !== 'undefined'
      ? JSON.parse(getCookieValue('automationWallet'))?.automationWalletJSON
      : ''
  )

  const [automationWalletMode, setAutomationWalletMode] =
    useState<AUTOMATION_MODES>(
      typeof getCookieValue('automationWallet') !== 'undefined'
        ? JSON.parse(getCookieValue('automationWallet'))?.automationWalletMode
        : automationConfig.defaultMode
    )

  const [showOnboardingModule, setShowOnboardingModule] = useState<boolean>(
    (typeof getCookieValue('onboardingModule') !== 'undefined' &&
      JSON.parse(getCookieValue('onboardingModule'))?.showOnboardingModule ===
        'true') ??
      showOnboardingModuleByDefault
  )

  const [onboardingStep, setOnboardingStep] = useState<number>(
    typeof getCookieValue('onboardingModule') !== 'undefined'
      ? Number(JSON.parse(getCookieValue('onboardingModule'))?.onboardingStep)
      : 0
  )

  // Write values to localStorage on change
  useEffect(() => {
    if (debug) {
      setCookie('debug', debug, TWO_MONTHS_COOKIE_OPTIONS)
    } else {
      deleteCookie('debug')
    }
  }, [debug])

  useEffect(() => {
    if (bookmarks.length > 0) {
      setCookie('bookmarks', bookmarks.toString())
    } else {
      deleteCookie('bookmarks')
    }
  }, [bookmarks])

  useEffect(() => {
    if (chainIds.toString() !== appConfig.chainIds.toString()) {
      setCookie('chainIds', chainIds.toString())
    } else {
      deleteCookie('chainIds')
    }
  }, [chainIds])

  useEffect(() => {
    if (privacyPolicySlug !== defaultPrivacyPolicySlug) {
      setCookie(
        'privacyPolicySlug',
        privacyPolicySlug,
        TWO_MONTHS_COOKIE_OPTIONS
      )
    } else {
      deleteCookie('privacyPolicySlug')
    }
  }, [privacyPolicySlug])

  useEffect(() => {
    if (showPPC === false && appConfig.privacyPreferenceCenter === 'true') {
      setCookie('showPPC', showPPC)
    } else {
      deleteCookie('showPPC')
    }
  }, [showPPC])

  useEffect(() => {
    if (allowExternalContent) {
      setCookie(
        'allowExternalContent',
        allowExternalContent,
        TWO_MONTHS_COOKIE_OPTIONS
      )
    } else {
      deleteCookie('allowExternalContent')
    }
  }, [allowExternalContent])

  useEffect(() => {
    if (
      automationWallet !== '' ||
      automationWalletMode !== automationConfig.defaultMode
    ) {
      const automationWalletCookie = {
        automationWalletJSON: automationWallet,
        automationWalletMode
      }
      setCookie(
        'automationWallet',
        JSON.stringify(automationWalletCookie),
        SESSION_COOKIE_OPTIONS
      )
    } else {
      deleteCookie('automationWallet')
    }
  }, [automationWallet, automationWalletMode])

  useEffect(() => {
    if (
      showOnboardingModule !== showOnboardingModuleByDefault ||
      onboardingStep !== 0
    ) {
      const onboardingModuleCookie = {
        showOnboardingModule,
        onboardingStep
      }
      setCookie(
        'onboardingModule',
        JSON.stringify(onboardingModuleCookie),
        TWO_MONTHS_COOKIE_OPTIONS
      )
    } else {
      deleteCookie('onboardingModule')
    }
  }, [showOnboardingModule, onboardingStep])

  // Set ocean.js log levels, default: Error
  useEffect(() => {
    debug === true
      ? LoggerInstance.setLevel(LogLevel.Verbose)
      : LoggerInstance.setLevel(LogLevel.Error)
  }, [debug])

  // Get locale always from user's browser
  useEffect(() => {
    if (!window) return
    setLocale(window.navigator.language)
  }, [])

  function addBookmark(didToAdd: string): void {
    const newPinned = [...bookmarks, didToAdd]
    setBookmarks(newPinned)
  }

  function removeBookmark(didToAdd: string): void {
    const newPinned = bookmarks.filter((did: string) => did !== didToAdd)
    setBookmarks(newPinned)
  }

  // Bookmarks old data structure migration
  useEffect(() => {
    if (bookmarks.length !== undefined) return
    const newPinned: string[] = []
    for (const network in bookmarks) {
      ;(bookmarks[network] as unknown as string[]).forEach((did: string) => {
        did !== null && newPinned.push(did)
      })
    }
    setBookmarks(newPinned)
  }, [bookmarks])

  // chainIds old data migration
  // remove deprecated networks from user-saved chainIds
  useEffect(() => {
    if (!chainIds.includes(3) && !chainIds.includes(4)) return
    const newChainIds = chainIds.filter((id) => id !== 3 && id !== 4)
    setChainIds(newChainIds)
  }, [chainIds])

  return (
    <UserPreferencesContext.Provider
      value={
        {
          debug,
          currency,
          locale,
          chainIds,
          bookmarks,
          privacyPolicySlug,
          showPPC,
          setChainIds,
          setDebug,
          setCurrency,
          addBookmark,
          removeBookmark,
          setPrivacyPolicySlug,
          setShowPPC,
          allowExternalContent,
          setAllowExternalContent,
          automationWalletJSON: automationWallet,
          setAutomationWalletJSON: setAutomationWallet,
          automationWalletMode,
          setAutomationWalletMode,
          showOnboardingModule,
          setShowOnboardingModule,
          onboardingStep,
          setOnboardingStep
        } as UserPreferencesValue
      }
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}

// Helper hook to access the provider values
const useUserPreferences = (): UserPreferencesValue =>
  useContext(UserPreferencesContext)

export { UserPreferencesProvider, useUserPreferences }
