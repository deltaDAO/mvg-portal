import { FileInfo } from '@oceanprotocol/lib'
import * as Yup from 'yup'
import { isAddress } from 'ethers/lib/utils'
import { testLinks } from '@utils/yup'
import { validationConsumerParameters } from '@shared/FormInput/InputElement/ConsumerParameters/_validation'

export const metadataValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, (param) => `Title must be at least ${param.min} characters`)
    .required('Required'),
  description: Yup.string().required('Required').min(10),
  links: Yup.array<FileInfo[]>().of(
    Yup.object().shape({
      url: testLinks(true),
      valid: Yup.boolean().test((value, context) => {
        // allow user to submit if the value is null
        const { valid, url } = context.parent
        // allow user to continue if the url is empty
        if (!url) return true
        return valid
      })
    })
  ),
  tags: Yup.array<string[]>().nullable(),
  usesConsumerParameters: Yup.boolean(),
  consumerParameters: Yup.array().when('usesConsumerParameters', {
    is: true,
    then: Yup.array()
      .of(Yup.object().shape(validationConsumerParameters))
      .required('Required'),
    otherwise: Yup.array()
      .nullable()
      .transform((value) => value || null)
  }),
  allow: Yup.array().of(Yup.string()).nullable(),
  deny: Yup.array().of(Yup.string()).nullable(),
  retireAsset: Yup.string(),
  useRemoteLicense: Yup.boolean(),
  licenseUrl: Yup.array().when('useRemoteLicense', {
    is: false,
    then: Yup.array().test('urlTest', (array, context) => {
      if (!array) {
        return context.createError({ message: `Need a valid url` })
      }
      const { url, valid } = array?.[0] as {
        url: string
        type: 'url'
        valid: boolean
      }
      if (!url || url?.length === 0 || !valid) {
        return context.createError({ message: `Need a valid url` })
      }
      return true
    })
  }),
  uploadedLicense: Yup.object().when('useRemoteLicense', {
    is: true,
    then: Yup.object().test('remoteTest', (license, context) => {
      if (!license) {
        return context.createError({ message: `Need a license file` })
      }
      return true
    })
  })
})

export const serviceValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, (param) => `Name must be at least ${param.min} characters`)
    .required('Required'),
  description: Yup.string().required('Required').min(10),
  price: Yup.number().required('Required'),
  files: Yup.array<FileInfo[]>()
    .of(
      Yup.object().shape({
        url: testLinks(true),
        valid: Yup.boolean().test((value, context) => {
          const { type } = context.parent
          // allow user to submit if the value type is hidden
          if (type === 'hidden') return true
          return value || false
        })
      })
    )
    .nullable(),
  timeout: Yup.string().required('Required'),
  usesConsumerParameters: Yup.boolean(),
  consumerParameters: Yup.array().when('usesConsumerParameters', {
    is: true,
    then: Yup.array()
      .of(Yup.object().shape(validationConsumerParameters))
      .required('Required'),
    otherwise: Yup.array()
      .nullable()
      .transform((value) => value || null)
  }),
  paymentCollector: Yup.string().test(
    'ValidAddress',
    'Must be a valid Ethereum Address.',
    (value) => {
      return isAddress(value)
    }
  ),
  allowAllPublishedAlgorithms: Yup.boolean().nullable(),
  publisherTrustedAlgorithms: Yup.array().nullable(),
  publisherTrustedAlgorithmPublishers: Yup.array().nullable(),
  allow: Yup.array().of(Yup.string()).nullable(),
  deny: Yup.array().of(Yup.string()).nullable()
})
