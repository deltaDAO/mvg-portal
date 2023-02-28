import React, {
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react'
import { LoggerInstance } from '@oceanprotocol/lib'
import styles from './index.module.css'
import { useRouter } from 'next/router'
import {
  getFormattedCodeString,
  getServiceSD,
  verifyRawServiceSD
} from '@components/Publish/_utils'
import InputGroup from '@components/@shared/FormInput/InputGroup'
import InputElement from '@components/@shared/FormInput/InputElement'
import Button from '@components/@shared/atoms/Button'
import Loader from '@components/@shared/atoms/Loader'
import SDVisualizer from '@components/@shared/SDVisualizer'
import content from '../../../content/pages/verify.json'
import { useAsset } from '@context/Asset'

interface Content {
  input: {
    label: string
    placeholder: string
    buttonLabel: string
  }
  serviceSDSection: {
    title: string
    badgeLabel: string
  }
  errorSection: {
    title: string
    badgeLabel: string
  }
  errorList: {
    invalidDid: string
    noServiceSD: string
    default: string
  }
}

export default function VerifyPage({
  didQueryString
}: {
  didQueryString?: string
}): ReactElement {
  const router = useRouter()
  const { asset } = useAsset()

  const { input, errorList, serviceSDSection, errorSection }: Content = content
  const { label, placeholder, buttonLabel } = input

  const [isLoading, setIsLoading] = useState(false)
  const [did, setDid] = useState<string>()
  const [serviceSD, setServiceSD] = useState<string>()
  const [isServiceSDVerified, setServiceSDVerified] = useState<boolean>()
  const [serviceSDVersion, setServiceSDVersion] = useState<string>()
  const [serviceSDErrors, setServiceSDErrors] = useState<string>()
  const [error, setError] = useState<keyof typeof errorList>()

  const resetState = () => {
    setServiceSD(undefined)
    setServiceSDVerified(undefined)
    setServiceSDErrors(undefined)
    setError(undefined)
  }

  const getDidString = (did: string): string => {
    if (!did) return
    return did.startsWith('did:op:') ? did : `did:op:${did}`
  }

  const handleVerify = useCallback(async () => {
    if (!asset) return
    resetState()
    setIsLoading(true)

    try {
      const serviceSD =
        asset.metadata?.additionalInformation?.gaiaXInformation?.serviceSD
      if (!serviceSD) {
        setError('noServiceSD')
        return
      }

      const serviceSDContent = serviceSD?.url
        ? await getServiceSD(serviceSD?.url)
        : serviceSD?.raw

      const { responseBody, verified, complianceApiVersion } =
        await verifyRawServiceSD(serviceSDContent)
      setServiceSDVerified(verified)
      setServiceSDVersion(complianceApiVersion)

      if (!verified && !responseBody) {
        setError('default')
        return
      }
      if (responseBody) {
        setServiceSDErrors(responseBody)
      }

      setServiceSD(JSON.parse(serviceSDContent))
      setIsLoading(false)
    } catch (error) {
      LoggerInstance.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [asset])

  const handleSearchStart = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const didString = getDidString(did)
    const { basePath, pathname } = router
    const url = `${basePath}${pathname}?did=${didString}`

    if (didQueryString === getDidString(did)) {
      setDid(getDidString(didQueryString))
      handleVerify()
      return
    }
    router.push(url)
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
        onSubmit={async (e) => handleSearchStart(e)}
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
            {isLoading ? <Loader /> : buttonLabel}
          </Button>
        </InputGroup>
      </form>
      {!isServiceSDVerified && error && (
        <p className={styles.error}>{errorList[error]}</p>
      )}
      {serviceSD && (
        <div className={styles.sdContainer}>
          {serviceSDErrors && (
            <SDVisualizer
              badgeLabel={errorSection.badgeLabel}
              text={getFormattedCodeString(serviceSDErrors)}
              title={errorSection.title}
              displayBadge={!isServiceSDVerified}
              apiVersion={serviceSDVersion}
              invalidBadge
            />
          )}
          <SDVisualizer
            badgeLabel={serviceSDSection.badgeLabel}
            text={getFormattedCodeString(serviceSD) || ''}
            title={serviceSDSection.title}
            displayBadge={isServiceSDVerified}
            apiVersion={serviceSDVersion}
            copyText={serviceSD && JSON.stringify(serviceSD, null, 2)}
          />
        </div>
      )}
    </div>
  )
}
