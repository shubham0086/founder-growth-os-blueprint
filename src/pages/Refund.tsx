import { siteConfig } from '@/lib/siteConfig';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Refund() {
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
          <h1>Refund Policy</h1>
          <p className="lead">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2>7-Day Sprint Refund Policy</h2>
          <p>
            We stand behind the quality of our 7-Day Sprint program. Our refund policy is designed 
            to be fair to both parties while ensuring you get the transformation you signed up for.
          </p>

          <h3>Eligibility for Refund</h3>
          <p>You may request a refund if:</p>
          <ul>
            <li>You request a refund within 48 hours of purchase AND before the Sprint begins</li>
            <li>We fail to deliver the promised deliverables outlined in your Sprint agreement</li>
            <li>There are significant technical issues that prevent program delivery</li>
          </ul>

          <h3>Non-Refundable Situations</h3>
          <p>Refunds will NOT be provided if:</p>
          <ul>
            <li>You change your mind after the Sprint has begun</li>
            <li>You fail to participate in scheduled calls or complete required tasks</li>
            <li>You don't implement the strategies provided</li>
            <li>Your results differ from what you expected (results vary based on execution)</li>
          </ul>

          <h2>Other Services</h2>
          <p>
            For consulting and other services, refund eligibility will be determined on a 
            case-by-case basis and outlined in your service agreement.
          </p>

          <h2>How to Request a Refund</h2>
          <p>To request a refund:</p>
          <ol>
            <li>Email us at <a href={`mailto:${siteConfig.CONTACT_EMAIL}`}>{siteConfig.CONTACT_EMAIL}</a></li>
            <li>Include your order number and reason for the refund request</li>
            <li>We will respond within 3 business days</li>
          </ol>

          <h2>Processing Time</h2>
          <p>
            Approved refunds will be processed within 7-10 business days. The refund will be 
            credited to your original payment method.
          </p>

          <h2>Partial Refunds</h2>
          <p>
            In some cases, we may offer a partial refund if a portion of the service has been 
            delivered. This will be calculated based on the work completed.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about our refund policy, please contact us at:{' '}
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
