import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Users, Mail, UserPlus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('event_guests')
    .select('*, profile:profiles(*), event:events(*)')
    .order('created_at', { ascending: false })

  if (params.event) {
    query = query.eq('event_id', params.event)
  }

  const { data: guests } = await query

  const { data: events } = await supabase
    .from('events')
    .select('id, title')
    .order('event_date', { ascending: false })

  const confirmedCount = guests?.filter((g) => g.status === 'confirmed').length || 0
  const pendingCount = guests?.filter((g) => g.status === 'pending').length || 0
  const declinedCount = guests?.filter((g) => g.status === 'declined').length || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guests</h1>
          <p className="text-gray-600 mt-1">Manage guest list and RSVPs</p>
        </div>
        <Link href="/admin/guests/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Guest
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{guests?.length || 0}</div>
            <p className="text-sm text-gray-600">Total Invited</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{confirmedCount}</div>
            <p className="text-sm text-gray-600">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{declinedCount}</div>
            <p className="text-sm text-gray-600">Declined</p>
          </CardContent>
        </Card>
      </div>

      {events && events.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          <Link href="/admin/guests">
            <Button variant={!params.event ? 'default' : 'outline'} size="sm">
              All Events
            </Button>
          </Link>
          {events.map((event) => (
            <Link key={event.id} href={`/admin/guests?event=${event.id}`}>
              <Button
                variant={params.event === event.id ? 'default' : 'outline'}
                size="sm"
              >
                {event.title}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {!guests || guests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No guests yet</h3>
            <p className="text-gray-600 mb-4">Add guests to start tracking RSVPs.</p>
            <Link href="/admin/guests/new">
              <Button>Add Guest</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plus Ones</TableHead>
                <TableHead>Responded</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{guest.profile?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{guest.profile?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{guest.event?.title || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        guest.status === 'confirmed'
                          ? 'success'
                          : guest.status === 'declined'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {guest.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {guest.plus_ones > 0 ? (
                      <span className="flex items-center gap-1">
                        <UserPlus className="h-4 w-4" />
                        {guest.plus_ones}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.responded_at ? formatDate(guest.responded_at) : '-'}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/guests/${guest.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
