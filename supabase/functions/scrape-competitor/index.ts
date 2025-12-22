import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log(`Scraping URL with Firecrawl: ${url}`);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firecrawl API error:', response.status, errorText);
      throw new Error(`Firecrawl API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Firecrawl scrape completed successfully');

    return new Response(JSON.stringify({
      content: data.data?.markdown || data.data?.html || 'No content extracted',
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
