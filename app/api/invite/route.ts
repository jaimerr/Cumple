import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendInvitationEmail, DEFAULT_TEMPLATES } from '@/lib/email'
import { formatDate } from '@/lib/utils'
import type { Language } from '@/lib/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cumple.encinas.casa'

export async function POST(request: NextRequest) {
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

    // Fetch event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Generate magic link using Supabase Admin
    const redirectTo = `${APP_URL}/event/${eventId}`
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo,
        data: { name },
      },
    })

    if (linkError || !linkData) {
      console.error('Magic link generation error:', linkError)
      return NextResponse.json(
        { error: `Failed to generate magic link: ${linkError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Get the magic link - it's in the properties
    const magicLink = linkData.properties?.action_link
    if (!magicLink) {
      return NextResponse.json(
        { error: 'Magic link not generated' },
        { status: 500 }
      )
    }

    // Get email template for the selected language
    const subjectKey = `email_subject_${lang}` as keyof typeof event
    const bodyKey = `email_body_${lang}` as keyof typeof event
    
    const subject = (event[subjectKey] as string) || DEFAULT_TEMPLATES[lang].subject
    const bodyTemplate = (event[bodyKey] as string) || DEFAULT_TEMPLATES[lang].body

    // Format date for the email
    const formattedDate = formatDate(event.event_date)

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
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}`, magicLink },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
    })
  } catch (error) {
    console.error('Invite API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
