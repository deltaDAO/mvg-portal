import { ReactElement } from 'react'
import Page from '@shared/Page'
import Container from '@shared/atoms/Container'
import PartnerIntakeForm from '@components/PartnerIntake/PartnerIntakeForm'
import { useRouter } from 'next/router'

export default function IntakePage(): ReactElement {
  const router = useRouter()

  return (
    <Page
      title="Partner Intake Form"
      description="Join the Clio-X community as a partner organization"
      uri={router.route}
      noPageHeader
    >
      <Container>
        <PartnerIntakeForm />
      </Container>
    </Page>
  )
}
