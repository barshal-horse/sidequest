/**
 * SideQuest Unified Telemetry & Analytics Engine
 * Supports PostHog, Google Analytics 4 (GA4), Vercel Analytics,
 * and graceful fallback with clean console logging.
 */

export type SideQuestEventName =
  | 'flare_created'
  | 'flare_joined'
  | 'flare_left'
  | 'flare_checkin_verified'
  | 'polaroid_snapped'
  | 'story_exported'
  | 'roulette_rolled'
  | 'sonar_swept'
  | 'city_switched'
  | 'profile_registered'
  | 'profile_updated'
  | 'spotify_connected';

export interface AnalyticsProperties {
  city?: string;
  category?: string;
  dropId?: string;
  venueName?: string;
  method?: 'gps' | 'qr' | 'pin';
  filter?: string;
  handle?: string;
  [key: string]: any;
}

declare global {
  interface Window {
    posthog?: {
      capture: (eventName: string, properties?: Record<string, any>) => void;
      identify: (distinctId: string, properties?: Record<string, any>) => void;
    };
    gtag?: (command: string, action: string, params?: Record<string, any>) => void;
    va?: (action: string, eventName: string, properties?: Record<string, any>) => void;
  }
}

/**
 * Universal Event Tracker: Dispatches to PostHog, GA4, Vercel, and Dev Console
 */
export function trackEvent(name: SideQuestEventName, properties: AnalyticsProperties = {}) {
  const payload = {
    ...properties,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.pathname : ''
  };

  // 1. PostHog Dispatch
  if (typeof window !== 'undefined' && window.posthog && typeof window.posthog.capture === 'function') {
    try {
      window.posthog.capture(name, payload);
    } catch (e) {
      // Silently continue
    }
  }

  // 2. Google Analytics 4 Dispatch
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', name, payload);
    } catch (e) {
      // Silently continue
    }
  }

  // 3. Vercel Analytics Dispatch
  if (typeof window !== 'undefined' && typeof window.va === 'function') {
    try {
      window.va('event', name, payload);
    } catch (e) {
      // Silently continue
    }
  }

  // 4. Development Telemetry Logger
  if (process.env.NODE_ENV === 'development') {
    console.log(`📡 [ANALYTICS] ${name}`, payload);
  }
}

/**
 * Identify User session in PostHog / GA4
 */
export function identifyUser(userId: string, traits: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.posthog && typeof window.posthog.identify === 'function') {
    try {
      window.posthog.identify(userId, traits);
    } catch (e) {
      // Silently continue
    }
  }
}
