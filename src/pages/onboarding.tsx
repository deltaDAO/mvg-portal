import { ReactElement } from 'react'
import OnboardingSection from '@components/@shared/Onboarding'
import Page from '@shared/Page'

export default function Onboarding(): ReactElement {
  return (
    <Page title="Onboarding" uri="/onboarding" noPageHeader>
      <OnboardingSection />
    </Page>
  )
}
