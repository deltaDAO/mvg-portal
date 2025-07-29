import { ReactElement } from 'react'

export interface FormComputeData {
  user: {
    stepCurrent: number
    accountId: string
    chainId: number
  }
  algorithm: any
  computeEnv: any
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
  step1Completed: boolean
  step2Completed: boolean
  step3Completed: boolean
  step4Completed: boolean
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
