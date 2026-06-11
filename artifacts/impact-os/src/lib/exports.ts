import { saveAs } from "file-saver";
import type { AppState } from "@/lib/state";

export const SDG_NAMES: Record<number, string> = {
  1: "No Poverty",
  2: "Zero Hunger",
  3: "Good Health and Well-being",
  4: "Quality Education",
  5: "Gender Equality",
  6: "Clean Water and Sanitation",
  7: "Affordable and Clean Energy",
  8: "Decent Work and Economic Growth",
  9: "Industry, Innovation and Infrastructure",
  10: "Reduced Inequalities",
  11: "Sustainable Cities and Communities",
  12: "Responsible Consumption and Production",
  13: "Climate Action",
  14: "Life Below Water",
  15: "Life on Land",
  16: "Peace, Justice and Strong Institutions",
  17: "Partnerships for the Goals",
};

export const SDG_COLORS: Record<number, string> = {
  1: "E5243B",
  2: "DDA63A",
  3: "4C9F38",
  4: "C5192D",
  5: "FF3A21",
  6: "26BDE2",
  7: "FCC30B",
  8: "A21942",
  9: "FD6925",
  10: "DD1367",
  11: "FD9D24",
  12: "BF8B2E",
  13: "3F7E44",
  14: "0A97D9",
  15: "56C02B",
  16: "00689D",
  17: "19486A",
};

function reportTitle(state: AppState): string {
  const period = state.reportingPeriod ? ` ${state.reportingPeriod}` : "";
  return `${state.orgName || "Organization"} Impact Report${period}`;
}

function safeFileName(state: AppState): string {
  const base = (state.orgName || "impact-report").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return base.replace(/^-+|-+$/g, "") || "impact-report";
}

const NAVY = "0A1024";
const NAVY_CARD = "111A33";
const CARD_LINE = "1E2A4A";
const ACCENT = "3B82F6";
const ACCENT2 = "0EA5E9";
const LIGHT = "E2E8F0";
const MUTED = "94A3B8";

/* ------------------------------------------------------------------ */
/* PDF (via browser print)                                             */
/* ------------------------------------------------------------------ */

export function exportPDF(): void {
  window.print();
}

/* ------------------------------------------------------------------ */
/* PPTX                                                                */
/* ------------------------------------------------------------------ */

export async function exportPPTX(state: AppState): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
  pptx.layout = "WIDE";
  pptx.author = "ImpactLabs";
  pptx.company = state.orgName || "ImpactLabs";
  pptx.title = reportTitle(state);

  const report = state.generatedReport;

  const newSlide = (title?: string) => {
    const slide = pptx.addSlide();
    slide.background = { color: NAVY };
    if (title) {
      slide.addText(title, {
        x: 0.6,
        y: 0.4,
        w: 12.1,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: LIGHT,
        fontFace: "Arial",
      });
      slide.addShape(pptx.ShapeType.line, {
        x: 0.6,
        y: 1.25,
        w: 3,
        h: 0,
        line: { color: ACCENT, width: 3 },
      });
    }
    return slide;
  };

  const bullets = (items: string[]) =>
    items
      .filter(Boolean)
      .map((t) => ({
        text: t,
        options: { bullet: { code: "2022" }, color: LIGHT, fontSize: 13, paraSpaceAfter: 6 },
      }));

  type Slide = ReturnType<typeof newSlide>;

  const card = (slide: Slide, x: number, y: number, w: number, h: number) =>
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h,
      fill: { color: NAVY_CARD },
      line: { color: CARD_LINE, width: 1 },
      rectRadius: 0.08,
    });

  // 1. Cover
  const cover = pptx.addSlide();
  cover.background = { color: NAVY };
  if (state.logo) {
    try {
      cover.addImage({
        data: state.logo,
        x: 0.6,
        y: 0.5,
        w: 1.6,
        h: 1.6,
        sizing: { type: "contain", w: 1.6, h: 1.6 },
      });
    } catch {
      /* ignore bad logo data */
    }
  }
  cover.addText("IMPACT REPORT", {
    x: 0.6,
    y: 2.4,
    w: 12,
    h: 0.5,
    fontSize: 16,
    color: ACCENT,
    bold: true,
    charSpacing: 3,
  });
  cover.addText(state.orgName || "Organization", {
    x: 0.6,
    y: 2.95,
    w: 12,
    h: 1.1,
    fontSize: 44,
    bold: true,
    color: LIGHT,
  });
  cover.addText(state.reportingPeriod || "", {
    x: 0.6,
    y: 4.1,
    w: 12,
    h: 0.5,
    fontSize: 18,
    color: MUTED,
  });
  if (report?.heroMetric) {
    card(cover, 0.6, 4.9, 6.6, 1.9);
    cover.addText(report.heroMetric.value, {
      x: 0.8,
      y: 5.05,
      w: 6.2,
      h: 0.9,
      fontSize: 40,
      bold: true,
      color: ACCENT2,
    });
    cover.addText(report.heroMetric.label, {
      x: 0.8,
      y: 5.95,
      w: 6.2,
      h: 0.4,
      fontSize: 14,
      bold: true,
      color: LIGHT,
    });
    cover.addText(report.heroMetric.context, {
      x: 0.8,
      y: 6.3,
      w: 6.2,
      h: 0.45,
      fontSize: 11,
      color: MUTED,
    });
  } else if (state.mission) {
    cover.addText(state.mission, { x: 0.6, y: 5.0, w: 9, h: 1.2, fontSize: 14, color: MUTED, italic: true });
  }

  if (report) {
    // 2. Impact at a Glance
    {
      const s = newSlide("Impact at a Glance");
      report.glanceKpis.slice(0, 6).forEach((k, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 0.6 + col * 4.05;
        const y = 1.5 + row * 1.55;
        card(s, x, y, 3.9, 1.4);
        s.addText(k.value, { x: x + 0.2, y: y + 0.15, w: 3.5, h: 0.6, bold: true, color: ACCENT2, fontSize: 26 });
        s.addText(k.label, { x: x + 0.2, y: y + 0.78, w: 3.5, h: 0.35, color: LIGHT, fontSize: 11 });
        if (k.change) s.addText(k.change, { x: x + 0.2, y: y + 1.08, w: 3.5, h: 0.28, color: MUTED, fontSize: 10 });
      });
      if (report.achievementsTimeline.length) {
        s.addText("Key Achievements", { x: 0.6, y: 4.8, w: 12, h: 0.35, bold: true, color: ACCENT, fontSize: 13 });
        s.addText(
          bullets(
            report.achievementsTimeline
              .slice(0, 5)
              .map((t) => `${t.date} — ${t.title}: ${t.description}`),
          ),
          { x: 0.6, y: 5.2, w: 12.1, h: 1.9, valign: "top" },
        );
      }
    }

    // 3. Organization Overview
    {
      const s = newSlide("Organization Overview");
      const ov = report.overview;
      const blocks: Array<[string, string]> = [
        ["Mission", ov.mission],
        ["Vision", ov.vision],
        ["The Problem", ov.problem],
        ["Who We Serve", ov.targetBeneficiaries],
      ];
      blocks.forEach(([label, text], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 0.6 + col * 6.15;
        const y = 1.5 + row * 2.7;
        card(s, x, y, 6.0, 2.5);
        s.addText(label.toUpperCase(), { x: x + 0.2, y: y + 0.15, w: 5.6, h: 0.35, bold: true, color: ACCENT, fontSize: 12, charSpacing: 1 });
        s.addText(text, { x: x + 0.2, y: y + 0.6, w: 5.6, h: 1.8, color: LIGHT, fontSize: 12, valign: "top", lineSpacingMultiple: 1.1 });
      });
    }

    // 4. Programs & Initiatives
    report.programs.slice(0, 5).forEach((p) => {
      const s = newSlide(p.name);
      s.addText(p.objective, { x: 0.6, y: 1.45, w: 12.1, h: 0.85, color: LIGHT, fontSize: 14, valign: "top" });
      const cols: Array<[string, string[]]> = [
        ["Activities", p.activities],
        ["Outputs", p.outputs],
        ["Outcomes", p.outcomes],
      ];
      cols.forEach(([label, items], i) => {
        const x = 0.6 + i * 4.05;
        s.addText(label.toUpperCase(), { x, y: 2.45, w: 3.9, h: 0.35, bold: true, color: ACCENT, fontSize: 12 });
        card(s, x, 2.85, 3.9, 2.75);
        s.addText(bullets(items.length ? items : ["—"]), { x: x + 0.15, y: 3.0, w: 3.6, h: 2.5, valign: "top" });
      });
      s.addText(`Beneficiaries: ${p.beneficiaries}`, { x: 0.6, y: 5.8, w: 12, h: 0.4, color: MUTED, fontSize: 12 });
      if (p.metrics.length) {
        s.addText(p.metrics.map((m) => `${m.label}: ${m.value}`).join("      "), {
          x: 0.6,
          y: 6.25,
          w: 12.1,
          h: 0.5,
          color: ACCENT2,
          fontSize: 13,
          bold: true,
        });
      }
    });

    // 5. Beneficiary Impact
    {
      const bi = report.beneficiaryImpact;
      if (bi.profiles.length || bi.testimonials.length) {
        const s = newSlide("Beneficiary Impact");
        bi.profiles.slice(0, 3).forEach((p, i) => {
          const x = 0.6 + i * 4.05;
          card(s, x, 1.5, 3.9, 3.7);
          s.addText(p.name, { x: x + 0.2, y: 1.65, w: 3.5, h: 0.35, bold: true, color: LIGHT, fontSize: 15 });
          s.addText(p.group, { x: x + 0.2, y: 2.0, w: 3.5, h: 0.3, color: ACCENT, fontSize: 11 });
          s.addText(p.story, { x: x + 0.2, y: 2.35, w: 3.5, h: 1.5, color: MUTED, fontSize: 10, valign: "top", lineSpacingMultiple: 1.05 });
          s.addText(
            [
              { text: "Before: ", options: { bold: true, color: MUTED, fontSize: 10 } },
              { text: p.before, options: { color: LIGHT, fontSize: 10 } },
            ],
            { x: x + 0.2, y: 3.9, w: 3.5, h: 0.35, valign: "top" },
          );
          s.addText(
            [
              { text: "After: ", options: { bold: true, color: ACCENT2, fontSize: 10 } },
              { text: p.after, options: { color: LIGHT, fontSize: 10 } },
            ],
            { x: x + 0.2, y: 4.25, w: 3.5, h: 0.35, valign: "top" },
          );
          s.addText(`"${p.quote}"`, { x: x + 0.2, y: 4.6, w: 3.5, h: 0.5, italic: true, color: ACCENT, fontSize: 10, valign: "top" });
        });
        if (bi.testimonials.length) {
          s.addText("Testimonials", { x: 0.6, y: 5.45, w: 12, h: 0.3, bold: true, color: ACCENT, fontSize: 13 });
          s.addText(
            bullets(bi.testimonials.slice(0, 3).map((t) => `"${t.quote}" — ${t.author}, ${t.role}`)),
            { x: 0.6, y: 5.8, w: 12.1, h: 1.4, valign: "top" },
          );
        }
      }
    }

    // 6. Impact Dashboard
    {
      const dash = report.dashboard;
      const s = newSlide("Impact Dashboard");
      dash.metrics.slice(0, 4).forEach((m, i) => {
        const x = 0.6 + i * 3.05;
        card(s, x, 1.5, 2.9, 1.4);
        s.addText(`${m.value}${m.unit ? ` ${m.unit}` : ""}`, { x, y: 1.6, w: 2.9, h: 0.7, align: "center", bold: true, color: ACCENT2, fontSize: 22 });
        s.addText(m.label, { x, y: 2.3, w: 2.9, h: 0.5, align: "center", color: MUTED, fontSize: 11 });
      });
      if (dash.growthSeries.length) {
        s.addChart(
          pptx.ChartType.line,
          [
            {
              name: "Growth",
              labels: dash.growthSeries.map((p) => p.period),
              values: dash.growthSeries.map((p) => p.value),
            },
          ],
          { x: 0.6, y: 3.1, w: 6.0, h: 3.6, showLegend: false, lineDataSymbol: "circle", chartColors: [ACCENT], catAxisLabelColor: MUTED, valAxisLabelColor: MUTED },
        );
      }
      if (dash.distribution.length) {
        s.addChart(
          pptx.ChartType.bar,
          [
            {
              name: "Distribution",
              labels: dash.distribution.map((d) => d.name),
              values: dash.distribution.map((d) => d.value),
            },
          ],
          { x: 6.9, y: 3.1, w: 5.8, h: 3.6, showLegend: false, chartColors: [ACCENT2], catAxisLabelColor: MUTED, valAxisLabelColor: MUTED },
        );
      }

      // Dashboard detail: progress + geographic
      if (dash.progressBars.length || dash.geographic.length) {
        const s2 = newSlide("Impact Dashboard");
        if (dash.progressBars.length) {
          s2.addText("Progress Toward Goals", { x: 0.6, y: 1.4, w: 6, h: 0.4, bold: true, color: ACCENT, fontSize: 14 });
          dash.progressBars.slice(0, 6).forEach((b, i) => {
            const y = 2.0 + i * 0.8;
            const pct = b.target > 0 ? Math.min(1, b.current / b.target) : 0;
            s2.addText(`${b.label}  (${b.current.toLocaleString()} / ${b.target.toLocaleString()}${b.unit ? ` ${b.unit}` : ""})`, {
              x: 0.6,
              y,
              w: 5.8,
              h: 0.3,
              color: LIGHT,
              fontSize: 11,
            });
            s2.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: y + 0.32, w: 5.8, h: 0.18, fill: { color: CARD_LINE }, rectRadius: 0.05 });
            s2.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: y + 0.32, w: Math.max(0.05, 5.8 * pct), h: 0.18, fill: { color: ACCENT }, rectRadius: 0.05 });
          });
        }
        if (dash.geographic.length) {
          s2.addChart(
            pptx.ChartType.bar,
            [
              {
                name: "Reach by Region",
                labels: dash.geographic.map((g) => g.region),
                values: dash.geographic.map((g) => g.value),
              },
            ],
            { x: 6.9, y: 1.9, w: 5.8, h: 4.8, showLegend: false, barDir: "bar", chartColors: [ACCENT2], catAxisLabelColor: MUTED, valAxisLabelColor: MUTED },
          );
          s2.addText("Geographic Reach", { x: 6.9, y: 1.4, w: 6, h: 0.4, bold: true, color: ACCENT, fontSize: 14 });
        }
      }
    }

    // 7. Theory of Change
    {
      const s = newSlide("Theory of Change");
      const toc = report.theoryOfChange;
      const cols: Array<[string, string[]]> = [
        ["Inputs", toc.inputs],
        ["Activities", toc.activities],
        ["Outputs", toc.outputs],
        ["Outcomes", toc.outcomes],
        ["Long-Term Impact", toc.longTermImpact],
      ];
      const colW = 2.3;
      const gap = 0.15;
      cols.forEach(([label, items], i) => {
        const x = 0.6 + i * (colW + gap);
        s.addText(label.toUpperCase(), { x, y: 1.6, w: colW, h: 0.5, fontSize: 10, bold: true, color: ACCENT, charSpacing: 1, align: "center" });
        card(s, x, 2.1, colW, 4.6);
        s.addText(bullets(items.length ? items : ["—"]), { x: x + 0.12, y: 2.25, w: colW - 0.24, h: 4.3, valign: "top" });
      });
    }

    // 8. Measurement Framework
    {
      const s = newSlide("Measurement Framework");
      const header = ["Metric", "Baseline", "Target", "Current", "Data Source", "Frequency"];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = [
        header.map((t) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: ACCENT } } })),
      ];
      report.measurementFramework.forEach((m) => {
        rows.push(
          [m.metric, m.baseline, m.target, m.current, m.dataSource, m.frequency].map((v) => ({
            text: v || "—",
            options: { color: LIGHT, fontSize: 11 },
          })),
        );
      });
      if (rows.length === 1) rows.push([{ text: "No metrics defined", options: { color: MUTED, colspan: 6 } }]);
      s.addTable(rows, {
        x: 0.6,
        y: 1.6,
        w: 12.1,
        fontSize: 11,
        border: { type: "solid", color: CARD_LINE, pt: 1 },
        fill: { color: NAVY_CARD },
        colW: [2.6, 1.7, 1.7, 1.7, 2.7, 1.7],
      });
    }

    // 9. Challenges & Learnings
    {
      const cl = report.challengesLearnings;
      const s = newSlide("Challenges & Learnings");
      cl.challenges.slice(0, 4).forEach((c, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 0.6 + col * 6.15;
        const y = 1.5 + row * 2.0;
        card(s, x, y, 6.0, 1.8);
        s.addText(c.challenge, { x: x + 0.2, y: y + 0.12, w: 5.6, h: 0.5, bold: true, color: LIGHT, fontSize: 12, valign: "top" });
        s.addText(
          [
            { text: "Lesson: ", options: { bold: true, color: ACCENT, fontSize: 10 } },
            { text: c.lesson, options: { color: MUTED, fontSize: 10 } },
          ],
          { x: x + 0.2, y: y + 0.7, w: 5.6, h: 0.5, valign: "top" },
        );
        s.addText(
          [
            { text: "Adaptation: ", options: { bold: true, color: ACCENT2, fontSize: 10 } },
            { text: c.adaptation, options: { color: MUTED, fontSize: 10 } },
          ],
          { x: x + 0.2, y: y + 1.2, w: 5.6, h: 0.5, valign: "top" },
        );
      });
      if (cl.futureImprovements.length) {
        s.addText("Future Improvements", { x: 0.6, y: 5.7, w: 12, h: 0.3, bold: true, color: ACCENT, fontSize: 12 });
        s.addText(bullets(cl.futureImprovements), { x: 0.6, y: 6.05, w: 12.1, h: 1.1, valign: "top" });
      }
    }

    // 10. Future Commitments
    {
      const fc = report.futureCommitments;
      const s = newSlide("Future Commitments");
      s.addText("Next Year Goals", { x: 0.6, y: 1.5, w: 5.7, h: 0.35, bold: true, color: ACCENT, fontSize: 14 });
      s.addText(bullets(fc.nextYearGoals), { x: 0.6, y: 1.9, w: 5.7, h: 2.4, valign: "top" });
      s.addText("Expansion Plans", { x: 0.6, y: 4.4, w: 5.7, h: 0.35, bold: true, color: ACCENT, fontSize: 14 });
      s.addText(bullets(fc.expansionPlans), { x: 0.6, y: 4.8, w: 5.7, h: 1.7, valign: "top" });
      s.addText("Roadmap", { x: 6.9, y: 1.5, w: 5.8, h: 0.35, bold: true, color: ACCENT, fontSize: 14 });
      s.addText(bullets(fc.roadmap.map((r) => `${r.period}: ${r.goal}`)), { x: 6.9, y: 1.9, w: 5.8, h: 2.9, valign: "top" });
      s.addText("Long-Term Vision", { x: 6.9, y: 4.9, w: 5.8, h: 0.35, bold: true, color: ACCENT, fontSize: 14 });
      s.addText(fc.longTermVision, { x: 6.9, y: 5.3, w: 5.8, h: 1.5, color: LIGHT, fontSize: 12, valign: "top", lineSpacingMultiple: 1.1 });
    }

    // 11. Appendix
    {
      const ap = report.appendix;
      const s = newSlide("Appendix");
      s.addText("Methodology", { x: 0.6, y: 1.5, w: 12, h: 0.35, bold: true, color: ACCENT, fontSize: 14 });
      s.addText(ap.methodology, { x: 0.6, y: 1.9, w: 12.1, h: 1.6, color: LIGHT, fontSize: 12, valign: "top", lineSpacingMultiple: 1.15 });
      s.addText("Data Sources", { x: 0.6, y: 3.6, w: 6, h: 0.35, bold: true, color: ACCENT, fontSize: 14 });
      s.addText(bullets(ap.dataSources), { x: 0.6, y: 4.0, w: 6, h: 2.4, valign: "top" });
      s.addText("Organization Profile", { x: 6.9, y: 3.6, w: 6, h: 0.35, bold: true, color: ACCENT, fontSize: 14 });
      const profile = (
        [
          ["Type", state.orgType],
          ["Industry", state.industry],
          ["Country", state.country],
          ["Website", state.website],
          ["Reporting Period", state.reportingPeriod],
        ] as Array<[string, string]>
      )
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`);
      s.addText(bullets(profile), { x: 6.9, y: 4.0, w: 6, h: 1.8, valign: "top" });
      if (ap.reportingNotes) {
        s.addText(ap.reportingNotes, { x: 6.9, y: 5.9, w: 6, h: 0.9, color: MUTED, fontSize: 10, italic: true, valign: "top" });
      }
    }
  }

  await pptx.writeFile({ fileName: `${safeFileName(state)}.pptx` });
}

/* ------------------------------------------------------------------ */
/* DOCX                                                                */
/* ------------------------------------------------------------------ */

export async function exportDOCX(state: AppState): Promise<void> {
  const docx = await import("docx");
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

  const report = state.generatedReport;
  const children: Array<InstanceType<typeof Paragraph> | InstanceType<typeof Table>> = [];

  const para = (
    text: string,
    opts: { bold?: boolean; size?: number; color?: string; spacingAfter?: number; italics?: boolean } = {},
  ) =>
    new Paragraph({
      spacing: { after: opts.spacingAfter ?? 120 },
      children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? 22, color: opts.color, italics: opts.italics })],
    });

  const heading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
      children: [new TextRun({ text, color: "1E3A8A", bold: true })],
    });

  const subheading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 160, after: 80 },
      children: [new TextRun({ text, color: "2563EB", bold: true })],
    });

  const bulletList = (items: string[]) =>
    items.filter(Boolean).map((t) => new Paragraph({ text: t, bullet: { level: 0 }, spacing: { after: 60 } }));

  const tableBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
  };

  const makeTable = (header: string[], body: string[][]) => {
    const headerCells = header.map(
      (t) =>
        new TableCell({
          shading: { fill: "2563EB" },
          children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF" })] })],
        }),
    );
    const bodyRows = body.map(
      (cells) =>
        new TableRow({ children: cells.map((v) => new TableCell({ children: [new Paragraph(v || "—")] })) }),
    );
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: headerCells }), ...bodyRows],
      borders: tableBorders,
    });
  };

  // Cover
  children.push(
    new Paragraph({ spacing: { before: 1000, after: 120 }, children: [new TextRun({ text: "IMPACT REPORT", bold: true, color: "2563EB", size: 28 })] }),
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: state.orgName || "Organization", bold: true, size: 56 })] }),
    para(state.reportingPeriod || "", { size: 28, color: "64748B" }),
  );
  if (report?.heroMetric) {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 40 },
        children: [new TextRun({ text: report.heroMetric.value, bold: true, color: "0EA5E9", size: 60 })],
      }),
      para(report.heroMetric.label, { bold: true, size: 26 }),
      para(report.heroMetric.context, { color: "64748B", italics: true, spacingAfter: 240 }),
    );
  } else if (state.mission) {
    children.push(para(state.mission, { italics: true, color: "64748B", spacingAfter: 240 }));
  }

  if (report) {
    // 1. Impact at a Glance
    children.push(heading("1. Impact at a Glance"));
    if (report.glanceKpis.length) {
      children.push(
        makeTable(
          ["Metric", "Value", "Change"],
          report.glanceKpis.map((k) => [k.label, k.value, k.change]),
        ),
      );
    }
    if (report.achievementsTimeline.length) {
      children.push(subheading("Key Achievements"));
      report.achievementsTimeline.forEach((t) =>
        children.push(para(`${t.date} — ${t.title}`, { bold: true, spacingAfter: 40 }), para(t.description, { color: "475569" })),
      );
    }

    // 2. Organization Overview
    children.push(heading("2. Organization Overview"));
    children.push(subheading("Mission"), para(report.overview.mission));
    children.push(subheading("Vision"), para(report.overview.vision));
    children.push(subheading("The Problem"), para(report.overview.problem));
    children.push(subheading("Who We Serve"), para(report.overview.targetBeneficiaries));

    // 3. Programs & Initiatives
    children.push(heading("3. Programs & Initiatives"));
    report.programs.forEach((p) => {
      children.push(subheading(p.name), para(p.objective, { italics: true }));
      if (p.activities.length) children.push(para("Activities", { bold: true, spacingAfter: 40 }), ...bulletList(p.activities));
      if (p.outputs.length) children.push(para("Outputs", { bold: true, spacingAfter: 40 }), ...bulletList(p.outputs));
      if (p.outcomes.length) children.push(para("Outcomes", { bold: true, spacingAfter: 40 }), ...bulletList(p.outcomes));
      if (p.beneficiaries) children.push(para(`Beneficiaries: ${p.beneficiaries}`));
      if (p.metrics.length) children.push(para(p.metrics.map((m) => `${m.label}: ${m.value}`).join("   |   "), { bold: true, color: "0EA5E9" }));
    });

    // 4. Beneficiary Impact
    children.push(heading("4. Beneficiary Impact"));
    report.beneficiaryImpact.profiles.forEach((p) => {
      children.push(subheading(`${p.name} — ${p.group}`));
      children.push(para(p.story));
      children.push(para(`Before: ${p.before}`, { color: "475569" }), para(`After: ${p.after}`, { color: "0EA5E9", bold: true }));
      children.push(para(`"${p.quote}"`, { italics: true }));
    });
    if (report.beneficiaryImpact.testimonials.length) {
      children.push(subheading("Testimonials"));
      report.beneficiaryImpact.testimonials.forEach((t) =>
        children.push(para(`"${t.quote}"`, { italics: true, spacingAfter: 40 }), para(`— ${t.author}, ${t.role}`, { color: "475569" })),
      );
    }

    // 5. Impact Dashboard
    children.push(heading("5. Impact Dashboard"));
    if (report.dashboard.metrics.length) {
      children.push(
        makeTable(
          ["Metric", "Value", "Unit", "Change"],
          report.dashboard.metrics.map((m) => [m.label, m.value, m.unit, m.change]),
        ),
      );
    }
    if (report.dashboard.progressBars.length) {
      children.push(subheading("Progress Toward Goals"));
      children.push(
        ...bulletList(
          report.dashboard.progressBars.map((b) => {
            const pct = b.target > 0 ? Math.round((b.current / b.target) * 100) : 0;
            return `${b.label}: ${b.current.toLocaleString()} / ${b.target.toLocaleString()}${b.unit ? ` ${b.unit}` : ""} (${pct}%)`;
          }),
        ),
      );
    }
    if (report.dashboard.geographic.length) {
      children.push(subheading("Geographic Reach"));
      children.push(...bulletList(report.dashboard.geographic.map((g) => `${g.region}: ${g.value.toLocaleString()}`)));
    }

    // 6. Theory of Change
    children.push(heading("6. Theory of Change"));
    (
      [
        ["Inputs", report.theoryOfChange.inputs],
        ["Activities", report.theoryOfChange.activities],
        ["Outputs", report.theoryOfChange.outputs],
        ["Outcomes", report.theoryOfChange.outcomes],
        ["Long-Term Impact", report.theoryOfChange.longTermImpact],
      ] as Array<[string, string[]]>
    ).forEach(([label, items]) => {
      if (items.filter(Boolean).length) children.push(subheading(label), ...bulletList(items));
    });

    // 7. Measurement Framework
    children.push(heading("7. Measurement Framework"));
    if (report.measurementFramework.length) {
      children.push(
        makeTable(
          ["Metric", "Baseline", "Target", "Current", "Data Source", "Frequency"],
          report.measurementFramework.map((m) => [m.metric, m.baseline, m.target, m.current, m.dataSource, m.frequency]),
        ),
      );
    }

    // 8. Challenges & Learnings
    children.push(heading("8. Challenges & Learnings"));
    report.challengesLearnings.challenges.forEach((c) => {
      children.push(subheading(c.challenge));
      children.push(para(`Lesson: ${c.lesson}`), para(`Adaptation: ${c.adaptation}`, { color: "0EA5E9" }));
    });
    if (report.challengesLearnings.risks.length) children.push(subheading("Risks"), ...bulletList(report.challengesLearnings.risks));
    if (report.challengesLearnings.futureImprovements.length)
      children.push(subheading("Future Improvements"), ...bulletList(report.challengesLearnings.futureImprovements));

    // 9. Future Commitments
    children.push(heading("9. Future Commitments"));
    children.push(subheading("Next Year Goals"), ...bulletList(report.futureCommitments.nextYearGoals));
    if (report.futureCommitments.roadmap.length) {
      children.push(subheading("Roadmap"), ...bulletList(report.futureCommitments.roadmap.map((r) => `${r.period}: ${r.goal}`)));
    }
    children.push(subheading("Expansion Plans"), ...bulletList(report.futureCommitments.expansionPlans));
    children.push(subheading("Long-Term Vision"), para(report.futureCommitments.longTermVision));

    // 10. Appendix
    children.push(heading("10. Appendix"));
    children.push(subheading("Methodology"), para(report.appendix.methodology));
    if (report.appendix.dataSources.length) children.push(subheading("Data Sources"), ...bulletList(report.appendix.dataSources));
    children.push(subheading("Organization Profile"));
    (
      [
        ["Type", state.orgType],
        ["Industry", state.industry],
        ["Country", state.country],
        ["Website", state.website],
        ["Reporting Period", state.reportingPeriod],
      ] as Array<[string, string]>
    ).forEach(([k, v]) => {
      if (v) children.push(para(`${k}: ${v}`));
    });
    if (report.appendix.reportingNotes) children.push(para(report.appendix.reportingNotes, { italics: true, color: "64748B" }));
  }

  const doc = new Document({
    creator: "ImpactLabs",
    title: reportTitle(state),
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${safeFileName(state)}.docx`);
}
