import React, { ReactElement, useEffect, useState } from 'react'
import { Formik } from 'formik'
import { File, Logger } from '@oceanprotocol/lib'
import VerifyForm from './VerifyForm'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios'
import { useSiteMetadata } from '../../../../hooks/useSiteMetadata'
import {
  RegisterVPPayload,
  RegistryApiResponse,
  SignatureMessageBody,
  VpDataBody
} from '../../../../@types/Verification'
import { useOcean } from '../../../../providers/Ocean'
import { getOceanConfig } from '../../../../utils/ocean'
import { useWeb3 } from '../../../../providers/Web3'
import Loader from '../../../atoms/Loader'

interface VerifyFormData {
  file: string | File[]
}

const initialValues = {
  file: ''
}

const validationSchema = Yup.object().shape({
  // ---- required fields ----
  file: Yup.array<File>()
    .required('Enter a valid URL and click "ADD FILE"')
    .nullable()
})

export default function Verify({
  accountIdentifier
}: {
  accountIdentifier: string
}): ReactElement {
  const { ocean, connect } = useOcean()
  const { accountId, networkId } = useWeb3()

  const [loading, setLoading] = useState<boolean>(false)
  const [loadMessage, setLoadMessage] = useState<string>()

  const { vpRegistryUri } = useSiteMetadata().appConfig

  useEffect(() => {
    async function initOcean() {
      const oceanInitialConfig = getOceanConfig(networkId)
      await connect(oceanInitialConfig)
    }
    if (ocean === undefined) {
      initOcean()
    }
  }, [networkId, ocean, connect])

  const signMessage = async (): Promise<{
    message: string
    signature: string
  }> => {
    const url = `${vpRegistryUri}/signature/message`
    try {
      const response: RegistryApiResponse<SignatureMessageBody> =
        await axios.get(url)

      const { message } = response.data.data

      const signature = await ocean.utils.signature.signText(message, accountId)

      return {
        message,
        signature
      }
    } catch (error) {
      Logger.error(error.message)
      if (error.code === 4001) {
        // User rejected signature (4001)
        toast.error(error.message)
      } else {
        toast.error('Error requesting message from the registry.')
      }
    }
  }

  const registerVp = async (
    file: File[],
    message: string,
    signature: string,
    cancelTokenSource: CancelTokenSource
  ): Promise<void> => {
    try {
      const url = `${vpRegistryUri}/vp`
      const method: AxiosRequestConfig['method'] = 'POST'
      const data: RegisterVPPayload = {
        signature: signature,
        hashedMessage: message,
        fileUrl: file[0].url
      }
      const response: RegistryApiResponse<VpDataBody> = await axios.request({
        method,
        url,
        data,
        cancelToken: cancelTokenSource.token
      })

      Logger.log(
        'Registered a Verifiable Presentation. Explore at blockscout:',
        response.data.data.transactionHash
      )
      toast.success(`Verifiable Presentation succesfully registered!`)
    } catch (error) {
      // TODO: improve error messages for user?

      toast.error(
        'Error registering Verifiable Presentation with the registry.'
      )
      if (axios.isCancel(error)) {
        cancelTokenSource.cancel()
        Logger.log(error.message)
      } else {
        Logger.error(error.message)
      }
    }
  }

  const handleSubmit = async (values: VerifyFormData): Promise<void> => {
    console.log(ocean)
    if (!accountId || accountIdentifier !== accountId) {
      toast.error('Could not submit. Please log in with your wallet first.')
      return
    }
    setLoading(true)
    const cancelTokenSource = axios.CancelToken.source()
    setLoadMessage('Awaiting User Signature...')
    // Get signature from user to register VP
    const { signature, message } = await signMessage()
    setLoadMessage('Registering Verifiable Presentation...')
    // Register VP with the registry
    signature &&
      (await registerVp(
        values.file as File[],
        message,
        signature,
        cancelTokenSource
      ))
    setLoading(false)
  }

  return loading ? (
    <Loader message={loadMessage} />
  ) : (
    <Formik
      initialValues={initialValues}
      initialStatus="empty"
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        await handleSubmit(values)
      }}
    >
      <VerifyForm accountIdentifier={accountIdentifier} />
    </Formik>
  )
}
