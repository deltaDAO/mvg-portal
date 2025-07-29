import { FormComputeData, StepContent, ComputeFeedback } from './_types'
import SelectAlgorithm from './SelectAlgorithm'
import SelectEnvironment from './SelectEnvironment'
import ConfigureEnvironment from './ConfigureEnvironment'
import Review from './Review'

export const wizardSteps: StepContent[] = [
  {
    step: 1,
    title: 'Select Algorithm',
    component: <SelectAlgorithm />
  },
  {
    step: 2,
    title: 'Select C2D Environment',
    component: <SelectEnvironment />
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
  environment: null,
  cpu: 4,
  gpu: 0,
  ram: 8,
  disk: 100,
  environmentData: '',
  makeAvailable: false,
  description: '',
  step1Completed: false,
  step2Completed: false,
  step3Completed: false,
  step4Completed: false
}

export const initialComputeFeedback: ComputeFeedback = {
  '1': {
    name: 'Select Algorithm',
    description: 'Selecting algorithm for compute job',
    status: 'pending',
    txCount: 0
  },
  '2': {
    name: 'Select Environment',
    description: 'Selecting C2D environment',
    status: 'pending',
    txCount: 0
  },
  '3': {
    name: 'Configure Environment',
    description: 'Configuring compute environment',
    status: 'pending',
    txCount: 0
  },
  '4': {
    name: 'Purchase Compute Job',
    description: 'Purchasing compute job',
    status: 'pending',
    txCount: 0
  }
}
