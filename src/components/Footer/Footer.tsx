import { ReactElement } from 'react'
import Links from './Links'
import Container from '@components/@shared/atoms/Container'
import styles from './Footer.module.css'

export default function Footer(): ReactElement {
  return (
    <footer className={styles.footer}>
      <Container className="mx-auto p-4 pb-8">
        <Links />
        <div className="border-t border-gray-200 mt-8 pt-4 text-center md:text-left">
          <p className="text-xs opacity-80">
            © {new Date().getFullYear()} ClioX. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}
