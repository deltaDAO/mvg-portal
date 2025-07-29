import { FormComputeData, StepContent } from './_types'
import SelectAlgorithm from './SelectAlgorithm'
import SelectEnvironment from './SelectEnvironment'
import ConfigureEnvironment from './ConfigureEnvironment'
import Review from './Review'

export const wizardSteps: StepContent[] = [
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
  {
    step: 4,
    title: 'Review',
    component: <Review />
  }
]

export const initialValues: FormComputeData = {
  user: {
    stepCurrent: 1,
    chainId: 100,
    accountId: ''
  },
  algorithm: null,
  computeEnv: null,
  cpu: 4,
  gpu: 0,
  ram: 8,
  disk: 100,
  jobDuration: 3600,
  environmentData: '',
  makeAvailable: false,
  description: '',
  termsAndConditions: false,
  acceptPublishingLicense: false,
  step1Completed: false,
  step2Completed: false,
  step3Completed: false,
  step4Completed: false
}
