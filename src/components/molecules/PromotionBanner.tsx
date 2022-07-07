import React, { ReactElement } from 'react'
import styles from './PromotionBanner.module.css'
import Markdown from '../atoms/Markdown'
import LinkOpener from './LinkOpener'

export interface PromoBanner {
  title: string
  description?: string
  link: string
  image: { childImageSharp: { original: { src: string } } }
}

export default function PromotionBanner({
  title,
  description,
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
        </div>
      </div>
    </LinkOpener>
  )
}
