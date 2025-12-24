import { siteConfig } from '@/lib/siteConfig';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container max-w-4xl py-12 px-4 flex-1">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>Terms of Service</h1>
          <p className="lead">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <p>
            Please read these Terms of Service ("Terms") carefully before using {siteConfig.BRAND_NAME} 
            operated by {siteConfig.COMPANY_LEGAL_NAME} ("us", "we", or "our").
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree 
            with any part of the terms, then you may not access the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            {siteConfig.BRAND_NAME} provides marketing strategy, growth consulting, and related 
            services to help businesses scale their operations. The specific scope of services 
            will be outlined in individual service agreements.
          </p>

          <h2>3. User Responsibilities</h2>
          <p>When using our Service, you agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the confidentiality of your account</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>Not use the Service for any illegal purpose</li>
            <li>Not attempt to gain unauthorized access to any part of the Service</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain 
            the exclusive property of {siteConfig.COMPANY_LEGAL_NAME}. Our trademarks may not be 
            used without prior written consent.
          </p>

          <h2>5. Payment Terms</h2>
          <p>
            For paid services, payment terms will be specified in the relevant service agreement. 
            All fees are non-refundable unless otherwise stated in our Refund Policy.
          </p>

          <h2>6. Confidentiality</h2>
          <p>
            Both parties agree to maintain the confidentiality of any proprietary information 
            shared during the course of our business relationship. This includes but is not 
            limited to business strategies, financial information, and customer data.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall {siteConfig.COMPANY_LEGAL_NAME}, nor its directors, employees, 
            partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, 
            special, consequential, or punitive damages arising out of or related to your use 
            of the Service.
          </p>

          <h2>8. No Guarantees</h2>
          <p>
            While we strive to provide high-quality services, we make no guarantees regarding 
            specific results. {siteConfig.DISCLAIMER}
          </p>

          <h2>9. Termination</h2>
          <p>
            We may terminate or suspend access to our Service immediately, without prior notice 
            or liability, for any reason whatsoever, including without limitation if you breach 
            the Terms.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, 
            without regard to its conflict of law provisions.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. We will provide 
            notice of any changes by posting the new Terms on this page.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:{' '}
            <a href={`mailto:${siteConfig.CONTACT_EMAIL}`}>{siteConfig.CONTACT_EMAIL}</a>
          </p>

          <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="m-0"><strong>Disclaimer:</strong> {siteConfig.DISCLAIMER}</p>
          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}
