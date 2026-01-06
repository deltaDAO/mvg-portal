import * as Yup from 'yup'
import { FormComputeData } from './_types'

const datasetArraySchema = Yup.array().of(Yup.mixed())

export const validationSchema: Yup.SchemaOf<FormComputeData> = Yup.object()
  .shape({
    flow: Yup.mixed<'dataset' | 'algorithm'>().oneOf(
      ['dataset', 'algorithm'],
      'Invalid flow'
    ),
    user: Yup.object().shape({
      stepCurrent: Yup.number().required(),
      accountId: Yup.string().required(),
      chainId: Yup.number().required()
    }),
    algorithm: Yup.mixed()
      .nullable()
      .when('flow', {
        is: 'algorithm',
        then: (schema) => schema.notRequired(),
        otherwise: (schema) => schema.required('Algorithm is required')
      }),
    algorithms: Yup.mixed().nullable(),
    dataset: datasetArraySchema.nullable().when(['withoutDataset', 'flow'], {
      is: (withoutDataset: boolean, flow?: string) =>
        !withoutDataset && flow === 'algorithm',
      then: (schema) => schema.min(1, 'At least one dataset is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    datasets: datasetArraySchema.nullable().when(['withoutDataset', 'flow'], {
      is: (withoutDataset: boolean, flow?: string) =>
        !withoutDataset && flow === 'algorithm',
      then: (schema) => schema.min(1, 'At least one dataset is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    computeEnv: Yup.mixed().nullable().required('Environment is required'),
    mode: Yup.mixed<'free' | 'paid'>().oneOf(['free', 'paid']).required(),
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
    isUserParameters: Yup.boolean(),
    userUpdatedParameters: Yup.mixed().nullable(),
    updatedGroupedUserParameters: Yup.mixed().nullable(),
    serviceSelected: Yup.boolean(),
    withoutDataset: Yup.boolean(),
    step1Completed: Yup.boolean(),
    step2Completed: Yup.boolean(),
    step3Completed: Yup.boolean(),
    step4Completed: Yup.boolean(),
    step5Completed: Yup.boolean(),
    step6Completed: Yup.boolean(),
    step7Completed: Yup.boolean(),
    dataServiceParams: Yup.mixed().nullable(),
    datasetServiceParams: Yup.mixed().nullable(),
    algoServiceParams: Yup.mixed().nullable(),
    algorithmServiceParams: Yup.mixed().nullable(),
    algoParams: Yup.mixed().nullable(),
    algorithmServices: Yup.array().of(
      Yup.object().shape({
        id: Yup.string().optional(),
        name: Yup.string().optional(),
        title: Yup.string().optional(),
        serviceDescription: Yup.string().optional(),
        type: Yup.string().optional(),
        duration: Yup.mixed().optional(),
        price: Yup.string().optional(),
        symbol: Yup.string().optional(),
        checked: Yup.boolean().optional()
      })
    ),
    algorithmDetails: Yup.object()
      .shape({
        id: Yup.string().required(),
        name: Yup.string().required(),
        price: Yup.string().required(),
        duration: Yup.string().required()
      })
      .nullable(),
    computeResources: Yup.object()
      .shape({
        price: Yup.string().required(),
        duration: Yup.string().required()
      })
      .nullable(),
    marketFees: Yup.object()
      .shape({
        dataset: Yup.string().required(),
        algorithm: Yup.string().required(),
        c2d: Yup.string().required()
      })
      .nullable(),
    totalPrice: Yup.string().nullable(),
    escrowFunds: Yup.string().required(),
    jobPrice: Yup.string().required()
  })
  .required()
