import { ReactElement } from 'react'
import styles from './index.module.css'
import Link from 'next/link'
import { useIsMounted } from '@hooks/useIsMounted'
import AddressName from '@components/@shared/AddressName'

export interface PublisherProps {
  account: string
  minimal?: boolean
  verifiedServiceProviderName?: string
  className?: string
  showName?: boolean
}

export default function Publisher({
  account,
  minimal,
  verifiedServiceProviderName,
  className,
  showName
}: PublisherProps): ReactElement {
  const isMounted = useIsMounted()

  return (
    <div className={`${styles.publisher} ${className || ''}`}>
      {minimal ? (
        <AddressName
          address={account}
          verifiedServiceProviderName={
            showName && isMounted ? verifiedServiceProviderName : undefined
          }
        />
      ) : (
        <>
          <Link href={`/profile/${account}`} title="Show profile page.">
            <AddressName
              address={account}
              verifiedServiceProviderName={
                showName && isMounted ? verifiedServiceProviderName : undefined
              }
            />
          </Link>
        </>
      )}
    </div>
  )
}
