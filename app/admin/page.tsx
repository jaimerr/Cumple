import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Gift, Receipt } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [eventsResult, guestsResult, giftsResult, expensesResult] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact' }),
    supabase.from('event_guests').select('*', { count: 'exact' }),
    supabase.from('gift_registry').select('*', { count: 'exact' }),
    supabase.from('expenses').select('amount'),
  ])

  const totalEvents = eventsResult.count || 0
  const totalGuests = guestsResult.count || 0
  const totalGifts = giftsResult.count || 0
  const totalExpenses = expensesResult.data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0

  const confirmedGuests = guestsResult.data?.filter((g: any) => g.status === 'confirmed').length || 0

  const stats = [
    {
      name: 'Total Events',
      value: totalEvents,
      icon: Calendar,
      href: '/admin/events',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Guests Invited',
      value: totalGuests,
      subValue: `${confirmedGuests} confirmed`,
      icon: Users,
      href: '/admin/guests',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Registry Items',
      value: totalGifts,
      icon: Gift,
      href: '/admin/registry',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Expenses',
      value: `€${totalExpenses.toLocaleString('es-ES')}`,
      icon: Receipt,
      href: '/admin/expenses',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Cumple - manage birthdays for Cova & Jaime</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.subValue && (
                  <p className="text-sm text-gray-500 mt-1">{stat.subValue}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/admin/events/new">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Create New Event
              </Button>
            </Link>
            <Link href="/admin/guests/new">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Add Guest
              </Button>
            </Link>
            <Link href="/admin/registry/new">
              <Button className="w-full justify-start" variant="outline">
                <Gift className="mr-2 h-4 w-4" />
                Add Registry Item
              </Button>
            </Link>
            <Link href="/admin/suppliers/new">
              <Button className="w-full justify-start" variant="outline">
                <Receipt className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About the Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-lg mb-2">Encinas</p>
            <p className="text-gray-600 mb-4">
              Encinas (Bularas), 1<br />
              28224 Pozuelo de Alarcón, Spain
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://maps.google.com/?q=Encina+Alam+Bul+1+28224+Pozuelo+de+Alarcon+Spain"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm">
                  Google Maps
                </Button>
              </a>
              <a
                href="https://maps.apple.com/?q=Encinas+Alameda+Bul+1+28224+Pozuelo+de+Alarcon+Spain"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary" size="sm">
                  Apple Maps
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
