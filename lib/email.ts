import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
})

interface SendInvitationEmailParams {
  to: string
  guestName: string
  eventTitle: string
  eventDate: string
  venue: string
  magicLink: string
  subject: string
  bodyTemplate: string
}

export async function sendInvitationEmail({
  to,
  guestName,
  eventTitle,
  eventDate,
  venue,
  magicLink,
  subject,
  bodyTemplate,
}: SendInvitationEmailParams): Promise<{ success: boolean; error?: string }> {
  const body = bodyTemplate
    .replace(/{guest_name}/g, guestName)
    .replace(/{event_title}/g, eventTitle)
    .replace(/{date}/g, eventDate)
    .replace(/{venue}/g, venue)
    .replace(/{link}/g, magicLink)

  const finalSubject = subject.includes('{event_title}')
    ? subject.replace(/{event_title}/g, eventTitle)
    : `${subject}${eventTitle}`

  try {
    await transporter.sendMail({
      from: `"Cova y Jaime" <${process.env.GMAIL_USER}>`,
      to,
      subject: finalSubject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    })
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

export const DEFAULT_TEMPLATES = {
  es: {
    subject: 'Invitación: {event_title}',
    body: `Hola {guest_name},

Estás invitado/a a {event_title}.

Fecha: {date}
Lugar: {venue}

Por favor confirma tu asistencia haciendo clic en el siguiente enlace:
{link}

¡Esperamos verte!
Cova y Jaime`,
  },
  en: {
    subject: 'Invitation: {event_title}',
    body: `Hi {guest_name},

You're invited to {event_title}.

Date: {date}
Venue: {venue}

Please confirm your attendance by clicking the link below:
{link}

We hope to see you there!
Cova y Jaime`,
  },
}
