import Input from '@shared/FormInput'
import { Field } from 'formik'
import { ReactElement } from 'react'
import content from '../../../../content/publish/form.json'
import { getFieldContent } from '@utils/form'

export default function PoliciesFields(): ReactElement {
  return (
    <>
      <Field
        {...getFieldContent('timeout', content.policies.fields)}
        component={Input}
        name="policies.timeout"
      />
      <Field
        {...getFieldContent('allow', content.policies.fields)}
        component={Input}
        name="policies.allow"
      />
      <Field
        {...getFieldContent('deny', content.policies.fields)}
        component={Input}
        name="policies.deny"
      />

      {/*
       Licensing and Terms
      */}
      <Field
        {...getFieldContent('license', content.metadata.fields)}
        component={Input}
        name="metadata.license"
      />
      <Field
        {...getFieldContent(
          'accessTermsAndConditions',
          content.metadata.fields
        )}
        component={Input}
        name="metadata.gaiaXInformation.termsAndConditions"
      />
    </>
  )
}
