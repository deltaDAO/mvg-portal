import Markdown from '@components/@shared/Markdown'
import styles from './Card.module.css'
import Button from '@components/@shared/atoms/Button'

export default function Card({
  description,
  image,
  link,
  title
}: {
  description: string
  image: string
  link: string
  title: string
}) {
  return (
    <div className={styles.container}>
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
            <Button href={link} style="primary" size="small">
              Go to Portal
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
