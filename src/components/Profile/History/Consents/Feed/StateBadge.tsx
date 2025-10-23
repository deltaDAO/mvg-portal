import { ConsentState } from '@utils/consents/types'
import styles from './StateBadge.module.css'

interface Props {
  status?: ConsentState
}

export default function ConsentStateBadge({ status }: Props) {
  return (
    <div
      className={`${styles.badge} ${
        styles[`badge-${status?.toLowerCase() ?? 'pending'}`]
      }`}
    >
      {status ?? 'Pending'}
    </div>
  )
}
