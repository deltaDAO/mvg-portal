import { ReactElement } from 'react'
import styles from './index.module.css'
import { RoadDamageResultWithImage } from '../_types'
import Time from '../../@shared/atoms/Time'
import { getConfidenceColor } from '../_utils'
import Button from '../../@shared/atoms/Button'
import Accordion from '../../@shared/Accordion'
import Coordinates from '../Coordinates'

export default function RoadDamageDetails({
  damage
}: {
  damage: RoadDamageResultWithImage
}): ReactElement {
  const { image, roadDamages } = damage
  return (
    <div className={styles.wrapper}>
      <div className={styles.image}>
        <img
          className={styles.mapImage}
          src={`data:image/${image.type || 'jpeg'};base64,${image.data}`}
          alt={image.name}
        />
      </div>
      <Accordion defaultExpanded title="Detections">
        {roadDamages.map((damage, index) => (
          <div key={`road-damage-details-${index}`} className={styles.detail}>
            <div>
              <h4 className={styles.title}>
                {damage.type} (<span>{damage.damageClass}</span>,{' '}
                <span style={{ color: getConfidenceColor(damage.confidence) }}>
                  {damage.confidence.toFixed(2)}
                </span>
                )
              </h4>
              <span>
                Observed <Time date={`${damage.lastObservation}`} relative />
              </span>
              <div className={styles.info}>
                <strong>Coordinates</strong>:{' '}
                <Button
                  href={`https://www.openstreetmap.org/directions?from=&to=${damage.gpsCoordinates.lat}%2C${damage.gpsCoordinates.lng}`}
                  style="text"
                >
                  <Coordinates gpsCoordinates={damage.gpsCoordinates} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Accordion>
    </div>
  )
}
