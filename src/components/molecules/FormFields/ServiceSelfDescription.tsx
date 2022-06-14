import { useField } from 'formik'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  getFormattedCodeString,
  verifyServiceSelfDescription
} from '../../../utils/metadata'
import Button from '../../atoms/Button'
import Input, { InputProps } from '../../atoms/Input'
import Markdown from '../../atoms/Markdown'
import BoxSelection from './BoxSelection'

const serviceSelfDescriptionOptions = [
  {
    name: 'uri',
    checked: false,
    title: 'Uri'
  },
  {
    name: 'json',
    checked: false,
    title: 'Json'
  }
]

export default function ServiceSelfDescription(
  props: InputProps
): ReactElement {
  const [field, meta, helpers] = useField(props.name)
  const [userSelection, setUserSelection] = useState<string>()
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const verifyRawBody = async (rawServiceSelfDescription: string) => {
    try {
      setIsLoading(true)

      const parsedBody = JSON.parse(rawServiceSelfDescription)
      const { verified } = await verifyServiceSelfDescription({
        body: parsedBody,
        raw: true
      })
      setIsVerified(verified)

      if (!verified) {
        toast.error(
          'The data you entered appears to be invalid. Please check the provided service self-description and try again'
        )
        return
      }
      toast.success(
        'Great! The provided service self-description looks good. 🐳'
      )
    } catch (error) {
      toast.error(
        'Something went wrong. Please check the provided service self-description and try again'
      )
      console.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    helpers.setValue(undefined)
    setIsVerified(false)
  }, [userSelection])

  useEffect(() => {
    console.log(field)
  }, [field])

  async function handleButtonClick(e: React.FormEvent<Element>, body: string) {
    // hack so the onBlur-triggered validation does not show,
    // like when this field is required
    helpers.setTouched(false)

    e.preventDefault()

    verifyRawBody(body)
  }

  return (
    <div>
      <div>
        <BoxSelection
          name="serviceSelfDescriptionOptions"
          options={serviceSelfDescriptionOptions}
          handleChange={(e) => setUserSelection(e.target.value)}
        />
      </div>
      <div>
        {userSelection === 'uri' && <Input type="files" {...props} />}
        {userSelection === 'json' &&
          (!isVerified ? (
            <div>
              <Input type="textarea" {...props} />
              <Button
                style="primary"
                disabled={isLoading || !field.value}
                onClick={(e) => handleButtonClick(e, field.value)}
              >
                Verify
              </Button>
            </div>
          ) : (
            <Markdown text={getFormattedCodeString(field.value)} />
          ))}
      </div>
    </div>
  )
}
