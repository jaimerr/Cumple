'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Loader2, Gift, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import type { GiftRegistryItem, Event } from '@/lib/types'

export default function ContributePage({
  params,
}: {
  params: Promise<{ id: string; giftId: string }>
}) {
  const { id, giftId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [gift, setGift] = useState<GiftRegistryItem | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    message: '',
    is_anonymous: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      const [giftRes, eventRes] = await Promise.all([
        supabase.from('gift_registry').select('*').eq('id', giftId).single(),
        supabase.from('events').select('*').eq('id', id).single(),
      ])

      if (giftRes.data) setGift(giftRes.data)
      if (eventRes.data) setEvent(eventRes.data)
      setLoading(false)
    }
    fetchData()
  }, [giftId, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      setSubmitting(false)
      return
    }

    // Check if contributor profile exists or create one
    let profileId: string | null = null

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', formData.email)
      .single()

    if (existingProfile) {
      profileId = existingProfile.id
    } else {
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email: formData.email,
          name: formData.name,
          role: 'guest',
        })
        .select('id')
        .single()

      if (profileError) {
        setError('Could not save contribution. Please try again.')
        setSubmitting(false)
        return
      }
      profileId = newProfile.id
    }

    // Create contribution
    const { error: contribError } = await supabase.from('contributions').insert({
      gift_id: giftId,
      contributor_id: profileId,
      amount: amount,
      message: formData.message || null,
      is_anonymous: formData.is_anonymous,
    })

    if (contribError) {
      setError('Could not save contribution. Please try again.')
      setSubmitting(false)
      return
    }

    // Update gift current amount
    const newAmount = (gift?.current_amount || 0) + amount
    const isFulfilled = newAmount >= (gift?.target_amount || 0)

    await supabase
      .from('gift_registry')
      .update({
        current_amount: newAmount,
        is_fulfilled: isFulfilled,
      })
      .eq('id', giftId)

    setSuccess(true)
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!gift || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Gift not found</p>
            <Link href={`/event/${id}`}>
              <Button className="mt-4">Back to event</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              Your contribution of {formatCurrency(parseFloat(formData.amount))} has been recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              {event.celebrant} will appreciate your generosity!
            </p>
            <Link href={`/event/${id}`}>
              <Button>Back to Event</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const percentage = gift.target_amount > 0
    ? Math.min((gift.current_amount / gift.target_amount) * 100, 100)
    : 0
  const remaining = Math.max(gift.target_amount - gift.current_amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="container mx-auto max-w-lg">
        <Link
          href={`/event/${id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to event
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{gift.name}</CardTitle>
                <CardDescription>For {event.celebrant}'s birthday</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {gift.description && (
              <p className="text-gray-600 mb-4">{gift.description}</p>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>{formatCurrency(gift.current_amount)} raised</span>
                <span className="text-gray-500">Goal: {formatCurrency(gift.target_amount)}</span>
              </div>
              <Progress value={percentage} className="mb-2" />
              <p className="text-sm text-gray-500">
                {formatCurrency(remaining)} still needed
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Contribution Amount (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="50.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
                <div className="flex gap-2 mt-2">
                  {[20, 50, 100].map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, amount: amt.toString() })}
                    >
                      €{amt}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Write a message for the birthday person..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_anonymous" className="font-normal">
                  Make my contribution anonymous
                </Label>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Contribute ${formData.amount ? formatCurrency(parseFloat(formData.amount) || 0) : ''}`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Note: This records your pledge. Payment should be arranged separately with Cova or Jaime.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
