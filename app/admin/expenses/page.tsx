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
import { Plus, Receipt } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('expenses')
    .select('*, supplier:suppliers(*), event:events(id, title)')
    .order('created_at', { ascending: false })

  if (params.event) {
    query = query.eq('event_id', params.event)
  }

  const { data: expenses } = await query

  const { data: events } = await supabase
    .from('events')
    .select('id, title')
    .order('event_date', { ascending: false })

  const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0
  const paidExpenses = expenses?.filter((e) => e.status === 'paid').reduce((sum, e) => sum + (e.amount || 0), 0) || 0
  const pendingExpenses = totalExpenses - paidExpenses

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track party expenses and payments</p>
        </div>
        <Link href="/admin/expenses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-sm text-gray-600">Total Expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidExpenses)}</div>
            <p className="text-sm text-gray-600">Paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingExpenses)}</div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
      </div>

      {events && events.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          <Link href="/admin/expenses">
            <Button variant={!params.event ? 'default' : 'outline'} size="sm">
              All Events
            </Button>
          </Link>
          {events.map((event) => (
            <Link key={event.id} href={`/admin/expenses?event=${event.id}`}>
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

      {!expenses || expenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses recorded</h3>
            <p className="text-gray-600 mb-4">Start tracking party expenses.</p>
            <Link href="/admin/expenses/new">
              <Button>Add Expense</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell className="text-sm">{expense.event?.title || '-'}</TableCell>
                  <TableCell className="text-sm">{expense.supplier?.name || '-'}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={expense.status === 'paid' ? 'success' : 'warning'}>
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {expense.due_date ? formatDate(expense.due_date) : '-'}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/expenses/${expense.id}`}>
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
