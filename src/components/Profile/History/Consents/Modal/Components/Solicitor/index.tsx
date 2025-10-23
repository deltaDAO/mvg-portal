import Time from '@components/@shared/atoms/Time'
import Publisher from '@components/@shared/Publisher'
import styles from './index.module.css'

interface SolicitorProps {
  address: string
  createdAt: number
}

function Solicitor({ address, createdAt }: SolicitorProps) {
  return (
    <span className={styles.publisher}>
      <Publisher account={address} showName={true} />
      <Time date={`${createdAt}`} relative isUnix={true} />
    </span>
  )
}

export default Solicitor
