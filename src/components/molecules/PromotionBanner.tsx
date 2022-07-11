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
    <div className={styles.banner} style={bannerStyle}>
      <div className={styles.contentWrapper}>
        <h2 className={styles.title}>{title}</h2>
        {description && (
          <Markdown text={description} className={styles.description} />
        )}
        {cta && (
          <LinkOpener openNewTab uri={link}>
            <div className={styles.cta}>{cta}</div>
          </LinkOpener>
        )}
      </div>
    </div>
  )
}
