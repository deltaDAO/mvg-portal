import { useMarketMetadata } from '@context/MarketMetadata'
import Card from './Card'
import styles from './index.module.css'

export default function Ecosystem() {
  const { siteContent } = useMarketMetadata()
  const ecosystemList = siteContent?.menu?.find(
    (item) => item.name.toLowerCase() === 'ecosystem'
  )?.subItems

  return (
    <div className={styles.container}>
      {ecosystemList?.map((portal) => (
        <Card
          key={portal.name}
          category={portal.category}
          description={portal.description}
          image={portal.image}
          link={portal.link}
          title={portal.name}
          live={portal.isLive}
        />
      ))}
    </div>
  )
}
