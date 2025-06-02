'use client'
import { useState, FormEvent } from 'react'
import Button from '../Home/common/Button'
import Container from '@components/@shared/atoms/Container'
import { getLandingPageContent } from '@utils/landingPageContent'
import { submitContactForm } from '../../utils/submitContactForm'

interface FormData {
  name: string
  email: string
  message: string
}

export default function ContactAndOnboarding() {
  const content = getLandingPageContent()
  const { contact } = content

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(
    null
  )
  const [submitMessage, setSubmitMessage] = useState<string>('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)
    setSubmitMessage('')

    try {
      const result = await submitContactForm(formData)

      // Contact Form 7 returns different response formats
      if (result.status === 'mail_sent') {
        setSubmitStatus('success')
        setSubmitMessage(result.message || 'Message sent successfully!')
        setFormData({ name: '', email: '', message: '' }) // Reset form
      } else {
        setSubmitStatus('error')
        setSubmitMessage(
          result.message || 'Failed to send message. Please try again.'
        )
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Failed to send message. Please try again.')
      console.error('Failed to send message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <Container>
        <div className={`grid md:grid-cols-3 gap-12 items-start`}>
          {/* Contact Section - Left Side */}
          <div className="flex flex-col md:col-span-2 justify-self-start">
            {/* Contact Header */}
            <div className="mb-6">
              <h2 className="text-4xl font-bold mb-4 font-sans">
                {contact.title}
              </h2>
              <p className="text-lg font-serif text-black/80 max-w-3xl">
                {contact.description}
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-8 mb-12">
              {/* Email Contacts */}
              <div className="space-y-4">
                <h3 className="text-lg font-sans font-semibold text-gray-800">
                  {contact.emailSection.title}
                </h3>
                {contact.emailSection.contacts.map((emailContact, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6"
                      style={{ color: '#734B3D' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a
                      href={`mailto:${emailContact.email}`}
                      style={{ color: '#734B3D' }}
                      className="text-lg hover:opacity-80 transition-colors"
                    >
                      {emailContact.email}
                    </a>
                    <span className="text-gray-500 text-sm">
                      {emailContact.description}
                    </span>
                  </div>
                ))}
              </div>

              {/* Social Media Contacts */}
              <div className="space-y-4">
                <h3 className="text-lg font-sans font-semibold text-gray-800">
                  {contact.socialSection.title}
                </h3>
                <div className="space-y-4">
                  {contact.socialSection.contacts.map(
                    (socialContact, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {socialContact.platform === 'Telegram' && (
                          <svg
                            className="w-6 h-6"
                            style={{ color: '#734B3D' }}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.06-.15-.04-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                          </svg>
                        )}
                        {socialContact.platform === 'Discord' && (
                          <svg
                            className="w-6 h-6"
                            style={{ color: '#734B3D' }}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1 .008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1 .006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                        )}
                        {socialContact.platform === 'WhatsApp' && (
                          <svg
                            className="w-6 h-6"
                            style={{ color: '#734B3D' }}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        )}
                        <a
                          href={socialContact.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#734B3D' }}
                          className="text-lg hover:opacity-80 transition-colors"
                        >
                          {socialContact.text}
                        </a>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Build with Us section */}
              {contact.buildWithUs && (
                <div className="space-y-4">
                  <h3 className="text-lg font-sans font-semibold text-gray-800">
                    {contact.buildWithUs.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6"
                      style={{ color: '#734B3D' }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <a
                      href={contact.buildWithUs.github.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#734B3D' }}
                      className="text-lg hover:opacity-80 transition-colors flex items-center gap-2"
                    >
                      {contact.buildWithUs.github.text}
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10 6v2h2.59l-6.3 6.3a1 1 0 0 0 0 1.4 1 1 0 0 0 1.42 0L14 9.41V12h2V6h-6z" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message Form - Right Side */}
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-sans font-semibold mb-6">
              Send us a message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#734B3D] focus:border-[#734B3D]"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#734B3D] focus:border-[#734B3D]"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      message: e.target.value
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#734B3D] focus:border-[#734B3D]"
                  placeholder="How can we help?"
                  required
                ></textarea>
              </div>

              {submitStatus && (
                <div
                  className={`text-sm ${
                    submitStatus === 'success'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {submitMessage}
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                className="w-full text-white transform transition-all duration-200 ease-in-out"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  )
}
