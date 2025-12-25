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
        
        // Extract token from header
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

    const { prompt, type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`AI Generate request - Type: ${type}`);

    const systemPrompts: Record<string, string> = {
      ad_copy: `You are an expert copywriter specializing in high-converting ad copy. Create compelling, persuasive ad copy that drives action. Use the context provided about the offer and target audience.`,
      video_script: `You are a video scriptwriter specializing in marketing videos. Create engaging video scripts that capture attention and drive conversions. Include hooks, story beats, and clear CTAs.`,
      email: `You are an email marketing specialist. Create compelling email sequences that nurture leads and drive conversions. Focus on subject lines, preview text, and body copy.`,
      landing_page: `You are a conversion-focused landing page copywriter. Create compelling landing page sections that drive conversions. Include headlines, subheadlines, body copy, and CTAs.`,
      offer: `You are an offer strategist. Help create irresistible offers with clear promises, unique mechanisms, and compelling proof points.`,
      objection: `You are a sales strategist. Create effective objection handling responses that address concerns while reinforcing value.`,
    };

    const systemPrompt = systemPrompts[type] || 'You are a helpful marketing assistant. Provide clear, actionable content.';

    const fullPrompt = context 
      ? `Context about the business/offer:\n${JSON.stringify(context, null, 2)}\n\nRequest:\n${prompt}`
      : prompt;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI generation completed successfully');

    return new Response(JSON.stringify({
      content: data.choices[0].message.content,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-generate function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
