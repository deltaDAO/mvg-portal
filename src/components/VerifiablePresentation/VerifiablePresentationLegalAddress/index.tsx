import { GaiaXVerifiableCredential } from '@utils/verifiablePresentations/types'
import { useMemo } from 'react'
import styles from './index.module.css'

interface VerifiablePresentationLegalAddressProps {
  credentials: GaiaXVerifiableCredential[]
  selected: number
}

export const VerifiablePresentationCardDescription = ({
  credentials,
  selected
}: Readonly<VerifiablePresentationLegalAddressProps>) => {
  console.log(credentials)

  const legalAddresses = useMemo(
    () => credentials.map((c) => c.credentialSubject?.['gx:legalAddress']),
    [credentials]
  )

  const legalRegistrationNumbers = useMemo(
    () =>
      credentials.map(
        (c) => c.credentialSubject?.['gx:legalRegistrationNumber']
      ),
    [credentials]
  )

  const legalAddress = useMemo(
    () => legalAddresses[selected],
    [legalAddresses, selected]
  )

  const legalRegistrationNumber = useMemo(
    () => legalRegistrationNumbers[selected],
    [legalRegistrationNumbers, selected]
  )

  if (!legalAddress || !legalRegistrationNumber) return <>ERROR</>

  return (
    <div className={styles.descriptions}>
      <span className={styles.description}>
        {legalAddress?.['gx:streetAddress']}, {legalAddress?.['gx:postalCode']},{' '}
        {legalAddress?.['gx:locality']},{' '}
        {legalRegistrationNumber.credentialSubject?.['gx:vatID-countryCode']}
      </span>

      <span className={styles.description}>
        {legalRegistrationNumber.credentialSubject?.['gx:vatID']}
      </span>
    </div>
  )
}
