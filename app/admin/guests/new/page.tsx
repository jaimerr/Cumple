'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Mail, Copy, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Event, Language } from '@/lib/types'

export default function NewGuestPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [copied, setCopied] = useState(false)
  const [manualLink, setManualLink] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    event_id: '',
    language: 'es' as Language,
    sendInvite: true,
  })

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })
      if (data) setEvents(data)
    }
    fetchEvents()
  }, [])

  const getEventLink = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    return `${baseUrl}/event/${formData.event_id}`
  }

  const copyLink = async () => {
    const link = getEventLink()
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setManualLink(null)

    let profileId: string | null = null

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', formData.email)
      .single()

    if (existingProfile) {
      profileId = existingProfile.id
    } else {
      // Create profile first
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: formData.email,
          name: formData.name,
          role: 'guest',
        })
        .select('id')
        .single()

      if (profileError) {
        setError(`Failed to create profile: ${profileError.message}`)
        setLoading(false)
        return
      }
      profileId = newProfile.id
    }

    // Create the event_guest entry with language
    const { error: guestError } = await supabase.from('event_guests').insert({
      event_id: formData.event_id,
      profile_id: profileId,
      status: 'pending',
      plus_ones: 0,
      language: formData.language,
    })

    if (guestError) {
      setError(`Failed to add guest: ${guestError.message}`)
      setLoading(false)
      return
    }

    // Send invitation via our custom API
    if (formData.sendInvite) {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          eventId: formData.event_id,
          language: formData.language,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(`Guest added but invitation failed: ${result.error}`)
        if (result.magicLink) {
          setManualLink(result.magicLink)
        } else {
          setManualLink(getEventLink())
        }
        setLoading(false)
        return
      }
    }

    router.push('/admin/guests')
    router.refresh()
  }

  return (
    <div>
      <Link href="/admin/guests" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to guests
      </Link>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Add New Guest</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="event_id">Event</Label>
              <Select
                id="event_id"
                value={formData.event_id}
                onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                required
              >
                <option value="">Select an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {event.celebrant}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Guest Name</Label>
              <Input
                id="name"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="guest@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Invitation Language</Label>
              <Select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
              >
                <option value="es">Español (Spanish)</option>
                <option value="en">English</option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendInvite"
                checked={formData.sendInvite}
                onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="sendInvite" className="font-normal">
                Send invitation email with magic link
              </Label>
            </div>

            {formData.event_id && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600 mb-2">Event link (for manual sharing):</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-white p-2 rounded border flex-1 truncate">
                    {getEventLink()}
                  </code>
                  <Button type="button" variant="outline" size="sm" onClick={copyLink}>
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <p>{error}</p>
                {manualLink && (
                  <div className="mt-2">
                    <p className="text-gray-600">Share this link manually:</p>
                    <code className="text-xs block mt-1 bg-white p-2 rounded break-all">{manualLink}</code>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {formData.sendInvite ? 'Sending...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {formData.sendInvite ? 'Add & Send Invite' : 'Add Guest'}
                  </>
                )}
              </Button>
              <Link href="/admin/guests">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
