import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement } from 'react'
import Container from '../../atoms/Container'
import Markdown from '../../atoms/Markdown'
import styles from './Hero.module.css'

const query = graphql`
{
  file(absolutePath: {regex: "pages/index/content\\.json/"}) {
    childIndexJson {
      hero {
        title
        subtitle
        body
      }
    }
  }
}
`

interface HomeHeroData {
  file: {
    childIndexJson: {
      hero: {
        title: string
        subtitle: string
        body: string
      }
    }
  }
}

export default function HomeHero(): ReactElement {
  const data: HomeHeroData = useStaticQuery(query)
  const { title, subtitle, body } = data.file.childIndexJson.hero

  return (
    <div className={styles.wrapper}>
      <div className={styles.background} />
      <Container className={styles.container}>
        <div className={styles.content}>
          <h5 className={styles.subtitle}>{subtitle}</h5>
          <h2 className={styles.title}>{title}</h2>
          <Markdown text={body} className={styles.paragraph} />
        </div>
      </Container>
    </div>
  )
}
