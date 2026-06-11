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

export interface KeyProgram {
  name: string;
  description: string;
}

export interface KeyMetric {
  label: string;
  value: string;
}

/* ------------------------------------------------------------------ */
/* Generated report (visual-first, org-type adaptive)                 */
/* ------------------------------------------------------------------ */

export interface HeroMetric {
  value: string;
  label: string;
  context: string;
}

export interface GlanceKpi {
  label: string;
  value: string;
  change: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  description: string;
}

export interface OrgOverview {
  mission: string;
  vision: string;
  problem: string;
  targetBeneficiaries: string;
}

export interface ProgramMetric {
  label: string;
  value: string;
}

export interface Program {
  name: string;
  objective: string;
  activities: string[];
  outputs: string[];
  outcomes: string[];
  beneficiaries: string;
  metrics: ProgramMetric[];
}

export interface BeneficiaryProfile {
  name: string;
  group: string;
  story: string;
  quote: string;
  before: string;
  after: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface BeneficiaryImpact {
  profiles: BeneficiaryProfile[];
  testimonials: Testimonial[];
}

export interface DashboardMetric {
  label: string;
  value: string;
  unit: string;
  change: string;
}

export interface GrowthPoint {
  period: string;
  value: number;
}

export interface DistributionSlice {
  name: string;
  value: number;
}

export interface ProgressBar {
  label: string;
  current: number;
  target: number;
  unit: string;
}

export interface GeoPoint {
  region: string;
  value: number;
}

export interface ImpactDashboard {
  metrics: DashboardMetric[];
  growthSeries: GrowthPoint[];
  distribution: DistributionSlice[];
  progressBars: ProgressBar[];
  geographic: GeoPoint[];
}

export interface TheoryOfChangeVisual {
  inputs: string[];
  activities: string[];
  outputs: string[];
  outcomes: string[];
  longTermImpact: string[];
}

export interface MeasurementRow {
  metric: string;
  baseline: string;
  target: string;
  current: string;
  dataSource: string;
  frequency: string;
}

export interface ChallengeItem {
  challenge: string;
  lesson: string;
  adaptation: string;
}

export interface ChallengesLearnings {
  challenges: ChallengeItem[];
  risks: string[];
  futureImprovements: string[];
}

export interface Milestone {
  period: string;
  goal: string;
}

export interface FutureCommitments {
  nextYearGoals: string[];
  roadmap: Milestone[];
  expansionPlans: string[];
  longTermVision: string;
}

export interface Appendix {
  methodology: string;
  dataSources: string[];
  reportingNotes: string;
}

export interface GeneratedReport {
  heroMetric: HeroMetric;
  glanceKpis: GlanceKpi[];
  achievementsTimeline: TimelineItem[];
  overview: OrgOverview;
  programs: Program[];
  beneficiaryImpact: BeneficiaryImpact;
  dashboard: ImpactDashboard;
  theoryOfChange: TheoryOfChangeVisual;
  measurementFramework: MeasurementRow[];
  challengesLearnings: ChallengesLearnings;
  futureCommitments: FutureCommitments;
  appendix: Appendix;
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
  // SDGs (optional, lighter context)
  selectedSdgs: number[]; // SDG numbers 1–17
  sdgChanges: Record<number, string>;
  // Stakeholders & beneficiaries
  primaryBeneficiary: Stakeholder;
  secondaryStakeholders: Stakeholder[];
  beneficiaryGroups: string[];
  // Programs
  keyPrograms: KeyProgram[];
  // Theory of Change inputs
  activities: string[];
  outputs: string[];
  outcomes: string[];
  impact: string[];
  // Measurement
  measurements: Record<string, Measurement>;
  keyMetrics: KeyMetric[];
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
  beneficiaryGroups: [],
  keyPrograms: [],
  activities: [""],
  outputs: [""],
  outcomes: [],
  impact: [],
  measurements: {},
  keyMetrics: [],
  generatedReport: null,
};

// Bumped to v2 when the GeneratedReport shape changed. An old-shape persisted
// report would crash the new ReportViewer, so the key change forces a clean slate.
const STORAGE_KEY = "impactos-state-v2";

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
