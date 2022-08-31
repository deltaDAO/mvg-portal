import { useStaticQuery, graphql } from 'gatsby'

export interface UsePrivacyMetadata {
  policies: {
    policy: string
    language: string
    params: {
      languageLabel: string
      tocHeader: string
    }
  }[]
}

const query = graphql`
  {
    privacyJson {
      policies {
        policy
        language
        params {
          tocHeader
          languageLabel
        }
      }
    }
  }
`

export function usePrivacyMetadata(): UsePrivacyMetadata {
  const data = useStaticQuery(query)

  return { ...data.privacyJson }
}
