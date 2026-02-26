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

Create `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL (for magic links)
NEXT_PUBLIC_APP_URL=https://cumple.encinas.casa

# Gmail SMTP (for custom invitation emails)
GMAIL_USER=jaime.rodriguezramos@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
```

#### Getting the Service Role Key
1. Go to Supabase Dashboard > Project Settings > API
2. Copy the `service_role` key (keep this secret!)

#### Getting Gmail App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to App Passwords (search "app passwords" in account)
4. Create new app password for "Mail" > "Other (Custom name)" = "Cumple App"
5. Copy the 16-character password

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
   - `NEXT_PUBLIC_APP_URL` = `https://cumple.encinas.casa`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
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
