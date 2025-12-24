/**
 * Analytics Module
 * Handles GA4 and Meta Pixel event tracking
 */

import { siteConfig } from './siteConfig';

// Declare global types for analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

// Event names for tracking
export const ANALYTICS_EVENTS = {
  LEAD_SUBMIT: 'lead_submit',
  WHATSAPP_CLICK: 'whatsapp_click',
  BOOK_CALL_CLICK: 'book_call_click',
  SPRINT_PAYMENT_CLICK: 'sprint_payment_click',
  PAGE_VIEW: 'page_view',
} as const;

type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

/**
 * Initialize GA4 script
 */
export function initGA4(): void {
  const measurementId = siteConfig.GA4_MEASUREMENT_ID;
  if (!measurementId) return;

  // Check if already loaded
  if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) {
    return;
  }

  // Load gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
  });

  console.log('[Analytics] GA4 initialized:', measurementId);
}

/**
 * Initialize Meta Pixel script
 */
export function initMetaPixel(): void {
  const pixelId = siteConfig.META_PIXEL_ID;
  if (!pixelId) return;

  // Check if already loaded
  if (window.fbq) return;

  // Meta Pixel base code
  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');

  console.log('[Analytics] Meta Pixel initialized:', pixelId);
}

/**
 * Initialize all analytics
 */
export function initAnalytics(): void {
  initGA4();
  initMetaPixel();
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: AnalyticsEventName | string,
  params?: Record<string, any>
): void {
  // GA4 tracking
  if (typeof window.gtag === 'function' && siteConfig.GA4_MEASUREMENT_ID) {
    window.gtag('event', eventName, params);
    console.log('[Analytics] GA4 event:', eventName, params);
  }

  // Meta Pixel tracking
  if (typeof window.fbq === 'function' && siteConfig.META_PIXEL_ID) {
    // Map custom events to Meta standard events where applicable
    const metaEventMap: Record<string, string> = {
      [ANALYTICS_EVENTS.LEAD_SUBMIT]: 'Lead',
      [ANALYTICS_EVENTS.SPRINT_PAYMENT_CLICK]: 'InitiateCheckout',
      [ANALYTICS_EVENTS.BOOK_CALL_CLICK]: 'Schedule',
    };

    const metaEvent = metaEventMap[eventName];
    if (metaEvent) {
      window.fbq('track', metaEvent, params);
    } else {
      window.fbq('trackCustom', eventName, params);
    }
    console.log('[Analytics] Meta Pixel event:', eventName, params);
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  // GA4
  if (typeof window.gtag === 'function' && siteConfig.GA4_MEASUREMENT_ID) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  }

  // Meta Pixel
  if (typeof window.fbq === 'function' && siteConfig.META_PIXEL_ID) {
    window.fbq('track', 'PageView');
  }
}

/**
 * Track conversion (for ad platforms)
 */
export function trackConversion(conversionLabel: string, value?: number): void {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: conversionLabel,
      value: value,
      currency: 'INR',
    });
  }
}
