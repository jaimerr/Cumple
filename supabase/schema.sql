-- Cumple Birthday Planning App - Database Schema
-- Run this SQL in your Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (users - both admins and guests)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'guest' CHECK (role IN ('admin', 'guest')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (birthday parties)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  celebrant TEXT NOT NULL CHECK (celebrant IN ('Cova', 'Jaime')),
  event_date DATE NOT NULL,
  venue_name TEXT DEFAULT 'Encinas',
  address_official TEXT DEFAULT 'Encinas (Bularas), 1 - 28224 Pozuelo de Alarcón, Spain',
  address_google_maps TEXT DEFAULT 'Encina Alam Bul, 1, 28224 Pozuelo de Alarcón, Spain',
  address_apple_maps TEXT DEFAULT 'Encinas Alameda Bul, 1, 28224 Pozuelo de Alarcón, Spain',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event guests (invited guests per event)
CREATE TABLE IF NOT EXISTS event_guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  plus_ones INTEGER DEFAULT 0,
  dietary_notes TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, profile_id)
);

-- Gift registry
CREATE TABLE IF NOT EXISTS gift_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,2) DEFAULT 0,
  current_amount DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  is_fulfilled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contributions to gifts
CREATE TABLE IF NOT EXISTS contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_id UUID NOT NULL REFERENCES gift_registry(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_event_guests_event ON event_guests(event_id);
CREATE INDEX IF NOT EXISTS idx_event_guests_profile ON event_guests(profile_id);
CREATE INDEX IF NOT EXISTS idx_event_guests_status ON event_guests(status);
CREATE INDEX IF NOT EXISTS idx_gift_registry_event ON gift_registry(event_id);
CREATE INDEX IF NOT EXISTS idx_contributions_gift ON contributions(gift_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event ON expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_expenses_supplier ON expenses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Anyone can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Events policies
CREATE POLICY "Active events are viewable by everyone" ON events
  FOR SELECT USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Event organizers can update events" ON events
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Event organizers can delete events" ON events
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Event guests policies
CREATE POLICY "Event guests viewable by authenticated users" ON event_guests
  FOR SELECT USING (auth.uid() IS NOT NULL OR profile_id::text = auth.uid()::text);

CREATE POLICY "Authenticated users can manage guests" ON event_guests
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Gift registry policies
CREATE POLICY "Gift registry viewable by everyone" ON gift_registry
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage registry" ON gift_registry
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Contributions policies
CREATE POLICY "Contributions viewable by authenticated users" ON contributions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can create contributions" ON contributions
  FOR INSERT WITH CHECK (true);

-- Suppliers policies
CREATE POLICY "Suppliers viewable by authenticated users" ON suppliers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage suppliers" ON suppliers
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Expenses policies
CREATE POLICY "Expenses viewable by authenticated users" ON expenses
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage expenses" ON expenses
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default admin profiles for Cova and Jaime
-- You'll need to update these with actual emails
INSERT INTO profiles (email, name, role) VALUES
  ('cova@encinas.casa', 'Covadonga', 'admin'),
  ('jaime@encinas.casa', 'Jaime', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin', name = EXCLUDED.name;
