import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/safeClient';
import { siteConfig, getWhatsAppLink } from '@/lib/siteConfig';
import { getPersistedUTMParams, persistUTMParams } from '@/hooks/useUTMParams';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
import { toast } from 'sonner';
import { Loader2, CheckCircle, MessageCircle, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublicLeadFormProps {
  source?: string;
  className?: string;
  variant?: 'default' | 'compact';
  onSuccess?: () => void;
}

const BUSINESS_TYPES = [
  { value: 'coach', label: 'Coach / Consultant' },
  { value: 'agency', label: 'Agency' },
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'creator', label: 'Creator / Influencer' },
  { value: 'service', label: 'Service Business' },
  { value: 'other', label: 'Other' },
];

const REVENUE_RANGES = [
  { value: 'pre-revenue', label: 'Pre-revenue' },
  { value: '0-10k', label: '₹0 - ₹10L/month' },
  { value: '10k-50k', label: '₹10L - ₹50L/month' },
  { value: '50k-100k', label: '₹50L - ₹1Cr/month' },
  { value: '100k+', label: '₹1Cr+/month' },
];

const GOALS = [
  { value: 'more-leads', label: 'Get more leads' },
  { value: 'scale-ads', label: 'Scale paid ads profitably' },
  { value: 'launch-offer', label: 'Launch a new offer' },
  { value: 'optimize-funnel', label: 'Optimize my funnel' },
  { value: 'other', label: 'Something else' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  business_type: string;
  revenue_range: string;
  goal: string;
  company_website: string; // Honeypot field
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  business_type?: string;
  revenue_range?: string;
  goal?: string;
}

export function PublicLeadForm({ source = 'website', className, variant = 'default', onSuccess }: PublicLeadFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    business_type: '',
    revenue_range: '',
    goal: '',
    company_website: '', // Honeypot
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Persist UTM params on mount
  useEffect(() => {
    persistUTMParams();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name is required (minimum 2 characters)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (formData.phone) {
      const cleaned = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
        newErrors.phone = 'Invalid phone number format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const utmParams = getPersistedUTMParams();
      
      const { data, error } = await supabase.functions.invoke('submit-lead', {
        body: {
          ...formData,
          source,
          ...utmParams,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      // Track successful submission
      trackEvent(ANALYTICS_EVENTS.LEAD_SUBMIT, {
        source,
        business_type: formData.business_type,
        revenue_range: formData.revenue_range,
        goal: formData.goal,
      });

      setSubmitted(true);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppClick = () => {
    trackEvent(ANALYTICS_EVENTS.WHATSAPP_CLICK, { source: 'thank_you' });
    window.open(getWhatsAppLink(), '_blank');
  };

  const handleBookCallClick = () => {
    trackEvent(ANALYTICS_EVENTS.BOOK_CALL_CLICK, { source: 'thank_you' });
    window.open(siteConfig.CALENDAR_BOOKING_LINK, '_blank');
  };

  // Thank you panel after submission
  if (submitted) {
    return (
      <Card className={cn("border-primary/20", className)}>
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">Thank You!</h3>
            <p className="text-muted-foreground">
              We've received your application. Here's what to do next:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleWhatsAppClick}
              className="gap-2 h-auto py-4 flex-col items-center"
            >
              <MessageCircle className="h-5 w-5 text-green-500" />
              <span>Message on WhatsApp</span>
              <span className="text-xs text-muted-foreground">Get a faster response</span>
            </Button>

            <Button
              size="lg"
              onClick={handleBookCallClick}
              className="gap-2 h-auto py-4 flex-col items-center gradient-primary text-primary-foreground"
            >
              <Calendar className="h-5 w-5" />
              <span>Book a Strategy Call</span>
              <span className="text-xs opacity-80">Schedule your session</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      {variant === 'default' && (
        <CardHeader>
          <CardTitle>Apply Now</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you within 24 hours.
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent className={variant === 'compact' ? 'pt-6' : ''}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field - hidden from users */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <Label htmlFor="company_website">Company Website</Label>
            <Input
              id="company_website"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              value={formData.company_website}
              onChange={(e) => setFormData(prev => ({ ...prev, company_website: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (WhatsApp preferred)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_type">Business Type</Label>
            <Select
              value={formData.business_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenue_range">Monthly Revenue</Label>
            <Select
              value={formData.revenue_range}
              onValueChange={(value) => setFormData(prev => ({ ...prev, revenue_range: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select revenue range" />
              </SelectTrigger>
              <SelectContent>
                {REVENUE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Primary Goal</Label>
            <Select
              value={formData.goal}
              onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="What do you want to achieve?" />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            disabled={submitting} 
            className="w-full gap-2 gradient-primary text-primary-foreground"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By submitting, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
            {' '}and{' '}
            <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
