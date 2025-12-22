import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const location = useLocation();

  useEffect(() => {
    // Only load if measurement ID is provided
    if (!measurementId) return;

    // Check if script is already loaded
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
      send_page_view: false, // We'll send manually on route changes
    });

    console.log('Google Analytics initialized:', measurementId);
  }, [measurementId]);

  // Track page views on route changes
  useEffect(() => {
    if (!measurementId || typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location, measurementId]);

  return null;
}

// Helper function to track custom events
export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

// Helper to track conversions (for ad platforms)
export function trackConversion(conversionLabel: string, value?: number) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: conversionLabel,
      value: value,
      currency: 'INR',
    });
  }
}
