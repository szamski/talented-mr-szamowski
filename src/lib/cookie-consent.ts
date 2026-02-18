export type ConsentCategory = "necessary" | "analytics" | "marketing";

export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const STORAGE_KEY = "cookie_consent";
const listeners = new Set<(state: ConsentState) => void>();

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasConsented(): boolean {
  return getConsent() !== null;
}

export function setConsent(
  choices: Pick<ConsentState, "analytics" | "marketing">
): void {
  const state: ConsentState = {
    necessary: true,
    analytics: choices.analytics,
    marketing: choices.marketing,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateGoogleConsent(state);
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn: (state: ConsentState) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function updateGoogleConsent(state: ConsentState): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: state.analytics ? "granted" : "denied",
      ad_storage: state.marketing ? "granted" : "denied",
      ad_user_data: state.marketing ? "granted" : "denied",
      ad_personalization: state.marketing ? "granted" : "denied",
    });
  }
}
