import React, { ReactElement, useEffect, useState } from 'react'
import styles from './VerifiedPublisher.module.css'
import { ReactComponent as VerifiedPatch } from '../../images/patch_check.svg'
import axios from 'axios'
import Loader from './Loader'
import { Logger } from '@oceanprotocol/lib'
import { useSiteMetadata } from '../../hooks/useSiteMetadata'

export default function VerifiedPublisher({
  address
}: {
  address: string
}): ReactElement {
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)

  const { vpRegistryUri } = useSiteMetadata().appConfig

  useEffect(() => {
    if (address) {
      setLoading(true)
      axios
        .get(`${vpRegistryUri}/vp/${address}/verify`)
        .then((response) => {
          Logger.debug('[Verification] publisher verification:', response.data)
          setVerified(response.data?.data?.verified)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [address])

  return loading ? (
    <div className={styles.loader}>
      <Loader />
      <span>verifying...</span>
    </div>
  ) : verified ? (
    <div className={styles.verifiedBadge}>
      <VerifiedPatch /> <span>Verified Publisher</span>
    </div>
  ) : null
}
