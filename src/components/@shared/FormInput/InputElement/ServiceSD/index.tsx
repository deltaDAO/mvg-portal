import React, { ReactElement, useEffect, useState } from 'react'
import { useField } from 'formik'
import { toast } from 'react-toastify'
import Input, { InputProps } from '../..'
import BoxSelection from '../BoxSelection'
import Button from '@components/@shared/atoms/Button'
import Markdown from '@components/@shared/Markdown'
import Loader from '@components/@shared/atoms/Loader'
import styles from './index.module.css'
import {
  getFormattedCodeString,
  getServiceSD,
  signServiceSD,
  storeRawServiceSD,
  verifyRawServiceSD
} from '@components/Publish/_utils'
import URLInput from '../URLInput'
import FileInfo from '../FilesInput/Info'

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

export default function ServiceSD(props: InputProps): ReactElement {
  const [field, meta, helpers] = useField(props.name)
  const [userSelection, setUserSelection] = useState<string>()
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rawServiceSDPreview, setRawServiceSDPreview] = useState<string>()

  const validateUrl = async (url: string): Promise<string> => {
    try {
      setIsLoading(true)
      const serviceSD = await getServiceSD(url)
      const { verified } = await verifyRawServiceSD(serviceSD)
      setIsVerified(verified)

      if (!verified) {
        toast.error(
          'The data file URL you entered appears to be invalid. Please check URL and try again'
        )
        return
      }
      if (!serviceSD) {
        toast.error(
          'The linked file is not accessible. Please verify your service provider allows access from this domain and try again.'
        )
        return
      }

      helpers.setValue({ url, isVerified: verified })
      toast.success('Great! The provided service self-description looks good.')
    } catch (error) {
      toast.error('Could not fetch file info. Please check URL and try again')
      console.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

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
      helpers.setValue({ url: storedSdUrl })
      toast.success('Great! The provided service self-description looks good.')
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
    e.preventDefault()

    if (isLoading) return
    helpers.setTouched(false)

    validateUrl(body)
  }

  const handleEdit = (e: React.FormEvent<Element>) => {
    e.preventDefault()

    helpers.setTouched(false)
    helpers.setValue(JSON.stringify(field.value.raw, null, 4))
    setIsVerified(false)
  }

  return (
    <div>
      {/* Check if there is a url coming from the edit form */}
      {isVerified || (field?.value?.isVerified && field?.value?.url) ? (
        <FileInfo
          file={field.value}
          handleClose={() => {
            setIsVerified(false)
            helpers.setTouched(false)
            helpers.setValue(undefined)
          }}
        />
      ) : (
        <URLInput
          submitText="Validate"
          {...props}
          name={`${field.name}[0].url`}
          isLoading={isLoading}
          handleButtonClick={handleVerify}
          checkUrl={true}
          storageType="url"
        />
      )}
    </div>
  )
}
