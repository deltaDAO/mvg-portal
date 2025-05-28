import dynamic from 'next/dynamic'
import { ReactElement, useRef, useState } from 'react'
import { RoadDamageUseCaseData } from '../../@context/UseCases/models/RoadDamage.model'
import JobList from './JobList'
import styles from './index.module.css'

export default function RoadDamageMap(): ReactElement {
  const MapWithNoSSR = dynamic(() => import('./Map'), {
    ssr: false
  })

  const scrollToMapRef = useRef<HTMLDivElement>()

  const [mapData, setMapData] = useState<RoadDamageUseCaseData[]>([])

  return (
    <div>
      <JobList setMapData={setMapData} scrollToMapRef={scrollToMapRef} />
      {mapData && mapData.length > 0 && (
        <div ref={scrollToMapRef}>
          <span className={styles.info}>
            Map info calculated from {mapData.length} compute job result
            {mapData.length > 1 && 's'}.
          </span>
          <MapWithNoSSR data={mapData} />
        </div>
      )}
    </div>
  )
}
