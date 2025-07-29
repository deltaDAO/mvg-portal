import { FormComputeData, StepContent } from './_types'
import SelectAlgorithm from './SelectAlgorithm'
import SelectEnvironment from './SelectEnvironment'
import ConfigureEnvironment from './ConfigureEnvironment'
import Review from './Review'

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
  { step: 4, title: 'Review', component: <Review /> }
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
