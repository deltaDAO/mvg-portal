import { ReactElement } from 'react'
import EditService from './EditService'
import Button from '@components/@shared/atoms/Button'

export default function EditServices({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
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
      <div
        style={{
          margin: '20px',
          display: 'flex',
          justifyContent: 'center',
          borderTop: '1px solid #e0e0e0',
          paddingTop: '20px'
        }}
      >
        <Button style="primary">Add Service</Button>
      </div>
    </div>
  )
}
