export default async function handler(req, res) {
  console.log('API route called with method:', req.method)
  // Don't log full request body - may contain sensitive user data
  console.log(
    'Form submission received from:',
    req.headers['x-forwarded-for'] || req.connection.remoteAddress
  )

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Create form data exactly as WordPress expects
    const formData = new URLSearchParams()

    // Map our fields to the exact WordPress field names
    formData.append('your-name', req.body.your_name || '')
    formData.append('your-email', req.body.your_email || '')
    formData.append('your-subject', req.body.your_subject || '')
    formData.append('your-message', req.body.your_message || '')

    // Contact Form 7 required fields (updated with correct values from WordPress)
    formData.append('_wpcf7', '6') // Correct Form ID
    formData.append('_wpcf7_version', '6.0.6') // Correct version
    formData.append('_wpcf7_locale', 'en_US')
    formData.append('_wpcf7_unit_tag', 'wpcf7-f6-p8-o1') // Correct unit tag
    formData.append('_wpcf7_container_post', '8') // Correct container post
    formData.append('_wpcf7_posted_data_hash', '')

    // Add Akismet anti-spam fields that WordPress expects
    formData.append('_wpcf7_ak_hp_textarea', '')
    formData.append('_wpcf7_ak_js', new Date().getTime().toString())

    // Log form submission attempt without sensitive data
    console.log('Submitting form to WordPress Contact Form 7')

    // Submit directly to the contact page (not REST API)
    const result = await fetch('https://blogs.ubc.ca/testbl/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Referer: 'https://blogs.ubc.ca/testbl/contact/',
        Origin: 'https://blogs.ubc.ca'
      },
      body: formData.toString()
    })

    console.log('WordPress response status:', result.status)

    // Handle the response
    const textResponse = await result.text()
    // Don't log full response - may contain sensitive data
    console.log('WordPress response received, checking for success indicators')

    // Look for specific Contact Form 7 success/error indicators
    const hasSuccessMessage =
      textResponse.includes('wpcf7-mail-sent-ok') ||
      textResponse.includes('Thank you for your message. It has been sent.') ||
      textResponse.includes('Your message was sent successfully')

    const hasValidationErrors =
      textResponse.includes('wpcf7-validation-errors') ||
      textResponse.includes('wpcf7-spam') ||
      textResponse.includes('wpcf7-acceptance-missing')

    const hasMailErrors =
      textResponse.includes('wpcf7-mail-sent-ng') ||
      textResponse.includes('There was an error trying to send your message')

    console.log(
      'Form submission result:',
      hasSuccessMessage ? 'SUCCESS' : 'FAILED'
    )

    // Check for success indicators in HTML response
    const isSuccess =
      hasSuccessMessage && !hasValidationErrors && !hasMailErrors

    if (isSuccess) {
      return res.status(200).json({
        status: 'mail_sent',
        message: 'Thank you for your message. It has been sent successfully!'
      })
    } else {
      // Check for validation errors
      const hasValidationErrors =
        textResponse.includes('wpcf7-validation-errors') ||
        textResponse.includes('There was an error trying to send your message')

      if (hasValidationErrors) {
        return res.status(400).json({
          status: 'validation_failed',
          message: 'Please check your form data and try again.'
        })
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'There was an issue sending your message. Please try again.'
        })
      }
    }
  } catch (error) {
    console.error('Contact form submission error:', error.message) // Don't log full error details
    res.status(500).json({
      message: 'Failed to send message. Please try again.',
      status: 'error'
    })
  }
}
