export interface AppState {
  step: number; // 0–5
  orgName: string;
  sector: string;
  selectedSdgs: number[]; // SDG numbers 1–17
  sdgChanges: Record<number, string>; // SDG number -> change description
  primaryBeneficiary: { name: string; affected: string };
  secondaryStakeholders: Array<{ name: string; affected: string }>;
  activities: string[];
  outputs: string[];
  outcomes: string[];
  impact: string[];
  measurements: Record<string, { indicator: string; baseline: string; target: string; frequency: string }>;
}

export const defaultState: AppState = {
  step: 0,
  orgName: "",
  sector: "",
  selectedSdgs: [],
  sdgChanges: {},
  primaryBeneficiary: { name: "", affected: "" },
  secondaryStakeholders: [],
  activities: [""],
  outputs: [""],
  outcomes: [],
  impact: [],
  measurements: {}
};

const STORAGE_KEY = "impactos-state";

export function loadState(): AppState {
  try {
    if (window.location.hash) {
      const hash = window.location.hash.slice(1);
      const decoded = JSON.parse(atob(hash));
      if (decoded && typeof decoded === "object") {
        return { ...defaultState, ...decoded };
      }
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return defaultState;
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

export function generateShareUrl(state: AppState): string {
  try {
    const encoded = btoa(JSON.stringify(state));
    const url = new URL(window.location.href);
    url.hash = encoded;
    return url.toString();
  } catch (e) {
    console.error("Failed to generate share URL", e);
    return window.location.href;
  }
}
