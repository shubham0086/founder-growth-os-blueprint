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

    const { url } = await req.json();
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Format URL properly
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    let scrapedContent = '';
    let source = 'perplexity';

    // Try Firecrawl first if available
    if (FIRECRAWL_API_KEY) {
      console.log(`Scraping URL with Firecrawl: ${formattedUrl}`);

      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
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

        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          scrapedContent = scrapeData.data?.markdown || '';
          source = 'firecrawl';
          console.log('Firecrawl scrape successful, content length:', scrapedContent.length);
        } else {
          console.warn('Firecrawl failed, falling back to Perplexity');
        }
      } catch (e) {
        console.warn('Firecrawl error, falling back to Perplexity:', e);
      }
    }

    // Use Perplexity as fallback for web research if no Firecrawl content
    if (!scrapedContent) {
      const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
      if (PERPLEXITY_API_KEY) {
        console.log(`Using Perplexity for research on: ${formattedUrl}`);
        
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'sonar',
            messages: [
              { 
                role: 'user', 
                content: `Research this website and provide detailed information: ${formattedUrl}. Include their main products/services, pricing if visible, unique value proposition, and target audience.` 
              }
            ],
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          scrapedContent = perplexityData.choices?.[0]?.message?.content || '';
          source = 'perplexity';
          console.log('Perplexity research successful');
        }
      }
    }

    if (!scrapedContent) {
      throw new Error('Could not retrieve content from competitor website');
    }

    // Truncate content for AI analysis (keep to ~4000 chars to stay within context limits)
    const truncatedContent = scrapedContent.slice(0, 4000);

    // Use Lovable AI to analyze the scraped content and extract structured insights
    console.log('Analyzing content with Lovable AI...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a competitive intelligence analyst. Analyze the provided website content and extract actionable insights. Be concise and specific. Return valid JSON only, no markdown.`
          },
          {
            role: 'user',
            content: `Analyze this competitor website content and extract key insights.

Website: ${formattedUrl}
Content:
${truncatedContent}

Return a JSON object with these exact fields:
{
  "companyName": "The company/brand name",
  "tagline": "Their main tagline or slogan (if found)",
  "pricingModel": "How they charge (subscription, one-time, freemium, etc.)",
  "pricingRange": "Price range or specific prices if found",
  "mainOffer": "Their primary product/service offering in 1-2 sentences",
  "uniqueSellingPoints": ["USP 1", "USP 2", "USP 3"],
  "targetAudience": "Who they target",
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Potential weakness 1", "Potential weakness 2"],
  "marketingAngles": ["Angle they use 1", "Angle they use 2"]
}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_competitor_analysis",
              description: "Extract structured competitor analysis from website content",
              parameters: {
                type: "object",
                properties: {
                  companyName: { type: "string", description: "Company or brand name" },
                  tagline: { type: "string", description: "Main tagline or slogan" },
                  pricingModel: { type: "string", description: "How they charge customers" },
                  pricingRange: { type: "string", description: "Price range or specific prices" },
                  mainOffer: { type: "string", description: "Primary product/service in 1-2 sentences" },
                  uniqueSellingPoints: { type: "array", items: { type: "string" }, description: "3-5 USPs" },
                  targetAudience: { type: "string", description: "Who they target" },
                  strengths: { type: "array", items: { type: "string" }, description: "2-3 strengths" },
                  weaknesses: { type: "array", items: { type: "string" }, description: "1-2 potential weaknesses" },
                  marketingAngles: { type: "array", items: { type: "string" }, description: "2-3 marketing angles they use" }
                },
                required: ["companyName", "mainOffer", "uniqueSellingPoints", "targetAudience"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_competitor_analysis" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract the tool call result
    let analysis: any = {};
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        analysis = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error('Failed to parse tool call arguments:', e);
      }
    }

    // Fallback: try to parse from content if tool call failed
    if (!analysis.companyName && aiData.choices?.[0]?.message?.content) {
      try {
        const content = aiData.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Failed to parse content as JSON:', e);
      }
    }

    // Ensure we have at least basic data
    if (!analysis.companyName) {
      analysis.companyName = new URL(formattedUrl).hostname.replace('www.', '').split('.')[0];
      analysis.mainOffer = 'Could not extract detailed information';
    }

    console.log('Analysis complete:', analysis.companyName);

    return new Response(JSON.stringify({
      analysis,
      source,
      url: formattedUrl,
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
