import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { siteConfig, isPaymentConfigured } from '@/lib/siteConfig';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
import { Rocket, AlertCircle } from 'lucide-react';

interface SprintCTAProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function SprintCTA({ variant = 'default', size = 'lg', className }: SprintCTAProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (isPaymentConfigured()) {
      trackEvent(ANALYTICS_EVENTS.SPRINT_PAYMENT_CLICK, { source: 'cta_button' });
      window.open(siteConfig.SPRINT_PAYMENT_LINK, '_blank');
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <Button onClick={handleClick} variant={variant} size={size} className={className}>
        <Rocket className="mr-2 h-4 w-4" />
        Start 7-Day Sprint
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Payment Link Not Configured
            </DialogTitle>
            <DialogDescription className="pt-2 space-y-3">
              <p>
                The Sprint payment link hasn't been set up yet.
              </p>
              <div className="bg-muted p-4 rounded-lg text-sm">
                <p className="font-medium text-foreground mb-2">For Admins:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Open <code className="bg-background px-1 rounded">src/lib/siteConfig.ts</code></li>
                  <li>Set <code className="bg-background px-1 rounded">SPRINT_PAYMENT_LINK</code> to your Stripe/Razorpay link</li>
                  <li>Deploy the changes</li>
                </ol>
              </div>
              <p className="text-muted-foreground">
                Contact <a href={`mailto:${siteConfig.CONTACT_EMAIL}`} className="text-primary hover:underline">{siteConfig.CONTACT_EMAIL}</a> for assistance.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
