import React, { ReactElement } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import Container from '../../../atoms/Container'
import Markdown from '../../../atoms/Markdown'
import styles from './Header.module.css'

const query = graphql`
  query OnboardingQuery {
    file(relativePath: { eq: "pages/index/onboarding/index.json" }) {
      childOnboardingJson {
        title
        subtitle
        body
      }
    }
  }
`

interface OnboardingHeaderData {
  file: {
    childOnboardingJson: {
      title: string
      subtitle: string
      body: string
    }
  }
}

export default function Header(): ReactElement {
  const data: OnboardingHeaderData = useStaticQuery(query)
  const { title, subtitle, body } = data.file.childOnboardingJson

  return (
    <Container className={styles.container}>
      <div className={styles.content}>
        <h5 className={styles.subtitle}>{subtitle}</h5>
        <h2 className={styles.title}>{title}</h2>
        <Markdown text={body} className={styles.paragraph} />
      </div>
    </Container>
  )
}
