import { VerifiableCredential } from '@components/Profile/Header/VerifiableCredential'
import { useVerifiablePresentationContext } from '@context/VerifiablePresentation'
import External from '@images/external.svg'
import { findVCType } from '@utils/verifiablePresentations/utils'
import Link from 'next/link'
import { useState } from 'react'
import { Address } from 'wagmi'
import { VerifiablePresentationCardDescription } from '../VerifiablePresentationLegalAddress'
import { VerifiablePresentationMessage } from '../VerifiablePresentationMessage'
import { VerifiablePresentationSelector } from '../VerifiablePresentationSelector/index'
import { VerifiablePresentationVerification } from '../VerifiablePresentationVerification'
import styles from './index.module.css'

interface VerifiablePresentationCardProperties {
  address: Address
}

export const VerifiablePresentationCard = ({
  address
}: VerifiablePresentationCardProperties) => {
  const { credentials } = useVerifiablePresentationContext()
  const [selected, setSelected] = useState(() => {
    if (!credentials || credentials.length === 0) return 0
    const idx = credentials.findIndex((c) =>
      Object.keys(c).includes('verifiableCredential')
    )
    return idx >= 0 ? idx : 0
  })

  if (credentials.length === 0 || selected === -1) return null

  const validCredentials = credentials.filter((c) => c.verifiableCredential)
  if (validCredentials.length === 0)
    return (
      <VerifiablePresentationMessage variant="warn">
        All found verifiable presentations are faulty
      </VerifiablePresentationMessage>
    )

  const verifiableCredentials = findVCType(
    validCredentials,
    'gx:LegalParticipant'
  )
  if (verifiableCredentials.length === 0)
    return (
      <VerifiablePresentationMessage variant="warn">
        Could not find representative information in Verifiable Presentation
      </VerifiablePresentationMessage>
    )

  const current = verifiableCredentials[selected]

  return (
    <section className={styles.container}>
      <VerifiableCredential address={address}>
        <span
          className={styles.title}
          data-full={current?.credentialSubject?.['gx:legalName']}
        >
          {current?.credentialSubject?.['gx:legalName']}
        </span>
      </VerifiableCredential>
      <VerifiablePresentationCardDescription
        credentials={verifiableCredentials}
        selected={selected}
      />
      <Link
        href={current?.credentialSubject?.id ?? ''}
        target="_blank"
        className={styles.link}
      >
        {current?.credentialSubject?.id}
        <External />
      </Link>
      <VerifiablePresentationVerification
        verifiablePresentation={credentials[selected]}
        index={selected}
        className={styles.credentials}
      />
      <VerifiablePresentationSelector
        selected={selected}
        setSelected={setSelected}
        max={validCredentials.length}
      />
    </section>
  )
}
