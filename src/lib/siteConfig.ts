/**
 * Site Configuration - Single Source of Truth
 * All contact links, brand info, and external URLs should be managed here.
 */

interface SiteConfigType {
  BRAND_NAME: string;
  BRAND_TAGLINE: string;
  CONTACT_EMAIL: string;
  WHATSAPP_PHONE_E164: string;
  CALENDAR_BOOKING_LINK: string;
  SPRINT_PAYMENT_LINK: string;
  ADMIN_EMAIL: string;
  SOCIAL_LINKS: {
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  COMPANY_LEGAL_NAME: string;
  DISCLAIMER: string;
  GA4_MEASUREMENT_ID: string;
  META_PIXEL_ID: string;
}

export const siteConfig: SiteConfigType = {
  // Brand
  BRAND_NAME: 'Creator Growth Engine',
  BRAND_TAGLINE: 'Scale your creative business with data-driven growth',
  
  // Contact
  CONTACT_EMAIL: 'hello@creatorgrowth.co',
  WHATSAPP_PHONE_E164: '+919876543210', // Format: +CountryCodeNumber
  
  // Booking & Payments
  CALENDAR_BOOKING_LINK: 'https://calendly.com/your-link', // Replace with actual link
  SPRINT_PAYMENT_LINK: '', // Leave empty to show "not configured" modal
  
  // Admin
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL || 'admin@creatorgrowth.co',
  
  // Social
  SOCIAL_LINKS: {
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  },
  
  // Legal
  COMPANY_LEGAL_NAME: 'Creator Growth Engine',
  DISCLAIMER: 'Results vary; depends on offer, market, and execution.',
  
  // Analytics (loaded from env vars)
  GA4_MEASUREMENT_ID: import.meta.env.VITE_GA4_ID || '',
  META_PIXEL_ID: import.meta.env.VITE_META_PIXEL_ID || '',
};

// WhatsApp prefilled message helper
export function getWhatsAppLink(message?: string): string {
  const phone = siteConfig.WHATSAPP_PHONE_E164.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(
    message || `Hi! I just submitted my application on ${siteConfig.BRAND_NAME}. Looking forward to chatting!`
  );
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

// Check if payment link is configured
export function isPaymentConfigured(): boolean {
  return siteConfig.SPRINT_PAYMENT_LINK.length > 0;
}

export type { SiteConfigType as SiteConfig };
