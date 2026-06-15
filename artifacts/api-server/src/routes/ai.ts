import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import {
  GenerateTheoryOfChangeBody,
  SuggestKpisBody,
  GenerateReportBody,
  GenerateReportResponse,
} from "@workspace/api-zod";

const router = Router();

const MODEL = "claude-sonnet-4-6";

function extractJson<T>(text: string): T {
  let cleaned = text.trim();
  // Strip markdown code fences if present.
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  }
  // Fall back to the first balanced object/array if there's surrounding prose.
  const firstBrace = cleaned.search(/[[{]/);
  if (firstBrace > 0) {
    cleaned = cleaned.slice(firstBrace);
  }
  return JSON.parse(cleaned) as T;
}

// Single AI call that returns parsed JSON. Throws on a non-text response or
// unparseable output so callers can decide how to surface the failure.
async function callJson<T>(prompt: string, maxTokens: number): Promise<T> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content[0];
  if (!block || block.type !== "text") {
    throw new Error("Unexpected response format from AI");
  }
  return extractJson<T>(block.text);
}

router.post("/ai/generate-theory", async (req, res) => {
  const parsed = GenerateTheoryOfChangeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { sdgs, beneficiary, activities, outputs } = parsed.data;

  const prompt = `You are an impact measurement expert. Given this organization's work:
- Focus areas (SDGs or commercial impact dimensions): ${sdgs.join(", ")}
- Primary beneficiary: ${beneficiary}
- Activities: ${activities.join("; ")}
- Outputs: ${outputs.join("; ")}

Generate realistic Outcomes (medium-term changes in beneficiaries) and Impact (long-term systemic change).
Return ONLY a JSON object with this structure, no markdown, no explanation:
{
  "outcomes": ["outcome1", "outcome2", "outcome3"],
  "impact": ["impact1", "impact2"]
}`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      res.status(500).json({ error: "Unexpected response format from AI" });
      return;
    }

    let result: { outcomes: string[]; impact: string[] };
    try {
      result = extractJson(block.text);
    } catch {
      res.status(500).json({ error: "AI returned invalid JSON" });
      return;
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "AI generation failed");
    res.status(500).json({ error: "AI generation failed" });
  }
});

router.post("/ai/suggest-kpis", async (req, res) => {
  const parsed = SuggestKpisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { sector, items } = parsed.data;

  const prompt = `You are an impact measurement expert specializing in M&E (monitoring and evaluation) frameworks${
    sector ? ` for the ${sector} sector` : ""
  }.

For each of the following outputs/outcomes, suggest a concrete, measurable KPI: a specific indicator, a realistic starting baseline, an ambitious-but-credible target, and an appropriate measurement frequency (one of: Monthly, Quarterly, Annually).

Items:
${items.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

Return ONLY a JSON object with this exact structure, no markdown, no explanation:
{
  "kpis": [
    { "item": "<the exact item text>", "indicator": "...", "baseline": "...", "target": "...", "frequency": "Monthly|Quarterly|Annually" }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      res.status(500).json({ error: "Unexpected response format from AI" });
      return;
    }

    let result: unknown;
    try {
      result = extractJson(block.text);
    } catch {
      res.status(500).json({ error: "AI returned invalid JSON" });
      return;
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "KPI suggestion failed");
    res.status(500).json({ error: "AI generation failed" });
  }
});

router.post("/ai/generate-report", async (req, res) => {
  const parsed = GenerateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const d = parsed.data;
  const list = (arr?: string[]) =>
    arr && arr.length ? arr.join("; ") : "Not specified";
  const programsList =
    d.keyPrograms && d.keyPrograms.length
      ? d.keyPrograms.map((p) => `${p.name}: ${p.description}`).join("; ")
      : "Not specified";
  const metricsList =
    d.keyMetrics && d.keyMetrics.length
      ? d.keyMetrics.map((m) => `${m.label} = ${m.value}`).join("; ")
      : "Not specified";

  const context = `ORGANIZATION
- Name: ${d.orgName}
- Type: ${d.orgType || "Not specified"}
- Industry / sector: ${d.industry || "Not specified"}
- Country / region: ${d.country || "Not specified"}
- Website: ${d.website || "Not specified"}
- Reporting period: ${d.reportingPeriod || "Not specified"}
- Mission: ${d.mission || "Not specified"}

FOCUS & BENEFICIARIES
- SDGs: ${list(d.sdgs)}
- Focus areas & desired changes: ${list(d.sdgChanges)}
- Beneficiary groups: ${list(d.beneficiaryGroups)}
- Primary beneficiary: ${d.primaryBeneficiary || "Not specified"}
- Secondary stakeholders: ${list(d.secondaryStakeholders)}

PROGRAMS (organization-provided)
- ${programsList}

KEY METRICS (organization-provided, treat as ground truth)
- ${metricsList}

THEORY OF CHANGE INPUTS
- Activities: ${list(d.activities)}
- Outputs: ${list(d.outputs)}
- Outcomes: ${list(d.outcomes)}
- Impact: ${list(d.impact)}`;

  const adaptation = `ADAPT TO ORGANIZATION TYPE: Choose metrics, KPIs, and language that genuinely fit a "${
    d.orgType || "mission-driven"
  }" organization working in ${
    d.industry || "social impact"
  }. Examples by type: education -> students reached, completion/graduation rates, learning gains; climate -> tonnes CO2e avoided, renewable capacity (MW), hectares restored; healthcare -> patients treated, health outcomes, access rates; startup / social enterprise -> users or customers, revenue, jobs created, growth rate; nonprofit -> beneficiaries served, funds deployed, volunteers, communities reached. Pick the ones that fit this organization; do not force irrelevant metrics.

RULES: Be specific, credible, and data-oriented. Where the organization provided key metrics, use those exact numbers and keep everything consistent with them. Where numbers are missing, infer realistic, internally consistent figures appropriate to the organization's stated scale. Do not invent or change provided facts (name, mission, programs). Do not use emojis.`;

  const intro =
    "You are a senior impact measurement and sustainability consultant producing an investor- and grantmaker-grade impact report.";

  const promptA = `${intro}

${context}

${adaptation}

Produce the STRUCTURED CONTENT sections. This report is VISUAL-FIRST, so keep text tight and scannable. The four "overview" fields COMBINED must total UNDER 250 words. Theory-of-change entries must be short bullet phrases, not full sentences.

Caps: programs 3-5 (base them on the provided programs when available); each program's activities/outputs/outcomes 3-4 short items; metrics per program 2-3; measurementFramework 6-8 rows; theoryOfChange each array 3-5 short items; challengesLearnings.challenges 3-4, risks 3-5, futureImprovements 3-5; futureCommitments.nextYearGoals 4-6, roadmap 4-6, expansionPlans 3-5; appendix.dataSources 3-5.

Return ONLY a JSON object with EXACTLY this structure, no markdown, no commentary:
{
  "overview": { "mission": "string", "vision": "string", "problem": "string", "targetBeneficiaries": "string" },
  "programs": [ { "name": "string", "objective": "string", "activities": ["string"], "outputs": ["string"], "outcomes": ["string"], "beneficiaries": "string", "metrics": [ { "label": "string", "value": "string" } ] } ],
  "theoryOfChange": { "inputs": ["string"], "activities": ["string"], "outputs": ["string"], "outcomes": ["string"], "longTermImpact": ["string"] },
  "measurementFramework": [ { "metric": "string", "baseline": "string", "target": "string", "current": "string", "dataSource": "string", "frequency": "Monthly|Quarterly|Annually" } ],
  "challengesLearnings": { "challenges": [ { "challenge": "string", "lesson": "string", "adaptation": "string" } ], "risks": ["string"], "futureImprovements": ["string"] },
  "futureCommitments": { "nextYearGoals": ["string"], "roadmap": [ { "period": "string", "goal": "string" } ], "expansionPlans": ["string"], "longTermVision": "string" },
  "appendix": { "methodology": "string", "dataSources": ["string"], "reportingNotes": "string" }
}`;

  const promptB = `${intro}

${context}

${adaptation}

Produce the VISUAL / QUANTITATIVE sections: headline metrics, KPIs, achievements timeline, beneficiary stories, and dashboard data. All numbers must be internally consistent with each other and with any organization-provided key metrics. The hero metric is the single most powerful headline number for this organization.

Caps: glanceKpis 6-8; achievementsTimeline 4-6 (chronological); beneficiaryImpact.profiles 3-4 (realistic, human, drawn from the beneficiary groups), testimonials 3-4; dashboard.metrics 4-6; growthSeries 5-7 points (chronological period labels, numeric values that show a trend); distribution 4-6 slices (by program or beneficiary group, numeric values); progressBars 4-6 (numeric current/target toward goals); geographic 4-6 regions (region name + numeric value). For "change" use a short delta like "+24% YoY" or "new", or "" when not applicable.

Return ONLY a JSON object with EXACTLY this structure, no markdown, no commentary:
{
  "heroMetric": { "value": "string", "label": "string", "context": "string" },
  "glanceKpis": [ { "label": "string", "value": "string", "change": "string" } ],
  "achievementsTimeline": [ { "date": "string", "title": "string", "description": "string" } ],
  "beneficiaryImpact": { "profiles": [ { "name": "string", "group": "string", "story": "string", "quote": "string", "before": "string", "after": "string" } ], "testimonials": [ { "quote": "string", "author": "string", "role": "string" } ] },
  "dashboard": { "metrics": [ { "label": "string", "value": "string", "unit": "string", "change": "string" } ], "growthSeries": [ { "period": "string", "value": 0 } ], "distribution": [ { "name": "string", "value": 0 } ], "progressBars": [ { "label": "string", "current": 0, "target": 0, "unit": "string" } ], "geographic": [ { "region": "string", "value": 0 } ] }
}`;

  try {
    const [partA, partB] = await Promise.all([
      callJson<Record<string, unknown>>(promptA, 16000),
      callJson<Record<string, unknown>>(promptB, 16000),
    ]);

    const merged = { ...partA, ...partB };
    const validated = GenerateReportResponse.safeParse(merged);
    if (!validated.success) {
      req.log.error(
        { issues: validated.error.issues },
        "Generated report failed schema validation",
      );
      res
        .status(500)
        .json({ error: "AI returned a report that did not match the required structure" });
      return;
    }

    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Report generation failed");
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
