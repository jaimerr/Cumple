import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendInvitationEmail, DEFAULT_TEMPLATES } from '@/lib/email'
import { formatDate } from '@/lib/utils'
import type { Language } from '@/lib/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cumple.encinas.casa'

export async function POST(request: NextRequest) {
  const errors: string[] = []
  
  try {
    const { email, name, eventId, language } = await request.json() as {
      email: string
      name: string
      eventId: string
      language: Language
    }

    if (!email || !name || !eventId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, eventId' },
        { status: 400 }
      )
    }

    const lang = language || 'es'
    errors.push(`Starting invite for ${email}, event ${eventId}, lang ${lang}`)

    // Fetch event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      errors.push(`Event fetch error: ${eventError?.message || 'not found'}`)
      return NextResponse.json(
        { error: 'Event not found', debug: errors },
        { status: 404 }
      )
    }
    errors.push(`Event found: ${event.title}`)

    // Generate invite link using Supabase Admin (type 'invite' doesn't send email)
    const redirectTo = `${APP_URL}/event/${eventId}`
    errors.push(`Redirect URL: ${redirectTo}`)
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        redirectTo,
        data: { name },
      },
    })

    if (linkError || !linkData) {
      errors.push(`Link generation error: ${linkError?.message || 'no data'}`)
      return NextResponse.json(
        { error: `Failed to generate link: ${linkError?.message || 'Unknown error'}`, debug: errors },
        { status: 500 }
      )
    }
    errors.push(`Link generated successfully`)

    // Get the link - it's in the properties
    const magicLink = linkData.properties?.action_link
    if (!magicLink) {
      errors.push(`No action_link in response: ${JSON.stringify(linkData.properties)}`)
      return NextResponse.json(
        { error: 'Link not generated', debug: errors },
        { status: 500 }
      )
    }
    errors.push(`Magic link: ${magicLink.substring(0, 50)}...`)

    // Get email template for the selected language
    const subjectKey = `email_subject_${lang}` as keyof typeof event
    const bodyKey = `email_body_${lang}` as keyof typeof event
    
    const subject = (event[subjectKey] as string) || DEFAULT_TEMPLATES[lang].subject
    const bodyTemplate = (event[bodyKey] as string) || DEFAULT_TEMPLATES[lang].body
    errors.push(`Template subject: ${subject}`)

    // Format date for the email
    const formattedDate = formatDate(event.event_date)

    // Check Gmail credentials
    errors.push(`Gmail user: ${process.env.GMAIL_USER || 'NOT SET'}`)
    errors.push(`Gmail pass: ${process.env.GMAIL_APP_PASSWORD ? 'SET' : 'NOT SET'}`)

    // Send the invitation email
    const emailResult = await sendInvitationEmail({
      to: email,
      guestName: name,
      eventTitle: event.title,
      eventDate: formattedDate,
      venue: `${event.venue_name}\n${event.address_official}`,
      magicLink,
      subject,
      bodyTemplate,
    })

    if (!emailResult.success) {
      errors.push(`Email send failed: ${emailResult.error}`)
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}`, magicLink, debug: errors },
        { status: 500 }
      )
    }
    errors.push(`Email sent successfully!`)

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      debug: errors,
    })
  } catch (error) {
    errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`)
    console.error('Invite API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error', debug: errors },
      { status: 500 }
    )
  }
}
