import { ReactElement } from 'react'
import Verify from '../components/Faucet'
import content from '../../content/pages/faucet.json'
import Page from '@components/@shared/Page'

export default function PageVerify(): ReactElement {
  return (
    <Page title={content.title} description={content.description} uri="">
      <Verify />
    </Page>
  )
}
