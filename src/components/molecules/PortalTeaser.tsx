import React, { ReactElement, useState } from 'react'
import Dotdotdot from 'react-dotdotdot'
import styles from './PortalTeaser.module.css'
import LinkOpener from '../molecules/LinkOpener'
import classNames from 'classnames/bind'
import UdlLogo from '../../images/udl-logo.svg'
import SafeFBDCLogo from '../../images/safe-FBDC-logo.svg'
import { ReactComponent as Caret } from '../../images/caret.svg'
import Button from '../atoms/Button'

const cx = classNames.bind(styles)

const logoList = {
  udl: UdlLogo,
  safeFBDC: SafeFBDCLogo
}
export interface ThirdPartyPortal {
  title: string
  desc: string
  link: string
  logo: keyof typeof logoList
  backgroundColor: string
}

export default function PortalTeaser({
  title,
  desc,
  link,
  logo,
  backgroundColor
}: ThirdPartyPortal): ReactElement {
  const [isOpen, setIsOpen] = useState(false)

  const cardClasses = cx({
    card: true,
    isOpen
  })

  const thumbnailStyle = {
    background: `url(${logoList[logo]})`,
    backgroundColor
  }

  return (
    <article className={cardClasses} onClick={() => setIsOpen(!isOpen)}>
      <div className={styles.thumb} style={thumbnailStyle} />
      <div className={styles.infos}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <Button style="text" onClick={() => setIsOpen(!isOpen)}>
            <label className={styles.srOnly}>
              {isOpen ? 'Show Less' : 'Show More'}
            </label>
            <Caret aria-hidden="true" className={cx({ caret: true, isOpen })} />
          </Button>
        </div>
        <Dotdotdot tagName="p" clamp={4} className={styles.content}>
          {desc}
        </Dotdotdot>
        <LinkOpener uri={link} className={styles.link} openNewTab>
          <h3>Visit the portal</h3>
        </LinkOpener>
      </div>
    </article>
  )
}
