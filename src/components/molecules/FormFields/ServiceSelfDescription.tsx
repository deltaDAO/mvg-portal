import { useField } from 'formik'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { verifyServiceSelfDescription } from '../../../utils/metadata'
import Button from '../../atoms/Button'
import Input, { InputProps } from '../../atoms/Input'
import BoxSelection from './BoxSelection'

const serviceSelfDescriptionOptions = [
  {
    name: 'uri',
    checked: false,
    title: 'Uri'
  },
  {
    name: 'json',
    checked: false,
    title: 'Json'
  }
]

export default function ServiceSelfDescription(
  props: InputProps
): ReactElement {
  const [field, meta, helpers] = useField(props.name)
  const [userSelection, setUserSelection] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async (rawServiceSelfDescription: string) => {
    try {
      setIsLoading(true)
      const { verified } = await verifyServiceSelfDescription({
        body: rawServiceSelfDescription,
        raw: true
      })
    } catch (error) {
      toast.error(
        'Something went wrong. Please check the provided service self-description and try again'
      )
      console.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    helpers.setValue(undefined)
  }, [userSelection])

  useEffect(() => {
    console.log(field)
  }, [field])
  return (
    <div>
      <div>
        <BoxSelection
          name="serviceSelfDescriptionOptions"
          options={serviceSelfDescriptionOptions}
          handleChange={(e) => setUserSelection(e.target.value)}
        />
      </div>
      <div>
        {userSelection === 'uri' && <Input type="files" {...props} />}
        {userSelection === 'json' && (
          <div>
            <Input type="textarea" {...props} />
            <Button style="primary">Verify</Button>
          </div>
        )}
      </div>
    </div>
  )
}
