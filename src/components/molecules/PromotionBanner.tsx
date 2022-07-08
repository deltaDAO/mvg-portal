import React, { ReactElement } from 'react'
import styles from './PromotionBanner.module.css'
import Markdown from '../atoms/Markdown'
import LinkOpener from './LinkOpener'
import Button from '../atoms/Button'

export interface PromoBanner {
  title: string
  description?: string
  cta?: string
  link: string
  image: { childImageSharp: { original: { src: string } } }
}

export default function PromotionBanner({
  title,
  description,
  cta,
  image,
  link
}: PromoBanner): ReactElement {
  const bannerStyle = {
    backgroundImage: `url(${image.childImageSharp.original.src})`
  }

  return (
    <LinkOpener uri={link}>
      <div className={styles.banner} style={bannerStyle}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {description && (
            <Markdown text={description} className={styles.description} />
          )}
          {cta && (
            <Button style="primary" className={styles.button}>
              {cta}
            </Button>
          )}
        </div>
      </div>
    </LinkOpener>
  )
}
