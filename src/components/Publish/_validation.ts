import { FileInfo } from '@oceanprotocol/lib'
import { MAX_DECIMALS } from '@utils/constants'
import { getMaxDecimalsValidation } from '@utils/numbers'
import * as Yup from 'yup'
import { testLinks } from '@utils/yup'
import { validationConsumerParameters } from '@components/@shared/FormInput/InputElement/ConsumerParameters/_validation'

// TODO: conditional validation
// e.g. when algo is selected, Docker image is required
// hint, hint: https://github.com/jquense/yup#mixedwhenkeys-string--arraystring-builder-object--value-schema-schema-schema

const validationMetadata = {
  type: Yup.string()
    .matches(/dataset|algorithm/g, { excludeEmptyString: true })
    .required('Required'),
  name: Yup.string()
    .min(4, (param) => `Title must be at least ${param.min} characters`)
    .required('Required'),
  description: Yup.string()
    .min(10, (param) => `Description must be at least ${param.min} characters`)
    .max(
      5000,
      (param) => `Description must have maximum ${param.max} characters`
    )
    .required('Required'),
  tags: Yup.array<string[]>().nullable(),
  dockerImage: Yup.string().when('type', {
    is: 'algorithm',
    then: Yup.string().required('Required')
  }),
  dockerImageCustomChecksum: Yup.string().when('type', {
    is: 'algorithm',
    then: Yup.string().when('dockerImage', {
      is: 'custom',
      then: Yup.string().required('Required')
    })
  }),
  dockerImageCustomEntrypoint: Yup.string().when('type', {
    is: 'algorithm',
    then: Yup.string().when('dockerImage', {
      is: 'custom',
      then: Yup.string().required('Required')
    })
  }),
  termsAndConditions: Yup.boolean()
    .required('Required')
    .isTrue('Please agree to the Terms and Conditions.'),
  dataSubjectConsent: Yup.boolean().when('type', {
    is: 'dataset',
    then: Yup.boolean()
      .required('Required')
      .isTrue("Please confirm the data subject's consent.")
  }),
  usesConsumerParameters: Yup.boolean(),
  consumerParameters: Yup.array().when('type', {
    is: 'algorithm',
    then: Yup.array().when('usesConsumerParameters', {
      is: true,
      then: Yup.array()
        .of(Yup.object().shape(validationConsumerParameters))
        .required('Required'),
      otherwise: Yup.array()
        .nullable()
        .transform((value) => value || null)
    })
  }),
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
}

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

const validationService = {
  files: Yup.array<FileInfo[]>()
    .of(
      Yup.object().shape({
        url: testLinks(),
        valid: Yup.boolean().isTrue().required('File must be valid.')
      })
    )
    .min(1, `At least one file is required.`)
    .required('Enter a valid URL and click ADD FILE.'),
  links: Yup.array<FileInfo[]>()
    .of(
      Yup.object().shape({
        url: testLinks(),
        valid: Yup.boolean()
        // valid: Yup.boolean().isTrue('File must be valid.')
      })
    )
    .nullable(),
  dataTokenOptions: Yup.object().shape({
    name: Yup.string(),
    symbol: Yup.string()
  }),
  timeout: Yup.string().required('Required'),
  access: Yup.string()
    .matches(/compute|access/g)
    .required('Required'),
  providerUrl: Yup.object().shape({
    //    url: Yup.string().url('Must be a valid URL.').required('Required'),
    valid: Yup.boolean().isTrue().required('Valid Provider is required.'),
    custom: Yup.boolean()
  }),
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
  credentials: Yup.object().shape(validationCredentials)
}

const validationPricing = {
  type: Yup.string()
    .matches(/fixed|free/g, { excludeEmptyString: true })
    .required('Required'),
  // https://github.com/jquense/yup#mixedwhenkeys-string--arraystring-builder-object--value-schema-schema-schema

  price: Yup.number()
    .min(1, (param: { min: number }) => `Must be more or equal to ${param.min}`)
    .max(
      1000000,
      (param: { max: number }) => `Must be less than or equal to ${param.max}`
    )
    .test(
      'maxDigitsAfterDecimal',
      `Must have maximum ${MAX_DECIMALS} decimal digits`,
      (param) => getMaxDecimalsValidation(MAX_DECIMALS).test(param?.toString())
    )
    .required('Required')
}

// TODO: make Yup.SchemaOf<FormPublishData> work, requires conditional validation
// of all the custom docker image stuff.
// export const validationSchema: Yup.SchemaOf<FormPublishData> =
export const validationSchema: Yup.SchemaOf<any> = Yup.object().shape({
  user: Yup.object().shape({
    stepCurrent: Yup.number(),
    chainId: Yup.number().required('Required'),
    accountId: Yup.string().required('Required')
  }),
  metadata: Yup.object().shape(validationMetadata),
  services: Yup.array().of(Yup.object().shape(validationService)),
  pricing: Yup.object().shape(validationPricing),
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
