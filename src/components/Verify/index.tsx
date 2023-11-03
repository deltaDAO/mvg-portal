import { ReactElement, useCallback, useEffect, useState } from 'react'
import { LoggerInstance } from '@oceanprotocol/lib'
import styles from './index.module.css'
import { useRouter } from 'next/router'
import {
  getFormattedCodeString,
  getServiceCredential
} from '@components/Publish/_utils'
import InputGroup from '@components/@shared/FormInput/InputGroup'
import InputElement from '@components/@shared/FormInput/InputElement'
import Button from '@components/@shared/atoms/Button'
import Loader from '@components/@shared/atoms/Loader'
import ServiceCredentialVisualizer from '@components/@shared/ServiceCredentialVisualizer'
import content from '../../../content/pages/verify.json'
import { useAsset } from '@context/Asset'
import Alert from '@components/@shared/atoms/Alert'

interface Content {
  title: string
  description: string
  input: {
    label: string
    placeholder: string
    buttonLabel: string
  }
}

export default function VerifyPage({
  didQueryString
}: {
  didQueryString?: string
}): ReactElement {
  const router = useRouter()
  const {
    asset,
    error,
    isVerifyingServiceCredential,
    isServiceCredentialVerified,
    serviceCredentialIdMatch,
    serviceCredentialVersion
  } = useAsset()

  const { input }: Content = content
  const { label, placeholder, buttonLabel } = input

  const [isLoading, setIsLoading] = useState(false)
  const [did, setDid] = useState<string>()
  const [serviceCredential, setServiceCredential] = useState<string>()

  const getDidString = (did: string): string => {
    if (!did) return
    return did.startsWith('did:op:') ? did : `did:op:${did}`
  }

  const handleVerify = useCallback(async () => {
    if (!asset) return
    setServiceCredential(undefined)
    setIsLoading(true)

    try {
      const serviceCredential =
        asset.metadata?.additionalInformation?.gaiaXInformation?.serviceSD
      if (!serviceCredential) return

      const serviceCredentialContent = serviceCredential?.url
        ? await getServiceCredential(serviceCredential?.url)
        : serviceCredential?.raw
      if (!serviceCredentialContent) return

      setServiceCredential(JSON.parse(serviceCredentialContent))
      setIsLoading(false)
    } catch (error) {
      LoggerInstance.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [asset])

  const handleSearchStart = () => {
    const didString = getDidString(did)
    const { pathname } = router

    if (didQueryString === getDidString(did)) {
      setDid(getDidString(didQueryString))
      handleVerify()
      return
    }
    router.push({ pathname, query: { did: didString } })
  }

  useEffect(() => {
    if (!didQueryString) return

    setDid(getDidString(didQueryString))
    handleVerify()
  }, [didQueryString, handleVerify])

  return (
    <div>
      <form
        className={styles.form}
        onSubmit={async (e) => {
          e.preventDefault()
          handleSearchStart()
        }}
      >
        <InputGroup>
          <InputElement
            className={styles.didInput}
            label={label}
            name="did"
            onChange={(event) =>
              setDid((event.target as HTMLInputElement).value)
            }
            placeholder={placeholder}
            value={did}
          />
          <Button
            disabled={!did || isLoading}
            style="primary"
            size="small"
            type="submit"
          >
            {isLoading || isVerifyingServiceCredential ? (
              <Loader />
            ) : (
              buttonLabel
            )}
          </Button>
        </InputGroup>
      </form>
      {!isLoading && !isVerifyingServiceCredential && error ? (
        <div className={styles.errorContainer}>
          <Alert title="Asset unavailable" text={error} state="error" />
        </div>
      ) : !isLoading &&
        !isVerifyingServiceCredential &&
        asset &&
        !serviceCredential ? (
        <div className={styles.errorContainer}>
          <Alert
            title="Service Credential unavailable"
            text="This asset does not include a Service Credential."
            state="error"
          />
        </div>
      ) : (
        !isLoading &&
        !isVerifyingServiceCredential &&
        serviceCredential && (
          <div className={styles.sdContainer}>
            <ServiceCredentialVisualizer
              text={getFormattedCodeString(serviceCredential) || ''}
              title="Service Credential"
              isValid={isServiceCredentialVerified}
              idMatch={serviceCredentialIdMatch}
              displayBadge
              apiVersion={serviceCredentialVersion}
              copyText={
                serviceCredential && JSON.stringify(serviceCredential, null, 2)
              }
              defaultExpanded
            />
          </div>
        )
      )}
    </div>
  )
}
