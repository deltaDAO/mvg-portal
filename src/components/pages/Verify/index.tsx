import React, { FormEvent, ReactElement, useState } from 'react'
import { useCancelToken } from '../../../hooks/useCancelToken'
import { retrieveDDO } from '../../../utils/aquarius'
import styles from './index.module.css'
import Button from '../../atoms/Button'
import Input from '../../atoms/Input'
import Markdown from '../../atoms/Markdown'
import {
  getFormattedCodeString,
  getServiceSelfDescription,
  verifyServiceSelfDescription
} from '../../../utils/metadata'
import VerifiedBadge from '../../atoms/VerifiedBadge'
import { Logger } from '@oceanprotocol/lib'
import Loader from '../../atoms/Loader'
import { MetadataMarket } from '../../../@types/MetaData'

interface Content {
  input: {
    label: string
    placeholder: string
    buttonLabel: string
  }
  errorList: {
    invalidDid: string
    noServiceSelfDescription: string
    default: string
  }
}

export default function VerifyPage({
  content
}: {
  content: Content
}): ReactElement {
  const { input, errorList } = content
  const { label, placeholder, buttonLabel } = input
  const newCancelToken = useCancelToken()
  const [isLoading, setIsLoading] = useState(false)
  const [did, setDid] = useState<string>()
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    resetState()
    setIsLoading(true)

    try {
      const ddo = await retrieveDDO(did, newCancelToken())
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
  }
  return (
    <div>
      <form onSubmit={async (e) => await handleSubmit(e)}>
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
                <div>
                  <div className={styles.selfDescriptionErrorsHeader}>
                    <h4>Validation Errors</h4>
                    {!isServiceSelfDescriptionVerified && (
                      <VerifiedBadge
                        isInvalid
                        text="Invalid Self-Description"
                        timestamp
                      />
                    )}
                  </div>
                  <Markdown
                    className={styles.errorBody}
                    text={getFormattedCodeString({
                      body: serviceSelfDescriptionErrors,
                      raw: true
                    })}
                  />
                </div>
              )}
              <div className={styles.selfDescriptionHeader}>
                <h4>Service Self-Description</h4>
                {isServiceSelfDescriptionVerified && (
                  <VerifiedBadge text="Verified Self-Description" timestamp />
                )}
              </div>
              <Markdown
                className={styles.description}
                text={serviceSelfDescription || ''}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
