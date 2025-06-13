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
  policy: any
  onDelete: () => void
  readOnly?: boolean
}

export default function StaticPolicyBlock({
  name,
  index,
  policy,
  onDelete,
  readOnly = false
}: StaticPolicyBlockProps): ReactElement {
  return (
    <div className={styles.block}>
      <InputGroup>
        <Field
          {...getFieldContent('staticPolicy', fields)}
          component={Input}
          name={`${name}.vcPolicies[${index}]`}
          readOnly={readOnly}
          className={styles.policyInput}
        />
        <DeleteButton onClick={onDelete} disabled={readOnly} />
      </InputGroup>
    </div>
  )
}
