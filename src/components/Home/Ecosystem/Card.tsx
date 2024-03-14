import Markdown from '@components/@shared/Markdown'
import styles from './Card.module.css'
import Button from '@components/@shared/atoms/Button'
import Badge from '@components/@shared/atoms/Badge'

export default function Card({
  category,
  description,
  image,
  link,
  title,
  live
}: {
  category: string
  description: string
  image: string
  link: string
  title: string
  live: boolean
}) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Badge label={category} />
        {live && (
          <div className={styles.indicatorContainer}>
            <div className={styles.indicator}>
              <div className={styles.indicatorPulse} />
            </div>
            <span>Live</span>
          </div>
        )}
      </div>
      <div className={styles.logoContainer}>
        <img
          className={styles.logo}
          alt={`${title} logo`}
          src={`/images/ecosystem/${image}`}
        />
      </div>
      <div className={styles.overlayContainer}>
        <div className={styles.overlay}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.details}>
            <Markdown className={styles.description} text={description} />
            {live ? (
              <Button href={link} style="primary" size="small">
                Go to Portal
              </Button>
            ) : (
              <Button disabled style="text" size="small">
                Coming soon
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
