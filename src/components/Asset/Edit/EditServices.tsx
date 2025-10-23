import { ReactElement, useState } from 'react'
import EditService from './EditService'
import Button from '@components/@shared/atoms/Button'
import AddService from './AddService'
import ServiceCard from '../AssetContent/ServiceCard'
import AddServiceCard from './AddServiceCard'
import styles from './index.module.css'
import { AssetExtended } from 'src/@types/AssetExtended'

export default function EditServices({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const [selectedService, setSelectedService] = useState<number | undefined>() // -1 is the new service, undefined is none

  return (
    <div>
      <div className={styles.servicesGrid}>
        {asset.credentialSubject?.services.map((service, index) => (
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
          <hr />

          <div className={styles.servicesHeader}>
            <h3>
              {selectedService === -1
                ? 'Add a new service'
                : `Edit service ${asset.credentialSubject?.services[selectedService].name}`}
            </h3>
          </div>

          {selectedService === -1 ? (
            <AddService asset={asset} />
          ) : (
            <EditService
              asset={asset}
              service={asset.credentialSubject?.services[selectedService]}
              accessDetails={asset.accessDetails[selectedService]}
            />
          )}
        </>
      )}
    </div>
  )
}
