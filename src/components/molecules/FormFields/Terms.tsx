import React, { ReactElement } from 'react'
import { InputProps } from '../../atoms/Input'
import InputElement from '../../atoms/Input/InputElement'
import styles from './Terms.module.css'

export default function Terms(props: InputProps): ReactElement {
  const termsProps: InputProps = {
    ...props,
    defaultChecked: props.value.toString() === 'true'
  }

  return (
    <>
      <div className={styles.terms} />
      <InputElement {...termsProps} type="checkbox" />
    </>
  )
}
