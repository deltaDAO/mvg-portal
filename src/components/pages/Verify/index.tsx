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

interface Content {
  input: {
    label: string
    placeholder: string
    buttonLabel: string
  }
}

const errorList = {
  invalidDid: 'The provided DID:OP does not refer to any DDO.',
  noParticipantSelfDescription:
    'The requested DDO does not contain a participant self-description.',
  default: 'An unexpected error occurred. Please try again later.'
}

export default function VerifyPage({
  content
}: {
  content: Content
}): ReactElement {
  const { label, placeholder, buttonLabel } = content.input
  const newCancelToken = useCancelToken()
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
  ] = useState<string>(`{
    "conforms": false,
    "shape": {
      "conforms": false,
      "results": [
        "http://w3id.org/gaia-x/participant#registrationNumber: Less than 1 values",
        "http://w3id.org/gaia-x/participant#headquarterAddress: Less than 1 values",
        "http://w3id.org/gaia-x/participant#legalAddress: Less than 1 values"
      ]
    },
    "content": {
      "conforms": false,
      "results": [
        "leiCode: the given leiCode is invalid or does not exist",
        "legalAddress.country: country needs to be a valid ISO-3166-1 country name"
      ]
    },
    "isValidSignature": false
  }`)
  const [error, setError] = useState<keyof typeof errorList>()

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
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

    const participantSelfDescriptionBody = await getParticipantSelfDescription(
      participantSelfDescriptionUrl
    )
    const formattedParticipantSelfDescription = getFormattedCodeString(
      participantSelfDescriptionBody
    )
    setParticipantSelfDescription(formattedParticipantSelfDescription)
  }
  return (
    <div>
      <form>
        <Input
          className={styles.didInput}
          label={label}
          name="did"
          onChange={(event) => setDid((event.target as HTMLInputElement).value)}
          placeholder={placeholder}
          value={did}
        />
        {error && <p className={styles.error}>{errorList[error]}</p>}
        <Button style="primary" onClick={handleSubmit} disabled={!did}>
          {buttonLabel}
        </Button>
      </form>
      {participantSelfDescription && (
        <div className={styles.selfDescriptionContainer}>
          {participantSelfDescriptionErrors && (
            <div>
              <div className={styles.selfDescriptionHeader}>
                <h4>Validation Errors</h4>
                <VerifiedBadge
                  text="Invalid Self-Description"
                  isInvalid
                  timestamp
                />
              </div>
              <Markdown
                className={styles.errorBody}
                text={getFormattedCodeString(participantSelfDescriptionErrors)}
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
      )}
    </div>
  )
}
