import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Gift, PartyPopper, ExternalLink } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function GuestEventPage({
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
    .eq('is_active', true)
    .single()

  if (!event) {
    notFound()
  }

  const { data: gifts } = await supabase
    .from('gift_registry')
    .select('*')
    .eq('event_id', id)
    .eq('is_fulfilled', false)
    .order('created_at')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <PartyPopper className="h-10 w-10 text-primary" />
            </div>
          </div>
          <Badge variant={event.celebrant === 'Cova' ? 'default' : 'secondary'} className="mb-4">
            {event.celebrant}'s Birthday
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
          {event.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{event.description}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                When
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatDate(event.event_date)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Where
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-lg mb-1">{event.venue_name}</p>
              <p className="text-gray-600 mb-4">{event.address_official}</p>
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
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Gift Registry
            </CardTitle>
            <p className="text-gray-600">
              Contribute to a gift for {event.celebrant}
            </p>
          </CardHeader>
          <CardContent>
            {!gifts || gifts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No gifts in the registry yet. Check back later!
              </p>
            ) : (
              <div className="grid gap-6">
                {gifts.map((gift) => {
                  const percentage = gift.target_amount > 0
                    ? Math.min((gift.current_amount / gift.target_amount) * 100, 100)
                    : 0

                  return (
                    <div key={gift.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{gift.name}</h3>
                          {gift.description && (
                            <p className="text-gray-600 text-sm mt-1">{gift.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>{formatCurrency(gift.current_amount)} raised</span>
                          <span className="text-gray-500">Goal: {formatCurrency(gift.target_amount)}</span>
                        </div>
                        <Progress value={percentage} />
                        <p className="text-xs text-gray-500">{percentage.toFixed(0)}% funded</p>
                      </div>
                      <Link href={`/event/${id}/contribute/${gift.id}`}>
                        <Button className="w-full">
                          Contribute to this gift
                        </Button>
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-gray-500 text-sm">
          <p>Questions? Contact Cova or Jaime directly.</p>
        </div>
      </div>
    </div>
  )
}
