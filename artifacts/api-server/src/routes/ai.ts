import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { GenerateTheoryOfChangeBody } from "@workspace/api-zod";

const router = Router();

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
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      res.status(500).json({ error: "Unexpected response format from AI" });
      return;
    }

    let parsed_result: { outcomes: string[]; impact: string[] };
    try {
      parsed_result = JSON.parse(block.text);
    } catch {
      res.status(500).json({ error: "AI returned invalid JSON" });
      return;
    }

    res.json(parsed_result);
  } catch (err) {
    req.log.error({ err }, "AI generation failed");
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
