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
  // Keyed by SDG number (as string) in SDG mode; also holds commercial-impact keys
  // ("__commercial_areas__" = JSON string[] of selected area ids, "comm_<id>" = notes).
  sdgChanges: Record<string, string>;
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

const isArr = (v: unknown): v is unknown[] => Array.isArray(v);
const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && !Number.isNaN(v);

// A persisted or shared report can be partial (old shape, truncated, or
// hand-crafted). ReportViewer maps over these nested arrays unconditionally, so
// rendering an incomplete report crashes the whole app. Validate the full shape
// before we ever hand it to the viewer; anything that fails is treated as "no
// report" and the user is shown the generate UI instead.
export function isValidReport(r: unknown): r is GeneratedReport {
  if (!isObj(r)) return false;
  if (!isObj(r.heroMetric)) return false;
  if (!isArr(r.glanceKpis)) return false;
  if (!isArr(r.achievementsTimeline)) return false;
  if (!isObj(r.overview)) return false;
  // ReportViewer and the DOCX export dereference each program's nested arrays
  // unconditionally, so a program element missing them would still crash.
  if (
    !isArr(r.programs) ||
    !r.programs.every(
      (p) =>
        isObj(p) &&
        isArr(p.activities) &&
        isArr(p.outputs) &&
        isArr(p.outcomes) &&
        isArr(p.metrics),
    )
  )
    return false;
  const bi = r.beneficiaryImpact;
  if (!isObj(bi) || !isArr(bi.profiles) || !isArr(bi.testimonials)) return false;
  const d = r.dashboard;
  // progressBars current/target and geographic value are used with arithmetic
  // and toLocaleString(), so they must be real numbers, not just present.
  if (
    !isObj(d) ||
    !isArr(d.metrics) ||
    !isArr(d.growthSeries) ||
    !isArr(d.distribution) ||
    !isArr(d.progressBars) ||
    !isArr(d.geographic) ||
    !d.progressBars.every((pb) => isObj(pb) && isNum(pb.current) && isNum(pb.target)) ||
    !d.geographic.every((g) => isObj(g) && isNum(g.value))
  )
    return false;
  const toc = r.theoryOfChange;
  if (
    !isObj(toc) ||
    !isArr(toc.inputs) ||
    !isArr(toc.activities) ||
    !isArr(toc.outputs) ||
    !isArr(toc.outcomes) ||
    !isArr(toc.longTermImpact)
  )
    return false;
  if (!isArr(r.measurementFramework)) return false;
  const cl = r.challengesLearnings;
  if (!isObj(cl) || !isArr(cl.challenges) || !isArr(cl.risks) || !isArr(cl.futureImprovements))
    return false;
  const fc = r.futureCommitments;
  if (
    !isObj(fc) ||
    !isArr(fc.nextYearGoals) ||
    !isArr(fc.roadmap) ||
    !isArr(fc.expansionPlans)
  )
    return false;
  const ap = r.appendix;
  if (!isObj(ap) || !isArr(ap.dataSources)) return false;
  return true;
}

// Drop any persisted/shared report that doesn't match the current shape so it
// can never reach ReportViewer. Wizard inputs are preserved.
function sanitizeState(state: AppState): AppState {
  if (state.generatedReport && !isValidReport(state.generatedReport)) {
    return { ...state, generatedReport: null };
  }
  return state;
}

// Mirror of generateShareUrl's btoa(unescape(encodeURIComponent(...))) so that
// non-ASCII content (e.g. Turkish characters) round-trips without mojibake.
function decodeHash(hash: string): unknown {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(hash))));
  } catch {
    // Fall back to a plain decode for any legacy/ASCII-only hashes.
    return JSON.parse(atob(hash));
  }
}

export function loadState(): AppState {
  try {
    if (window.location.hash) {
      const hash = window.location.hash.slice(1);
      const decoded = decodeHash(hash);
      if (decoded && typeof decoded === "object") {
        return sanitizeState({ ...defaultState, ...decoded });
      }
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return sanitizeState({ ...defaultState, ...JSON.parse(saved) });
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
