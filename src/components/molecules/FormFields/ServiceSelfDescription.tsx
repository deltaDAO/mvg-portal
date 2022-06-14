import { useField } from 'formik'
import React, { ReactElement, useEffect, useState } from 'react'
import Button from '../../atoms/Button'
import Input from '../../atoms/Input'
import BoxSelection from './BoxSelection'

const serviceSelfDescriptionOptions = [
  {
    name: 'uri',
    checked: true,
    title: 'Uri'
  },
  {
    name: 'json',
    checked: false,
    title: 'Json'
  }
]

export default function ServiceSelfDescription(): ReactElement {
  const [field, meta, helpers] = useField('serviceSelfDescription')

  const [userSelection, setUserSelection] = useState<string>()

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
          name="serviceSelfDescription"
          options={serviceSelfDescriptionOptions}
          handleChange={(e) => setUserSelection(e.target.value)}
        />
      </div>
      <div>
        {userSelection === 'uri' ? (
          <Input type="files" name="serviceSelfDescription" />
        ) : (
          <div>
            <Input type="textarea" />
            <Button style="primary">Verify</Button>
          </div>
        )}
      </div>
    </div>
  )
}
