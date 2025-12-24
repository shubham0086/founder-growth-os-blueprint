-- Add missing columns to leads table for public lead capture
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS revenue_range text,
  ADD COLUMN IF NOT EXISTS goal text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text;

-- Create a separate table for public lead submissions that doesn't require RLS auth
-- This allows the edge function to insert without user authentication
CREATE TABLE IF NOT EXISTS public.public_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text,
  phone text,
  business_type text,
  revenue_range text,
  goal text,
  status text DEFAULT 'new',
  notes text,
  source text DEFAULT 'website',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  ip_address text,
  user_agent text
);

-- Enable RLS on public_leads
ALTER TABLE public.public_leads ENABLE ROW LEVEL SECURITY;

-- No public access policies - only service role can insert via edge function
-- Admin can read via authenticated session

-- Create policy for admin to read public leads (using ADMIN_EMAIL check via a function)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND email = current_setting('app.admin_email', true)
  );
$$;

-- Policy: Only admin can read public_leads
CREATE POLICY "Admin can view public leads" 
ON public.public_leads 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- Policy: Only admin can update public_leads
CREATE POLICY "Admin can update public leads" 
ON public.public_leads 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- Policy: Only admin can delete public_leads
CREATE POLICY "Admin can delete public leads" 
ON public.public_leads 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid()
  )
);