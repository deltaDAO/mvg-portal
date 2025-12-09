import React from 'react'
import { useFormikContext } from 'formik'
import styles from './index.module.css'

interface FormErrorGroupProps {
  children: React.ReactNode
  errorFields?: string[]
  className?: string
}

export default function FormErrorGroup({
  children,
  errorFields = [],
  className = ''
}: FormErrorGroupProps) {
  const { errors } = useFormikContext<Record<string, string>>()

  const hasErrors = errorFields.some((field) => errors[field])

  return (
    <div
      className={`${styles.errorGroup} ${
        hasErrors ? styles.hasErrors : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
