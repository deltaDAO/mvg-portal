import OnboardingSection from '@components/@shared/Onboarding'
import Page from '@components/@shared/Page'
import { ReactElement } from 'react'

export default function PageOnboarding(): ReactElement {
  return (
    <Page
      title="Onboarding"
      description="Get started with the Pontus-X portal by following the onboarding steps."
      uri="/onboarding"
      headerCenter
    >
      <OnboardingSection />
    </Page>
  )
}
