import { useVerifiablePresentations } from '@hooks/useVerifiablePresentations'
import PatchCheck from '@images/patch_check.svg'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Address } from 'wagmi'
import styles from './VerifiableCredential.module.css'

interface VerifiableCredentialProps {
  address: Address
  children?: ReactNode
}

export const VerifiableCredential = ({
  address,
  children
}: Readonly<VerifiableCredentialProps>) => {
  const { data: credentials } = useVerifiablePresentations(address)
  if (!address || credentials.length === 0) return

  return (
    <Link className={styles.icon} href={`/credentials/${address}`}>
      {children || <PatchCheck />}
    </Link>
  )
}
