import { Field } from 'formik'
import { ReactElement } from 'react'
import Input from '@components/@shared/FormInput'
import { getFieldContent } from '@utils/form'
import content from '../../../../../content/publish/form.json'
import SectionContainer from '../../../@shared/SectionContainer/SectionContainer'

export default function AccessRulesSection(): ReactElement {
  return (
    <SectionContainer title="Access Rules" required>
      <Field
        {...getFieldContent('allow', content.credentials.fields)}
        component={Input}
        name="credentials.allow"
      />
      <Field
        {...getFieldContent('deny', content.credentials.fields)}
        component={Input}
        name="credentials.deny"
      />
    </SectionContainer>
  )
}
