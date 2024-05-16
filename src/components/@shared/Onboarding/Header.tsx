import { ReactElement } from 'react'
import styles from './Header.module.css'
import content from '../../../../content/onboarding/index.json'
import Container from '../atoms/Container'
import Markdown from '../Markdown'
import LightBulb from '@images/lightBulb.svg'

interface OnboardingHeaderData {
  title: string
  subtitle: string
  body: string
}

export default function Header(): ReactElement {
  const { title, subtitle, body }: OnboardingHeaderData = content

  return (
    <Container className={styles.container}>
      <div className={styles.content}>
        <h5 className={styles.subtitle}>{subtitle}</h5>
        <h2 className={styles.title}>{title}</h2>
        <Markdown text={body} className={styles.paragraph} />
      </div>
      <LightBulb />
    </Container>
  )
}
