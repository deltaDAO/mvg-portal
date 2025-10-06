import { forwardRef, ReactElement, RefObject } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import styles from './index.module.css'
import { InputProps } from '..'
import FilesInput from './FilesInput'
import CustomProvider from './Provider'
import BoxSelection, { BoxSelectionOption } from './BoxSelection'
import Datatoken from './Datatoken'
import classNames from 'classnames/bind'
import AssetSelection, { AssetSelectionAsset } from './AssetSelection'
import EnvironmentSelection, {
  EnvironmentSelectionEnvironment
} from './EnvironmentSelection'
import Nft from './Nft'
import InputRadio from './Radio'
import ContainerInput from '@shared/FormInput/InputElement/ContainerInput'
import TagsAutoComplete from './TagsAutoComplete'
import TabsFile from '@shared/atoms/TabsFile'
import { extensions, oceanTheme } from '@utils/codemirror'
import { ConsumerParameters } from './ConsumerParameters'
import ComputeEnvSelection from './ComputeEnvSelection'
import Credentials from './Credential'
import Option from './Radio/Option'
import { PublishConsumerParameters } from './ConsumerParameters/PublishConsumerParameters'

const cx = classNames.bind(styles)

const DefaultInput = forwardRef(
  (
    {
      size,
      className,
      // We filter out all props which are not allowed
      // to be passed to HTML input so these stay unused.
      /* eslint-disable @typescript-eslint/no-unused-vars */
      prefix,
      postfix,
      additionalComponent,
      selectStyle,
      hideLabel,
      computeHelp,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...props
    }: InputProps,
    ref: RefObject<HTMLInputElement>
  ) => (
    <input
      ref={ref}
      className={cx({ input: true, [size]: size, [className]: className })}
      id={props.name}
      onWheel={(e) => {
        if (props.type === 'number') {
          ;(e.target as HTMLInputElement).blur()
        }
      }}
      {...props}
    />
  )
)
DefaultInput.displayName = 'DefaultInput'

const InputElement = forwardRef(
  (
    {
      options,
      sortOptions,
      size,
      field,
      multiple,
      // We filter out all props which are not allowed
      // to be passed to HTML input so these stay unused.
      /* eslint-disable @typescript-eslint/no-unused-vars */
      label,
      help,
      prominentHelp,
      form,
      prefix,
      postfix,
      additionalComponent,
      disclaimer,
      disclaimerValues,
      accountId,
      prefixes,
      postfixes,
      actions,
      variant = 'default',
      selectStyle,
      hideLabel,
      computeHelp,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...props
    }: InputProps,
    ref: RefObject<HTMLInputElement>
  ): ReactElement => {
    const styleClasses = cx({
      select:
        selectStyle !== 'publish' &&
        selectStyle !== 'custom' &&
        selectStyle !== 'serviceLanguage',
      publishSelect: selectStyle === 'publish',
      customSelect: selectStyle === 'custom',
      serviceLanguageSelect: selectStyle === 'serviceLanguage',
      [size]: size
    })

    switch (props.type) {
      case 'select': {
        const sortedOptions =
          !sortOptions && sortOptions === false
            ? options
            : (options as string[]).sort((a: string, b: string) =>
                a.localeCompare(b)
              )
        const { ...selectProps } = props
        return (
          <select
            id={selectProps.name}
            className={styleClasses}
            {...selectProps}
            multiple={multiple}
          >
            {field !== undefined && field.value === '' && (
              <option value="" disabled hidden>
                {selectProps.placeholder}
              </option>
            )}
            {sortedOptions &&
              (sortedOptions as string[]).map(
                (option: string, index: number) => (
                  <option key={index} value={option}>
                    <Option
                      option={option}
                      prefix={prefixes?.[index]}
                      postfix={postfixes?.[index]}
                    />
                  </option>
                )
              )}
          </select>
        )
      }
      case 'tabs': {
        const tabs: any = []
        props.fields.map((field: any, i) => {
          return tabs.push({
            title: field.title,
            field,
            props,
            content: (
              <FilesInput
                key={`fileInput_${i}`}
                {...field}
                form={form}
                {...props}
              />
            )
          })
        })

        return (
          <TabsFile
            items={tabs}
            key={`tabFile_${props.name}`}
            className={styles.pricing}
          />
        )
      }

      case 'codeeditor':
        return (
          <CodeMirror
            id={props.name}
            className={styles.codemirror}
            value={`${props.value ? props.value : ''}`}
            height="200px"
            placeholder={props.placeholder}
            theme={oceanTheme('light', props)}
            extensions={[extensions]}
            onChange={(value) => {
              form.setFieldValue(`${props.name}`, value)
            }}
          />
        )

      case 'consumerParameters':
        return <ConsumerParameters {...field} form={form} {...props} />
      case 'publishConsumerParameters':
        return <PublishConsumerParameters {...field} form={form} {...props} />

      case 'textarea': {
        return (
          <textarea id={props.name} className={styles.textarea} {...props} />
        )
      }

      case 'radio':
      case 'checkbox':
        return (
          <InputRadio
            options={options as string[]}
            inputSize={size}
            prefixes={prefixes}
            postfixes={postfixes}
            actions={actions}
            {...props}
          />
        )

      case 'assetSelection':
        return (
          <AssetSelection
            assets={options as AssetSelectionAsset[]}
            accountId={accountId}
            {...field}
            {...props}
          />
        )

      case 'environmentSelection':
        return (
          <EnvironmentSelection
            environments={options as EnvironmentSelectionEnvironment[]}
            {...field}
            {...props}
          />
        )

      case 'computeEnvSelection':
        return (
          <ComputeEnvSelection
            computeEnvs={options as ComputeEnvironmentExtended[]}
            setAllResourceValues={props.setAllResourceValues}
            {...field}
            {...props}
          />
        )

      case 'assetSelectionMultiple':
        return (
          <AssetSelection
            assets={options as AssetSelectionAsset[]}
            accountId={accountId}
            multiple
            selected={(field?.value as unknown as string[]) || []}
            {...field}
            {...props}
          />
        )
      case 'files':
        return <FilesInput {...field} form={form} {...props} />
      case 'container':
        return <ContainerInput {...field} {...props} />
      case 'providerUrl':
        return <CustomProvider {...field} {...props} />
      case 'nft':
        return <Nft {...field} {...props} />
      case 'datatoken':
        return <Datatoken {...field} {...props} />
      case 'boxSelection':
        return (
          <BoxSelection
            options={options as BoxSelectionOption[]}
            size={size}
            {...field}
            {...props}
          />
        )
      case 'tags':
        return <TagsAutoComplete {...field} {...props} />
      case 'credentials':
        return <Credentials {...field} {...props} />
      default:
        return prefix || postfix ? (
          <div
            className={`${prefix ? styles.prefixGroup : styles.postfixGroup} ${
              variant === 'publish' ? styles.publishPrefixGroup : ''
            }`}
          >
            {prefix && (
              <div
                className={cx({
                  prefix: true,
                  [size]: size,
                  publishPrefix: variant === 'publish'
                })}
              >
                {prefix}
              </div>
            )}
            <DefaultInput
              ref={ref}
              type={props.type || 'text'}
              size={size}
              {...field}
              {...props}
            />
            {postfix && (
              <div
                className={cx({
                  postfix: true,
                  [size]: size,
                  publishPostfix: variant === 'publish'
                })}
              >
                {postfix}
              </div>
            )}
          </div>
        ) : (
          <DefaultInput
            ref={ref}
            type={props.type || 'text'}
            size={size}
            {...field}
            {...props}
          />
        )
    }
  }
)
InputElement.displayName = 'InputElement'

export default InputElement
