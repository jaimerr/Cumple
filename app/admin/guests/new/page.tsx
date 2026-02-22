'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Event } from '@/lib/types'

export default function NewGuestPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    event_id: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // First, create or get the profile
    let profileId: string | null = null

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', formData.email)
      .single()

    if (existingProfile) {
      profileId = existingProfile.id
    } else {
      // Create new profile
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
        setError(profileError.message)
        setLoading(false)
        return
      }
      profileId = newProfile.id
    }

    // Create the event_guest entry
    const { error: guestError } = await supabase.from('event_guests').insert({
      event_id: formData.event_id,
      profile_id: profileId,
      status: 'pending',
      plus_ones: 0,
    })

    if (guestError) {
      setError(guestError.message)
      setLoading(false)
    } else {
      router.push('/admin/guests')
    }
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
              <p className="text-sm text-gray-500">
                This email will be used to send the invitation link.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Guest'
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
