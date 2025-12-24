import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Scoring weights for different factors
const SCORING_CONFIG = {
  // Source scores (0-30 points)
  source: {
    google_ads: 30,
    meta_ads: 28,
    facebook: 25,
    instagram: 25,
    linkedin: 22,
    referral: 20,
    organic: 15,
    direct: 10,
    unknown: 5,
  },
  // Contact completeness (0-25 points)
  contact: {
    hasEmail: 15,
    hasPhone: 10,
  },
  // UTM attribution (0-20 points)
  attribution: {
    hasUtm: 10,
    hasGclid: 10,
    hasFbclid: 8,
    hasReferrer: 5,
  },
  // Stage progression (0-25 points)
  stage: {
    new: 0,
    contacted: 5,
    booked: 15,
    qualified: 20,
    won: 25,
    lost: 0,
  },
};

function calculateScore(lead: any): number {
  let score = 0;

  // 1. Source scoring (0-30 points)
  const source = (lead.source || "unknown").toLowerCase().replace(/[\s-]/g, "_");
  const sourceScore = SCORING_CONFIG.source[source as keyof typeof SCORING_CONFIG.source] 
    ?? SCORING_CONFIG.source.unknown;
  score += sourceScore;

  // 2. Contact completeness (0-25 points)
  if (lead.email) score += SCORING_CONFIG.contact.hasEmail;
  if (lead.phone) score += SCORING_CONFIG.contact.hasPhone;

  // 3. Attribution data (0-20 points)
  if (lead.utm && Object.keys(lead.utm).length > 0) {
    score += SCORING_CONFIG.attribution.hasUtm;
  }
  if (lead.gclid) score += SCORING_CONFIG.attribution.hasGclid;
  if (lead.fbclid) score += SCORING_CONFIG.attribution.hasFbclid;
  if (lead.referrer) score += SCORING_CONFIG.attribution.hasReferrer;

  // 4. Stage progression (0-25 points)
  const stage = (lead.stage || "new").toLowerCase();
  const stageScore = SCORING_CONFIG.stage[stage as keyof typeof SCORING_CONFIG.stage] ?? 0;
  score += stageScore;

  // Cap at 100
  return Math.min(100, score);
}

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
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

    const { workspace_id, lead_id } = await req.json();

    if (!workspace_id) {
      return new Response(
        JSON.stringify({ error: "workspace_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user owns this workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from("workspaces")
      .select("id")
      .eq("id", workspace_id)
      .eq("user_id", user.id)
      .single();

    if (workspaceError || !workspace) {
      console.error('Workspace access denied');
      return new Response(
        JSON.stringify({ error: "Access denied to workspace" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Scoring leads for workspace: ${workspace_id}${lead_id ? `, lead: ${lead_id}` : " (all leads)"}`);

    // Fetch leads to score (RLS will enforce workspace ownership)
    let query = supabase
      .from("leads")
      .select("id, name, email, phone, source, stage, utm, gclid, fbclid, referrer, score")
      .eq("workspace_id", workspace_id);

    if (lead_id) {
      query = query.eq("id", lead_id);
    }

    const { data: leads, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching leads:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch leads" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!leads || leads.length === 0) {
      return new Response(
        JSON.stringify({ message: "No leads to score", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${leads.length} leads to score`);

    // Calculate and update scores
    let updatedCount = 0;
    const scoreDetails: Array<{ id: string; name: string; oldScore: number; newScore: number }> = [];

    for (const lead of leads) {
      const newScore = calculateScore(lead);
      const oldScore = lead.score || 0;

      // Only update if score changed
      if (newScore !== oldScore) {
        const { error: updateError } = await supabase
          .from("leads")
          .update({ score: newScore })
          .eq("id", lead.id);

        if (updateError) {
          console.error(`Error updating lead ${lead.id}:`, updateError);
        } else {
          updatedCount++;
          scoreDetails.push({
            id: lead.id,
            name: lead.name,
            oldScore,
            newScore,
          });
        }
      }
    }

    console.log(`Updated ${updatedCount} lead scores`);

    return new Response(
      JSON.stringify({
        message: `Scored ${leads.length} leads, updated ${updatedCount}`,
        updated: updatedCount,
        total: leads.length,
        details: scoreDetails,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in score-leads function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
