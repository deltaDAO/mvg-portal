import { FormComputeData, StepContent } from './_types'
import SelectAlgorithm from './SelectAlgorithm'
import SelectEnvironment from './SelectEnvironment'
import ConfigureEnvironment from './ConfigureEnvironment'
import Review from './Review'

import { ComputeEnvironment, UserCustomParameters } from '@oceanprotocol/lib'
import * as Yup from 'yup'
import { getDefaultValues } from '../Asset/AssetActions/ConsumerParameters/FormConsumerParameters'
import { getUserCustomParameterValidationSchema } from '../Asset/AssetActions/ConsumerParameters/_validation'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Option } from 'src/@types/ddo/Option'

export const datasetSteps: StepContent[] = [
  {
    step: 1,
    title: 'Select Algorithm',
    component: <SelectAlgorithm algorithms={[]} />
  },
  {
    step: 2,
    title: 'Select C2D Environment',
    component: <SelectEnvironment computeEnvs={[]} />
  },
  {
    step: 3,
    title: 'C2D Environment Configuration',
    component: <ConfigureEnvironment />
  },
  { step: 4, title: 'Review', component: <div /> }
]

export const algorithmSteps: StepContent[] = [
  { step: 1, title: 'Select Datasets', component: <div>Step 1</div> },
  { step: 2, title: 'Select Services', component: <div>Step 2</div> },
  {
    step: 3,
    title: 'Preview Selected Datasets & Services',
    component: <div>Step 3</div>
  },
  { step: 4, title: 'Select C2D Environment', component: <div>Step 4</div> },
  {
    step: 5,
    title: 'C2D Environment Configuration',
    component: <div>Step 5</div>
  },
  { step: 6, title: 'Review', component: <div>Step 6</div> }
]

export const initialValues: FormComputeData = {
  user: {
    stepCurrent: 1,
    chainId: 100,
    accountId: ''
  },
  algorithm: null,
  dataset: [], // Added for algorithm flow
  computeEnv: null,
  mode: 'free',
  cpu: 0,
  gpu: 0,
  ram: 0,
  disk: 0,
  jobDuration: 0,
  environmentData: '',
  makeAvailable: false,
  description: '',
  termsAndConditions: false,
  acceptPublishingLicense: false,
  credentialsVerified: false,
  step1Completed: false,
  step2Completed: false,
  step3Completed: false,
  step4Completed: false,
  // Added fields required by onSubmit
  dataServiceParams: {},
  algoServiceParams: {},
  algoParams: {},
  // These will be populated dynamically
  datasets: [],
  algorithmDetails: null,
  computeResources: null,
  marketFees: null,
  totalPrice: '0'
}

export interface ComputeDatasetForm {
  algorithm: string
  dataset?: string[]
  computeEnv: string
  dataServiceParams: UserCustomParameters
  algoServiceParams: UserCustomParameters
  algoParams: UserCustomParameters
  termsAndConditions: boolean
  acceptPublishingLicense: boolean
}

export function getComputeValidationSchema(
  dataServiceParams: Record<string, string | number | boolean | Option[]>[],
  algoServiceParams: Record<string, string | number | boolean | Option[]>[],
  algoParams: Record<string, string | number | boolean | Option[]>[]
) {
  return Yup.object().shape({
    // algorithm: Yup.string().required('Required'),
    computeEnv: Yup.string().required('Required'),
    dataServiceParams:
      getUserCustomParameterValidationSchema(dataServiceParams),
    algoServiceParams:
      getUserCustomParameterValidationSchema(algoServiceParams),
    algoParams: getUserCustomParameterValidationSchema(algoParams),
    termsAndConditions: Yup.boolean()
      .required('Required')
      .isTrue('Please agree to the Terms and Conditions.'),
    acceptPublishingLicense: Yup.boolean()
      .required('Required')
      .isTrue('Please agree to the Publishing License')
  })
}

export function getInitialValues(
  service: Service,
  selectedAlgorithmAsset?: AssetExtended,
  selectedComputeEnv?: ComputeEnvironment,
  termsAndConditions?: boolean,
  acceptPublishingLicense?: boolean
): ComputeDatasetForm {
  return {
    algorithm: selectedAlgorithmAsset?.id,
    computeEnv: selectedComputeEnv?.id,
    dataServiceParams: getDefaultValues(service.consumerParameters),
    algoServiceParams: getDefaultValues(
      selectedAlgorithmAsset?.credentialSubject?.services[0].consumerParameters
    ),
    algoParams: getDefaultValues(
      selectedAlgorithmAsset?.credentialSubject?.metadata?.algorithm
        .consumerParameters
    ),
    termsAndConditions: !!termsAndConditions,
    acceptPublishingLicense
  }
}
