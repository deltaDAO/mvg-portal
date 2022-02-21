import React, { ReactElement } from 'react'
import Dotdotdot from 'react-dotdotdot'
import styles from './PortalTeaser.module.css'
import LinkOpener from '../molecules/LinkOpener'

export interface ThirdPartyPortal {
  title: string
  desc: string
  link: string
}

export default function PortalTeaser({
  title,
  desc,
  link
}: ThirdPartyPortal): ReactElement {
  return (
    <article className={styles.teaser}>
      <LinkOpener uri={link} className={styles.link} openNewTab>
        <header className={styles.header}>
          <Dotdotdot clamp={3}>
            <h1 className={styles.title}>{title}</h1>
          </Dotdotdot>
        </header>

        <div className={styles.content}>
          <Dotdotdot tagName="p" clamp={4}>
            {desc}
          </Dotdotdot>
        </div>
      </LinkOpener>
    </article>
  )
}
