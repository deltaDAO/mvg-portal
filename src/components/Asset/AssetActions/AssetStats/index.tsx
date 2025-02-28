import { useAsset } from '@context/Asset'
import styles from './index.module.css'

export default function AssetStats() {
  const { asset } = useAsset()

  return (
    <footer className={styles.stats}>
      {!asset?.credentialSubject.stats ||
      asset?.credentialSubject.stats?.orders < 0 ? (
        <span className={styles.stat}>N/A</span>
      ) : asset?.credentialSubject.stats?.orders === 0 ? (
        <span className={styles.stat}>No sales yet</span>
      ) : (
        <span className={styles.stat}>
          <span className={styles.number}>
            {asset.credentialSubject.stats.orders}
          </span>{' '}
          sale
          {asset.credentialSubject.stats.orders === 1 ? '' : 's'}
        </span>
      )}
    </footer>
  )
}
