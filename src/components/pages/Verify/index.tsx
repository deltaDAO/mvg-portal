import React, { FormEvent, ReactElement, useState } from 'react'
import { useCancelToken } from '../../../hooks/useCancelToken'
import { retrieveDDO } from '../../../utils/aquarius'
import styles from './index.module.css'
import Button from '../../atoms/Button'
import Input from '../../atoms/Input'
import Markdown from '../../atoms/Markdown'
import {
  getFormattedCodeString,
  getParticipantSelfDescription,
  verifyParticipantSelfDescription
} from '../../../utils/metadata'
import VerifiedBadge from '../../atoms/VerifiedBadge'
import { Logger } from '@oceanprotocol/lib'
import Loader from '../../atoms/Loader'

interface Content {
  input: {
    label: string
    placeholder: string
    buttonLabel: string
  }
  errorList: {
    invalidDid: string
    noParticipantSelfDescription: string
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
  const [participantSelfDescription, setParticipantSelfDescription] =
    useState<string>()
  const [
    isParticipantSelfDescriptionVerified,
    setParticipantSelfDescriptionVerified
  ] = useState<boolean>()
  const [
    participantSelfDescriptionErrors,
    setParticipantSelfDescriptionErrors
  ] = useState<string>()
  const [error, setError] = useState<keyof typeof errorList>()

  const resetState = () => {
    setParticipantSelfDescription(undefined)
    setParticipantSelfDescriptionVerified(undefined)
    setParticipantSelfDescriptionErrors(undefined)
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

      const { attributes } = ddo.findServiceByType('metadata')
      const participantSelfDescriptionUrl =
        attributes.additionalInformation?.participantSelfDescription
      if (!participantSelfDescriptionUrl) {
        setError('noParticipantSelfDescription')
        return
      }

      const participantSelfDescriptionVerification =
        await verifyParticipantSelfDescription(participantSelfDescriptionUrl)

      const { responseBody, verified } = participantSelfDescriptionVerification
      setParticipantSelfDescriptionVerified(verified)

      if (!verified && !responseBody) {
        setError('default')
        return
      }
      if (responseBody) {
        setParticipantSelfDescriptionErrors(responseBody)
      }

      const participantSelfDescriptionBody =
        await getParticipantSelfDescription(participantSelfDescriptionUrl)
      const formattedParticipantSelfDescription = getFormattedCodeString(
        participantSelfDescriptionBody
      )
      setParticipantSelfDescription(formattedParticipantSelfDescription)
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
        {error && <p className={styles.error}>{errorList[error]}</p>}
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
        participantSelfDescription && (
          <div className={styles.selfDescriptionContainer}>
            {participantSelfDescriptionErrors && (
              <div>
                <div className={styles.selfDescriptionErrorsHeader}>
                  <h4>Validation Errors</h4>
                  {!isParticipantSelfDescriptionVerified && (
                    <VerifiedBadge
                      text="Invalid Self-Description"
                      isInvalid
                      timestamp
                    />
                  )}
                </div>
                <Markdown
                  className={styles.errorBody}
                  text={getFormattedCodeString(
                    participantSelfDescriptionErrors
                  )}
                />
              </div>
            )}
            <div className={styles.selfDescriptionHeader}>
              <h4>Participant Self-Description</h4>
              {isParticipantSelfDescriptionVerified && (
                <VerifiedBadge text="Verified Self-Description" timestamp />
              )}
            </div>
            <Markdown
              className={styles.description}
              text={participantSelfDescription || ''}
            />
          </div>
        )
      )}
    </div>
  )
}
