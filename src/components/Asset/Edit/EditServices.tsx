import { ReactElement, useState } from 'react'
import EditService from './EditService'
import Button from '@components/@shared/atoms/Button'
import AddService from './AddService'
import ServiceCard from '../AssetContent/ServiceCard'
import AddServiceCard from './AddServiceCard'

export default function EditServices({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const [selectedService, setSelectedService] = useState<number | undefined>() // -1 is the new service, undefined is none

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}
      >
        {asset.services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            accessDetails={asset.accessDetails[index]}
            onClick={() => setSelectedService(index)}
          />
        ))}
        <AddServiceCard onClick={() => setSelectedService(-1)} />
      </div>

      {selectedService !== undefined && (
        <>
          <hr style={{ marginTop: 20 }} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 40
            }}
          >
            <h3>
              {selectedService === -1
                ? 'Add a new service'
                : `Edit service ${asset.services[selectedService].name}`}
            </h3>
            <Button
              size="small"
              style="text"
              onClick={() => setSelectedService(undefined)}
            >
              Cancel
            </Button>
          </div>

          {selectedService === -1 ? (
            <AddService asset={asset} />
          ) : (
            <EditService
              asset={asset}
              service={asset.services[selectedService]}
              accessDetails={asset.accessDetails[selectedService]}
            />
          )}
        </>
      )}
    </div>
  )
}
