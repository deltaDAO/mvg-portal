import OnboardingSection from '@components/@shared/Onboarding'
import Page from '@components/@shared/Page'
import { ReactElement } from 'react'
import content from '../../content/pages/onboarding.json'
import router from 'next/router'

export default function PageOnboarding(): ReactElement {
  return (
    <Page
      title={content.title}
      description={content.description}
      uri={router.route}
    >
      <OnboardingSection />
    </Page>
  )
}
