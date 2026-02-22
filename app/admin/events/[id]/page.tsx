import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, Users, Gift, Edit, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    notFound()
  }

  const { data: guests } = await supabase
    .from('event_guests')
    .select('*, profile:profiles(*)')
    .eq('event_id', id)

  const { data: gifts } = await supabase
    .from('gift_registry')
    .select('*')
    .eq('event_id', id)

  const confirmedCount = guests?.filter((g) => g.status === 'confirmed').length || 0
  const pendingCount = guests?.filter((g) => g.status === 'pending').length || 0
  const totalPlusOnes = guests?.reduce((sum, g) => sum + (g.plus_ones || 0), 0) || 0

  return (
    <div>
      <Link href="/admin/events" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to events
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <Badge variant={event.celebrant === 'Cova' ? 'default' : 'secondary'}>
              {event.celebrant}
            </Badge>
            {event.is_active && <Badge variant="success">Active</Badge>}
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(event.event_date)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.venue_name}
            </span>
          </div>
        </div>
        <Link href={`/admin/events/${id}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{guests?.length || 0}</p>
            <p className="text-sm text-gray-500">
              {confirmedCount} confirmed, {pendingCount} pending
            </p>
            {totalPlusOnes > 0 && (
              <p className="text-sm text-gray-500">+{totalPlusOnes} additional guests</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Registry Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{gifts?.length || 0}</p>
            <p className="text-sm text-gray-500">
              {gifts?.filter((g) => g.is_fulfilled).length || 0} fulfilled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Guest Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">Share this link with guests:</p>
            <code className="text-xs bg-gray-100 p-2 rounded block truncate">
              {process.env.NEXT_PUBLIC_SITE_URL || 'https://encinas.casa'}/event/{id}
            </code>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Venue Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">{event.venue_name}</p>
              <p className="text-gray-600">{event.address_official}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(event.address_google_maps)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Google Maps
                </Button>
              </a>
              <a
                href={`https://maps.apple.com/?q=${encodeURIComponent(event.address_apple_maps)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Apple Maps
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {event.description && (
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Guest List
              </CardTitle>
              <Link href={`/admin/guests?event=${id}`}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!guests || guests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No guests added yet</p>
            ) : (
              <div className="space-y-2">
                {guests.slice(0, 5).map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{guest.profile?.name || guest.profile?.email}</span>
                    <Badge variant={
                      guest.status === 'confirmed' ? 'success' :
                      guest.status === 'declined' ? 'destructive' : 'secondary'
                    }>
                      {guest.status}
                    </Badge>
                  </div>
                ))}
                {guests.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{guests.length - 5} more guests
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Gift Registry
              </CardTitle>
              <Link href={`/admin/registry?event=${id}`}>
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!gifts || gifts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No registry items yet</p>
            ) : (
              <div className="space-y-2">
                {gifts.slice(0, 5).map((gift) => (
                  <div key={gift.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{gift.name}</span>
                    <span className="text-sm text-gray-600">
                      €{gift.current_amount} / €{gift.target_amount}
                    </span>
                  </div>
                ))}
                {gifts.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{gifts.length - 5} more items
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
