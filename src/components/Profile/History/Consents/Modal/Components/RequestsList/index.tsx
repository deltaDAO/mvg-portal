import Info from '@images/info.svg'
import { Asset } from '@oceanprotocol/lib'
import { PossibleRequests } from '@utils/consents/types'
import { cleanRequests } from '@utils/consents/utils'
import { ErrorMessage, Form, Formik } from 'formik'
import { ReactNode } from 'react'
import Actions from '../Actions'
import { AutoResize } from '../ConsentResponse/AutoResize'
import { InteractiveRequests } from '../Requests/InteractiveRequests'
import styles from './index.module.css'

interface RequestsListProps {
  dataset: Asset
  algorithm: Asset
  handleSubmit: (reason: string, request: PossibleRequests) => void
}

function RequestsList({ dataset, algorithm, handleSubmit }: RequestsListProps) {
  return (
    <Formik
      initialValues={{ reason: '', permissions: {} }}
      validateOnBlur={false}
      validateOnChange={true}
      validateOnMount={false}
      validate={(values) => {
        const errors: { reason?: string; permissions?: string } = {}
        if (!values.reason || values.reason.length === 0) {
          errors.reason = 'Reason required'
        } else if (values.reason.length > 255) {
          errors.reason = 'Must be 255 characters or less'
        }

        const permissions = Object.values(values.permissions)
        if (
          !permissions ||
          permissions.length === 0 ||
          permissions.every((x) => !x)
        ) {
          errors.permissions = 'Must make a request'
        }

        return errors
      }}
      onSubmit={({ reason, permissions }, { setSubmitting }) => {
        console.log('Submitting', reason, permissions)

        handleSubmit(reason, cleanRequests(permissions))
        setSubmitting(false)
      }}
    >
      {({ isSubmitting, isValid, submitForm }) => (
        <Form className={styles.form}>
          <AutoResize
            name="reason"
            placeholder="This is where your reasons go"
          />
          <ErrorMessage name="reason" component="div">
            {(msg: ReactNode) => (
              <div className={styles.error}>
                <Info />
                {msg}
              </div>
            )}
          </ErrorMessage>
          <InteractiveRequests
            dataset={dataset}
            algorithm={algorithm}
            fieldName="permissions"
          >
            Request for:
            <ErrorMessage name="permissions" component="div">
              {(msg: ReactNode) => (
                <div className={styles.error}>
                  <Info />
                  {msg}
                </div>
              )}
            </ErrorMessage>
          </InteractiveRequests>
          <Actions
            acceptText="Submit"
            handleAccept={submitForm}
            isLoading={!isValid || isSubmitting}
          />
        </Form>
      )}
    </Formik>
  )
}

export default RequestsList
