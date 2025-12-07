import { ComputeFlow, FormComputeData } from './_types'

export const initialValues: FormComputeData = {
  flow: 'dataset',
  user: {
    stepCurrent: 1,
    chainId: 100,
    accountId: ''
  },
  algorithm: null,
  algorithms: null,
  dataset: [],
  datasets: [],
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
  isUserParameters: false,
  userUpdatedParameters: null,
  updatedGroupedUserParameters: null,
  serviceSelected: false,
  withoutDataset: false,
  step1Completed: false,
  step2Completed: false,
  step3Completed: false,
  step4Completed: false,
  step5Completed: false,
  step6Completed: false,
  step7Completed: false,
  dataServiceParams: null,
  datasetServiceParams: null,
  algoServiceParams: null,
  algorithmServiceParams: null,
  algoParams: {},
  algorithmServices: [],
  algorithmDetails: null,
  computeResources: null,
  marketFees: null,
  totalPrice: '0',
  escrowFunds: '0',
  jobPrice: '0'
}

export function createInitialValues(flow: ComputeFlow): FormComputeData {
  const clonedValues = JSON.parse(
    JSON.stringify(initialValues)
  ) as FormComputeData
  return {
    ...clonedValues,
    flow
  }
}
