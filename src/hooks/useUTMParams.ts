import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export interface UTMParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

/**
 * Hook to extract UTM parameters from the current URL
 */
export function useUTMParams(): UTMParams {
  const location = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    
    return {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      utm_term: params.get('utm_term'),
    };
  }, [location.search]);
}

/**
 * Get UTM params from current window location (for non-hook usage)
 */
export function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  };
}

/**
 * Store UTM params in sessionStorage for persistence across page navigations
 */
export function persistUTMParams(): void {
  const utmParams = getUTMParams();
  const hasUTM = Object.values(utmParams).some(v => v !== null);
  
  if (hasUTM) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
  }
}

/**
 * Get persisted UTM params from sessionStorage
 */
export function getPersistedUTMParams(): UTMParams {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    };
  }

  const stored = sessionStorage.getItem('utm_params');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getUTMParams();
    }
  }
  
  return getUTMParams();
}
