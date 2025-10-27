import { ReactElement } from 'react'
// import type { Dataset } from './SelectServices'
import { UserCustomParameters } from '@oceanprotocol/lib'

export interface FormComputeData {
  user: {
    stepCurrent: number
    accountId: string
    chainId: number
  }
  algorithm?: any
  dataset?: any // Added for algorithm flow - array of dataset IDs
  // datasets?: any // Added for algorithm flow - array of dataset IDs
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
  step1Completed: boolean
  step2Completed: boolean
  step3Completed: boolean
  step4Completed: boolean
  step5Completed?: boolean
  step6Completed?: boolean
  // Added fields required by onSubmit function
  dataServiceParams?: UserCustomParameters // UserCustomParameters - will be properly typed later
  algoServiceParams?: UserCustomParameters // UserCustomParameters - will be properly typed later
  algoParams?: UserCustomParameters // UserCustomParameters - will be properly typed later
  // New fields for multi-dataset support
  datasets?: Array<{
    id: string
    name: string
    services: Array<{
      id: string
      name: string
      price: string
      duration: string
    }>
    credentialsStatus: 'pending' | 'valid' | 'invalid'
    credentialsValidUntil?: Date
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
  // New field for algorithm services
  algorithmServices?: Array<{
    id: string
    name: string
    title: string
    serviceDescription: string
    type: string
    duration: string | number
    price: string
    symbol: string
    checked?: boolean
  }>
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
