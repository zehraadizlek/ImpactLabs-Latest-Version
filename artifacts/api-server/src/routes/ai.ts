import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import {
  GenerateTheoryOfChangeBody,
  SuggestKpisBody,
  GenerateReportBody,
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

router.post("/ai/generate-theory", async (req, res) => {
  const parsed = GenerateTheoryOfChangeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { sdgs, beneficiary, activities, outputs } = parsed.data;

  const prompt = `You are an impact measurement expert. Given this organization's work:
- SDGs focused on: ${sdgs.join(", ")}
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
  const list = (arr?: string[]) => (arr && arr.length ? arr.join("; ") : "Not specified");

  const prompt = `You are a senior sustainability and impact consultant (think BCG, McKinsey Sustainability, UN SDG reporting). Write a professional, investor-ready Impact Report for the organization below. Be specific, credible, and data-oriented. Avoid generic filler. Do not use emojis.

ORGANIZATION
- Name: ${d.orgName}
- Type: ${d.orgType || "Not specified"}
- Industry: ${d.industry || "Not specified"}
- Country: ${d.country || "Not specified"}
- Reporting period: ${d.reportingPeriod || "Not specified"}
- Mission: ${d.mission || "Not specified"}

FOCUS
- SDGs: ${list(d.sdgs)}
- Desired change per SDG: ${list(d.sdgChanges)}

STAKEHOLDERS
- Primary beneficiary: ${d.primaryBeneficiary || "Not specified"}
- Secondary stakeholders: ${list(d.secondaryStakeholders)}

THEORY OF CHANGE
- Activities: ${list(d.activities)}
- Outputs: ${list(d.outputs)}
- Outcomes: ${list(d.outcomes)}
- Impact: ${list(d.impact)}

Write each narrative field as polished prose (executiveSummary, stakeholderAnalysis, theoryOfChangeNarrative, measurementFramework should each be 2-4 paragraphs). For "sdgAlignment", include one entry per SDG listed above (use the SDG number). For "progressMetrics", provide realistic forward-looking projected figures consistent with the organization's scale, and an "impactGrowth" series of 4-5 points across the reporting horizon (period labels like years or quarters, value an index/count showing growth).

Return ONLY a JSON object with EXACTLY this structure, no markdown, no explanation:
{
  "executiveSummary": "string",
  "sdgAlignment": [ { "sdg": 0, "whyItMatters": "string", "expectedContribution": "string" } ],
  "stakeholderAnalysis": "string",
  "theoryOfChangeNarrative": "string",
  "impactStrategy": { "longTermVision": "string", "strategicObjectives": ["string"], "keyInitiatives": ["string"] },
  "measurementFramework": "string",
  "risks": { "keyRisks": ["string"], "dependencies": ["string"], "mitigation": ["string"] },
  "futureCommitments": { "nextYearGoals": ["string"], "expansionPlans": ["string"], "sdgRoadmap": ["string"] },
  "progressMetrics": { "beneficiariesReached": 0, "partnershipsFormed": 0, "projectsLaunched": 0, "impactGrowth": [ { "period": "string", "value": 0 } ] }
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
    req.log.error({ err }, "Report generation failed");
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
