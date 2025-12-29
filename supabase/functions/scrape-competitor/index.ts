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
    // Authentication check
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    const { url, extractType } = await req.json();
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

    if (!FIRECRAWL_API_KEY) {
      // If Firecrawl is not configured, use Perplexity as fallback
      const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
      
      if (!PERPLEXITY_API_KEY) {
        throw new Error('No scraping API configured');
      }

      console.log(`Using Perplexity fallback for URL: ${url}`);

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            { 
              role: 'system', 
              content: 'You are a web scraping assistant. Extract and summarize the key information from the given URL including pricing, features, testimonials, and messaging.' 
            },
            { 
              role: 'user', 
              content: `Analyze this website and extract key information: ${url}. Focus on: pricing, main offer, unique selling points, testimonials, and key messaging.` 
            }
          ],
          search_domain_filter: [new URL(url).hostname],
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();

      return new Response(JSON.stringify({
        content: data.choices[0].message.content,
        citations: data.citations || [url],
        source: 'perplexity',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format URL properly
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log(`Scraping URL with Firecrawl: ${formattedUrl}`);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firecrawl API error:', response.status, errorText);
      throw new Error(`Firecrawl API error: ${response.status}`);
    }

    const data = await response.json();
    const markdown = data.data?.markdown || '';
    
    // Extract pricing and offer info
    const lines = markdown.split('\n');
    let pricing = 'Not found';
    let mainOffer = 'Not found';
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if ((lowerLine.includes('₹') || lowerLine.includes('$') || lowerLine.includes('price') || lowerLine.includes('/month')) && pricing === 'Not found') {
        pricing = line.trim().slice(0, 50);
      }
      if ((lowerLine.includes('free') || lowerLine.includes('trial') || lowerLine.includes('guarantee') || lowerLine.includes('offer')) && mainOffer === 'Not found') {
        mainOffer = line.trim().slice(0, 100);
      }
    }

    console.log('Firecrawl scrape completed successfully');

    return new Response(JSON.stringify({
      content: markdown.slice(0, 2000),
      pricing,
      mainOffer,
      metadata: data.data?.metadata || {},
      source: 'firecrawl',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in scrape-competitor function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
