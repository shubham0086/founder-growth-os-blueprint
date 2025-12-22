import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Search,
  Target,
  FileText,
  Palette,
  Megaphone,
  Users,
  Zap,
  FlaskConical,
  BarChart3,
  Settings,
  BookOpen,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Play,
  Upload,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "getting-started", title: "Getting Started", icon: Play },
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "research", title: "Research Hub", icon: Search },
  { id: "offer", title: "Offer Blueprint", icon: Target },
  { id: "landing-pages", title: "Landing Pages", icon: FileText },
  { id: "assets", title: "Asset Factory", icon: Palette },
  { id: "campaigns", title: "Campaigns", icon: Megaphone },
  { id: "leads", title: "Leads Management", icon: Users },
  { id: "automations", title: "Automations", icon: Zap },
  { id: "experiments", title: "Experiments", icon: FlaskConical },
  { id: "reports", title: "Reports & Analytics", icon: BarChart3 },
  { id: "settings", title: "Settings", icon: Settings },
  { id: "data-import", title: "Data Import/Export", icon: Upload },
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("getting-started");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
          <p className="text-muted-foreground">Complete guide to Founder Growth OS</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <Card className="w-64 shrink-0 sticky top-6 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Contents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1 px-4 pb-4">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      activeSection === section.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <section.icon className="h-4 w-4" />
                    <span>{section.title}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Getting Started */}
          <section id="getting-started" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  <CardTitle>Getting Started</CardTitle>
                </div>
                <CardDescription>
                  Welcome to Founder Growth OS - your all-in-one marketing automation platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex gap-3">
                    <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Quick Start Guide</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Follow these steps to set up your growth engine in under 30 minutes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Setup Checklist</h3>
                  <div className="space-y-3">
                    {[
                      "Complete your workspace profile in Settings",
                      "Run competitor research in the Research Hub",
                      "Create your Offer Blueprint with pricing tiers",
                      "Build your first landing page",
                      "Set up lead capture automations",
                      "Launch your first campaign",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {i + 1}
                        </div>
                        <p className="text-sm text-muted-foreground pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Recommended Workflow</h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="outline">Research</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">Offer</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">Landing Page</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">Assets</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">Campaign</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">Leads</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">Automate</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Dashboard */}
          <section id="dashboard" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <CardTitle>Dashboard</CardTitle>
                </div>
                <CardDescription>
                  Your command center for monitoring growth metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The Dashboard provides a real-time overview of your marketing performance with key metrics, recent activity, and quick actions.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Key Features:</h4>
                  <ul className="space-y-2">
                    {[
                      "Metric Cards - Track ad spend, leads, bookings, and revenue at a glance",
                      "Weekly Brief - AI-generated summary of your performance with audio playback",
                      "Leads Pipeline - Visual representation of leads across stages",
                      "Recent Activity - Live feed of leads, conversions, and campaign events",
                      "Quick Actions - One-click access to common tasks",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Research Hub */}
          <section id="research" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <CardTitle>Research Hub</CardTitle>
                </div>
                <CardDescription>
                  AI-powered competitor and market research
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Leverage AI to analyze competitors, understand market trends, and identify opportunities. The Research Hub uses Firecrawl for web scraping and Perplexity AI for deep analysis.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Capabilities:</h4>
                  <ul className="space-y-2">
                    {[
                      "Competitor Analysis - Add competitor URLs and get AI-powered insights",
                      "Market Trends - Discover trending topics and customer pain points",
                      "Offer Teardown - Analyze competitor pricing and positioning",
                      "Content Gap Analysis - Find content opportunities your competitors are missing",
                      "Save Findings - Store research for future reference",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground">How to use:</p>
                  <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Add competitor URLs in the Competitors tab</li>
                    <li>Click "Analyze" to run AI research</li>
                    <li>Review findings in the Research Findings tab</li>
                    <li>Use insights to inform your offer and content strategy</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Offer Blueprint */}
          <section id="offer" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>Offer Blueprint</CardTitle>
                </div>
                <CardDescription>
                  Design compelling offers that convert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Build and refine your offer using the proven Promise → Mechanism → Proof framework. Define pricing tiers and prepare objection handling.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium text-foreground mb-2">Promise</h4>
                    <p className="text-sm text-muted-foreground">
                      What transformation or result do you promise? Be specific and measurable.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium text-foreground mb-2">Mechanism</h4>
                    <p className="text-sm text-muted-foreground">
                      How do you deliver on the promise? What's your unique method?
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium text-foreground mb-2">Proof</h4>
                    <p className="text-sm text-muted-foreground">
                      What evidence supports your claims? Case studies, testimonials, data.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium text-foreground mb-2">Pricing Tiers</h4>
                    <p className="text-sm text-muted-foreground">
                      Create tiered pricing to capture different customer segments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Landing Pages */}
          <section id="landing-pages" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Landing Pages</CardTitle>
                </div>
                <CardDescription>
                  Build high-converting landing pages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create and manage landing pages for your campaigns. Each page can have multiple sections and a unique URL slug.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Page Management:</h4>
                  <ul className="space-y-2">
                    {[
                      "Create new landing pages with custom slugs",
                      "Draft, publish, or archive pages as needed",
                      "Preview pages before publishing",
                      "Track page performance in Reports",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Asset Factory */}
          <section id="assets" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Asset Factory</CardTitle>
                </div>
                <CardDescription>
                  Create and manage marketing assets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate and organize all your marketing assets including ad copy, images, videos, and email templates.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Asset Types:</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Ad Copy", "Headlines", "Images", "Videos", "Email Templates", "Scripts", "Social Posts"].map((type) => (
                      <Badge key={type} variant="secondary">{type}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Features:</h4>
                  <ul className="space-y-2">
                    {[
                      "AI-powered content generation",
                      "Tag and organize assets for easy retrieval",
                      "Track asset status (draft, approved, in use)",
                      "Filter by type and tags",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Campaigns */}
          <section id="campaigns" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <CardTitle>Campaigns</CardTitle>
                </div>
                <CardDescription>
                  Plan and manage advertising campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create campaign plans for Meta Ads, Google Ads, and other platforms. Define structure, budgets, and targeting rules.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Supported Platforms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Meta Ads", "Google Ads", "LinkedIn Ads", "TikTok Ads", "YouTube Ads"].map((platform) => (
                      <Badge key={platform} variant="outline">{platform}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Campaign Features:</h4>
                  <ul className="space-y-2">
                    {[
                      "Plan campaign structure (campaigns, ad sets, ads)",
                      "Set budget rules and spending limits",
                      "Draft campaigns before launching",
                      "Pause and resume campaigns",
                      "Track performance in Reports",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Leads */}
          <section id="leads" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Leads Management</CardTitle>
                </div>
                <CardDescription>
                  Track and manage your sales pipeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage leads through your sales pipeline from new lead to closed deal. Track source, score, and engagement.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Lead Stages:</h4>
                  <div className="flex flex-wrap gap-2">
                    {["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"].map((stage) => (
                      <Badge key={stage} variant="secondary">{stage}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Features:</h4>
                  <ul className="space-y-2">
                    {[
                      "Add leads manually or import via CSV",
                      "Track lead source and UTM parameters",
                      "Lead scoring based on engagement",
                      "Move leads through pipeline stages",
                      "Export leads to CSV for external use",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Automations */}
          <section id="automations" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle>Automations</CardTitle>
                </div>
                <CardDescription>
                  Set up automated follow-up sequences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Create automated sequences triggered by lead events. Send emails, SMS, or WhatsApp messages with configurable delays.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Trigger Events:</h4>
                  <div className="flex flex-wrap gap-2">
                    {["New Lead", "Stage Change", "No Response", "Form Submit", "Page Visit", "Cart Abandon"].map((trigger) => (
                      <Badge key={trigger} variant="outline">{trigger}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Channels:</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Email", "SMS", "WhatsApp", "In-App"].map((channel) => (
                      <Badge key={channel} variant="secondary">{channel}</Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground">Example Sequence:</p>
                  <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                    <li>New lead → Send welcome email (immediate)</li>
                    <li>No response → Send follow-up SMS (24 hours)</li>
                    <li>Still no response → Send value offer (72 hours)</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Experiments */}
          <section id="experiments" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  <CardTitle>Experiments</CardTitle>
                </div>
                <CardDescription>
                  Run A/B tests and validate hypotheses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Design and run experiments to optimize your marketing. Test headlines, offers, landing pages, and more.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Experiment Structure:</h4>
                  <ul className="space-y-2">
                    {[
                      "Hypothesis - What you're testing and expected outcome",
                      "Variants - Different versions to compare (A/B/C)",
                      "Metric - Primary KPI to measure success",
                      "Duration - Run until statistical significance",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Experiment Status:</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Draft", "Running", "Completed", "Archived"].map((status) => (
                      <Badge key={status} variant="secondary">{status}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Reports */}
          <section id="reports" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle>Reports & Analytics</CardTitle>
                </div>
                <CardDescription>
                  Track performance and analyze trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  View detailed performance reports with charts and metrics. Log daily metrics and track progress over time.
                </p>

                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Key Metrics Tracked:</h4>
                  <ul className="space-y-2">
                    {[
                      "Ad Spend - Daily advertising investment",
                      "Leads - New leads generated",
                      "Bookings - Appointments or calls scheduled",
                      "Revenue - Sales and conversions",
                      "CPL (Cost Per Lead) - Efficiency metric",
                      "ROI - Return on ad spend",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground">Tip:</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Log your metrics daily for accurate trend analysis. Use "Log Today" to quickly enter daily numbers or import CSV data for bulk updates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Settings */}
          <section id="settings" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure your workspace and account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage workspace settings, integrations, notifications, and account preferences.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium text-foreground mb-2">Workspace</h4>
                    <p className="text-sm text-muted-foreground">
                      Name, industry, timezone, currency, and region settings.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium text-foreground mb-2">Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Profile information, email, and password management.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium text-foreground mb-2">Integrations</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect AI tools, ad platforms, and messaging services.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium text-foreground mb-2">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Email alerts for new leads, reports, and budget limits.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Data Import/Export */}
          <section id="data-import" className="scroll-mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <CardTitle>Data Import/Export</CardTitle>
                </div>
                <CardDescription>
                  Bulk import and export your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Import leads and metrics from CSV files. Export data for external analysis or backup.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-foreground">Import</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Leads from CSV (name, email, phone, source)</li>
                      <li>• Daily metrics from CSV</li>
                      <li>• Map columns during import</li>
                      <li>• Preview data before importing</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-foreground">Export</h4>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Export leads to CSV</li>
                      <li>• Export metrics to CSV</li>
                      <li>• Filter before exporting</li>
                      <li>• Include all fields</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <div className="flex gap-3">
                    <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">CSV Format</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        For leads: Include columns for name, email, phone, source. For metrics: Include date, spend, leads, bookings, revenue columns.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
