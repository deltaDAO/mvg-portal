import React, { ReactElement, useEffect, useState } from 'react'
import styles from './VerifiedPublisher.module.css'
import axios, { AxiosResponse } from 'axios'
import Loader from './Loader'
import { Logger } from '@oceanprotocol/lib'
import { useSiteMetadata } from '../../hooks/useSiteMetadata'
import Button from './Button'
import queryString from 'query-string'
import { useLocation } from '@reach/router'
import VerifiedBadge from './VerifiedBadge'

export default function VerifiedPublisher({
  address,
  verifyOption
}: {
  address: string
  verifyOption?: boolean
}): ReactElement {
  const [verified, setVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [claimingCredentials, setClaimingCredentials] = useState(false)

  const { vpRegistryUri } = useSiteMetadata().appConfig
  const location = useLocation()

  useEffect(() => {
    const { token } = queryString.parse(location.search)
    setClaimingCredentials(!!token)

    const verify = async () => {
      if (address) {
        setLoading(true)
        try {
          const response: AxiosResponse<any> = await axios.get(
            `${vpRegistryUri}/api/v2/credential/verify?address=${address}`
          )
          Logger.debug('[Verification] publisher verification:', response.data)
          setVerified(response.data?.data?.valid)
        } catch (err) {
          Logger.error('[Verification] verification error:', err.message)
          setVerified(false)
        } finally {
          setLoading(false)
        }
      }
    }
    verify()
  }, [address, location])

  return loading || claimingCredentials ? (
    <div className={styles.loader}>
      <Loader />
      <span>verifying...</span>
    </div>
  ) : verified ? (
    <VerifiedBadge text="Verified Publisher" fillBackground />
  ) : verifyOption ? (
    <div className={styles.verifyButton}>
      <Button
        style="primary"
        href="https://onboarding-portal.lab.gaia-x.eu/verification/"
      >
        Verify Credentials
      </Button>
    </div>
  ) : null
}
