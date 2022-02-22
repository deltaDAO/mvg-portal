import React, { ReactElement, useState } from 'react'
import Dotdotdot from 'react-dotdotdot'
import styles from './PortalTeaser.module.css'
import LinkOpener from '../molecules/LinkOpener'
import classNames from 'classnames/bind'
import UdlLogo from '../../images/udl-logo.svg'
import SafeFBDCLogo from '../../images/safe-FBDC-logo.svg'

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

  const styleClasses = cx({
    card: true,
    isOpen
  })

  const thumbnailStyle = {
    background: `url(${logoList[logo]})`,
    backgroundColor
  }

  return (
    <article className={styleClasses} onClick={() => setIsOpen(!isOpen)}>
      <div className={styles.thumb} style={thumbnailStyle} />
      <div className={styles.infos}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.content}>
          <Dotdotdot tagName="p" clamp={4}>
            {desc}
          </Dotdotdot>
        </p>
        <LinkOpener uri={link} className={styles.link} openNewTab>
          <h3>Visit the portal</h3>
        </LinkOpener>
      </div>
    </article>
  )
}
