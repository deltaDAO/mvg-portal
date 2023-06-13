import React, { ReactElement, useEffect, useState } from 'react'
import styles from './index.module.css'
import Link from 'next/link'
import { accountTruncate } from '@utils/wallet'
import { useIsMounted } from '@hooks/useIsMounted'

export interface PublisherProps {
  account: string
  minimal?: boolean
  verifiedServiceProviderName?: string
  className?: string
}

export default function Publisher({
  account,
  minimal,
  verifiedServiceProviderName,
  className
}: PublisherProps): ReactElement {
  const isMounted = useIsMounted()
  const [name, setName] = useState(
    verifiedServiceProviderName || accountTruncate(account)
  )

  useEffect(() => {
    if (!account || account === '') return

    // set default name on hook
    // to avoid side effect (UI not updating on account's change)
    if (verifiedServiceProviderName && isMounted())
      setName(verifiedServiceProviderName || accountTruncate(account))
  }, [account, isMounted, verifiedServiceProviderName])

  return (
    <div className={`${styles.publisher} ${className || ''}`}>
      {minimal ? (
        name
      ) : (
        <>
          <Link href={`/profile/${account}`} title="Show profile page.">
            {name}
          </Link>
        </>
      )}
    </div>
  )
}
