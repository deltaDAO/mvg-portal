import { ReactElement } from 'react'
import { UserCustomParameters } from '@oceanprotocol/lib'

export type ComputeFlow = 'dataset' | 'algorithm'

export type UserParameterOption = Record<string, string>

export type UserParameter = {
  name?: string
  label?: string
  description?: string
  type?: string
  required?: boolean
  default?: string | number | boolean | null
  value?: string | number | boolean | null
  options?: UserParameterOption[]
}

export type DatasetServiceUserParams = {
  serviceId?: string
  serviceName?: string
  serviceDescription?: string
  serviceDuration?: string | number
  serviceType?: string
  userParameters?: UserParameter[]
}

export type DatasetItemUserParams = {
  did?: string
  id?: string
  name?: string
  services?: DatasetServiceUserParams[]
}

export interface FormComputeData {
  flow?: ComputeFlow
  user: {
    stepCurrent: number
    accountId: string
    chainId: number
  }
  algorithm?: any
  algorithms?: any
  dataset?: any
  datasets?: Array<{
    did?: string
    id?: string
    name: string
    services: Array<{
      id: string
      name: string
      price: string
      duration: string
    }>
    credentialsStatus?: 'pending' | 'valid' | 'invalid'
    credentialsValidUntil?: Date
  }>
  computeEnv?: any
  mode?: 'free' | 'paid'
  cpu: number
  gpu: number
  ram: number
  disk: number
  jobDuration: number
  environmentData: string
  makeAvailable: boolean
  description: string
  termsAndConditions: boolean
  acceptPublishingLicense: boolean
  credentialsVerified: boolean
  isUserParameters: boolean
  userUpdatedParameters: any
  updatedGroupedUserParameters?: any
  serviceSelected: boolean
  withoutDataset: boolean
  step1Completed: boolean
  step2Completed: boolean
  step3Completed: boolean
  step4Completed: boolean
  step5Completed?: boolean
  step6Completed?: boolean
  step7Completed?: boolean
  dataServiceParams?: any
  datasetServiceParams?: any
  algoServiceParams?: any
  algorithmServiceParams?: any
  algoParams?: UserCustomParameters
  algorithmServices?: Array<{
    id?: string
    name?: string
    title?: string
    serviceDescription?: string
    type?: string
    duration?: string | number
    price?: string
    symbol?: string
    checked?: boolean
  }>
  algorithmDetails?: {
    id: string
    name: string
    price: string
    duration: string
  }
  computeResources?: {
    price: string
    duration: string
  }
  marketFees?: {
    dataset: string
    algorithm: string
    c2d: string
  }
  totalPrice?: string
  escrowFunds: string
  jobPrice: string
}

export interface StepContent {
  step: number
  title: string
  component: ReactElement
}

export interface ComputeFeedback {
  [key: string]: {
    name: string
    description: string
    status: 'success' | 'error' | 'pending' | 'active' | string
    txCount: number
    errorMessage?: string
    txHash?: string
  }
}
