import { ReactElement, useState } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

interface FormValues {
  organizationName: string
  contactName: string
  contactEmail: string
  partnershipReason: string
  otherReason?: string
  verificationCode: string
  privacyConsent: boolean
}

const validationSchema = Yup.object({
  organizationName: Yup.string().required('Organization name is required'),
  contactName: Yup.string().required('Contact name is required'),
  contactEmail: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  partnershipReason: Yup.string().required('Please select a reason'),
  otherReason: Yup.string().when('partnershipReason', {
    is: 'Other',
    then: (schema) => schema.required('Please specify your reason')
  }),
  // verificationCode: Yup.string().required('Verification code is required'),
  privacyConsent: Yup.boolean()
    .oneOf([true], 'You must agree to the privacy policy')
    .required('Privacy consent is required')
})

export default function PartnerIntakeForm(): ReactElement {
  const [expandedFaq, setExpandedFaq] = useState(true)
  // const [generatedCode, setGeneratedCode] = useState('')
  // const [codeSent, setCodeSent] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(
    null
  )
  const [submitMessage, setSubmitMessage] = useState<string>('')

  const partnershipOptions = [
    { value: '', label: 'Select a reason' },
    { value: 'Research', label: 'Research collaboration' },
    { value: 'Education', label: 'Educational initiative' },
    { value: 'Preservation', label: 'Digital reference and access support' },
    { value: 'Other', label: 'Something else' }
  ]

  const generateMailtoLink = (data: FormValues): string => {
    const to = 'info@cliox.org'
    const subject = encodeURIComponent(
      'New Partner Application - ' + data.organizationName
    )
    const body = encodeURIComponent(
      `Organization Name: ${data.organizationName}\n` +
        `Contact Name: ${data.contactName}\n` +
        `Contact Email: ${data.contactEmail}\n` +
        `Partnership Reason: ${data.partnershipReason}\n` +
        (data.otherReason ? `Other Reason: ${data.otherReason}\n` : '') +
        // `Email Verification Code: ${data.verificationCode}\n` +
        `Privacy Consent: Yes\n\n` +
        `---\n` +
        `This application was sent through the ClioX Partner Intake Form.`
    )

    return `mailto:${to}?subject=${subject}&body=${body}`
  }

  // const sendVerificationCode = (email: string) => {
  //   if (!email || !email.includes('@')) {
  //     alert('Please enter a valid email before requesting a code.')
  //     return
  //   }

  //   const code = Math.floor(100000 + Math.random() * 900000).toString()
  //   setGeneratedCode(code)
  //   setCodeSent(true)
  //   alert(`Verification code sent to: ${email}\nCode (for demo): ${code}`)
  // }

  const handleSubmit = async (values: FormValues) => {
    // if (values.verificationCode !== generatedCode) {
    //   alert('Verification code is incorrect or missing.')
    //   return
    // }

    try {
      // Generate mailto link and open email client
      const mailtoLink = generateMailtoLink(values)
      window.location.href = mailtoLink

      // Show success message
      setSubmitStatus('success')
      setSubmitMessage(
        'Opening your email client... Please send the email to complete your partner application.'
      )

      // Reset form after a short delay (but keep the generated code for reference)
      setTimeout(() => {
        setSubmitStatus(null)
        setSubmitMessage('')
      }, 5000)
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage(
        'Failed to open email client. Please try contacting us directly at partnerships@cliox.org'
      )
      console.error('Failed to generate mailto link:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto mb-12">
        <details
          open={expandedFaq}
          onToggle={(e) =>
            setExpandedFaq((e.target as HTMLDetailsElement).open)
          }
        >
          <summary className="cursor-pointer font-semibold text-lg py-2 list-none text-black flex items-center gap-3">
            <span
              className={`text-[var(--color-primary)] transition-transform duration-200 ${
                expandedFaq ? 'rotate-90' : ''
              }`}
            >
              ▶
            </span>
            What It Means to Be a Clio-X Partner
          </summary>
          <div className="mt-3 ml-7">
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              If your organization works with cultural heritage materials,
              welcome to our vibrant community. We&apos;re building a
              technology-rich environment that encourages exploration and
              interaction with digital archives in innovative ways.
            </p>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              Partnering with Clio-X fosters a creative space for research,
              teaching, and learning.
            </p>
            <p className="text-base text-gray-700 mb-0 leading-relaxed">
              Join us in transforming the future of archival research and
              engagement!
            </p>
          </div>
        </details>
      </section>

      {/* Form Section */}
      <section className="bg-white text-black py-15 px-6 md:px-10 rounded-xl shadow-lg mx-auto max-w-4xl mt-4">
        <h2 className="text-3xl font-bold text-black mb-8">
          Partner Intake Form
        </h2>

        <div className="flex justify-between mb-10 border-b-2 border-gray-200">
          <div className="flex-1 text-center py-3 font-semibold text-black border-b-2 border-[var(--color-primary)]">
            Organization Information
          </div>
        </div>

        <Formik
          initialValues={{
            organizationName: '',
            contactName: '',
            contactEmail: '',
            partnershipReason: '',
            otherReason: '',
            verificationCode: '',
            privacyConsent: false
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, touched }) => (
            <Form className="space-y-4">
              {/* Basic Info Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-black text-sm mb-1.5">
                    *Organization&apos;s Name
                  </label>
                  <Field
                    name="organizationName"
                    type="text"
                    placeholder="What's your organization's name?"
                    className="w-full py-3 px-3.5 text-base border border-gray-300 rounded-md bg-gray-50 text-black"
                  />
                  {errors.organizationName && touched.organizationName && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.organizationName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-black text-sm mb-1.5">
                    *Contact Person&apos;s Name
                  </label>
                  <Field
                    name="contactName"
                    type="text"
                    placeholder="Who's the best person to reach?"
                    className="w-full py-3 px-3.5 text-base border border-gray-300 rounded-md bg-gray-50 text-black"
                  />
                  {errors.contactName && touched.contactName && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.contactName}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-black text-sm mb-1.5">
                    *Contact&apos;s Email
                  </label>
                  <Field
                    name="contactEmail"
                    type="email"
                    placeholder="Where can we reach you?"
                    className="w-full py-3 px-3.5 text-base border border-gray-300 rounded-md bg-gray-50 text-black"
                  />
                  {errors.contactEmail && touched.contactEmail && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.contactEmail}
                    </div>
                  )}
                </div>
              </div>

              {/* Partnership Reason */}
              <div>
                <label
                  htmlFor="partnershipReason"
                  className="block font-medium text-black text-sm mb-1.5"
                >
                  *Why are you interested in partnering with us?
                </label>
                <Field
                  as="select"
                  name="partnershipReason"
                  className="w-full py-3 px-3.5 text-base border border-gray-300 rounded-md bg-gray-50 text-black appearance-none"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFieldValue('partnershipReason', e.target.value)
                    if (e.target.value !== 'Other') {
                      setFieldValue('otherReason', '')
                    }
                  }}
                >
                  {partnershipOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.value === ''}
                    >
                      {option.label}
                    </option>
                  ))}
                </Field>
                {errors.partnershipReason && touched.partnershipReason && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.partnershipReason}
                  </div>
                )}
              </div>

              {/* Other Reason - conditionally rendered */}
              {values.partnershipReason === 'Other' && (
                <div>
                  <Field
                    name="otherReason"
                    type="text"
                    placeholder="Tell us more..."
                    className="w-full py-3 px-3.5 text-base border border-gray-300 rounded-md bg-gray-50 text-black"
                  />
                  {errors.otherReason && touched.otherReason && (
                    <div className="text-red-500 text-sm mt-1">
                      {errors.otherReason}
                    </div>
                  )}
                </div>
              )}

              {/* Email Verification - Temporarily Commented Out */}
              {/* <div>
                <label className="block font-medium text-black text-sm mb-1.5">
                  *Email Verification Code
                </label>
                <div className="flex gap-2.5">
                  <Field
                    name="verificationCode"
                    type="text"
                    placeholder="Paste your code here"
                    className="flex-1 py-3 px-3.5 text-base border border-gray-300 rounded-md bg-gray-50 text-black"
                  />
                  <button
                    type="button"
                    onClick={() => sendVerificationCode(values.contactEmail)}
                    className="py-3 px-4 font-semibold bg-[var(--color-primary)] text-white border-none rounded-md cursor-pointer whitespace-nowrap hover:bg-[var(--color-highlight)] transition-colors"
                  >
                    Send Code
                  </button>
                </div>
                {errors.verificationCode && touched.verificationCode && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.verificationCode}
                  </div>
                )}
              </div> */}

              {/* Privacy Consent */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-sm leading-relaxed text-black">
                  <Field
                    type="checkbox"
                    name="privacyConsent"
                    className="flex-shrink-0 accent-[var(--input-selected-background)]"
                  />
                  <span>
                    I agree to the storage and processing of my information in
                    accordance with the{' '}
                    <a
                      href="/privacy/en"
                      target="_blank"
                      className="text-[var(--color-primary)] underline transition-colors hover:text-[var(--color-highlight)]"
                    >
                      privacy policy
                    </a>
                    .
                  </span>
                </label>
                {errors.privacyConsent && touched.privacyConsent && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.privacyConsent}
                  </div>
                )}
              </div>

              {/* Status Message */}
              {submitStatus && (
                <div
                  className={`text-sm text-center ${
                    submitStatus === 'success'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {submitMessage}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 text-center">
                <button
                  type="submit"
                  className="py-4 px-8 text-base font-semibold bg-[var(--color-primary)] text-white border-none rounded-md cursor-pointer min-w-48 transition-colors hover:bg-[var(--color-highlight)]"
                >
                  Submit Application
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  )
}
