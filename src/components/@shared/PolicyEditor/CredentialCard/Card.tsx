import { ReactElement } from 'react'
import { Field } from 'formik'
import Input from '../../FormInput'
import { getFieldContent } from '@utils/form'
import styles from './Card.module.css'
import fields from '../editor.json'
import DeleteButton from '../../DeleteButton/DeleteButton'

interface CredentialCardProps {
  index: number
  name: string
  credential: any
  onDelete: () => void
  children?: React.ReactNode
}

export default function CredentialCard({
  index,
  name,
  credential,
  onDelete,
  children
}: CredentialCardProps): ReactElement {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Credential request #{index + 1}</h3>
      </div>

      <div className={styles.typeFormatRow}>
        <Field
          {...getFieldContent('type', fields)}
          component={Input}
          name={`${name}.requestCredentials[${index}].type`}
          className={styles.typeFormatInput}
        />
        <Field
          {...getFieldContent('format', fields)}
          component={Input}
          name={`${name}.requestCredentials[${index}].format`}
          className={styles.typeFormatInput}
        />
        <DeleteButton onClick={onDelete} />
      </div>

      {children}
    </div>
  )
}
