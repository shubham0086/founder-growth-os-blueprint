import { Link } from 'react-router-dom';
import { PublicLeadForm } from '@/components/forms/PublicLeadForm';
import { Footer } from '@/components/layout/Footer';
import { siteConfig } from '@/lib/siteConfig';
import { SprintCTA } from '@/components/SprintCTA';
import { Rocket, CheckCircle, ArrowLeft } from 'lucide-react';

export default function Apply() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-semibold">{siteConfig.BRAND_NAME}</span>
          </Link>
          <SprintCTA size="sm" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-6">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Apply for Your Growth Sprint
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {siteConfig.BRAND_TAGLINE}. Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              'Custom Growth Strategy',
              'Done-For-You Assets',
              'Weekly Performance Reports',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Lead Form */}
          <div className="max-w-xl mx-auto">
            <PublicLeadForm source="apply_page" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
