import React, { ReactElement, useEffect } from 'react'
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

  const signMessage = async (): Promise<string> => {
    const url = `${vpRegistryUri}/signature/message`
    try {
      const response: RegistryApiResponse<SignatureMessageBody> =
        await axios.get(url)

      const signature = await ocean.utils.signature.signText(
        response.data.data.message,
        accountId
      )

      return signature
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
    signature: string,
    cancelTokenSource: CancelTokenSource
  ): Promise<void> => {
    try {
      const url = `${vpRegistryUri}/vp`
      const method: AxiosRequestConfig['method'] = 'POST'
      const data: RegisterVPPayload = {
        signature: signature,
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
    const cancelTokenSource = axios.CancelToken.source()

    // Get signature from user to register VP
    const signature = await signMessage()

    // Register VP with the registry
    signature &&
      (await registerVp(values.file as File[], signature, cancelTokenSource))
  }

  return (
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
