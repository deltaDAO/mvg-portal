import { ReactElement, useState } from 'react'
import EditService from './EditService'
import Button from '@components/@shared/atoms/Button'
import AddService from './AddService'

export default function EditServices({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const [isAddingNewService, setIsAddingNewService] = useState(false)

  return (
    <div>
      {asset.services.map((service, index) => (
        <EditService
          key={service.id}
          asset={asset}
          service={service}
          accessDetails={asset.accessDetails[index]}
        />
      ))}
      {isAddingNewService ? (
        <AddService
          asset={asset}
          onRemove={() => setIsAddingNewService(false)}
        />
      ) : (
        <div
          style={{
            margin: '20px',
            display: 'flex',
            justifyContent: 'center',
            borderTop: '1px solid #e0e0e0',
            paddingTop: '20px'
          }}
        >
          <Button style="primary" onClick={() => setIsAddingNewService(true)}>
            Add Service
          </Button>
        </div>
      )}
    </div>
  )
}
