import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ 
  to, 
  subject, 
  html, 
  from = 'Availability Helper <onboarding@resend.dev>' 
}: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }

  // For sandbox mode, redirect all emails to verified address
  const originalRecipients = Array.isArray(to) ? to : [to]
  const testRecipient = 'zac.strangeway@gmail.com'
  
  // Add note about original recipient to email content
  const modifiedHtml = `
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 12px; margin-bottom: 20px; color: #856404;">
      <strong>🧪 Test Mode:</strong> This email was originally intended for: ${originalRecipients.join(', ')}
    </div>
    ${html}
  `

  try {
    const result = await resend.emails.send({
      from,
      to: [testRecipient],
      subject: `[TEST] ${subject}`,
      html: modifiedHtml,
    })

    return result
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}