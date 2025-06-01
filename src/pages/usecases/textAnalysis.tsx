import { ReactElement } from 'react'
import Page from '@shared/Page'
import { useRouter } from 'next/router'
import content from '../../../content/pages/textAnalysis.json'
import TextAnalysis from '../../components/TextAnalysis'

export default function PageRoadDamage(): ReactElement {
  const router = useRouter()

  const { title, description } = content

  return (
    <Page title={title} description={description} uri={router.route}>
      <TextAnalysis />
    </Page>
  )
}
