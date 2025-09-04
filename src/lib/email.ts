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

  try {
    const result = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    return result
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}