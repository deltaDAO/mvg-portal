import { useField } from 'formik'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  getFormattedCodeString,
  signServiceSD,
  storeRawServiceSD
} from '../../../utils/metadata'
import Button from '../../atoms/Button'
import Input, { InputProps } from '../../atoms/Input'
import Loader from '../../atoms/Loader'
import Markdown from '../../atoms/Markdown'
import BoxSelection from './BoxSelection'
import styles from './ServiceSelfDescription.module.css'

const serviceSelfDescriptionOptions = [
  {
    name: 'url',
    checked: false,
    title: 'Url'
  },
  {
    name: 'raw',
    checked: false,
    title: 'Raw'
  }
]

export default function ServiceSelfDescription(
  props: InputProps
): ReactElement {
  const [field, meta, helpers] = useField(props.name)
  const [userSelection, setUserSelection] = useState<string>()
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rawServiceSDPreview, setRawServiceSDPreview] = useState<string>()

  const verifyRawBody = async (rawServiceSD: string) => {
    try {
      setIsLoading(true)

      const parsedServiceSD = JSON.parse(rawServiceSD)
      const signedServiceSD = parsedServiceSD?.complianceCredential
        ? parsedServiceSD
        : await signServiceSD(parsedServiceSD)

      const { verified, storedSdUrl } = await storeRawServiceSD(signedServiceSD)
      setIsVerified(verified)

      if (!verified) {
        toast.error(
          'The data you entered appears to be invalid. Please check the provided service self-description and try again'
        )
        return
      }

      setRawServiceSDPreview(signedServiceSD)
      helpers.setValue([{ url: storedSdUrl }])
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
    setIsVerified(false)
  }, [userSelection])

  const handleVerify = async (e: React.FormEvent<Element>, body: string) => {
    helpers.setTouched(false)

    e.preventDefault()

    verifyRawBody(body)
  }

  const handleEdit = (e: React.FormEvent<Element>) => {
    helpers.setTouched(false)
    e.preventDefault()

    helpers.setValue(JSON.stringify(field.value[0].raw, null, 4))
    setIsVerified(false)
  }

  return (
    <div>
      <div>
        <BoxSelection
          name="serviceSelfDescriptionOptions"
          options={serviceSelfDescriptionOptions}
          handleChange={(e) => {
            helpers.setValue(undefined)
            setUserSelection(e.target.value)
          }}
        />
      </div>
      <div>
        {userSelection === 'url' && <Input type="files" {...props} />}
        {userSelection === 'raw' &&
          (!isVerified ? (
            <div className={styles.inputContainer}>
              <Input type="textarea" {...props} placeholder="" />
              <Button
                disabled={!field.value}
                style="primary"
                onClick={(e) => handleVerify(e, field.value)}
              >
                {!isLoading ? 'Verify' : <Loader />}
              </Button>
            </div>
          ) : (
            <div className={styles.previewContainer}>
              <Markdown text={getFormattedCodeString(rawServiceSDPreview)} />
              <Button style="text" onClick={(e) => handleEdit(e)}>
                Edit
              </Button>
            </div>
          ))}
      </div>
    </div>
  )
}
