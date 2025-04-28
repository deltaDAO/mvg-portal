import { ReactElement } from 'react'
import Time from '@shared/atoms/Time'
import {
  useCookieMetadata,
  UsePolicyMetadata,
  usePrivacyMetadata
} from '@hooks/usePolicyMetadata'
import PolicyLanguages from './PolicyLanguages'

export default function PolicyHeader({
  lang,
  policies
}: {
  lang: string
  policies: UsePolicyMetadata['policies']
}): ReactElement {
  /* const cookieMeta = useCookieMetadata()
  const privacyMeta = usePrivacyMetadata()
  const { policies } = isCookiePolicy ? cookieMeta : privacyMeta */
  const policyMetadata = policies.find((p) => p.policy === lang)
  const { date, params } = policyMetadata
  console.log('policy', lang)

  return (
    <div>
      <PolicyLanguages label={params.languageLabel} policies={policies} />
      <p>
        <em>
          {params?.updated || 'Last updated on'}{' '}
          <Time
            date={date}
            displayFormat={params?.dateFormat || 'MMMM dd, yyyy.'}
          />
        </em>
      </p>
    </div>
  )
}
