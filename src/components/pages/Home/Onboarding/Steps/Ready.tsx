import React, { ReactElement } from 'react'
import styles from './Ready.module.css'
import SuccessConfetti from '../../../../atoms/SuccessConfetti'

export default function Ready({
  title,
  success,
  image
}: {
  title: string
  success: string
  image: {
    childImageSharp: { original: { src: string } }
  }
}): ReactElement {
  return (
    <div className={styles.container}>
      <SuccessConfetti success={success} className={styles.suggestion} />
      <img src={image.childImageSharp.original.src} className={styles.image} />
      <div className={styles.footer}>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </div>
  )
}
