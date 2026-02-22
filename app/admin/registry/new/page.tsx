'use client'

import { useState, useEffect } from 'react'
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
import type { Event } from '@/lib/types'

export default function NewRegistryItemPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    event_id: '',
    image_url: '',
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

    const { error } = await supabase.from('gift_registry').insert({
      name: formData.name,
      description: formData.description || null,
      target_amount: parseFloat(formData.target_amount) || 0,
      current_amount: 0,
      event_id: formData.event_id,
      image_url: formData.image_url || null,
      is_fulfilled: false,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/registry')
    }
  }

  return (
    <div>
      <Link href="/admin/registry" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to registry
      </Link>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Add Gift to Registry</CardTitle>
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
              <Label htmlFor="name">Gift Name</Label>
              <Input
                id="name"
                placeholder="e.g., Weekend trip to Barcelona"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the gift idea..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_amount">Target Amount (€)</Label>
              <Input
                id="target_amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="500.00"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                type="url"
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
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
                  'Add to Registry'
                )}
              </Button>
              <Link href="/admin/registry">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
