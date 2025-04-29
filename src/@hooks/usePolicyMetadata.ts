import privacyContent from '../../content/pages/privacy/policies.json'
import cookieContent from '../../content/pages/cookies/policies.json'

export interface UsePolicyMetadata {
  policies: {
    policyLangTag: string
    language: string
    date: string
    params: {
      languageLabel: string
      updated: string
      dateFormat: string
    }
  }[]
  slug: string
}

export function usePrivacyMetadata(): UsePolicyMetadata {
  return { ...privacyContent }
}

export function useCookieMetadata(): UsePolicyMetadata {
  return { ...cookieContent }
}
