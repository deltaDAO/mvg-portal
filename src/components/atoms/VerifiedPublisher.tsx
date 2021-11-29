import React, { ReactElement, useEffect, useState } from 'react'
import styles from './VerifiedPublisher.module.css'
import { ReactComponent as VerifiedPatch } from '../../images/patch_check.svg'
import axios, { AxiosResponse } from 'axios'
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
    const verify = async () => {
      if (address) {
        setLoading(true)
        try {
          const response: AxiosResponse<any> = await axios.get(
            `${vpRegistryUri}/vp/${address}/verify`
          )
          Logger.debug('[Verification] publisher verification:', response.data)
          setVerified(response.data?.data?.verified)
        } catch (err) {
          Logger.error('[Verification] verification error:', err.message)
          setVerified(false)
        } finally {
          setLoading(false)
        }
      }
    }
    verify()
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
