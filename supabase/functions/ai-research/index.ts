import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Optional authentication - function works with or without auth
    const authHeader = req.headers.get('authorization');
    let userId = 'anonymous';
    
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (user && !authError) {
          userId = user.id;
          console.log(`Authenticated user: ${userId}`);
        } else {
          console.log('Auth token provided but invalid, proceeding as anonymous');
        }
      } catch (authErr) {
        console.log('Auth check failed, proceeding as anonymous:', authErr);
      }
    } else {
      console.log('No auth header, proceeding as anonymous');
    }

    console.log(`Processing request for user: ${userId}`);

    const { query, type, sources } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not configured');
    }

    console.log(`AI Research request - Type: ${type}, Query: ${query}`);

    const systemPrompts: Record<string, string> = {
      pricing: 'You are a market research analyst specializing in pricing strategies. Analyze competitor pricing, identify pricing patterns, and provide actionable insights for pricing decisions.',
      offer: 'You are a marketing strategist specializing in offer creation. Analyze market offers, identify winning elements, and provide recommendations for compelling offers.',
      objections: 'You are a sales strategist specializing in objection handling. Identify common customer objections in the market and provide effective responses.',
      angles: 'You are a creative marketing strategist. Identify unique marketing angles and messaging strategies used by competitors.',
      positioning: 'You are a brand positioning expert. Analyze market positioning and provide recommendations for differentiation.',
      general: 'You are a helpful market research assistant. Provide thorough, well-researched answers with citations.',
    };

    const systemPrompt = systemPrompts[type] || systemPrompts.general;

    const requestBody: any = {
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
    };

    if (sources && sources.length > 0) {
      requestBody.search_domain_filter = sources;
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Perplexity response received successfully');

    return new Response(JSON.stringify({
      content: data.choices[0].message.content,
      citations: data.citations || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-research function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
