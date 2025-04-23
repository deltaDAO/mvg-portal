import { ReactElement } from 'react'
import Time from '@shared/atoms/Time'
import { usePrivacyMetadata } from '@hooks/usePrivacyMetadata'
import PrivacyLanguages from './PrivacyLanguages'

export default function PrivacyPolicyHeader({
  policy,
  isCookie = false
}: {
  policy: string
  isCookie?: boolean
}): ReactElement {
  const { policies } = usePrivacyMetadata(isCookie)
  const policyMetadata = policies.find((p) => p.policy === policy)
  const { date, params } = policyMetadata

  return (
    <div>
      <PrivacyLanguages label={params.languageLabel} isCookie={isCookie} />
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
