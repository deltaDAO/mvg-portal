import React from 'react'
import { ComputeFlow, FormComputeData, StepContent } from './_types'
import { initialValues } from './_constants'

export function createInitialValues(flow: ComputeFlow): FormComputeData {
  const clonedValues = JSON.parse(
    JSON.stringify(initialValues)
  ) as FormComputeData
  return {
    ...clonedValues,
    flow
  }
}

function createStep(step: number, title: string): StepContent {
  return { step, title, component: React.createElement('div') }
}

export function getDatasetSteps(
  hasUserParamsStep: boolean,
  withoutDataset: boolean
): StepContent[] {
  const steps: StepContent[] = [createStep(1, 'Select Datasets')]

  if (withoutDataset) {
    let stepCounter = 2

    if (hasUserParamsStep) {
      steps.push(createStep(stepCounter++, 'User Parameters'))
    }

    steps.push(
      createStep(stepCounter++, 'Select C2D Environment'),
      createStep(stepCounter++, 'C2D Environment Configuration'),
      createStep(stepCounter, 'Review')
    )

    return steps
  }

  steps.push(
    createStep(2, 'Select Services'),
    createStep(3, 'Preview Selected Datasets & Services')
  )

  if (hasUserParamsStep) {
    steps.push(
      createStep(4, 'User Parameters'),
      createStep(5, 'Select C2D Environment'),
      createStep(6, 'C2D Environment Configuration'),
      createStep(7, 'Review')
    )
  } else {
    steps.push(
      createStep(4, 'Select C2D Environment'),
      createStep(5, 'C2D Environment Configuration'),
      createStep(6, 'Review')
    )
  }

  return steps
}
