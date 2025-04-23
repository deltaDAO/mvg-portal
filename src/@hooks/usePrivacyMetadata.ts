import privacyContent from '../../content/pages/privacy/policies.json'
import cookieContent from '../../content/pages/cookie/policies.json'

export interface UsePrivacyMetadata {
  policies: {
    policy: string
    language: string
    date: string
    params: {
      languageLabel: string
      updated: string
      dateFormat: string
    }
  }[]
}

export function usePrivacyMetadata(isCookie: boolean): UsePrivacyMetadata {
  if (isCookie) {
    return { ...cookieContent }
  }
  return { ...privacyContent }
}
