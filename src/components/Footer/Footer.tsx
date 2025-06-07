import { ReactElement } from 'react'
import Links from './Links'
import Container from '@components/@shared/atoms/Container'
import NewsletterBanner from './NewsletterBanner'
import { useNewsletterBanner } from '../../@context/NewsletterBanner'
import styles from './Footer.module.css'

export default function Footer(): ReactElement {
  const { showNewsletterBanner } = useNewsletterBanner()

  return (
    <>
      {showNewsletterBanner && <NewsletterBanner />}
      <footer className={styles.footer}>
        <Container className="mx-auto px-4 py-8">
          <Links />
          <div className="border-t border-gray-200 mt-8 pt-4 text-center md:text-left">
            <p className="text-xs opacity-80">
              © {new Date().getFullYear()} ClioX. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    </>
  )
}
