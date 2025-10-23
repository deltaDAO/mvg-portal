import { useFormikContext } from 'formik'
import { useEffect } from 'react'

interface AutoSaveProps {
  onChange: (values: any) => void
}

export const AutoSave = ({ onChange }: Readonly<AutoSaveProps>) => {
  const { values } = useFormikContext()

  useEffect(() => onChange(values), [values, onChange])

  return null
}
