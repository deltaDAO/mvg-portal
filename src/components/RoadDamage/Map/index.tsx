import 'leaflet-defaulticon-compatibility'

import { FeatureGroup, LatLngBounds, LatLngTuple, Marker } from 'leaflet'
import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import { GPSCoordinate, RoadDamageResultWithImage } from '../_types'
import styles from './index.module.css'

import { LoggerInstance } from '@oceanprotocol/lib'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet/dist/leaflet.css'
import { RoadDamageUseCaseData } from '../../../@context/UseCases/models/RoadDamage.model'
import RoadDamageDetails from '../Details'
import { getConfidenceColor, getMapColor } from '../_utils'

export interface MapProps {
  data: RoadDamageUseCaseData[]
}

function Map({ data }: MapProps) {
  const [markers, setMarkers] = useState<JSX.Element[]>()
  const [coords, setCoords] = useState<GPSCoordinate[]>([])
  const [bounds, setBounds] = useState<LatLngBounds>()
  const [center, setCenter] = useState<LatLngTuple>()
  const [currentMapDataEntry, setCurrentMapDataEntry] =
    useState<RoadDamageResultWithImage>()

  useEffect(() => {
    if (coords.length < 1) return

    const leafletMarkers = coords.map((coord) => new Marker(coord))
    const featureGroup = new FeatureGroup(leafletMarkers)
    setBounds(featureGroup.getBounds())

    // Calculate center of map
    const sum = coords.reduce(
      (partialSum, c) => {
        partialSum[0] += c.lat
        partialSum[1] += c.lng
        return partialSum
      },
      [0, 0]
    )
    const centroid = sum.map((el) => {
      const avg = el / Object.entries(data).length
      return Number(avg.toFixed(6))
    })

    setCenter(centroid as LatLngTuple)

    LoggerInstance.log('[RoadDamage]: updated map view bounds', {
      coords,
      centroid
    })
  }, [coords])

  useEffect(() => {
    const newCoords: GPSCoordinate[] = []
    const mapMarkers = data
      .map((row) => {
        return row.result.map((entry, index) => {
          if (!entry.roadDamages || entry.roadDamages.length < 1)
            return undefined

          const roadDamageCoordinates = entry.roadDamages.find(
            (damage) => damage.gpsCoordinates?.lat && damage.gpsCoordinates?.lng
          ).gpsCoordinates

          if (!roadDamageCoordinates) return undefined

          const lat = Number(roadDamageCoordinates.lat)
          const lng = Number(roadDamageCoordinates.lng)

          newCoords.push({ lat, lng })

          return (
            <CircleMarker
              key={`${row.id}-${lat}-${lng}-${index}`}
              center={{ lat, lng }}
              eventHandlers={{
                click: () => setCurrentMapDataEntry(entry)
              }}
              color={getMapColor(row.job.inputDID)}
            >
              <Tooltip>
                <div className={styles.tooltip}>
                  <strong>Road Damage</strong>
                  <br />
                  <div className={styles.types}>
                    Types:{' '}
                    {entry.roadDamages.map((damage, i) => (
                      <span
                        key={`road-damage-entry-${index}-damage-types-${i}`}
                        style={{ color: getConfidenceColor(damage.confidence) }}
                      >
                        {damage.type}
                        {' ('}
                        {Math.round(damage.confidence * 100)}
                        {'%)'}
                        {i < entry.roadDamages.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                  <br />
                  <span>
                    Coordinates:
                    <br />[{lat.toFixed(4).toString()}
                    {', '}
                    {lng.toFixed(4).toString()}]
                  </span>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })
      })
      .reduce((previous, current) => previous.concat(current), [])

    setCoords(newCoords)
    setMarkers(mapMarkers)
    LoggerInstance.log('[RoadDamage]: updated map view markers', {
      count: mapMarkers.length,
      coords
    })
  }, [data])

  return (
    <>
      <div className={styles.mapContainer}>
        {center ? (
          <div className={styles.mapContainer}>
            <MapContainer
              center={center}
              style={{ width: 900, height: 600, zIndex: 1 }}
              scrollWheelZoom={false}
              bounds={bounds}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {markers}
            </MapContainer>
          </div>
        ) : (
          <p>Calculating map...</p>
        )}
      </div>
      {currentMapDataEntry && (
        <RoadDamageDetails damage={currentMapDataEntry} />
      )}
    </>
  )
}

export default Map
