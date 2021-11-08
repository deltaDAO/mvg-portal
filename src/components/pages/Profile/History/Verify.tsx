import React, { ReactElement, useEffect, useState } from 'react'
import { Formik, FormikState } from 'formik'
import { File, Logger } from '@oceanprotocol/lib'
import VerifyForm from './VerifyForm'
import * as Yup from 'yup'
import { useWeb3 } from '../../../../providers/Web3'
import { toast } from 'react-toastify'
import { vpStorageUri } from '../../../../../app.config'
import axios, { AxiosResponse } from 'axios'
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

export default function Verify({
  accountIdentifier
}: {
  accountIdentifier: string
}): ReactElement {
  const { accountId } = useWeb3()

  const handleSubmit = async (
    values: VerifyFormData,
    resetForm: (
      nextState?: Partial<FormikState<Partial<VerifyFormData>>>
    ) => void
  ): Promise<void> => {
    try {
      if (!accountId || accountIdentifier !== accountId) {
        toast.error('Could not submit. Please log in with your wallet first')
        return
      }

      console.log(vpStorageUri)

      axios
        .put(`${vpStorageUri}/vp/${accountId}`, {
          vp: (values.vp as File[])[0].url
        })
        .then(() => {
          toast.success('Verifiable Presentation succesfully updated!')
        })
        .catch((error) => {
          if (error.response && error.response.status === 409) {
            // VP is not yet stored
            return axios
              .post(`${vpStorageUri}/vp`, {
                address: accountId,
                vp: (values.vp as File[])[0].url
              })
              .then(() => {
                toast.success('Verifiable Presentation succesfully added!')
              })
          } else throw error
        })
        .catch(() => {
          toast.error('Oops! Something went wrong. Please try again later.')
        })
    } catch (error) {
      Logger.error(error.message)
    }
  }
  return (
    <Formik
      initialValues={initialValues}
      initialStatus="empty"
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        await handleSubmit(values, resetForm)
      }}
    >
      <VerifyForm accountIdentifier={accountIdentifier} />
    </Formik>
  )
}
