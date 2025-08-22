import { AUTOMATION_MODES } from '@context/Automation/AutomationProvider'

export interface OpcFee {
  chainId: number
  swapNotApprovedFee: string
  swapApprovedFee: string
  approvedTokens: string[]
}

export interface AppConfig {
  metadataCacheUri: string
  complianceUri: string
  complianceApiVersion: string
  chainIds: number[]
  chainIdsSupported: number[]
  defaultDatatokenTemplateIndex: number
  marketFeeAddress: string
  publisherMarketOrderFee: string
  publisherMarketFixedSwapFee: string
  consumeMarketOrderFee: string
  consumeMarketFixedSwapFee: string
  allowFixedPricing: string
  allowDynamicPricing: string
  allowFreePricing: string
  defaultPrivacyPolicySlug: string
  privacyPreferenceCenter: string
  darkModeConfig: {
    classNameDark: string
    classNameLight: string
    storageKey: string
  }
  defaultTermsAndConditionsUrl: string
  purgatoryUrl: string
  dockerHubProxyUrl: string
  automationConfig: {
    enableAutomation: string
    networkTokenFundDefaultValue: string
    erc20ApprovalDefaultValue: string
    roughTxGasEstimate: number
    defaultMode: AUTOMATION_MODES
  }
  showPreviewAlert: string
  contractingProvider: {
    enable: boolean
    endpoint: string
  }
  networkAlertConfig: {
    // Refresh interval for network status - 30 sec
    refreshInterval: number
    // Margin of error for block count (how much difference between min / max block numbers before showing an alert)
    errorMargin: number
    // Map chainIds to their respective status endpoints
    statusEndpoints: {
      [chainId: number]: string
    }
  }
  faucet: {
    baseUri: string
  }
  showOnboardingModuleByDefault: boolean
}
export interface SiteContent {
  siteTitle: string
  siteTagline: string
  siteUrl: string
  siteImage: string
  copyright: string
  menu: {
    name: string
    link?: string
    subItems?: {
      name: string
      link?: string
      description?: string
      image?: string
      category?: string
      isLive?: boolean
      subItems?: {
        name: string
        link: string
        description?: string
        image?: string
        category?: string
        isLive?: boolean
      }[]
    }[]
  }[]
  announcement: {
    text: string
    state: 'success' | 'warning' | 'error'
  }
  devPreviewAnnouncement: string
  warning: {
    ctd: string
  }
  footer: {
    subtitle: string
    copyright: string
    privacyTitle: string
    content: {
      title: string
      links: {
        name: string
        link: string
      }[]
    }[]
  }
}

export interface MarketMetadataProviderValue {
  opcFees: OpcFee[]
  siteContent: SiteContent
  appConfig: AppConfig
  getOpcFeeForToken: (tokenAddress: string, chainId: number) => string
  approvedBaseTokens: TokenInfo[]
}
