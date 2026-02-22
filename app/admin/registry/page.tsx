import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Gift } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function RegistryPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('gift_registry')
    .select('*, event:events(id, title, celebrant)')
    .order('created_at', { ascending: false })

  if (params.event) {
    query = query.eq('event_id', params.event)
  }

  const { data: gifts } = await query

  const { data: events } = await supabase
    .from('events')
    .select('id, title')
    .order('event_date', { ascending: false })

  const totalTarget = gifts?.reduce((sum, g) => sum + (g.target_amount || 0), 0) || 0
  const totalCollected = gifts?.reduce((sum, g) => sum + (g.current_amount || 0), 0) || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gift Registry</h1>
          <p className="text-gray-600 mt-1">Manage gift ideas and contributions</p>
        </div>
        <Link href="/admin/registry/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Gift
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{gifts?.length || 0}</div>
            <p className="text-sm text-gray-600">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(totalTarget)}</div>
            <p className="text-sm text-gray-600">Target Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCollected)}</div>
            <p className="text-sm text-gray-600">Collected</p>
          </CardContent>
        </Card>
      </div>

      {events && events.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          <Link href="/admin/registry">
            <Button variant={!params.event ? 'default' : 'outline'} size="sm">
              All Events
            </Button>
          </Link>
          {events.map((event) => (
            <Link key={event.id} href={`/admin/registry?event=${event.id}`}>
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

      {!gifts || gifts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gifts in registry</h3>
            <p className="text-gray-600 mb-4">Add gift ideas for guests to contribute to.</p>
            <Link href="/admin/registry/new">
              <Button>Add Gift</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift) => {
            const percentage = gift.target_amount > 0
              ? Math.min((gift.current_amount / gift.target_amount) * 100, 100)
              : 0

            return (
              <Link key={gift.id} href={`/admin/registry/${gift.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{gift.name}</CardTitle>
                      {gift.is_fulfilled && (
                        <Badge variant="success">Fulfilled</Badge>
                      )}
                    </div>
                    {gift.event && (
                      <p className="text-sm text-gray-500">{gift.event.title}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {gift.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{gift.description}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{formatCurrency(gift.current_amount)}</span>
                        <span className="text-gray-500">{formatCurrency(gift.target_amount)}</span>
                      </div>
                      <Progress value={percentage} />
                      <p className="text-xs text-gray-500 text-right">{percentage.toFixed(0)}% funded</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
