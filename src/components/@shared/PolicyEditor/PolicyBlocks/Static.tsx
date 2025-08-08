import { ReactElement } from 'react'
import { Field } from 'formik'
import Button from '../../atoms/Button'
import Input from '../../FormInput'
import { getFieldContent } from '@utils/form'
import styles from './Block.module.css'
import fields from '../editor.json'
import DeleteButton from '../../DeleteButton/DeleteButton'
import InputGroup from '../../FormInput/InputGroup'

interface StaticPolicyBlockProps {
  name: string
  index: number
  innerIndex?: number
  policy: any
  onDelete: () => void
  readOnly?: boolean
}

export default function StaticPolicyBlock({
  name,
  index,
  innerIndex,
  policy,
  onDelete,
  readOnly = false
}: StaticPolicyBlockProps): ReactElement {
  const fieldName =
    innerIndex !== undefined
      ? `${name}.requestCredentials[${index}].policies[${innerIndex}].name`
      : `${name}.vcPolicies[${index}]`

  return (
    <div className={styles.block}>
      <InputGroup>
        <Field
          {...getFieldContent('staticPolicy', fields)}
          component={Input}
          name={fieldName}
          readOnly={readOnly}
          className={styles.policyInput}
          selectStyle="default"
        />
        <DeleteButton onClick={onDelete} disabled={readOnly} />
      </InputGroup>
    </div>
  )
}
