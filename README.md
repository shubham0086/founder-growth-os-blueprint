# Creator Growth Engine

A production-ready growth marketing platform with lead capture, admin management, and analytics.

## Required Environment Variables

```env
# Supabase (auto-configured by Lovable Cloud)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Admin Access
VITE_ADMIN_EMAIL=admin@yourdomain.com

# Analytics (optional)
VITE_GA4_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=your_pixel_id
```

## Database Setup

The `public_leads` table is created via migration with RLS enabled:
- **Public users cannot directly insert** - leads are submitted via the `submit-lead` edge function using SERVICE_ROLE_KEY
- **Only authenticated users can read** - admin access is checked via email match

### RLS Policies
- `Admin can view public leads` - SELECT for authenticated users
- `Admin can update public leads` - UPDATE for authenticated users  
- `Admin can delete public leads` - DELETE for authenticated users

## Setting Admin Email

1. Set `VITE_ADMIN_EMAIL` in your environment
2. Or update `src/lib/siteConfig.ts` directly

## End-to-End Testing

1. **Submit a lead**: Fill out the public lead form on any page using `<PublicLeadForm />`
2. **View in admin**: Navigate to `/admin` and login with the admin email
3. **Manage leads**: Update status, add notes, filter and search
4. **Export CSV**: Click "Export CSV" to download all leads

## Key Features

- ✅ Secure lead capture with honeypot + rate limiting
- ✅ UTM parameter tracking
- ✅ Admin dashboard with magic link auth
- ✅ CSV export
- ✅ GA4 + Meta Pixel integration
- ✅ Legal pages (Privacy, Terms, Refund)
- ✅ Dark/Light mode

## Site Configuration

All brand info and links are in `src/lib/siteConfig.ts`:
- Contact email, WhatsApp number
- Calendar booking link
- Sprint payment link
- Brand name and tagline

## Connecting a Domain

1. Go to Lovable → Project Settings → Domains
2. Click "Connect Domain"
3. Follow DNS configuration instructions
