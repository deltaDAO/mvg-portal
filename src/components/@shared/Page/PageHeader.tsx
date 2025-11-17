import SearchBar from '@components/Header/SearchBar'
import BrandLogo from '@images/pontusx_logo_horizontal.svg'
import Markdown from '@shared/Markdown'
import classNames from 'classnames/bind'
import { ReactElement } from 'react'
import NetworkStatus from '../NetworkStatus'
import styles from './PageHeader.module.css'
import Button from '../atoms/Button'

const cx = classNames.bind(styles)

export default function PageHeader({
  title,
  center,
  description,
  isHome,
  showSearch
}: {
  title: string | ReactElement
  center?: boolean
  description?: string
  isHome?: boolean
  showSearch?: boolean
}): ReactElement {
  const styleClasses = cx({
    header: true,
    center
  })

  return (
    <header className={styleClasses}>
      {isHome ? (
        <div className={styles.homeTitleContainer}>
          <BrandLogo />
          {description && (
            <Markdown text={description} className={styles.subtitle} />
          )}
          <div className={styles.cta}>
            <Button
              style="primary"
              href="https://onboarding.delta-dao.com/"
              disableExternalLinkIndicator={true}
            >
              {'Get onboarded now'}
            </Button>
          </div>
          <div className={styles.logoContainer}>
            <a
              href="https://gaia-x.eu/community/lighthouse-projects/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <img
                className={styles.gaiaxLighthouseLogo}
                alt={'Gaia-X Lighthouse'}
                src={'/images/gaia-x_lightouse.png'}
              />
            </a>
          </div>
        </div>
      ) : (
        <div>
          <h1 className={styles.title}>{title}</h1>
          <NetworkStatus className={styles.networkAlert} />
        </div>
      )}
      {description && !isHome && (
        <Markdown text={description} className={styles.description} />
      )}
      {showSearch && (
        <div className={styles.search}>
          <SearchBar placeholder="Search for service offerings" />
        </div>
      )}
    </header>
  )
}
