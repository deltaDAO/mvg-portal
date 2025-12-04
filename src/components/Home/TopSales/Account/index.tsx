import { ReactElement } from 'react'
import Dotdotdot from 'react-dotdotdot'
import Link from 'next/link'
import styles from './index.module.css'
import Avatar from '../../../@shared/atoms/Avatar'
import { UserSales } from '@utils/aquarius'
import AddressName from '@components/@shared/AddressName'

declare type AccountProps = {
  account: UserSales
  place?: number
}

export default function Account({
  account,
  place
}: AccountProps): ReactElement {
  return (
    <Link href={`/profile/${account.id}`} className={styles.teaser}>
      {place && <span className={styles.place}>{place}</span>}
      <Avatar accountId={account.id} className={styles.avatar} />
      <div>
        <Dotdotdot tagName="h4" clamp={2} className={styles.name}>
          <AddressName address={account.id} />
        </Dotdotdot>
        <p className={styles.sales}>
          <span>{account.totalSales}</span>
          {`${account.totalSales === 1 ? ' sale' : ' sales'}`}
        </p>
      </div>
    </Link>
  )
}
