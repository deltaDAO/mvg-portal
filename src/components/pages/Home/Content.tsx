import React, { ReactElement } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Markdown from '../../atoms/Markdown'
import styles from './Content.module.css'
import classNames from 'classnames/bind'
import Button from '../../atoms/Button'
import Container from '../../atoms/Container'
import InteractiveModalImage from '../../molecules/InteractiveModalImage'

const cx = classNames.bind(styles)

const query = graphql`
{
  file(absolutePath: {regex: "/content\\.json/"}) {
    childIndexJson {
      content {
        paragraphs {
          title
          body
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
`
interface HomeContentData {
  file: {
    childIndexJson: {
      content: {
        paragraphs: {
          title: string
          body: string
          image: {
            childImageSharp: { original: { src: string } }
          }
        }[]
      }
    }
  }
}

export default function HomeContent(): ReactElement {
  const data: HomeContentData = useStaticQuery(query)
  const { paragraphs } = data.file.childIndexJson.content

  return (
    <Container>
      <div className={styles.container}>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}
