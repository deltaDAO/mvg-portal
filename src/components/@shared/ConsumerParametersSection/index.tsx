import { Field, useFormikContext } from 'formik'
import { ReactElement } from 'react'
import Input from '@shared/FormInput'
import { getFieldContent } from '@utils/form'
import consumerParametersContent from '../../../../content/publish/consumerParameters.json'
import content from '../../../../content/publish/form.json'
import SectionContainer from '../SectionContainer/SectionContainer'
import { FormPublishData } from '../../Publish/_types'

interface ConsumerParametersSectionProps {
  title?: string
  fieldNamePrefix: string
  type?: 'publishConsumerParameters' | 'consumerParameters'
  help?: string
}

export default function ConsumerParametersSection({
  title = 'Consumer Parameters',
  fieldNamePrefix,
  type = 'consumerParameters',
  help
}: ConsumerParametersSectionProps): ReactElement {
  const { values } = useFormikContext<FormPublishData>()

  const getFieldValue = (field: string) => {
    const path = `${fieldNamePrefix}.${field}`
    const pathParts = path.split('.')
    let value = values

    for (const part of pathParts) {
      if (part.includes('[') && part.includes(']')) {
        const arrayMatch = part.match(/(.+)\[(\d+)\]/)
        if (arrayMatch) {
          const [, arrayName, index] = arrayMatch
          value = value?.[arrayName]?.[parseInt(index)]
        }
      } else {
        value = value?.[part]
      }
    }
    return value
  }

  const usesConsumerParameters = getFieldValue('usesConsumerParameters')

  return (
    <SectionContainer title={title} help={help}>
      <Field
        {...getFieldContent(
          'usesConsumerParameters',
          fieldNamePrefix.includes('services')
            ? (content as any).services?.fields
            : (content as any).metadata?.fields
        )}
        component={Input}
        name={`${fieldNamePrefix}.usesConsumerParameters`}
      />

      {usesConsumerParameters && (
        <div>
          <Field
            {...getFieldContent(
              'consumerParameters',
              consumerParametersContent.consumerParameters.fields
            )}
            component={Input}
            name={`${fieldNamePrefix}.consumerParameters`}
            type={type}
          />
        </div>
      )}
    </SectionContainer>
  )
}
