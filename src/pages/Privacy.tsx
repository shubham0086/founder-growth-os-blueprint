import { siteConfig } from '@/lib/siteConfig';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12 px-4">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="lead">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <p>
            {siteConfig.COMPANY_LEGAL_NAME} ("we", "our", or "us") operates {siteConfig.BRAND_NAME}. 
            This page informs you of our policies regarding the collection, use, and disclosure of 
            personal information when you use our Service.
          </p>

          <h2>Information We Collect</h2>
          <p>We collect several types of information for various purposes:</p>
          <ul>
            <li><strong>Personal Data:</strong> Name, email address, phone number, business information</li>
            <li><strong>Usage Data:</strong> Browser type, pages visited, time spent on pages</li>
            <li><strong>Marketing Data:</strong> UTM parameters, referral sources, ad click identifiers</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To send you marketing communications (with your consent)</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            We will retain your Personal Data only for as long as is necessary for the purposes 
            set out in this Privacy Policy. We will retain and use your Personal Data to the extent 
            necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
          </p>

          <h2>Data Security</h2>
          <p>
            The security of your data is important to us. We use commercially acceptable means to 
            protect your Personal Data, but no method of transmission over the Internet or electronic 
            storage is 100% secure.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>

          <h2>Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our Service. 
            Cookies are files with a small amount of data which may include an anonymous unique identifier. 
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            We may employ third-party companies and individuals to facilitate our Service, provide 
            the Service on our behalf, perform Service-related services, or assist us in analyzing 
            how our Service is used. These third parties have access to your Personal Data only to 
            perform these tasks on our behalf.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:{' '}
            <a href={`mailto:${siteConfig.CONTACT_EMAIL}`}>{siteConfig.CONTACT_EMAIL}</a>
          </p>

          <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="m-0"><strong>Disclaimer:</strong> {siteConfig.DISCLAIMER}</p>
          </div>
        </article>
      </div>
    </div>
  );
}
