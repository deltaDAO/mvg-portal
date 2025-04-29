import { ReactElement } from 'react'
import Time from '@shared/atoms/Time'
import { UsePolicyMetadata } from '@hooks/usePolicyMetadata'
import PolicyLanguages from './PolicyLanguages'

export default function PolicyHeader({
  lang,
  metadata
}: {
  lang: string
  metadata: UsePolicyMetadata
}): ReactElement {
  const { policies } = metadata
  const policyMetadata = policies.find(
    (policy) => policy.policyLangTag === lang
  )
  const { date, params } = policyMetadata

  return (
    <div>
      <PolicyLanguages label={params.languageLabel} metadata={metadata} />
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
