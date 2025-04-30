import { ReactElement } from 'react'
import Links from './Links'
import Container from '@components/@shared/atoms/Container'
import styles from './Footer.module.css'

export default function Footer(): ReactElement {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <Container className="mx-auto px-4">
        <Links />
        <div className="border-t border-gray-800 mt-12 pt-6 text-center md:text-left">
          <p className={`${styles.subtitle} text-xs`}>
            © {currentYear} ClioX. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}
