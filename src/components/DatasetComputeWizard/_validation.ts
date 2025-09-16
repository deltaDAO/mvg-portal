import * as Yup from 'yup'
import { FormComputeData } from './_types'

export const validationSchema: Yup.SchemaOf<FormComputeData> = Yup.object()
  .shape({
    user: Yup.object().shape({
      stepCurrent: Yup.number().required(),
      accountId: Yup.string().required(),
      chainId: Yup.number().required()
    }),
    algorithm: Yup.object().nullable().required('Algorithm is required'),
    computeEnv: Yup.object().nullable().required('Environment is required'),
    cpu: Yup.number().min(0).required('CPU is required'),
    gpu: Yup.number().min(0).required('GPU is required'),
    ram: Yup.number().min(0).required('RAM is required'),
    disk: Yup.number().min(0).required('Disk is required'),
    jobDuration: Yup.number().min(0).required('Job duration is required'),
    environmentData: Yup.string(),
    makeAvailable: Yup.boolean(),
    description: Yup.string(),
    termsAndConditions: Yup.boolean().oneOf(
      [true],
      'Terms and conditions must be accepted'
    ),
    acceptPublishingLicense: Yup.boolean().oneOf(
      [true],
      'Publishing license must be accepted'
    ),
    credentialsVerified: Yup.boolean().oneOf(
      [true],
      'Dataset & Algorithm credentials must be verified'
    ),
    step1Completed: Yup.boolean(),
    step2Completed: Yup.boolean(),
    step3Completed: Yup.boolean(),
    step4Completed: Yup.boolean(),
    step5Completed: Yup.boolean(),
    step6Completed: Yup.boolean()
  })
  .required()
