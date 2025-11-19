import { ReactElement, useState } from 'react'
import styles from './ServiceCard.module.css'
import { Service } from 'src/@types/ddo/Service'

export default function ServiceCard({
  service,
  accessDetails,
  onClick
}: {
  service: Service
  accessDetails: AccessDetails
  onClick: () => void
}): ReactElement {
  const [expanded, setExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (!accessDetails) return null

  const description = service.description?.['@value']

  return (
    <div
      onClick={onClick}
      className={styles.service}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={styles.serviceTitle}>{service.name || 'Unknown'} </span>
      <br />
      <div className={styles.descriptionWrapper}>
        {description ? (
          <>
            <span
              className={`${styles.serviceDescription} ${
                expanded ? styles.expanded : styles.collapsed
              }`}
            >
              {description}
            </span>
            {description.length > 50 && (
              <button
                type="button"
                className={styles.toggle}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  setExpanded((prev) => !prev)
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </>
        ) : (
          <span className={styles.serviceDescriptionPlaceholder}>
            No description available.
          </span>
        )}
      </div>
      <span className={styles.title}>Type: </span>
      <span className={styles.access}>{service.type}</span>
      <br />
      <span className={styles.title}>Price: </span>
      {accessDetails.type === 'fixed' ? (
        <>
          {accessDetails.price}{' '}
          <span className={styles.tokenSymbol}>
            {accessDetails.baseToken.symbol}
          </span>
        </>
      ) : (
        <span className={styles.free}>free</span>
      )}
      <br />
      <div
        className={`${styles.selectButtonWrapper} ${
          isHovered ? styles.visible : ''
        }`}
      >
        <button className={styles.selectButton}>Select</button>
      </div>
    </div>
  )
}
