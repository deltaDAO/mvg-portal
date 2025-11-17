import { ReactElement } from 'react'
import Time from '@shared/atoms/Time'
import { usePrivacyMetadata } from '@hooks/usePrivacyMetadata'
import PrivacyLanguages from './PrivacyLanguages'
import AnchorNavigation from '@shared/AnchorNavigation'

export default function PrivacyPolicyHeader({
  policy
}: {
  policy: string
}): ReactElement {
  const { policies } = usePrivacyMetadata()
  const policyMetadata = policies.find((p) => p.policy === policy)

  if (!policyMetadata) return null

  const { date, params } = policyMetadata

  return (
    <div>
      <PrivacyLanguages label={params.languageLabel} />
      <AnchorNavigation
        items={[
          {
            label: 'Terms and Conditions',
            anchor: 'terms-and-conditions'
          },
          { label: 'Privacy Policy', anchor: 'privacy-policy' }
        ]}
      />
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
