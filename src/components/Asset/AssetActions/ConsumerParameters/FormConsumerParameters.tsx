import { ReactElement } from 'react'
import Input from '@shared/FormInput'
import Label from '@shared/FormInput/Label'
import { Field, useField } from 'formik'
import styles from './FormConsumerParameters.module.css'
import { UserCustomParameters } from '@oceanprotocol/lib'
import classNames from 'classnames/bind'
import { Option } from 'src/@types/ddo/Option'

const cx = classNames.bind(styles)

export function getDefaultValues(
  consumerParameters: Record<string, string | number | boolean | Option[]>[]
): UserCustomParameters {
  const defaults = {}

  consumerParameters?.forEach((param) => {
    if ('name' in param && typeof param.name === 'string') {
      Object.assign(defaults, {
        [param.name as string]:
          param.type === 'number'
            ? Number(param.default)
            : param.type === 'boolean'
            ? param.default.toString()
            : param.default
      })
    }
  })

  return defaults
}

export default function FormConsumerParameters({
  name,
  parameters,
  disabled
}: {
  name: string
  parameters: Record<string, string | number | boolean | Option[]>[]
  disabled?: boolean
}): ReactElement {
  const [field] = useField<UserCustomParameters[]>(name)

  const getParameterOptions = (
    parameter: Record<string, string | number | boolean | Option[]>
  ): string[] => {
    if (!parameter.options && parameter.type !== 'boolean') return []
    let transformedOptions
    if (Array.isArray(parameter.options)) {
      transformedOptions = parameter.options.map(
        (option) => Object.keys(option)[0]
      )
    }

    const updatedOptions =
      parameter.type === 'boolean'
        ? ['true', 'false']
        : parameter.type === 'select'
        ? transformedOptions
        : []

    // add empty option, if parameter is optional
    if (!parameter.required) updatedOptions.unshift('')

    return updatedOptions
  }

  return (
    <div className={styles.container}>
      <Label htmlFor="Input the consumer parameters">
        Input the consumer parameters
      </Label>
      <div
        className={cx({
          parametersContainer: true,
          parametersContainerDisabled: disabled
        })}
      >
        {parameters.map((param) => {
          const { default: paramDefault, ...rest } = param

          return 'name' in param && typeof param.name === 'string' ? (
            <div key={param.name} className={styles.parameter}>
              <Field
                {...rest}
                component={Input}
                disabled={disabled}
                help={param.description}
                name={`${name}.${param.name}`}
                options={getParameterOptions(param)}
                size="small"
                type={param.type === 'boolean' ? 'select' : param.type}
                value={field.value[param.name]}
              />
            </div>
          ) : (
            <></>
          )
        })}
      </div>
    </div>
  )
}
