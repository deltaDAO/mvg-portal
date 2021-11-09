import React, { ReactElement, useEffect, useState } from 'react'
import { Formik, FormikState } from 'formik'
import { File, Logger } from '@oceanprotocol/lib'
import VerifyForm from './VerifyForm'
import * as Yup from 'yup'
import { useWeb3 } from '../../../../providers/Web3'
import { toast } from 'react-toastify'
import { vpStorageUri } from '../../../../../app.config'
import axios, { AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios'
import { useCancelToken } from '../../../../hooks/useCancelToken'
import { reject } from 'lodash'

interface VerifyFormData {
  vp: string | File[]
}

const initialValues = {
  vp: ''
}

const validationSchema = Yup.object().shape({
  // ---- required fields ----
  vp: Yup.array<File>()
    .required('Enter a valid URL and click "ADD FILE"')
    .nullable()
})

const updateVp = async (
  accountId: string,
  vp: File[],
  cancelToken: CancelToken,
  create?: boolean
): Promise<void> => {
  try {
    const url = `${vpStorageUri}/vp${create ? '' : `/${accountId}`}`
    const method: AxiosRequestConfig['method'] = create ? 'POST' : 'PUT'
    const data = {
      address: create ? accountId : undefined,
      vp: vp[0].url
    }

    const response = await axios.request({
      method,
      url,
      data,
      cancelToken
    })

    toast.success(
      `Verifiable Presentation succesfully ${response.data.message}!`
    )
  } catch (error) {
    if (axios.isCancel(error)) {
      toast.error('isCancel')
      Logger.log(error.message)
    } else {
      toast.error('Oops! Something went wrong. Please try again later.')
      Logger.error(error.message)
    }
  }
}

export default function Verify({
  accountIdentifier
}: {
  accountIdentifier: string
}): ReactElement {
  const { accountId } = useWeb3()

  const handleSubmit = async (values: VerifyFormData): Promise<void> => {
    if (!accountId || accountIdentifier !== accountId) {
      toast.error('Could not submit. Please log in with your wallet first')
      return
    }
    const cancelTokenSource = axios.CancelToken.source()

    try {
      const response = await axios.get(`${vpStorageUri}/vp/${accountId}`)

      // VP already exists
      if (response.status === 200)
        await updateVp(accountId, values.vp as File[], cancelTokenSource.token)
    } catch (error) {
      if (error.response?.status === 409)
        await updateVp(
          accountId,
          values.vp as File[],
          cancelTokenSource.token,
          true
        )
      else Logger.error(error.message)
    } finally {
      cancelTokenSource.cancel()
    }
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
