// Core data types for Founder Growth OS

export interface Workspace {
  id: string;
  name: string;
  industry: string;
  region: string;
  currency: string;
  timezone: string;
  created_at: string;
}

export interface Competitor {
  id: string;
  workspace_id: string;
  name: string;
  url: string;
  notes: string;
  created_at: string;
}

export interface ResearchFinding {
  id: string;
  workspace_id: string;
  type: 'pricing' | 'offer' | 'objections' | 'angles' | 'positioning';
  content: Record<string, any>;
  sources: string[];
  created_at: string;
}

export interface OfferBlueprint {
  id: string;
  workspace_id: string;
  version: number;
  name: string;
  promise: string;
  mechanism: string;
  proof: string;
  tiers: OfferTier[];
  objections: ObjectionResponse[];
  status: 'draft' | 'approved';
  created_at: string;
}

export interface OfferTier {
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

export interface ObjectionResponse {
  objection: string;
  response: string;
}

export interface LandingPage {
  id: string;
  workspace_id: string;
  title: string;
  slug: string;
  sections: LandingSection[];
  status: 'draft' | 'published';
  published_url?: string;
  created_at: string;
}

export interface LandingSection {
  type: 'hero' | 'problem' | 'proof' | 'mechanism' | 'features' | 'testimonials' | 'faq' | 'cta';
  content: Record<string, any>;
}

export interface Asset {
  id: string;
  workspace_id: string;
  type: 'ad_copy' | 'video_script' | 'creative_brief' | 'email';
  name: string;
  content: string;
  tags: string[];
  status: 'draft' | 'approved';
  created_at: string;
}

export interface CampaignPlan {
  id: string;
  workspace_id: string;
  name: string;
  platform: 'google' | 'meta' | 'linkedin';
  structure: Record<string, any>;
  budget_rules: {
    min: number;
    max: number;
    scale_conditions: string[];
  };
  status: 'draft' | 'approved' | 'active';
  created_at: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  utm: Record<string, string>;
  stage: 'new' | 'contacted' | 'booked' | 'qualified' | 'won' | 'lost';
  score: number;
  notes: string;
  created_at: string;
}

export interface Experiment {
  id: string;
  workspace_id: string;
  hypothesis: string;
  metric: string;
  variants: string[];
  status: 'backlog' | 'running' | 'completed';
  result?: Record<string, any>;
  created_at: string;
}

export interface MetricsDaily {
  id: string;
  workspace_id: string;
  date: string;
  spend: number;
  clicks: number;
  leads: number;
  cpl: number;
  bookings: number;
  revenue?: number;
  notes?: string;
}

export interface Automation {
  id: string;
  workspace_id: string;
  name: string;
  channel: 'email' | 'whatsapp';
  trigger: string;
  template: string;
  sequence_order: number;
  delay_hours: number;
  status: 'active' | 'paused';
  created_at: string;
}

export type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};
