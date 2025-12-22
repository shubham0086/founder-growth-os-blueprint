-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  industry TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  region TEXT,
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competitors table
CREATE TABLE public.competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create research_findings table
CREATE TABLE public.research_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pricing', 'offer', 'objections', 'angles', 'positioning')),
  content JSONB NOT NULL DEFAULT '{}',
  sources TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create offer_blueprints table
CREATE TABLE public.offer_blueprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  promise TEXT,
  mechanism TEXT,
  proof TEXT,
  tiers JSONB DEFAULT '[]',
  objections JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create landing_pages table
CREATE TABLE public.landing_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  sections JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ad_copy', 'video_script', 'creative_brief', 'email')),
  name TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_plans table
CREATE TABLE public.campaign_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('google', 'meta', 'linkedin')),
  structure JSONB DEFAULT '{}',
  budget_rules JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  utm JSONB DEFAULT '{}',
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'booked', 'qualified', 'won', 'lost')),
  score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create experiments table
CREATE TABLE public.experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  hypothesis TEXT NOT NULL,
  metric TEXT,
  variants TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'running', 'completed')),
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create metrics_daily table
CREATE TABLE public.metrics_daily (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  spend DECIMAL(12,2) DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  cpl DECIMAL(12,2) DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  revenue DECIMAL(12,2),
  notes TEXT,
  UNIQUE(workspace_id, date)
);

-- Create automations table
CREATE TABLE public.automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  trigger_event TEXT NOT NULL,
  template TEXT,
  sequence_order INTEGER DEFAULT 1,
  delay_hours INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Workspaces RLS policies
CREATE POLICY "Users can view their own workspaces" ON public.workspaces FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workspaces" ON public.workspaces FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workspaces" ON public.workspaces FOR DELETE USING (auth.uid() = user_id);

-- Helper function to check workspace ownership
CREATE OR REPLACE FUNCTION public.user_owns_workspace(workspace_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspaces WHERE id = workspace_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Competitors RLS policies
CREATE POLICY "Users can view competitors in their workspaces" ON public.competitors FOR SELECT USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can create competitors in their workspaces" ON public.competitors FOR INSERT WITH CHECK (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can update competitors in their workspaces" ON public.competitors FOR UPDATE USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete competitors in their workspaces" ON public.competitors FOR DELETE USING (public.user_owns_workspace(workspace_id));

-- Research findings RLS policies
CREATE POLICY "Users can view research in their workspaces" ON public.research_findings FOR SELECT USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can create research in their workspaces" ON public.research_findings FOR INSERT WITH CHECK (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can update research in their workspaces" ON public.research_findings FOR UPDATE USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete research in their workspaces" ON public.research_findings FOR DELETE USING (public.user_owns_workspace(workspace_id));

-- Offer blueprints RLS policies
CREATE POLICY "Users can view offers in their workspaces" ON public.offer_blueprints FOR SELECT USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can create offers in their workspaces" ON public.offer_blueprints FOR INSERT WITH CHECK (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can update offers in their workspaces" ON public.offer_blueprints FOR UPDATE USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete offers in their workspaces" ON public.offer_blueprints FOR DELETE USING (public.user_owns_workspace(workspace_id));

-- Landing pages RLS policies
CREATE POLICY "Users can view landing pages in their workspaces" ON public.landing_pages FOR SELECT USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can create landing pages in their workspaces" ON public.landing_pages FOR INSERT WITH CHECK (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can update landing pages in their workspaces" ON public.landing_pages FOR UPDATE USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete landing pages in their workspaces" ON public.landing_pages FOR DELETE USING (public.user_owns_workspace(workspace_id));

-- Assets RLS policies
CREATE POLICY "Users can view assets in their workspaces" ON public.assets FOR SELECT USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can create assets in their workspaces" ON public.assets FOR INSERT WITH CHECK (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can update assets in their workspaces" ON public.assets FOR UPDATE USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete assets in their workspaces" ON public.assets FOR DELETE USING (public.user_owns_workspace(workspace_id));

-- Campaign plans RLS policies
CREATE POLICY "Users can view campaigns in their workspaces" ON public.campaign_plans FOR SELECT USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can create campaigns in their workspaces" ON public.campaign_plans FOR INSERT WITH CHECK (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can update campaigns in their workspaces" ON public.campaign_plans FOR UPDATE USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete campaigns in their workspaces" ON public.campaign_plans FOR DELETE USING (public.user_owns_workspace(workspace_id));

-- Leads RLS policies
CREATE POLICY "Users can view leads in their workspaces" ON public.leads FOR SELECT USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can create leads in their workspaces" ON public.leads FOR INSERT WITH CHECK (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can update leads in their workspaces" ON public.leads FOR UPDATE USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete leads in their workspaces" ON public.leads FOR DELETE USING (public.user_owns_workspace(workspace_id));

-- Experiments RLS policies
CREATE POLICY "Users can view experiments in their workspaces" ON public.experiments FOR SELECT USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can create experiments in their workspaces" ON public.experiments FOR INSERT WITH CHECK (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can update experiments in their workspaces" ON public.experiments FOR UPDATE USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete experiments in their workspaces" ON public.experiments FOR DELETE USING (public.user_owns_workspace(workspace_id));

-- Metrics daily RLS policies
CREATE POLICY "Users can view metrics in their workspaces" ON public.metrics_daily FOR SELECT USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can create metrics in their workspaces" ON public.metrics_daily FOR INSERT WITH CHECK (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can update metrics in their workspaces" ON public.metrics_daily FOR UPDATE USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete metrics in their workspaces" ON public.metrics_daily FOR DELETE USING (public.user_owns_workspace(workspace_id));

-- Automations RLS policies
CREATE POLICY "Users can view automations in their workspaces" ON public.automations FOR SELECT USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can create automations in their workspaces" ON public.automations FOR INSERT WITH CHECK (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can update automations in their workspaces" ON public.automations FOR UPDATE USING (public.user_owns_workspace(workspace_id));
CREATE POLICY "Users can delete automations in their workspaces" ON public.automations FOR DELETE USING (public.user_owns_workspace(workspace_id));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_offer_blueprints_updated_at BEFORE UPDATE ON public.offer_blueprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON public.landing_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaign_plans_updated_at BEFORE UPDATE ON public.campaign_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON public.experiments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_workspaces_user_id ON public.workspaces(user_id);
CREATE INDEX idx_competitors_workspace_id ON public.competitors(workspace_id);
CREATE INDEX idx_research_findings_workspace_id ON public.research_findings(workspace_id);
CREATE INDEX idx_offer_blueprints_workspace_id ON public.offer_blueprints(workspace_id);
CREATE INDEX idx_landing_pages_workspace_id ON public.landing_pages(workspace_id);
CREATE INDEX idx_assets_workspace_id ON public.assets(workspace_id);
CREATE INDEX idx_campaign_plans_workspace_id ON public.campaign_plans(workspace_id);
CREATE INDEX idx_leads_workspace_id ON public.leads(workspace_id);
CREATE INDEX idx_leads_stage ON public.leads(stage);
CREATE INDEX idx_experiments_workspace_id ON public.experiments(workspace_id);
CREATE INDEX idx_metrics_daily_workspace_id ON public.metrics_daily(workspace_id);
CREATE INDEX idx_metrics_daily_date ON public.metrics_daily(date);
CREATE INDEX idx_automations_workspace_id ON public.automations(workspace_id);