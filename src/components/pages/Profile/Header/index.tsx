import React, { ReactElement, useState } from 'react'
import PublisherLinks from './PublisherLinks'
import Markdown from '../../../atoms/Markdown'
import Stats from './Stats'
import Account from './Account'
import styles from './index.module.css'
import { useProfile } from '../../../../providers/Profile'
import { useWeb3 } from '../../../../providers/Web3'
import Button from '../../../atoms/Button'

const isDescriptionTextClamped = () => {
  const el = document.getElementById('description')
  if (el) return el.scrollHeight > el.clientHeight
}

const LinkExternal = ({ url, text }: { url: string; text: string }) => {
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {text}
    </a>
  )
}

export default function AccountHeader({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { profile } = useProfile()
  const [isShowMore, setIsShowMore] = useState(false)

  const toogleShowMore = () => {
    setIsShowMore(!isShowMore)
  }
  const account = useWeb3().accountId

  return (
    <div className={styles.grid}>
      <div>
        <Account accountId={accountId} />
        <Stats accountId={accountId} />
      </div>

      <div>
        <div className={styles.verify}>
          <p>Verify your credentials</p>
          <Button
            style="primary"
            href="https://onboarding-portal.lab.gaia-x.eu/"
          >
            Verify
          </Button>
        </div>
        <Markdown text={profile?.description} className={styles.description} />
        {isDescriptionTextClamped() ? (
          <span className={styles.more} onClick={toogleShowMore}>
            <LinkExternal
              url={`https://www.3box.io/${accountId}`}
              text="Read more on 3box"
            />
          </span>
        ) : (
          ''
        )}
        {profile?.links?.length > 0 && (
          <PublisherLinks className={styles.publisherLinks} />
        )}
      </div>
      <div className={styles.meta}>
        Profile data from{' '}
        {profile?.accountEns && (
          <>
            <LinkExternal
              url={`https://app.ens.domains/name/${profile.accountEns}`}
              text="ENS"
            />{' '}
            &{' '}
          </>
        )}
        <LinkExternal
          url={`https://www.3box.io/${accountId}`}
          text="3Box Hub"
        />
      </div>
    </div>
  )
}
