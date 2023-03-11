import React, { ReactElement } from 'react'
import styles from './index.module.css'
import classNames from 'classnames/bind'
import content from '../../../../content/pages/home/content.json'
import Container from '@components/@shared/atoms/Container'
import Markdown from '@components/@shared/Markdown'
import Button from '@components/@shared/atoms/Button'
import InteractiveModalImage from '@components/@shared/atoms/InteractiveModalImage'

const cx = classNames.bind(styles)

interface HomeContentData {
  teaser: {
    title: string
    text: string
  }
  paragraphs: {
    title: string
    body: string
    cta: string
    ctaTo: string
    image: string
  }[]
}

export default function HomeContent(): ReactElement {
  const { paragraphs, teaser }: HomeContentData = content

  return (
    <Container>
      <div className={styles.container}>
        <div className={styles.teaser}>
          <h2>{teaser.title}</h2>
          <Markdown text={teaser.text} />
        </div>
        <div className={styles.paragraphs}>
          {paragraphs.map((paragraph, i) => (
            <div
              key={paragraph.title}
              className={
                i % 2 === 1
                  ? cx({ paragraph: true, mirror: true })
                  : styles.paragraph
              }
            >
              <div className={styles.interactivity}>
                <InteractiveModalImage
                  src={paragraph.image}
                  alt={paragraph.title}
                />
              </div>
              <div className={styles.content}>
                <h2>{paragraph.title}</h2>
                <Markdown text={paragraph.body} />
                <Button href={paragraph.ctaTo} style="primary">
                  {paragraph.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}
