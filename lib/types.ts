export type UserRole = 'admin' | 'guest'

export type RSVPStatus = 'pending' | 'confirmed' | 'declined'

export type ExpenseStatus = 'pending' | 'paid'

export type Celebrant = 'Cova' | 'Jaime'

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

export interface Event {
  id: string
  organizer_id: string
  title: string
  celebrant: Celebrant
  event_date: string
  venue_name: string
  address_official: string
  address_google_maps: string
  address_apple_maps: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface EventGuest {
  id: string
  event_id: string
  profile_id: string
  status: RSVPStatus
  plus_ones: number
  dietary_notes: string | null
  responded_at: string | null
  created_at: string
  profile?: Profile
}

export interface GiftRegistryItem {
  id: string
  event_id: string
  name: string
  description: string | null
  target_amount: number
  current_amount: number
  image_url: string | null
  is_fulfilled: boolean
  created_at: string
}

export interface Contribution {
  id: string
  gift_id: string
  contributor_id: string
  amount: number
  message: string | null
  is_anonymous: boolean
  created_at: string
  contributor?: Profile
}

export interface Supplier {
  id: string
  name: string
  category: string
  contact_email: string | null
  contact_phone: string | null
  notes: string | null
  created_at: string
}

export interface Expense {
  id: string
  event_id: string
  supplier_id: string | null
  description: string
  amount: number
  status: ExpenseStatus
  due_date: string | null
  paid_date: string | null
  created_at: string
  supplier?: Supplier
}

export const VENUE = {
  name: 'Encinas' as string,
  official: 'Encinas (Bularas), 1 - 28224 Pozuelo de Alarcón, Spain' as string,
  googleMaps: 'Encina Alam Bul, 1, 28224 Pozuelo de Alarcón, Spain' as string,
  appleMaps: 'Encinas Alameda Bul, 1, 28224 Pozuelo de Alarcón, Spain' as string,
  googleMapsUrl: 'https://maps.google.com/?q=Encina+Alam+Bul+1+28224+Pozuelo+de+Alarcon+Spain',
  appleMapsUrl: 'https://maps.apple.com/?q=Encinas+Alameda+Bul+1+28224+Pozuelo+de+Alarcon+Spain',
}
