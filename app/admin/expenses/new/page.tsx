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
import type { Event, Supplier } from '@/lib/types'

export default function NewExpensePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    event_id: '',
    supplier_id: '',
    status: 'pending',
    due_date: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const [eventsRes, suppliersRes] = await Promise.all([
        supabase.from('events').select('*').order('event_date', { ascending: false }),
        supabase.from('suppliers').select('*').order('name'),
      ])
      if (eventsRes.data) setEvents(eventsRes.data)
      if (suppliersRes.data) setSuppliers(suppliersRes.data)
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('expenses').insert({
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      event_id: formData.event_id || null,
      supplier_id: formData.supplier_id || null,
      status: formData.status,
      due_date: formData.due_date || null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/expenses')
    }
  }

  return (
    <div>
      <Link href="/admin/expenses" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to expenses
      </Link>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this expense for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={2}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="150.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_id">Event (optional)</Label>
              <Select
                id="event_id"
                value={formData.event_id}
                onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
              >
                <option value="">No specific event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_id">Supplier (optional)</Label>
              <Select
                id="supplier_id"
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              >
                <option value="">No supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.category})
                  </option>
                ))}
              </Select>
              <Link href="/admin/suppliers/new" className="text-sm text-primary hover:underline">
                + Add new supplier
              </Link>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date (optional)</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                  'Add Expense'
                )}
              </Button>
              <Link href="/admin/expenses">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
