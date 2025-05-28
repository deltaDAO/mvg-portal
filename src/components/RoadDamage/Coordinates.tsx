import { ReactElement } from 'react'
import { GPSCoordinate } from './_types'

export default function Coordinates({
  gpsCoordinates
}: {
  gpsCoordinates: GPSCoordinate
}): ReactElement {
  return (
    <span>
      {gpsCoordinates.lat.toFixed(4)}, {gpsCoordinates.lng.toFixed(4)}
    </span>
  )
}
