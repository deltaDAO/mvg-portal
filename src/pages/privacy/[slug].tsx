import { ReactElement } from 'react'
import { markdownToHtmlWithToc } from '@utils/markdown'
import { getPageBySlug, getAllPages, PageData } from '@utils/markdownPages'
import Page from '@shared/Page'
import styles from '@shared/Page/PageMarkdown.module.css'
import Container from '@shared/atoms/Container'
import PolicyHeader from '../../components/Privacy/PolicyHeader'
import { useRouter } from 'next/router'
import { usePrivacyMetadata } from '@hooks/usePolicyMetadata'

export default function PageMarkdown(page: PageData): ReactElement {
  const router = useRouter()
  const privacyPoliciesMetadata = usePrivacyMetadata()
  if (!page || page.content === '') return null
  const { title, description } = page.frontmatter
  const { slug, content } = page

  return (
    <Page
      title={title}
      description={description}
      uri={router.asPath}
      headerCenter
    >
      <Container narrow>
        <PolicyHeader
          lang={slug.replace('/privacy/', '')}
          policiesMetadata={privacyPoliciesMetadata}
        />
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Container>
    </Page>
  )
}

export async function getStaticProps({
  params
}: {
  params: { slug: string }
}): Promise<{ props: PageData }> {
  const page = getPageBySlug(params.slug, 'privacy')
  const content = markdownToHtmlWithToc(page?.content || '')

  return {
    props: { ...page, content }
  }
}

export async function getStaticPaths(): Promise<{
  paths: {
    params: {
      slug: string
    }
  }[]
  fallback: boolean
}> {
  const pages = getAllPages('privacy')

  return {
    paths: pages.map((page) => {
      return {
        params: { slug: page.slug }
      }
    }),
    fallback: false
  }
}
