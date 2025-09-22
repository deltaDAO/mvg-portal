import { FieldMetaProps } from 'formik'
import { ReactElement } from 'react'
import stylesInput from '@shared/FormInput/index.module.css'

export default function Error({
  meta
}: {
  meta: FieldMetaProps<any>
}): ReactElement {
  if (!meta.error) return null

  let errorMessage: string
  if (typeof meta.error === 'string') {
    errorMessage = meta.error
  } else if (Array.isArray(meta.error) && (meta.error as any)[0]?.url) {
    errorMessage = (meta.error as any)[0].url
  } else if (
    meta.error &&
    typeof meta.error === 'object' &&
    (meta.error as any).url
  ) {
    errorMessage = (meta.error as any).url
  } else {
    errorMessage = String(meta.error)
  }

  return <div className={stylesInput.error}>{errorMessage}</div>
}
