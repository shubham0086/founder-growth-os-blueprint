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

    const { prompt, type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch offer blueprint for rich context
    let offerContext = null;
    if (context?.workspaceId) {
      const { data: blueprint } = await supabase
        .from('offer_blueprints')
        .select('*')
        .eq('workspace_id', context.workspaceId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (blueprint) {
        offerContext = {
          offerName: blueprint.name,
          promise: blueprint.promise,
          mechanism: blueprint.mechanism,
          proof: blueprint.proof,
          objections: blueprint.objections,
          tiers: blueprint.tiers,
        };
        console.log('Found offer blueprint for context');
      }
    }

    console.log(`AI Generate request - Type: ${type}, User: ${user.id}`);

    const systemPrompts: Record<string, string> = {
      ad_copy: `You are an elite direct-response copywriter who has written ads for 7 and 8-figure businesses. Your ad copy is known for:
- Pattern-interrupting hooks that stop the scroll
- Speaking directly to a specific pain point or desire
- Using proof and specificity to build credibility
- Creating urgency without being sleazy
- Clear, compelling calls-to-action

FORMAT YOUR RESPONSE AS:
**HOOK OPTIONS (choose one):**
1. [Problem-agitation hook]
2. [Curiosity hook]
3. [Social proof hook]

**PRIMARY COPY:**
[2-3 paragraphs of persuasive body copy]

**CALL TO ACTION:**
[Strong CTA with urgency element]

**VARIATIONS:**
- Short version (for character limits)
- Story angle version
- Testimonial-style version

Always write in a conversational, human tone. Avoid corporate jargon. Be specific, not generic.`,

      video_script: `You are a top UGC and video ad scriptwriter. Your scripts consistently produce videos with high watch time and conversion rates.

FORMAT YOUR RESPONSE AS:

**HOOK (0-3 seconds):**
[Pattern interrupt that stops scrolling - be specific]

**PROBLEM/AGITATION (3-15 seconds):**
[Relatable problem the viewer faces]

**SOLUTION INTRO (15-25 seconds):**
[Introduce the solution naturally]

**PROOF/MECHANISM (25-45 seconds):**
[Why this works - be specific with details]

**CTA (45-60 seconds):**
[Clear next step with urgency]

**VISUAL NOTES:**
[Suggested b-roll, text overlays, or actions]

**ALTERNATIVE HOOKS:**
1. [Controversy hook]
2. [Question hook]
3. [Story hook]

Write in natural, spoken language. Include pauses and emphasis cues.`,

      email: `You are an email marketing expert who specializes in high-converting sequences. Your emails have high open rates and click-through rates.

FORMAT YOUR RESPONSE AS:

**SUBJECT LINE OPTIONS:**
1. [Curiosity-driven]
2. [Benefit-driven]
3. [Urgency-driven]

**PREVIEW TEXT:**
[Compelling preview that complements subject]

**EMAIL BODY:**
[Personalized greeting]
[Hook - first line that pulls them in]
[Story/Problem section]
[Solution/Value section]
[Social proof element]
[Clear CTA with button text suggestion]
[P.S. line with secondary hook]

**FOLLOW-UP ANGLE:**
[Brief outline for follow-up email if no response]

Write conversationally. Use short paragraphs. One idea per sentence.`,

      creative_brief: `You are a creative director who has led campaigns for major brands. Create detailed briefs that inspire great creative work.

FORMAT YOUR RESPONSE AS:

**CAMPAIGN OVERVIEW:**
- Objective:
- Target Audience:
- Key Message:
- Tone & Voice:

**VISUAL DIRECTION:**
- Style:
- Colors:
- Imagery:
- Typography feel:

**CONTENT PIECES NEEDED:**
1. [Specific asset with dimensions/specs]
2. [Specific asset with dimensions/specs]
3. [Specific asset with dimensions/specs]

**KEY MESSAGING:**
- Headline options:
- Supporting copy:
- CTAs:

**DO's AND DON'Ts:**
- DO: [list]
- DON'T: [list]

**INSPIRATION/REFERENCES:**
[Describe the vibe with specific references]`,

      landing_page: `You are a conversion-focused landing page copywriter. Your pages consistently convert at 2-3x industry average.

FORMAT YOUR RESPONSE AS:

**HERO SECTION:**
- Headline: [Benefit-driven, specific]
- Subheadline: [Supporting detail]
- CTA Button: [Action-oriented text]

**PROBLEM SECTION:**
[3 specific pain points with emotional language]

**SOLUTION SECTION:**
[How the offer solves each pain point]

**FEATURES/BENEFITS:**
[Feature 1] → [Benefit 1]
[Feature 2] → [Benefit 2]
[Feature 3] → [Benefit 3]

**SOCIAL PROOF SECTION:**
[Testimonial format suggestions]
[Stats/numbers to highlight]

**FAQ SECTION:**
Q1: [Common objection as question]
A1: [Objection-handling answer]

**FINAL CTA:**
[Urgency-driven closing with strong CTA]`,

      offer: `You are an offer strategist who has created irresistible offers for 8-figure businesses.

FORMAT YOUR RESPONSE AS:

**OFFER STRUCTURE:**
- Core Promise: [Specific, measurable outcome]
- Unique Mechanism: [How this is different]
- Timeline: [When they'll see results]

**VALUE STACK:**
1. [Main offer - perceived value $X]
2. [Bonus 1 - perceived value $X]
3. [Bonus 2 - perceived value $X]
4. [Bonus 3 - perceived value $X]
Total Value: $X
Your Investment: $X

**RISK REVERSAL:**
[Guarantee that removes all risk]

**URGENCY/SCARCITY:**
[Legitimate reason to act now]

**OBJECTION HANDLERS:**
"But I don't have time..." → [Response]
"But I've tried before..." → [Response]
"But it's too expensive..." → [Response]`,

      objection: `You are a sales psychology expert who helps businesses handle objections with empathy and effectiveness.

FORMAT YOUR RESPONSE AS:

**OBJECTION:** [The objection being addressed]

**UNDERLYING CONCERN:**
[What they're really worried about]

**RESPONSE FRAMEWORK:**
1. Acknowledge: [Validate their concern]
2. Reframe: [Shift the perspective]
3. Evidence: [Proof that addresses it]
4. Bridge: [Connect back to the offer]

**WORD-FOR-WORD SCRIPT:**
"I totally understand... [full response]"

**FOLLOW-UP QUESTIONS:**
[Questions to uncover the real objection if this isn't it]`,
    };

    const systemPrompt = systemPrompts[type] || 'You are a helpful marketing assistant. Provide clear, actionable content with specific examples and formats.';

    // Build rich context
    let fullContext = '';
    if (context || offerContext) {
      fullContext = `\n\n=== BUSINESS CONTEXT ===\n`;
      
      if (context?.name) {
        fullContext += `Business Name: ${context.name}\n`;
      }
      if (context?.industry) {
        fullContext += `Industry: ${context.industry}\n`;
      }
      
      if (offerContext) {
        fullContext += `\n--- OFFER DETAILS ---\n`;
        if (offerContext.offerName) fullContext += `Offer Name: ${offerContext.offerName}\n`;
        if (offerContext.promise) fullContext += `Core Promise: ${offerContext.promise}\n`;
        if (offerContext.mechanism) fullContext += `Unique Mechanism: ${offerContext.mechanism}\n`;
        if (offerContext.proof) fullContext += `Proof/Results: ${offerContext.proof}\n`;
        if (offerContext.objections) {
          fullContext += `Common Objections: ${JSON.stringify(offerContext.objections)}\n`;
        }
        if (offerContext.tiers) {
          fullContext += `Offer Tiers: ${JSON.stringify(offerContext.tiers)}\n`;
        }
      }
      
      fullContext += `\n=== END CONTEXT ===\n\n`;
    }

    const fullPrompt = `${fullContext}USER REQUEST:\n${prompt}\n\nProvide a complete, ready-to-use response. Be specific, not generic. Use the business context provided to make this highly relevant.`;

    console.log('Sending request to AI gateway with enriched context');

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
