import React, { ReactElement, useState } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Markdown from '../atoms/Markdown'
import styles from './HomeContent.module.css'
import classNames from 'classnames/bind'
import Button from '../atoms/Button'
import VideoPlayer from '../molecules/VideoPlayer'
import Img, { FluidObject } from 'gatsby-image'
import Container from '../atoms/Container'
import Modal from 'react-modal'

const cx = classNames.bind(styles)

const query = graphql`
{
  file(absolutePath: {regex: "/content\\.json/"}) {
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
          interactivity
        }
      }
    }
  }
    ctdBenefits: file(relativePath: { eq: "ctd_benefits.png" }) {
        childImageSharp {
        fluid {
            ...GatsbyImageSharpFluid
            }
        }
    }
}
`
interface HomeContentData {
  file: {
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
          interactivity: string
        }[]
      }
    }
  }
  ctdBenefits: { childImageSharp: { fluid: FluidObject } }
}

export default function HomeContent(): ReactElement {
  const data: HomeContentData = useStaticQuery(query)
  const { paragraphs, teaser } = data.file.childIndexJson.content
  const ctdBenefitsImage = data.ctdBenefits.childImageSharp.fluid
  const [modalIsOpen, setIsOpen] = useState(false)

  const interactiveComponents: any = {
    video: (
      <VideoPlayer videoUrl="https://www.youtube.com/watch?v=R49CXPTRamg" />
    ),
    image: (
      <>
        <div className={styles.imagePreview} onClick={() => setIsOpen(true)}>
          <Img fluid={ctdBenefitsImage} />
        </div>
        <Modal isOpen={modalIsOpen} onRequestClose={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={() => setIsOpen(false)}>
            <button id={styles.close} onClick={() => setIsOpen(false)}>
              close
            </button>
            <Img fluid={ctdBenefitsImage} />
          </div>
        </Modal>
      </>
    )
  }

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
                {interactiveComponents[paragraph.interactivity]}
              </div>
              <div className={styles.content}>
                <h2>{paragraph.title}</h2>
                <Markdown text={paragraph.body} />
                <Button to={paragraph.ctaTo} style="primary" target="_blank">
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
