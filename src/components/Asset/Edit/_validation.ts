import { FileInfo } from '@oceanprotocol/lib'
import * as Yup from 'yup'
import { isAddress } from 'ethers/lib/utils'
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
          then: (shema) => shema.required('Required')
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
        then: (shema) => shema.required('Required')
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
  name: Yup.string().when('type', {
    is: 'staticVpPolicy',
    then: (shema) => shema.required('Required')
  }),
  policy: Yup.string().when('type', {
    is: 'argumentVpPolicy',
    then: (shema) => shema.required('Required')
  }),
  args: Yup.number().when('type', {
    is: 'argumentVpPolicy',
    then: (shema) => shema.required('Required')
  })
}

const validationCredentials = {
  requestCredentials: Yup.array().of(
    Yup.object().shape(validationRequestCredentials)
  ),
  vcPolicies: Yup.array().of(Yup.string().required('Required')),
  vpPolicies: Yup.array().of(Yup.object().shape(validationVpPolicy)),
  allow: Yup.array().of(Yup.string()).nullable(),
  deny: Yup.array().of(Yup.string()).nullable()
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
  }),
  additionalDdos: Yup.array()
    .of(
      Yup.object().shape({
        data: Yup.string().required('Required'),
        type: Yup.string().required('Required')
      })
    )
    .nullable(),
  credentials: Yup.object().shape(validationCredentials)
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
  deny: Yup.array().of(Yup.string()).nullable(),
  credentials: Yup.object().shape(validationCredentials)
})
