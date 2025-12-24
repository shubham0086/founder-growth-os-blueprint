# Antigravity ADE - Developer Documentation

> Complete technical guide for understanding, modifying, and extending the Founder Growth OS platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Current Integrations](#current-integrations)
3. [Edge Functions](#edge-functions)
4. [Custom API Integration Guide](#custom-api-integration-guide)
5. [Research & Scraping System](#research--scraping-system)
6. [Lead Management System](#lead-management-system)
7. [Authentication & Security](#authentication--security)
8. [Database Schema](#database-schema)
9. [Migration Guides](#migration-guides)
10. [Environment Variables](#environment-variables)

---

## Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | TanStack React Query |
| Backend | Supabase (Lovable Cloud) |
| Edge Functions | Deno (Supabase Edge Functions) |
| Database | PostgreSQL |
| Authentication | Supabase Auth |

### Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── layout/          # Layout components (Sidebar, Footer)
│   │   ├── analytics/       # Analytics dashboards
│   │   ├── leads/           # Lead management
│   │   ├── settings/        # Settings & integrations
│   │   └── forms/           # Public forms
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Route pages
│   ├── lib/                 # Utilities & API clients
│   └── integrations/        # Supabase client & types
├── supabase/
│   ├── functions/           # Edge functions
│   └── config.toml          # Supabase configuration
└── docs/                    # Documentation
```

---

## Current Integrations

### Native Connectors (via Lovable)

These are managed through Lovable's connector system and inject environment variables automatically:

| Connector | Env Variable | Purpose |
|-----------|--------------|---------|
| Firecrawl | `FIRECRAWL_API_KEY` | Web scraping & competitor analysis |
| Perplexity AI | `PERPLEXITY_API_KEY` | AI research & market analysis |
| ElevenLabs | `ELEVENLABS_API_KEY` | Text-to-speech for weekly briefs |

### Ad Platform Integrations

| Platform | OAuth Flow | Data Stored |
|----------|------------|-------------|
| Google Ads | `google-ads-auth-start` → `google-ads-auth-callback` | `google_ads_connections`, `google_ads_campaigns`, `google_ads_metrics_daily` |
| Meta Ads | `meta-ads-auth-start` → `meta-ads-auth-callback` | `meta_ads_connections`, `meta_campaigns`, `meta_metrics_daily` |

---

## Edge Functions

### Current Edge Functions

```
supabase/functions/
├── ai-generate/           # AI content generation (Perplexity)
├── ai-insights/           # AI-powered insights
├── ai-research/           # Market research (Perplexity)
├── firecrawl-scrape/      # Web scraping (Firecrawl)
├── google-ads-auth-start/ # Google OAuth initiation
├── google-ads-auth-callback/ # Google OAuth callback
├── google-ads-list-accounts/ # List Google Ads accounts
├── google-ads-sync/       # Sync Google Ads data
├── meta-ads-auth-start/   # Meta OAuth initiation
├── meta-ads-auth-callback/ # Meta OAuth callback
├── meta-ads-list-accounts/ # List Meta Ad accounts
├── meta-ads-sync/         # Sync Meta Ads data
├── score-leads/           # AI lead scoring
├── scrape-competitor/     # Competitor analysis
├── submit-lead/           # Public lead submission
└── text-to-speech/        # TTS for briefs
```

### Edge Function Template

```typescript
// supabase/functions/my-function/index.ts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { param1, param2 } = await req.json();

    // Get API key from environment
    const apiKey = Deno.env.get('MY_API_KEY');
    if (!apiKey) {
      console.error('MY_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Your logic here
    const result = await someApiCall(apiKey, param1, param2);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Calling Edge Functions from Frontend

```typescript
import { supabase } from '@/integrations/supabase/client';

// Method 1: Using Supabase client (recommended)
const { data, error } = await supabase.functions.invoke('my-function', {
  body: { param1: 'value1', param2: 'value2' },
});

// Method 2: Direct fetch (for public functions)
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/my-function`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ param1: 'value1' }),
  }
);
```

---

## Custom API Integration Guide

### Replacing Firecrawl with Custom Scraping

#### Option 1: Self-Hosted Firecrawl

```typescript
// supabase/functions/custom-scrape/index.ts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, options } = await req.json();

    // Use your self-hosted Firecrawl instance
    const FIRECRAWL_URL = Deno.env.get('CUSTOM_FIRECRAWL_URL') || 'https://your-firecrawl.com';
    const apiKey = Deno.env.get('CUSTOM_FIRECRAWL_API_KEY');

    const response = await fetch(`${FIRECRAWL_URL}/v1/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: options?.formats || ['markdown'],
        onlyMainContent: options?.onlyMainContent ?? true,
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

#### Option 2: Alternative Scraping Services

```typescript
// supabase/functions/custom-scrape/index.ts

// ScrapingBee example
async function scrapeWithScrapingBee(url: string) {
  const apiKey = Deno.env.get('SCRAPINGBEE_API_KEY');
  const response = await fetch(
    `https://app.scrapingbee.com/api/v1?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=true`
  );
  return response.text();
}

// Browserless example
async function scrapeWithBrowserless(url: string) {
  const apiKey = Deno.env.get('BROWSERLESS_API_KEY');
  const response = await fetch(
    `https://chrome.browserless.io/content?token=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }
  );
  return response.text();
}

// Crawlee/Apify example
async function scrapeWithApify(url: string) {
  const apiKey = Deno.env.get('APIFY_API_KEY');
  const response = await fetch(
    `https://api.apify.com/v2/acts/apify~web-scraper/runs?token=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: [{ url }],
        pageFunction: async function pageFunction(context) {
          return {
            title: document.title,
            content: document.body.innerText,
          };
        },
      }),
    }
  );
  return response.json();
}
```

#### Option 3: Puppeteer/Playwright via External Service

```typescript
// supabase/functions/puppeteer-scrape/index.ts

Deno.serve(async (req) => {
  const { url } = await req.json();
  
  // Use a Puppeteer-as-a-service endpoint
  const PUPPETEER_SERVICE_URL = Deno.env.get('PUPPETEER_SERVICE_URL');
  
  const response = await fetch(PUPPETEER_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      actions: [
        { type: 'waitForSelector', selector: 'body' },
        { type: 'evaluate', script: 'document.body.innerHTML' },
      ],
    }),
  });

  return new Response(JSON.stringify(await response.json()), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Replacing Perplexity with Custom AI

#### Option 1: OpenAI Direct

```typescript
// supabase/functions/custom-ai-research/index.ts

Deno.serve(async (req) => {
  const { query, type } = await req.json();
  const apiKey = Deno.env.get('OPENAI_API_KEY');

  const systemPrompts = {
    pricing: 'You are a pricing analyst. Analyze competitor pricing strategies.',
    offer: 'You are a marketing strategist. Analyze the main offer and value proposition.',
    objections: 'You are a sales expert. Identify common customer objections.',
    angles: 'You are a copywriter. Generate marketing angles and hooks.',
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompts[type] || systemPrompts.pricing },
        { role: 'user', content: query },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify({
    content: data.choices[0].message.content,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

#### Option 2: Anthropic Claude

```typescript
// supabase/functions/claude-research/index.ts

Deno.serve(async (req) => {
  const { query, type } = await req.json();
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: query }],
    }),
  });

  const data = await response.json();
  return new Response(JSON.stringify({
    content: data.content[0].text,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

#### Option 3: Lovable AI (No API Key Required)

```typescript
// Use Lovable's built-in AI models - no API key needed!
// Available models:
// - google/gemini-2.5-pro
// - google/gemini-2.5-flash
// - openai/gpt-5
// - openai/gpt-5-mini

// This is handled through Lovable's internal AI infrastructure
// and doesn't require custom edge functions for basic AI tasks
```

---

## Research & Scraping System

### Current Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Research.tsx  │────▶│   useResearch    │────▶│ scrape-competitor│
│   (UI Page)     │     │   (Hook)         │     │ (Edge Function) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                        │
                                ▼                        ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │   ai-research    │     │   Firecrawl or  │
                        │ (Edge Function)  │     │   Perplexity    │
                        └──────────────────┘     └─────────────────┘
```

### API Endpoints Reference

#### 1. Scrape Competitor

**Endpoint:** `POST /functions/v1/scrape-competitor`

**Request:**
```json
{
  "url": "https://competitor.com",
  "extractType": "pricing" | "offer" | "full"
}
```

**Response:**
```json
{
  "success": true,
  "content": "Scraped markdown content...",
  "pricing": "$99/month",
  "mainOffer": "All-in-one marketing platform",
  "source": "firecrawl" | "perplexity"
}
```

#### 2. AI Research

**Endpoint:** `POST /functions/v1/ai-research`

**Request:**
```json
{
  "query": "Analyze pricing strategies for SaaS marketing tools",
  "type": "pricing" | "offer" | "objections" | "angles" | "positioning" | "general",
  "sources": ["competitor1.com", "competitor2.com"]
}
```

**Response:**
```json
{
  "content": "AI-generated analysis...",
  "citations": ["https://source1.com", "https://source2.com"]
}
```

#### 3. Firecrawl Scrape (Direct)

**Endpoint:** `POST /functions/v1/firecrawl-scrape`

**Request:**
```json
{
  "url": "https://example.com",
  "options": {
    "formats": ["markdown", "html", "screenshot", "links"],
    "onlyMainContent": true,
    "waitFor": 5000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "markdown": "# Page Title\n\nContent...",
    "html": "<html>...</html>",
    "screenshot": "base64-encoded-image",
    "links": ["https://example.com/page1"],
    "metadata": {
      "title": "Page Title",
      "description": "...",
      "sourceURL": "https://example.com"
    }
  }
}
```

### Creating Custom Research Endpoints

```typescript
// src/lib/api/research.ts

import { supabase } from '@/integrations/supabase/client';

export interface ResearchOptions {
  provider: 'firecrawl' | 'scrapingbee' | 'browserless' | 'custom';
  aiProvider: 'perplexity' | 'openai' | 'anthropic' | 'lovable';
}

export const researchApi = {
  // Scrape a single URL
  async scrapeUrl(url: string, options?: Partial<ResearchOptions>) {
    const functionName = options?.provider === 'custom' 
      ? 'custom-scrape' 
      : 'firecrawl-scrape';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { url, options },
    });
    
    if (error) throw error;
    return data;
  },

  // Run AI analysis on content
  async analyzeContent(content: string, type: string, options?: Partial<ResearchOptions>) {
    const functionName = options?.aiProvider === 'openai' 
      ? 'openai-research' 
      : 'ai-research';
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { query: content, type },
    });
    
    if (error) throw error;
    return data;
  },

  // Combined scrape + analyze
  async researchCompetitor(url: string, analysisTypes: string[]) {
    // Step 1: Scrape
    const scrapeResult = await this.scrapeUrl(url);
    
    // Step 2: Analyze for each type
    const analyses = await Promise.all(
      analysisTypes.map(type => 
        this.analyzeContent(scrapeResult.data?.markdown || '', type)
      )
    );
    
    return {
      scraped: scrapeResult,
      analyses: analysisTypes.reduce((acc, type, i) => {
        acc[type] = analyses[i];
        return acc;
      }, {} as Record<string, any>),
    };
  },
};
```

---

## Lead Management System

### Current Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ PublicLeadForm  │────▶│   submit-lead    │────▶│  public_leads   │
│   (Component)   │     │ (Edge Function)  │     │    (Table)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
                        ┌──────────────────┐             │
                        │   score-leads    │◀────────────┘
                        │ (Edge Function)  │
                        └──────────────────┘
```

### Lead Submission Endpoint

**Endpoint:** `POST /functions/v1/submit-lead`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "business_type": "SaaS",
  "revenue_range": "$100k-$500k",
  "goal": "Scale paid ads",
  "source": "website",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "brand",
  "utm_content": "hero-cta",
  "utm_term": "marketing automation"
}
```

**Response:**
```json
{
  "success": true,
  "lead_id": "uuid-here"
}
```

### Custom Lead Endpoints

#### Webhook Integration

```typescript
// supabase/functions/lead-webhook/index.ts

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lead = await req.json();
    
    // Forward to external CRM
    const CRM_WEBHOOK_URL = Deno.env.get('CRM_WEBHOOK_URL');
    if (CRM_WEBHOOK_URL) {
      await fetch(CRM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
    }

    // Forward to Slack
    const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL');
    if (SLACK_WEBHOOK_URL) {
      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New lead: ${lead.name} (${lead.email})`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*New Lead*\n• Name: ${lead.name}\n• Email: ${lead.email}\n• Goal: ${lead.goal}`,
              },
            },
          ],
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

#### Lead Scoring

```typescript
// supabase/functions/score-leads/index.ts

Deno.serve(async (req) => {
  const { lead } = await req.json();

  // Scoring logic
  let score = 50; // Base score

  // Revenue range scoring
  const revenueScores: Record<string, number> = {
    'Under $50k': 10,
    '$50k-$100k': 20,
    '$100k-$500k': 35,
    '$500k-$1M': 45,
    '$1M+': 50,
  };
  score += revenueScores[lead.revenue_range] || 0;

  // Business type scoring
  const businessScores: Record<string, number> = {
    'SaaS': 20,
    'E-commerce': 15,
    'Agency': 25,
    'Coaching': 20,
    'Other': 5,
  };
  score += businessScores[lead.business_type] || 0;

  // UTM source scoring (paid vs organic)
  if (lead.utm_medium === 'cpc' || lead.utm_medium === 'paid') {
    score += 15;
  }

  // Normalize to 0-100
  score = Math.min(100, Math.max(0, score));

  return new Response(JSON.stringify({ score }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

---

## Authentication & Security

### Current Auth Setup

- **Provider:** Supabase Auth
- **Auto-confirm:** Enabled for development
- **Anonymous users:** Disabled

### RLS Policies

All tables have Row Level Security enabled. Key policies:

```sql
-- Users can only see their own workspace data
CREATE POLICY "Users can view own workspace data"
ON public.leads FOR SELECT
USING (workspace_id IN (
  SELECT id FROM public.workspaces WHERE user_id = auth.uid()
));

-- Public leads table is insertable by anyone (for lead forms)
CREATE POLICY "Anyone can insert public leads"
ON public.public_leads FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view public leads
CREATE POLICY "Authenticated users can view public leads"
ON public.public_leads FOR SELECT
USING (auth.role() = 'authenticated');
```

### Adding Authentication to Custom Endpoints

```typescript
// supabase/functions/protected-endpoint/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Missing authorization header' }),
      { status: 401 }
    );
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid token' }),
      { status: 401 }
    );
  }

  // User is authenticated, proceed with logic
  // user.id contains the authenticated user's ID
});
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `workspaces` | Multi-tenant workspace management |
| `profiles` | User profile data |
| `leads` | Internal lead management |
| `public_leads` | Public lead capture (no auth required) |
| `competitors` | Competitor tracking |
| `research_findings` | AI research results |
| `assets` | Generated marketing assets |
| `automations` | Automation rules |
| `experiments` | A/B test tracking |

### Ad Platform Tables

| Table | Purpose |
|-------|---------|
| `google_ads_connections` | OAuth tokens for Google |
| `google_ads_accounts` | Linked Google Ads accounts |
| `google_ads_campaigns` | Campaign data |
| `google_ads_metrics_daily` | Daily performance metrics |
| `meta_ads_connections` | OAuth tokens for Meta |
| `meta_ad_accounts` | Linked Meta Ad accounts |
| `meta_campaigns` | Campaign data |
| `meta_metrics_daily` | Daily performance metrics |

### Unified Metrics View

```sql
-- ads_metrics_daily view combines Google and Meta data
SELECT 
  workspace_id,
  date,
  'google' as network,
  campaign_id,
  clicks,
  impressions,
  cost_micros / 1000000 as spend,
  conversions
FROM google_ads_metrics_daily

UNION ALL

SELECT 
  workspace_id,
  date,
  'meta' as network,
  campaign_id,
  clicks,
  impressions,
  spend,
  conversions
FROM meta_metrics_daily;
```

---

## Migration Guides

### Migrating from Firecrawl Connector to Custom API

1. **Create new edge function:**
```bash
# Create the function directory
mkdir -p supabase/functions/custom-scrape
```

2. **Add to config.toml:**
```toml
[functions.custom-scrape]
verify_jwt = true
```

3. **Add secrets:**
Use Lovable's secrets manager to add `CUSTOM_SCRAPE_API_KEY`

4. **Update API client:**
```typescript
// src/lib/api.ts
export async function scrapeCompetitor(url: string, extractType?: string) {
  const { data, error } = await supabase.functions.invoke('custom-scrape', {
    body: { url, extractType },
  });
  if (error) throw error;
  return data;
}
```

5. **Update hook:**
```typescript
// src/hooks/useResearch.tsx
// No changes needed if API signature is maintained
```

### Migrating from Perplexity to OpenAI

1. **Create new edge function** with OpenAI integration
2. **Add `OPENAI_API_KEY` secret**
3. **Update function calls** in `useResearch.tsx`

### Adding New Ad Platform

1. **Create OAuth edge functions:**
   - `platform-auth-start`
   - `platform-auth-callback`
   - `platform-list-accounts`
   - `platform-sync`

2. **Create database tables:**
```sql
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  access_token TEXT,
  refresh_token TEXT,
  -- platform-specific fields
);

CREATE TABLE platform_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  date DATE,
  campaign_id TEXT,
  -- metrics fields
);
```

3. **Add to unified view:**
```sql
-- Add to ads_metrics_daily view
UNION ALL
SELECT ... FROM platform_metrics_daily;
```

4. **Create hook:** `src/hooks/usePlatformConnection.tsx`

5. **Add to IntegrationsTab:** Add new `IntegrationCard`

---

## Environment Variables

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=xxx
```

### Edge Functions (Secrets)

| Variable | Required | Purpose |
|----------|----------|---------|
| `FIRECRAWL_API_KEY` | Optional | Web scraping |
| `PERPLEXITY_API_KEY` | Optional | AI research |
| `ELEVENLABS_API_KEY` | Optional | Text-to-speech |
| `GOOGLE_CLIENT_ID` | For Google Ads | OAuth |
| `GOOGLE_CLIENT_SECRET` | For Google Ads | OAuth |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | For Google Ads | API access |
| `META_APP_ID` | For Meta Ads | OAuth |
| `META_APP_SECRET` | For Meta Ads | OAuth |

### Adding New Secrets

1. Use Lovable's add_secret tool
2. Or manually in Supabase dashboard (if you have access)
3. Access in edge functions: `Deno.env.get('SECRET_NAME')`

---

## Development Workflow

### Local Development

```bash
# Start Vite dev server
npm run dev

# Edge functions are deployed automatically
# when you push changes via Lovable
```

### Testing Edge Functions

```typescript
// In browser console or test file
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { test: 'data' },
});
console.log(data, error);
```

### Debugging

1. **Edge function logs:** Check Lovable Cloud logs
2. **Frontend errors:** Browser console
3. **Database queries:** Use Lovable's SQL tools

---

## Best Practices

### Code Organization

- Keep edge functions focused and single-purpose
- Use shared utilities via inline code (no external imports)
- Create custom hooks for each data domain
- Use TypeScript for type safety

### Security

- Always validate input in edge functions
- Use RLS policies for all tables
- Never expose API keys to frontend
- Use JWT verification for sensitive endpoints

### Performance

- Batch database queries where possible
- Use React Query for caching
- Implement pagination for large datasets
- Use database indexes for frequent queries

---

## Support & Resources

- **Lovable Documentation:** https://docs.lovable.dev
- **Supabase Documentation:** https://supabase.com/docs
- **Firecrawl Documentation:** https://docs.firecrawl.dev
- **Perplexity API:** https://docs.perplexity.ai

---

*Last updated: December 2024*
