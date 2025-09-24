import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import content from '../../content/pages/faucet.json'
import Page from '@components/@shared/Page'

import Faucet from '../components/Faucet'

export default function PageFaucet(): ReactElement {
  const router = useRouter()
  return (
    <Page
      title={content.title}
      description={content.description}
      uri={router.pathname}
    >
      <Faucet />
    </Page>
  )
}
