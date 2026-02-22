# Cumple - Birthday Planning App

A birthday planning application for Cova & Jaime, featuring guest management, gift registry, and expense tracking.

## Features

- **Admin Dashboard**: Manage events, guests, gift registry, expenses, and suppliers
- **Guest Portal**: RSVP and contribute to gift registry
- **Magic Link Authentication**: Secure, passwordless login
- **Multi-Map Support**: Location links for Google Maps and Apple Maps

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth)
- **Deployment**: Netlify

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Set up Supabase

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the contents of `supabase/schema.sql` to create all tables

### 3. Configure Environment

Create `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Configure Supabase Auth

In your Supabase project:
1. Go to Authentication > URL Configuration
2. Set Site URL to your domain (e.g., `https://encinas.casa`)
3. Add redirect URLs:
   - `https://encinas.casa/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment to Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Venue Information

- **Official Address**: Encinas (Bularas), 1 - 28224 Pozuelo de Alarcón, Spain
- **Google Maps**: Encina Alam Bul, 1
- **Apple Maps**: Encinas Alameda Bul, 1

## Admin Access

Default admin profiles are created for:
- cova@encinas.casa
- jaime@encinas.casa

Update these emails in the database as needed.
