import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DeleteEventButton } from '@/components/admin/delete-event-button'

export default async function EventsPage() {
  const supabase = await createClient()
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-1">Manage birthday celebrations</p>
        </div>
        <Link href="/admin/events/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-4">Create your first birthday event to get started.</p>
            <Link href="/admin/events/new">
              <Button>Create Event</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Link href={`/admin/events/${event.id}`} className="flex-1 cursor-pointer">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.event_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.venue_name}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge variant={event.celebrant === 'Cova' ? 'default' : 'secondary'}>
                      {event.celebrant}
                    </Badge>
                    {event.is_active && (
                      <Badge variant="success">Active</Badge>
                    )}
                    <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                  </div>
                </div>
              </CardHeader>
              {event.description && (
                <CardContent>
                  <Link href={`/admin/events/${event.id}`}>
                    <p className="text-gray-600 line-clamp-2">{event.description}</p>
                  </Link>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
