import { FileInfo } from '@oceanprotocol/lib'
import * as Yup from 'yup'
import { isAddress } from 'ethers'
import { MAX_DECIMALS } from '@utils/constants'
import { getMaxDecimalsValidation } from '@utils/numbers'
import { testLinks } from '@utils/yup'
import { validationConsumerParameters } from '@shared/FormInput/InputElement/ConsumerParameters/_validation'

const validationRequestCredentials = {
  format: Yup.string().required('Required'),
  type: Yup.string().required('Required'),
  policies: Yup.array().of(
    Yup.object().shape({
      type: Yup.string(),
      name: Yup.string()
        .when('type', {
          is: 'staticPolicy',
          then: (shema) => shema.required('Required')
        })
        .when('type', {
          is: 'customUrlPolicy',
          then: (shema) => shema.required('Required')
        })
        .when('type', {
          is: 'customPolicy',
          then: (shema) =>
            shema
              .required('Required')
              .matches(/^[A-Za-z]+$/, 'Only letters A–Z are allowed')
        }),
      args: Yup.array().when('type', {
        is: 'parameterizedPolicy',
        then: (shema) => shema.of(Yup.string().required('Required'))
      }),
      policy: Yup.string().when('type', {
        is: 'parameterizedPolicy',
        then: (shema) => shema.required('Required')
      }),
      policyUrl: Yup.string().when('type', {
        is: 'customUrlPolicy',
        then: (shema) =>
          shema
            .required('Required')
            .test('isValidUrl', 'Invalid URL format', (value) => {
              if (!value) return false
              const trimmedValue = value.trim()
              if (
                !trimmedValue.startsWith('http://') &&
                !trimmedValue.startsWith('https://')
              ) {
                return false
              }
              try {
                const url = new URL(trimmedValue)
                return url.protocol === 'http:' || url.protocol === 'https:'
              } catch {
                return false
              }
            })
      }),
      arguments: Yup.array()
        .when('type', {
          is: 'customUrlPolicy',
          then: (shema) =>
            shema.of(
              Yup.object().shape({
                name: Yup.string().required('Required'),
                value: Yup.string().required('Required')
              })
            )
        })
        .when('type', {
          is: 'customPolicy',
          then: (shema) =>
            shema.of(
              Yup.object().shape({
                name: Yup.string().required('Required'),
                value: Yup.string().required('Required')
              })
            )
        }),
      rules: Yup.array().when('type', {
        is: 'customPolicy',
        then: (shema) =>
          shema.of(
            Yup.object().shape({
              leftValue: Yup.string().required('Required'),
              operator: Yup.string().required('Required'),
              rightValue: Yup.string().required('Required')
            })
          )
      })
    })
  )
}

const validationVpPolicy = {
  type: Yup.string().required('Required'),
  name: Yup.mixed().when('type', {
    is: 'staticVpPolicy',
    then: (shema) =>
      shema.test('static-name', 'Required', (value) => {
        if (typeof value === 'string') return value.trim().length > 0
        if (
          value &&
          typeof value === 'object' &&
          typeof (value as any).policy === 'string'
        ) {
          return (value as any).policy.trim().length > 0
        }
        return false
      })
  }),
  policy: Yup.string().when('type', {
    is: 'argumentVpPolicy',
    then: (shema) => shema.required('Required')
  }),
  args: Yup.string().when('type', {
    is: 'argumentVpPolicy',
    then: (shema) => shema.required('Required')
  }),
  url: Yup.string().when('type', {
    is: 'externalEvpForwardVpPolicy',
    then: (shema) =>
      shema.test('isValidUrlOpt', 'Invalid URL format', (value) => {
        // Optional here to avoid transient invalid state; main enforcement occurs on credentials.externalEvpForwardUrl
        if (!value) return true
        const trimmedValue = value.trim()
        const pattern = /^https?:\/\/\S+$/i
        return pattern.test(trimmedValue)
      })
  })
}

const validationCredentials = {
  requestCredentials: Yup.array().of(
    Yup.object().shape(validationRequestCredentials)
  ),
  vcPolicies: Yup.array().of(Yup.string().required('Required')),
  vpPolicies: Yup.array().of(Yup.object().shape(validationVpPolicy)),
  allow: Yup.array().of(Yup.string()).nullable(),
  deny: Yup.array().of(Yup.string()).nullable(),
  allowInputValue: Yup.string().nullable(),
  externalEvpForwardUrl: Yup.string().test(
    'external-evp-url',
    'Invalid URL format',
    function (value) {
      const vpPolicies = (this.parent as any)?.vpPolicies || []
      const hasExternal = vpPolicies.some(
        (p: any) => p?.type === 'externalEvpForwardVpPolicy'
      )
      if (!hasExternal) return true

      if (!value) return false
      const trimmedValue = value.trim()
      // Accept any http(s) URL format without strict parsing to avoid false negatives
      const pattern = /^https?:\/\/\S+$/i
      return pattern.test(trimmedValue)
    }
  )
}

export const metadataValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, (param) => `Title must be at least ${param.min} characters`)
    .required('Required'),
  description: Yup.string().required('Required').min(10),
  links: Yup.array<FileInfo[]>().of(
    Yup.object().shape({
      url: testLinks(true),
      valid: Yup.boolean().test((value, context) => {
        const { valid, url } = context.parent

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
  credentials: Yup.object().shape(validationCredentials),
  allow: Yup.array().of(Yup.string()).nullable(),
  deny: Yup.array().of(Yup.string()).nullable(),
  retireAsset: Yup.string(),
  useRemoteLicense: Yup.boolean(),
  licenseUrl: Yup.array().when('useRemoteLicense', {
    is: false,
    then: Yup.array().test('urlTest', (array, context) => {
      if (!array || !array[0]) {
        return context.createError({ message: `Need a valid url` })
      }
      const { url, valid } = array[0] as {
        url: string
        type: 'url'
        valid: boolean
      }
      if (!url || url.length === 0) {
        return context.createError({ message: `Need a valid url` })
      }
      // Only check valid flag if validation has been attempted (valid is not undefined)
      if (valid !== undefined && !valid) {
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
  }),
  additionalDdos: Yup.array()
    .of(
      Yup.object().shape({
        data: Yup.string().required('Required'),
        type: Yup.string().required('Required')
      })
    )
    .nullable()
})

export const serviceValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, (param) => `Name must be at least ${param.min} characters`)
    .required('Required'),
  description: Yup.string().required('Required').min(10),
  price: Yup.number()
    .required('Required')
    .min(1, 'Price must be at least 1')
    .max(
      1000000,
      (param: { max: number }) => `Must be less than or equal to ${param.max}`
    )
    .test(
      'maxDigitsAfterDecimal',
      `Must have maximum ${MAX_DECIMALS} decimal digits`,
      (param) => getMaxDecimalsValidation(MAX_DECIMALS).test(param?.toString())
    ),
  files: Yup.array()
    .of(
      Yup.object().shape({
        url: Yup.string().nullable(),
        type: Yup.string().nullable(),
        valid: Yup.boolean().nullable()
      })
    )
    .test('files-validation', 'Please provide a valid file', function (files) {
      const fileList = files || []
      const hasEncryptedFile = fileList.some(
        (file: any) =>
          file?.type === 'hidden' && (!file?.url || file.url.trim() === '')
      )

      if (hasEncryptedFile) {
        return true
      }
      if (fileList.length === 0) {
        return this.createError({ message: 'At least one file is required' })
      }
      const hasValidFile = fileList.some(
        (file: any) => file?.url?.trim() && file.valid !== false
      )
      return (
        hasValidFile ||
        this.createError({ message: 'Please provide a valid file URL' })
      )
    }),
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
  allowAllPublishedAlgorithms: Yup.string().nullable(),
  publisherTrustedAlgorithms: Yup.array().nullable(),
  publisherTrustedAlgorithmPublishers: Yup.string().nullable(),
  credentials: Yup.object().shape(validationCredentials)
})

export const newServiceValidationSchema = serviceValidationSchema.shape({
  price: Yup.number()
    .required('Required')
    .min(0, 'Price must be at least 0')
    .max(
      1000000,
      (param: { max: number }) => `Must be less than or equal to ${param.max}`
    )
    .test(
      'maxDigitsAfterDecimal',
      `Must have maximum ${MAX_DECIMALS} decimal digits`,
      (param) => getMaxDecimalsValidation(MAX_DECIMALS).test(param?.toString())
    )
})
