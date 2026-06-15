import type { AppState } from "@/lib/state";
import { SDG_NAMES } from "@/lib/exports";

export const COMMERCIAL_KEY = "__commercial_areas__";

export const COMMERCIAL_AREAS: { id: string; name: string; desc: string }[] = [
  { id: "esg", name: "ESG / Sustainability", desc: "Environmental, Social & Governance reporting" },
  { id: "dei", name: "Diversity, Equity & Inclusion", desc: "Workplace equity and belonging initiatives" },
  { id: "customer", name: "Customer Impact", desc: "Lives improved through products or services" },
  { id: "environment", name: "Environmental Footprint", desc: "Carbon reduction, waste, resource efficiency" },
  { id: "supply_chain", name: "Supply Chain Ethics", desc: "Fair trade, responsible sourcing, labor standards" },
  { id: "community", name: "Community Investment", desc: "Local economic development, philanthropy, volunteering" },
  { id: "wellbeing", name: "Employee Wellbeing", desc: "Health, safety, mental wellness programs" },
  { id: "innovation", name: "Innovation for Good", desc: "R&D, products or services that solve societal problems" },
];

export function readCommercialAreas(sdgChanges: Record<string, string>): string[] {
  try {
    const parsed = JSON.parse(sdgChanges[COMMERCIAL_KEY] || "[]");
    return Array.isArray(parsed) ? parsed.filter((a): a is string => typeof a === "string") : [];
  } catch {
    return [];
  }
}

// Build clean, human-readable focus strings for AI prompts (report + theory).
// Internal storage keys (__commercial_areas__, comm_<id>) are never leaked.
export function buildFocusStrings(state: AppState): string[] {
  const out: string[] = [];

  for (const id of readCommercialAreas(state.sdgChanges)) {
    const area = COMMERCIAL_AREAS.find(a => a.id === id);
    if (!area) continue;
    const note = (state.sdgChanges[`comm_${id}`] || "").trim();
    out.push(note ? `${area.name}: ${note}` : area.name);
  }

  for (const id of state.selectedSdgs) {
    const name = SDG_NAMES[id] || `SDG ${id}`;
    const note = (state.sdgChanges[String(id)] || "").trim();
    out.push(note ? `SDG ${id} (${name}): ${note}` : `SDG ${id} (${name})`);
  }

  return out;
}
