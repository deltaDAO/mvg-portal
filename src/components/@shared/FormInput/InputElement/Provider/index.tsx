import { ReactElement, useState } from 'react'
import { useField, useFormikContext } from 'formik'
import UrlInput from '../URLInput'
import { InputProps } from '@shared/FormInput'
import FileInfo from '../FilesInput/Info'
import styles from './index.module.css'
import Button from '@shared/atoms/Button'
import {
  LoggerInstance,
  ProviderInstance,
  getErrorMessage
} from '@oceanprotocol/lib'
import { FormPublishData } from '@components/Publish/_types'
import { getOceanConfig } from '@utils/ocean'
import axios from 'axios'
import { useCancelToken } from '@hooks/useCancelToken'
import { useNetwork } from 'wagmi'
import { toast } from 'react-toastify'

export default function CustomProvider(props: InputProps): ReactElement {
  const { chain } = useNetwork()
  const newCancelToken = useCancelToken()
  const { initialValues, setFieldError } = useFormikContext<FormPublishData>()
  const [field, meta, helpers] = useField(props.name)
  const [isLoading, setIsLoading] = useState(false)

  async function handleValidation(e: React.SyntheticEvent) {
    e.preventDefault()

    try {
      setIsLoading(true)

      // Check if provider is a valid provider
      const isValid = await ProviderInstance.isValidProvider(field.value.url)

      // No way to detect a failed request with ProviderInstance.isValidProvider,
      // making this error show up for multiple cases it shouldn't, like network
      // down.
      if (!isValid) {
        setFieldError(
          `${field.name}.url`,
          '✗ No valid provider detected. Check your network, your URL and try again.'
        )
        LoggerInstance.error(
          '[Custom Provider]:',
          '✗ No valid provider detected. Check your network, your URL and try again.'
        )
        return
      }

      // Check if valid provider is for same chain user is on
      const providerResponse = await axios.get(field.value.url, {
        cancelToken: newCancelToken()
      })
      const userChainId = chain?.id || 32457
      const providerChain =
        providerResponse?.data?.chainId || providerResponse?.data?.chainIds

      const isCompatible =
        providerChain === userChainId
          ? true
          : !!(providerChain.length > 0 && providerChain.includes(userChainId))

      if (!isCompatible) {
        setFieldError(
          `${field.name}.url`,
          '✗ This provider is incompatible with the network your wallet is connected to.'
        )
        LoggerInstance.error(
          '[Custom Provider]:',
          '✗ This provider is incompatible with the network your wallet is connected to.'
        )
        return
      }

      // if all good, add provider to formik state
      helpers.setValue({ url: field.value.url, valid: isValid, custom: true })
    } catch (error) {
      const message = getErrorMessage(error.message)
      setFieldError(`${field.name}.url`, message)
      LoggerInstance.error('[Custom Provider]:', message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleFileInfoClose() {
    helpers.setValue({ url: '', valid: false, custom: true })
    helpers.setTouched(false)
  }

  function handleDefault(e: React.SyntheticEvent) {
    e.preventDefault()

    const oceanConfig = getOceanConfig(chain?.id || 32457)
    const providerUrl =
      oceanConfig?.providerUri || initialValues.services[0].providerUrl.url

    helpers.setValue({ url: providerUrl, valid: true, custom: false })
  }

  return field?.value?.valid === true ? (
    <FileInfo file={field.value} handleClose={handleFileInfoClose} />
  ) : (
    <>
      <UrlInput
        submitText="Validate"
        {...props}
        name={`${field.name}.url`}
        isLoading={isLoading}
        handleButtonClick={handleValidation}
      />
      <Button
        style="text"
        size="small"
        onClick={handleDefault}
        className={styles.default}
      >
        Use Default Provider
      </Button>
    </>
  )
}
