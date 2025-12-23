import { supabase } from '@/integrations/supabase/client';

export async function seedWorkspaceData(workspaceId: string) {
  try {
    // Seed sample leads
    await supabase.from('leads').insert([
      { workspace_id: workspaceId, name: 'Sarah Johnson', email: 'sarah@example.com', source: 'Google Ads', stage: 'new', score: 85 },
      { workspace_id: workspaceId, name: 'Mike Chen', email: 'mike@example.com', source: 'Facebook', stage: 'contacted', score: 72 },
      { workspace_id: workspaceId, name: 'Emily Davis', email: 'emily@example.com', source: 'Organic', stage: 'qualified', score: 90 },
      { workspace_id: workspaceId, name: 'James Wilson', email: 'james@example.com', source: 'Referral', stage: 'proposal', score: 95 },
      { workspace_id: workspaceId, name: 'Lisa Brown', email: 'lisa@example.com', source: 'LinkedIn', stage: 'won', score: 100 },
    ]);

    // Seed sample campaigns
    await supabase.from('campaign_plans').insert([
      { workspace_id: workspaceId, name: 'Summer Sale Campaign', platform: 'Google Ads', status: 'active', structure: { type: 'search', keywords: ['summer sale', 'discount'] } },
      { workspace_id: workspaceId, name: 'Brand Awareness', platform: 'Meta Ads', status: 'draft', structure: { type: 'display', audience: 'broad' } },
    ]);

    // Seed sample assets
    await supabase.from('assets').insert([
      { workspace_id: workspaceId, name: 'Homepage Hero Copy', type: 'ad_copy', content: 'Transform your business with our proven strategies. Get started today!', status: 'approved', tags: ['homepage', 'hero'] },
      { workspace_id: workspaceId, name: 'Email Welcome Sequence', type: 'email', content: 'Welcome to our community! Here\'s what you can expect...', status: 'draft', tags: ['email', 'onboarding'] },
    ]);

    // Seed sample landing page
    await supabase.from('landing_pages').insert([
      { workspace_id: workspaceId, title: 'Product Launch Page', slug: 'product-launch', status: 'draft', sections: [{ type: 'hero', headline: 'Introducing Our New Product' }] },
    ]);

    // Seed sample experiment
    await supabase.from('experiments').insert([
      { workspace_id: workspaceId, hypothesis: 'Adding social proof will increase conversions by 15%', metric: 'conversion_rate', status: 'backlog', variants: ['Control', 'With Testimonials'] },
    ]);

    // Seed sample automation
    await supabase.from('automations').insert([
      { workspace_id: workspaceId, name: 'Welcome Email', trigger_event: 'lead_created', channel: 'email', status: 'active', template: 'Welcome {{name}}! Thanks for signing up.', delay_hours: 0, sequence_order: 1 },
    ]);

    // Seed sample metrics (last 7 days)
    const today = new Date();
    const metricsData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      metricsData.push({
        workspace_id: workspaceId,
        date: date.toISOString().split('T')[0],
        spend: Math.floor(Math.random() * 500) + 100,
        clicks: Math.floor(Math.random() * 200) + 50,
        leads: Math.floor(Math.random() * 20) + 5,
        bookings: Math.floor(Math.random() * 10) + 1,
        cpl: Math.floor(Math.random() * 30) + 10,
      });
    }
    await supabase.from('metrics_daily').insert(metricsData);

    // Seed sample offer blueprint
    await supabase.from('offer_blueprints').insert([
      { 
        workspace_id: workspaceId, 
        name: 'Core Offer v1', 
        promise: 'Double your leads in 90 days or your money back', 
        mechanism: 'AI-powered lead generation system', 
        proof: '500+ businesses served, 4.9 star rating',
        status: 'draft',
        version: 1,
        tiers: [{ name: 'Starter', price: 497 }, { name: 'Pro', price: 997 }],
        objections: [{ objection: 'Too expensive', response: 'ROI typically covers cost in first month' }]
      },
    ]);

    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding sample data:', error);
  }
}
