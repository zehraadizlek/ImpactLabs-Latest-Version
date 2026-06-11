export interface Stakeholder {
  name: string;
  affected: string;
}

export interface Measurement {
  indicator: string;
  baseline: string;
  target: string;
  frequency: string;
}

export interface SdgAlignment {
  sdg: number;
  whyItMatters: string;
  expectedContribution: string;
}

export interface ImpactStrategy {
  longTermVision: string;
  strategicObjectives: string[];
  keyInitiatives: string[];
}

export interface RiskAnalysis {
  keyRisks: string[];
  dependencies: string[];
  mitigation: string[];
}

export interface FutureCommitments {
  nextYearGoals: string[];
  expansionPlans: string[];
  sdgRoadmap: string[];
}

export interface ProgressMetrics {
  beneficiariesReached: number;
  partnershipsFormed: number;
  projectsLaunched: number;
  impactGrowth: Array<{ period: string; value: number }>;
}

export interface GeneratedReport {
  executiveSummary: string;
  sdgAlignment: SdgAlignment[];
  stakeholderAnalysis: string;
  theoryOfChangeNarrative: string;
  impactStrategy: ImpactStrategy;
  measurementFramework: string;
  risks: RiskAnalysis;
  futureCommitments: FutureCommitments;
  progressMetrics: ProgressMetrics;
}

export interface AppState {
  step: number; // 0–5
  // Organization profile
  orgName: string;
  orgType: string; // Startup, NGO, Social Enterprise, Company, Student Project, Government Initiative
  industry: string;
  website: string;
  logo: string; // base64 data URL, optional
  mission: string;
  country: string;
  reportingPeriod: string;
  sector: string; // legacy / kept for back-compat
  // SDGs (1–5 allowed)
  selectedSdgs: number[]; // SDG numbers 1–17
  sdgChanges: Record<number, string>;
  // Stakeholders
  primaryBeneficiary: Stakeholder;
  secondaryStakeholders: Stakeholder[];
  // Theory of Change
  activities: string[];
  outputs: string[];
  outcomes: string[];
  impact: string[];
  // Measurement
  measurements: Record<string, Measurement>;
  // AI-generated report content
  generatedReport: GeneratedReport | null;
}

export const defaultState: AppState = {
  step: 0,
  orgName: "",
  orgType: "",
  industry: "",
  website: "",
  logo: "",
  mission: "",
  country: "",
  reportingPeriod: "",
  sector: "",
  selectedSdgs: [],
  sdgChanges: {},
  primaryBeneficiary: { name: "", affected: "" },
  secondaryStakeholders: [],
  activities: [""],
  outputs: [""],
  outcomes: [],
  impact: [],
  measurements: {},
  generatedReport: null,
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
    // Strip heavy fields to keep the share URL compact.
    const { logo: _logo, generatedReport: _report, ...lite } = state;
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(lite))));
    const url = new URL(window.location.href);
    url.hash = encoded;
    return url.toString();
  } catch (e) {
    console.error("Failed to generate share URL", e);
    return window.location.href;
  }
}
