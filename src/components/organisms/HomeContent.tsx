import React, { ReactElement, useState } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Markdown from '../atoms/Markdown'
import styles from './HomeContent.module.css'
import classNames from 'classnames/bind'
import Button from '../atoms/Button'
import Container from '../atoms/Container'
import InteractiveModalImage from '../molecules/InteractiveModalImage'

const cx = classNames.bind(styles)

const query = graphql`
  query homeContentQuery {
    content: allFile(
      filter: { relativePath: { eq: "pages/index/content.json" } }
    ) {
      edges {
        node {
          childIndexJson {
            content {
              teaser {
                title
                text
              }
              paragraphs {
                title
                body
                cta
                ctaTo
                image {
                  childImageSharp {
                    original {
                      src
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
interface HomeContentData {
  content: {
    edges: {
      node: {
        childIndexJson: {
          content: {
            teaser: {
              title: string
              text: string
            }
            paragraphs: {
              title: string
              body: string
              cta: string
              ctaTo: string
              image: { childImageSharp: { original: { src: string } } }
            }[]
          }
        }
      }
    }[]
  }
}

export default function HomeContent(): ReactElement {
  const data: HomeContentData = useStaticQuery(query)
  const { paragraphs, teaser } =
    data.content.edges[0].node.childIndexJson.content

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
                  src={paragraph.image.childImageSharp.original.src}
                  alt={paragraph.title}
                />
              </div>
              <div className={styles.content}>
                <h2>{paragraph.title}</h2>
                <Markdown text={paragraph.body} />
                <Button
                  href={paragraph.ctaTo}
                  style="primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
