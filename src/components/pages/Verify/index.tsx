import React, { FormEvent, ReactElement, useEffect, useState } from 'react'
import { useCancelToken } from '../../../hooks/useCancelToken'
import { retrieveDDO } from '../../../utils/aquarius'
import styles from './index.module.css'
import Button from '../../atoms/Button'
import Input from '../../atoms/Input'
import Markdown from '../../atoms/Markdown'
import {
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

export default function VerifyPage({
  content
}: {
  content: Content
}): ReactElement {
  const { label, placeholder, buttonLabel } = content.input
  const [did, setDid] = useState<string>()
  const [participantSelfDescription, setParticipantSelfDescription] =
    useState<string>()
  const [isSelfDescriptionVerified, setIsSelfDescriptionVerified] =
    useState<boolean>()
  const newCancelToken = useCancelToken()

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const ddo = await retrieveDDO(did, newCancelToken())
    const { attributes } = ddo.findServiceByType('metadata')
    const participantSelfDescriptionUrl =
      attributes.additionalInformation?.participantSelfDescription
    const isParticipantSelfDescriptionVerified =
      await verifyParticipantSelfDescription(participantSelfDescriptionUrl)
    const participantSelfDescription = await getParticipantSelfDescription(
      participantSelfDescriptionUrl
    )
    const formattedParticipantSelfDescription = `\`\`\`\n${participantSelfDescription}\n\`\`\``
    setParticipantSelfDescription(formattedParticipantSelfDescription)
  }
  return (
    <div>
      <form>
        <Input
          label={label}
          name="did"
          onChange={(event) => setDid((event.target as HTMLInputElement).value)}
          placeholder={placeholder}
          value={did}
        />
        <Button style="primary" onClick={handleSubmit}>
          {buttonLabel}
        </Button>
      </form>
      {participantSelfDescription && (
        <div className={styles.selfDescriptionContainer}>
          <div className={styles.selfDescriptionHeader}>
            <h4>Participant Self-Description</h4>
            <VerifiedBadge text="Verified Self-Description" timestamp />
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
