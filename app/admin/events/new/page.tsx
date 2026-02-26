'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { VENUE } from '@/lib/types'

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    celebrant: 'Cova',
    event_date: '',
    venue_name: VENUE.name,
    address_official: VENUE.official,
    address_google_maps: VENUE.googleMaps,
    address_apple_maps: VENUE.appleMaps,
    description: '',
    is_active: true,
    email_subject_es: 'Invitación: {event_title}',
    email_body_es: `Hola {guest_name},

Estás invitado/a a {event_title}.

Fecha: {date}
Lugar: {venue}

Por favor confirma tu asistencia haciendo clic en el siguiente enlace:
{link}

¡Esperamos verte!
Cova y Jaime`,
    email_subject_en: 'Invitation: {event_title}',
    email_body_en: `Hi {guest_name},

You're invited to {event_title}.

Date: {date}
Venue: {venue}

Please confirm your attendance by clicking the link below:
{link}

We hope to see you there!
Cova y Jaime`,
  })

  const [showEmailTemplates, setShowEmailTemplates] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('events').insert({
      ...formData,
      organizer_id: user.user.id,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/events')
      router.refresh()
    }
  }

  return (
    <div>
      <Link href="/admin/events" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to events
      </Link>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Cova's 40th Birthday"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="celebrant">Celebrant</Label>
                <Select
                  id="celebrant"
                  value={formData.celebrant}
                  onChange={(e) => setFormData({ ...formData, celebrant: e.target.value })}
                >
                  <option value="Cova">Cova (Covadonga)</option>
                  <option value="Jaime">Jaime</option>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue_name">Venue Name</Label>
                <Input
                  id="venue_name"
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_official">Official Address</Label>
              <Input
                id="address_official"
                value={formData.address_official}
                onChange={(e) => setFormData({ ...formData, address_official: e.target.value })}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address_google_maps">Google Maps Address</Label>
                <Input
                  id="address_google_maps"
                  value={formData.address_google_maps}
                  onChange={(e) => setFormData({ ...formData, address_google_maps: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_apple_maps">Apple Maps Address</Label>
                <Input
                  id="address_apple_maps"
                  value={formData.address_apple_maps}
                  onChange={(e) => setFormData({ ...formData, address_apple_maps: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add details about the celebration..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_active">Active event (visible to guests)</Label>
            </div>

            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowEmailTemplates(!showEmailTemplates)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span>{showEmailTemplates ? '▼' : '▶'}</span>
                Email Invitation Templates
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Variables: {'{guest_name}'}, {'{event_title}'}, {'{date}'}, {'{venue}'}, {'{link}'}
              </p>
            </div>

            {showEmailTemplates && (
              <div className="space-y-6 border rounded-lg p-4 bg-gray-50">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Spanish (Español)</h4>
                  <div className="space-y-2">
                    <Label htmlFor="email_subject_es">Subject</Label>
                    <Input
                      id="email_subject_es"
                      value={formData.email_subject_es}
                      onChange={(e) => setFormData({ ...formData, email_subject_es: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_body_es">Body</Label>
                    <Textarea
                      id="email_body_es"
                      value={formData.email_body_es}
                      onChange={(e) => setFormData({ ...formData, email_body_es: e.target.value })}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900">English</h4>
                  <div className="space-y-2">
                    <Label htmlFor="email_subject_en">Subject</Label>
                    <Input
                      id="email_subject_en"
                      value={formData.email_subject_en}
                      onChange={(e) => setFormData({ ...formData, email_subject_en: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_body_en">Body</Label>
                    <Textarea
                      id="email_body_en"
                      value={formData.email_body_en}
                      onChange={(e) => setFormData({ ...formData, email_body_en: e.target.value })}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
              <Link href="/admin/events">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
