'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteEventButtonProps {
  eventId: string
  eventTitle: string
}

export function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    
    // Delete related records first (due to foreign keys)
    await supabase.from('event_guests').delete().eq('event_id', eventId)
    await supabase.from('gift_registry').delete().eq('event_id', eventId)
    await supabase.from('expenses').delete().eq('event_id', eventId)
    
    // Then delete the event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      alert(`Error deleting event: ${error.message}`)
      setLoading(false)
      return
    }

    router.refresh()
    setShowConfirm(false)
    setLoading(false)
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Delete'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      title={`Delete ${eventTitle}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
