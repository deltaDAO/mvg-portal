interface ContactForm7Response {
  status: string
  message: string
  posted_data_hash?: string
  into?: string
  invalid_fields?: Array<{
    field: string
    message: string
    error_id: string
  }>
}

interface ContactFormData {
  name: string
  email: string
  message: string
}

export async function submitContactForm(
  data: ContactFormData
): Promise<ContactForm7Response> {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // These keys must match the "name" attributes in the WordPress form
        your_name: data.name,
        your_email: data.email,
        your_message: data.message
      })
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)

    // Handle different response types
    const contentType = response.headers.get('content-type')
    let result: ContactForm7Response

    if (contentType && contentType.includes('application/json')) {
      result = await response.json()
    } else {
      // Handle non-JSON responses
      const textResponse = await response.text()
      console.log('Non-JSON response:', textResponse)

      result = {
        status: response.ok ? 'mail_sent' : 'error',
        message: response.ok
          ? 'Message sent successfully'
          : textResponse || `HTTP ${response.status}: ${response.statusText}`
      }
    }

    console.log('Parsed result:', result)

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return result
  } catch (error) {
    console.error('Submit contact form error:', error)
    throw error
  }
}
