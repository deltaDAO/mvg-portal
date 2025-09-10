import { InputHTMLAttributes, ReactElement } from 'react'
import slugify from 'slugify'
import classNames from 'classnames/bind'
import styles from './index.module.css'
import Option from './Option'

const cx = classNames.bind(styles)

interface InputRadioProps extends InputHTMLAttributes<HTMLInputElement> {
  options: string[]
  inputSize?: string
  prefixes?: string[]
  postfixes?: string[]
  actions?: string[]
  variant?: 'default' | 'publish'
  hideLabel?: boolean
}

export default function InputRadio({
  options,
  inputSize,
  prefixes,
  postfixes,
  actions,
  variant = 'default',
  ...props
}: InputRadioProps): ReactElement {
  const { hideLabel, ...inputProps } = props

  return (
    <div className={styles.radioGroup}>
      {options &&
        (options as string[]).map((option: string, index: number) => (
          <div className={styles.radioWrap} key={index}>
            <input
              {...inputProps}
              className={`${styles[inputProps.type]} ${
                variant === 'publish' ? styles.publishRadio : ''
              }`}
              id={slugify(option)}
            />
            <label
              className={cx({
                [styles.radioLabel]: true,
                [inputSize]: inputSize
              })}
              htmlFor={slugify(option)}
            >
              <Option
                option={option}
                prefix={prefixes?.[index]}
                postfix={postfixes?.[index]}
                action={actions?.[index]}
              />
            </label>
          </div>
        ))}
    </div>
  )
}
