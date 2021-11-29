import React, { ReactElement } from 'react'
import { InputProps } from '../../atoms/Input'
import InputElement from '../../atoms/Input/InputElement'

export default function Terms(props: InputProps): ReactElement {
  const termsProps: InputProps = {
    ...props,
    defaultChecked: props.value.toString() === 'true'
  }

  return <InputElement {...termsProps} type="checkbox" />
}
