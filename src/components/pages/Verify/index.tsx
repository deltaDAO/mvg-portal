import React, {
  FormEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react'
import { useLocation, useNavigate } from '@reach/router'
import { useCancelToken } from '../../../hooks/useCancelToken'
import { retrieveDDO } from '../../../utils/aquarius'
import styles from './index.module.css'
import Button from '../../atoms/Button'
import Input from '../../atoms/Input'
import {
  getFormattedCodeString,
  getServiceSelfDescription,
  verifyServiceSelfDescription
} from '../../../utils/metadata'
import { Logger } from '@oceanprotocol/lib'
import Loader from '../../atoms/Loader'
import { MetadataMarket } from '../../../@types/MetaData'
import Visualizer from './Visualizer'

interface Content {
  input: {
    label: string
    placeholder: string
    buttonLabel: string
  }
  serviceSelfDescriptionSection: {
    title: string
    badgeLabel: string
  }
  errorSection: {
    title: string
    badgeLabel: string
  }
  errorList: {
    invalidDid: string
    noServiceSelfDescription: string
    default: string
  }
}

export default function VerifyPage({
  content,
  didQueryString
}: {
  content: Content
  didQueryString?: string
}): ReactElement {
  const navigate = useNavigate()
  const location = useLocation()
  const { input, errorList, serviceSelfDescriptionSection, errorSection } =
    content
  const { label, placeholder, buttonLabel } = input
  const newCancelToken = useCancelToken()
  const [isLoading, setIsLoading] = useState(false)
  const [did, setDid] = useState(didQueryString)
  const [serviceSelfDescription, setServiceSelfDescription] = useState<string>()
  const [isServiceSelfDescriptionVerified, setServiceSelfDescriptionVerified] =
    useState<boolean>()
  const [serviceSelfDescriptionErrors, setServiceSelfDescriptionErrors] =
    useState<string>()
  const [error, setError] = useState<keyof typeof errorList>()

  const resetState = () => {
    setServiceSelfDescription(undefined)
    setServiceSelfDescriptionVerified(undefined)
    setServiceSelfDescriptionErrors(undefined)
    setError(undefined)
  }

  const getDidString = (did: string): string => {
    if (!did) return
    return did.startsWith('did:op:') ? did : `did:op:${did}`
  }

  const handleVerify = useCallback(
    async (did: string) => {
      if (!did) return
      resetState()
      setIsLoading(true)

      const didString = getDidString(did)
      try {
        const ddo = await retrieveDDO(didString, newCancelToken())
        if (!ddo) {
          setError('invalidDid')
          return
        }

        const { attributes }: { attributes: MetadataMarket } =
          ddo.findServiceByType('metadata')
        if (!attributes.additionalInformation?.serviceSelfDescription) {
          setError('noServiceSelfDescription')
          return
        }
        const { raw, url } =
          attributes.additionalInformation?.serviceSelfDescription

        const requestBody = url ? { body: url } : { body: raw, raw: true }
        if (!requestBody) {
          setError('noServiceSelfDescription')
          return
        }

        const { responseBody, verified } = await verifyServiceSelfDescription(
          requestBody
        )
        setServiceSelfDescriptionVerified(verified)

        if (!verified && !responseBody) {
          setError('default')
          return
        }
        if (responseBody) {
          setServiceSelfDescriptionErrors(responseBody)
        }

        const serviceSelfDescriptionContent = url
          ? { body: await getServiceSelfDescription(url) }
          : { body: raw, raw: true }
        const formattedServiceSelfDescription = getFormattedCodeString(
          serviceSelfDescriptionContent
        )
        setServiceSelfDescription(formattedServiceSelfDescription)
        setIsLoading(false)
      } catch (error) {
        Logger.error(error)
      } finally {
        setIsLoading(false)
      }
    },
    [newCancelToken]
  )

  const handleSearchStart = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const didString = getDidString(did)
    const { origin, pathname } = location
    const url = `${origin}${pathname}?did=${didString}`
    navigate(url)
  }

  useEffect(() => {
    if (!didQueryString) return
    handleVerify(didQueryString)
  }, [didQueryString, handleVerify])

  return (
    <div>
      <form onSubmit={async (e) => handleSearchStart(e)}>
        <Input
          className={styles.didInput}
          label={label}
          name="did"
          onChange={(event) => setDid((event.target as HTMLInputElement).value)}
          placeholder={placeholder}
          value={did}
        />
        <Button
          className={styles.actionButton}
          disabled={!did || isLoading}
          style="primary"
          type="submit"
        >
          {buttonLabel}
        </Button>
      </form>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          {error && <p className={styles.error}>{errorList[error]}</p>}
          {serviceSelfDescription && (
            <div className={styles.selfDescriptionContainer}>
              {serviceSelfDescriptionErrors && (
                <Visualizer
                  badgeLabel={errorSection.badgeLabel}
                  text={getFormattedCodeString({
                    body: serviceSelfDescriptionErrors,
                    raw: true
                  })}
                  title={errorSection.title}
                  displayBadge={!isServiceSelfDescriptionVerified}
                  invalidBadge
                />
              )}
              <Visualizer
                badgeLabel={serviceSelfDescriptionSection.badgeLabel}
                text={serviceSelfDescription || ''}
                title={serviceSelfDescriptionSection.title}
                displayBadge={isServiceSelfDescriptionVerified}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
