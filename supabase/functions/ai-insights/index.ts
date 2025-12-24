import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
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
      global: { headers: { authorization: authHeader } }
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { metrics, type } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "dashboard") {
      systemPrompt = `You are a growth marketing AI assistant for a founder's growth OS. Analyze the provided metrics and give actionable, concise insights. Be specific with numbers. Format your response with 2-3 bullet points, each starting with an emoji. Keep it under 150 words total.`;
      
      userPrompt = `Here are this week's metrics:
- Ad Spend: ₹${metrics.adSpend || 0}
- Total Clicks: ${metrics.totalClicks || 0}
- New Leads: ${metrics.newLeads || 0}
- Bookings: ${metrics.bookings || 0}
- Week-over-week changes: Spend ${metrics.adSpendChange || 0}%, Clicks ${metrics.clicksChange || 0}%, Leads ${metrics.leadsChange || 0}%, Bookings ${metrics.bookingsChange || 0}%

Provide 2-3 key insights and one actionable recommendation.`;
    } else if (type === "monthly_report") {
      systemPrompt = `You are a growth marketing AI analyst. Generate insights for a monthly report based on the provided metrics. Be specific with percentages and trends. Provide both positive highlights and areas needing attention.`;
      
      userPrompt = `Monthly metrics summary:
- Total Spend: ₹${metrics.totalSpend || 0}
- Total Leads: ${metrics.totalLeads || 0}
- Total Bookings: ${metrics.totalBookings || 0}
- Average CPL: ₹${metrics.avgCpl || 0}
- Conversion Rate: ${metrics.conversionRate || 0}%
- Channel breakdown: ${JSON.stringify(metrics.channels || {})}

Generate:
1. 3 things that worked well (with specific metrics)
2. 3 areas to improve (with recommendations)
3. One key action for next month`;
    } else if (type === "channel_insights") {
      systemPrompt = `You are an advertising analytics expert. Analyze channel performance data and identify optimization opportunities.`;
      
      userPrompt = `Channel performance data:
${JSON.stringify(metrics.channels || [], null, 2)}

For each channel, identify:
1. Performance trend
2. Key concern or opportunity
3. Recommended action`;
    }

    console.log(`Generating ${type} insights...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No insights generated.";

    console.log("Insights generated successfully");

    return new Response(
      JSON.stringify({ insights: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-insights function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
