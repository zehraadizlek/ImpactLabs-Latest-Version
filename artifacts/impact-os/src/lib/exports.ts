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
  return `${state.orgName || "Organization"} Social Impact Report${period}`;
}

function safeFileName(state: AppState): string {
  const base = (state.orgName || "impact-report").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return base.replace(/^-+|-+$/g, "") || "impact-report";
}

const NAVY = "0A1024";
const NAVY_CARD = "111A33";
const ACCENT = "3B82F6";
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
      .map((t) => ({ text: t, options: { bullet: { code: "2022" }, color: LIGHT, fontSize: 14, paraSpaceAfter: 8 } }));

  // 1. Cover
  const cover = pptx.addSlide();
  cover.background = { color: NAVY };
  if (state.logo) {
    try {
      cover.addImage({ data: state.logo, x: 0.6, y: 0.5, w: 1.6, h: 1.6, sizing: { type: "contain", w: 1.6, h: 1.6 } });
    } catch {
      /* ignore bad logo data */
    }
  }
  cover.addText("SOCIAL IMPACT REPORT", { x: 0.6, y: 2.6, w: 12, h: 0.5, fontSize: 16, color: ACCENT, bold: true, charSpacing: 3 });
  cover.addText(state.orgName || "Organization", { x: 0.6, y: 3.2, w: 12, h: 1.2, fontSize: 44, bold: true, color: LIGHT });
  cover.addText(state.reportingPeriod || "", { x: 0.6, y: 4.5, w: 12, h: 0.5, fontSize: 18, color: MUTED });
  if (state.mission) {
    cover.addText(state.mission, { x: 0.6, y: 5.4, w: 9, h: 1.2, fontSize: 14, color: MUTED, italic: true });
  }

  // 2. Executive Summary
  if (report?.executiveSummary) {
    const s = newSlide("Executive Summary");
    s.addText(report.executiveSummary, { x: 0.6, y: 1.6, w: 12.1, h: 5.4, fontSize: 14, color: LIGHT, valign: "top", lineSpacingMultiple: 1.2 });
  }

  // 3. SDG Alignment
  if (state.selectedSdgs.length) {
    const s = newSlide("SDG Alignment");
    state.selectedSdgs.slice(0, 5).forEach((sdg, i) => {
      const y = 1.6 + i * 1.05;
      s.addShape(pptx.ShapeType.rect, { x: 0.6, y, w: 0.7, h: 0.7, fill: { color: SDG_COLORS[sdg] || ACCENT } });
      s.addText(String(sdg), { x: 0.6, y, w: 0.7, h: 0.7, align: "center", valign: "middle", bold: true, color: "FFFFFF", fontSize: 18 });
      s.addText(SDG_NAMES[sdg] || `SDG ${sdg}`, { x: 1.5, y, w: 4, h: 0.7, valign: "middle", bold: true, color: LIGHT, fontSize: 14 });
      const align = report?.sdgAlignment?.find((a) => a.sdg === sdg);
      if (align) {
        s.addText(align.expectedContribution, { x: 5.7, y, w: 7, h: 0.95, valign: "middle", color: MUTED, fontSize: 11 });
      }
    });
  }

  // 4. Stakeholder Analysis
  if (report?.stakeholderAnalysis || state.primaryBeneficiary.name) {
    const s = newSlide("Stakeholder Analysis");
    let y = 1.6;
    if (state.primaryBeneficiary.name) {
      s.addText([
        { text: "Primary Beneficiary: ", options: { bold: true, color: ACCENT } },
        { text: state.primaryBeneficiary.name, options: { color: LIGHT } },
      ], { x: 0.6, y, w: 12, h: 0.5, fontSize: 14 });
      y += 0.6;
    }
    if (report?.stakeholderAnalysis) {
      s.addText(report.stakeholderAnalysis, { x: 0.6, y, w: 12.1, h: 7 - y - 0.4, fontSize: 13, color: LIGHT, valign: "top", lineSpacingMultiple: 1.2 });
    }
  }

  // 5. Theory of Change
  {
    const s = newSlide("Theory of Change");
    const cols: Array<[string, string[]]> = [
      ["Activities", state.activities],
      ["Outputs", state.outputs],
      ["Outcomes", state.outcomes],
      ["Impact", state.impact],
    ];
    cols.forEach(([label, items], i) => {
      const x = 0.6 + i * 3.05;
      s.addText(label.toUpperCase(), { x, y: 1.6, w: 2.9, h: 0.4, fontSize: 12, bold: true, color: ACCENT, charSpacing: 1 });
      s.addShape(pptx.ShapeType.roundRect, { x, y: 2.05, w: 2.9, h: 4.8, fill: { color: NAVY_CARD }, line: { color: "1E2A4A", width: 1 }, rectRadius: 0.08 });
      s.addText(bullets(items.length ? items : ["—"]), { x: x + 0.15, y: 2.2, w: 2.6, h: 4.5, valign: "top" });
    });
  }

  // 6. Impact Strategy
  if (report?.impactStrategy) {
    const s = newSlide("Impact Strategy");
    s.addText([
      { text: "Long-term Vision\n", options: { bold: true, color: ACCENT, fontSize: 15 } },
      { text: report.impactStrategy.longTermVision, options: { color: LIGHT, fontSize: 13 } },
    ], { x: 0.6, y: 1.6, w: 12.1, h: 1.5, valign: "top" });
    s.addText("Strategic Objectives", { x: 0.6, y: 3.2, w: 6, h: 0.4, bold: true, color: ACCENT, fontSize: 14 });
    s.addText(bullets(report.impactStrategy.strategicObjectives), { x: 0.6, y: 3.6, w: 6, h: 3.2, valign: "top" });
    s.addText("Key Initiatives", { x: 6.9, y: 3.2, w: 6, h: 0.4, bold: true, color: ACCENT, fontSize: 14 });
    s.addText(bullets(report.impactStrategy.keyInitiatives), { x: 6.9, y: 3.6, w: 6, h: 3.2, valign: "top" });
  }

  // 7. Measurement Framework (KPI table)
  {
    const s = newSlide("Measurement Framework");
    const rows: any[] = [
      [
        { text: "Indicator", options: { bold: true, color: "FFFFFF", fill: { color: ACCENT } } },
        { text: "Baseline", options: { bold: true, color: "FFFFFF", fill: { color: ACCENT } } },
        { text: "Target", options: { bold: true, color: "FFFFFF", fill: { color: ACCENT } } },
        { text: "Frequency", options: { bold: true, color: "FFFFFF", fill: { color: ACCENT } } },
      ],
    ];
    Object.values(state.measurements).forEach((m) => {
      if (!m.indicator && !m.target) return;
      rows.push([
        { text: m.indicator || "—", options: { color: LIGHT } },
        { text: m.baseline || "—", options: { color: LIGHT } },
        { text: m.target || "—", options: { color: LIGHT } },
        { text: m.frequency || "—", options: { color: LIGHT } },
      ]);
    });
    if (rows.length === 1) rows.push([{ text: "No KPIs defined", options: { color: MUTED, colspan: 4 } }]);
    s.addTable(rows, { x: 0.6, y: 1.6, w: 12.1, fontSize: 12, border: { type: "solid", color: "1E2A4A", pt: 1 }, fill: { color: NAVY_CARD } });
  }

  // 8. Progress Dashboard
  if (report?.progressMetrics) {
    const s = newSlide("Progress Dashboard");
    const m = report.progressMetrics;
    const stats: Array<[string, number]> = [
      ["Beneficiaries Reached", m.beneficiariesReached],
      ["Partnerships Formed", m.partnershipsFormed],
      ["Projects Launched", m.projectsLaunched],
    ];
    stats.forEach(([label, val], i) => {
      const x = 0.6 + i * 4.05;
      s.addShape(pptx.ShapeType.roundRect, { x, y: 1.6, w: 3.9, h: 1.6, fill: { color: NAVY_CARD }, line: { color: "1E2A4A", width: 1 }, rectRadius: 0.08 });
      s.addText(val.toLocaleString(), { x, y: 1.7, w: 3.9, h: 0.9, align: "center", bold: true, color: ACCENT, fontSize: 30 });
      s.addText(label, { x, y: 2.6, w: 3.9, h: 0.5, align: "center", color: MUTED, fontSize: 12 });
    });
    if (m.impactGrowth?.length) {
      s.addChart(pptx.ChartType.line, [
        {
          name: "Impact Growth",
          labels: m.impactGrowth.map((p) => p.period),
          values: m.impactGrowth.map((p) => p.value),
        },
      ], { x: 0.6, y: 3.5, w: 12.1, h: 3.3, showLegend: false, lineDataSymbol: "circle", chartColors: [ACCENT], catAxisLabelColor: MUTED, valAxisLabelColor: MUTED });
    }
  }

  // 9. Risks & Assumptions
  if (report?.risks) {
    const s = newSlide("Risks & Assumptions");
    s.addText("Key Risks", { x: 0.6, y: 1.6, w: 4, h: 0.4, bold: true, color: ACCENT, fontSize: 14 });
    s.addText(bullets(report.risks.keyRisks), { x: 0.6, y: 2.0, w: 4, h: 4.8, valign: "top" });
    s.addText("Dependencies", { x: 4.7, y: 1.6, w: 4, h: 0.4, bold: true, color: ACCENT, fontSize: 14 });
    s.addText(bullets(report.risks.dependencies), { x: 4.7, y: 2.0, w: 4, h: 4.8, valign: "top" });
    s.addText("Mitigation", { x: 8.8, y: 1.6, w: 4, h: 0.4, bold: true, color: ACCENT, fontSize: 14 });
    s.addText(bullets(report.risks.mitigation), { x: 8.8, y: 2.0, w: 4, h: 4.8, valign: "top" });
  }

  // 10. Future Commitments
  if (report?.futureCommitments) {
    const s = newSlide("Future Commitments");
    s.addText("Next Year Goals", { x: 0.6, y: 1.6, w: 4, h: 0.4, bold: true, color: ACCENT, fontSize: 14 });
    s.addText(bullets(report.futureCommitments.nextYearGoals), { x: 0.6, y: 2.0, w: 4, h: 4.8, valign: "top" });
    s.addText("Expansion Plans", { x: 4.7, y: 1.6, w: 4, h: 0.4, bold: true, color: ACCENT, fontSize: 14 });
    s.addText(bullets(report.futureCommitments.expansionPlans), { x: 4.7, y: 2.0, w: 4, h: 4.8, valign: "top" });
    s.addText("SDG Roadmap", { x: 8.8, y: 1.6, w: 4, h: 0.4, bold: true, color: ACCENT, fontSize: 14 });
    s.addText(bullets(report.futureCommitments.sdgRoadmap), { x: 8.8, y: 2.0, w: 4, h: 4.8, valign: "top" });
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

  const para = (text: string, opts: { bold?: boolean; size?: number; color?: string; spacingAfter?: number; italics?: boolean } = {}) =>
    new Paragraph({
      spacing: { after: opts.spacingAfter ?? 120 },
      children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? 22, color: opts.color, italics: opts.italics })],
    });

  const heading = (text: string) =>
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 }, children: [new TextRun({ text, color: "1E3A8A", bold: true })] });

  const subheading = (text: string) =>
    new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 160, after: 80 }, children: [new TextRun({ text, color: "2563EB", bold: true })] });

  const bulletList = (items: string[]) =>
    items.filter(Boolean).map((t) => new Paragraph({ text: t, bullet: { level: 0 }, spacing: { after: 60 } }));

  const paragraphs = (text: string) =>
    text.split(/\n\s*\n/).map((p) => para(p.trim(), { spacingAfter: 160 }));

  // Cover
  children.push(
    new Paragraph({ spacing: { before: 1200, after: 120 }, children: [new TextRun({ text: "SOCIAL IMPACT REPORT", bold: true, color: "2563EB", size: 28 })] }),
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: state.orgName || "Organization", bold: true, size: 56 })] }),
    para(state.reportingPeriod || "", { size: 28, color: "64748B" }),
  );
  if (state.mission) children.push(para(state.mission, { italics: true, color: "64748B", spacingAfter: 240 }));

  // Executive Summary
  if (report?.executiveSummary) {
    children.push(heading("1. Executive Summary"), ...paragraphs(report.executiveSummary));
  }

  // SDG Alignment
  if (state.selectedSdgs.length) {
    children.push(heading("2. SDG Alignment"));
    state.selectedSdgs.forEach((sdg) => {
      children.push(subheading(`SDG ${sdg}: ${SDG_NAMES[sdg] || ""}`));
      const a = report?.sdgAlignment?.find((x) => x.sdg === sdg);
      if (a) {
        children.push(para(a.whyItMatters), para(`Expected contribution: ${a.expectedContribution}`, { italics: true }));
      } else if (state.sdgChanges[sdg]) {
        children.push(para(state.sdgChanges[sdg]));
      }
    });
  }

  // Stakeholder Analysis
  children.push(heading("3. Stakeholder Analysis"));
  if (state.primaryBeneficiary.name) children.push(para(`Primary beneficiary: ${state.primaryBeneficiary.name}`, { bold: true }));
  if (report?.stakeholderAnalysis) children.push(...paragraphs(report.stakeholderAnalysis));

  // Theory of Change
  children.push(heading("4. Theory of Change"));
  if (report?.theoryOfChangeNarrative) children.push(...paragraphs(report.theoryOfChangeNarrative));
  ([
    ["Activities", state.activities],
    ["Outputs", state.outputs],
    ["Outcomes", state.outcomes],
    ["Impact", state.impact],
  ] as Array<[string, string[]]>).forEach(([label, items]) => {
    if (items.filter(Boolean).length) {
      children.push(subheading(label), ...bulletList(items));
    }
  });

  // Impact Strategy
  if (report?.impactStrategy) {
    children.push(heading("5. Impact Strategy"));
    children.push(subheading("Long-term Vision"), para(report.impactStrategy.longTermVision));
    children.push(subheading("Strategic Objectives"), ...bulletList(report.impactStrategy.strategicObjectives));
    children.push(subheading("Key Initiatives"), ...bulletList(report.impactStrategy.keyInitiatives));
  }

  // Measurement Framework table
  children.push(heading("6. Measurement Framework"));
  if (report?.measurementFramework) children.push(...paragraphs(report.measurementFramework));
  const measRows = Object.values(state.measurements).filter((m) => m.indicator || m.target);
  if (measRows.length) {
    const headerCells = ["Indicator", "Baseline", "Target", "Frequency"].map(
      (t) =>
        new TableCell({
          shading: { fill: "2563EB" },
          children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF" })] })],
        }),
    );
    const bodyRows = measRows.map(
      (m) =>
        new TableRow({
          children: [m.indicator || "—", m.baseline || "—", m.target || "—", m.frequency || "—"].map(
            (v) => new TableCell({ children: [new Paragraph(v)] }),
          ),
        }),
    );
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: headerCells }), ...bodyRows],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
        },
      }),
    );
  }

  // Progress Dashboard
  if (report?.progressMetrics) {
    const m = report.progressMetrics;
    children.push(heading("7. Progress Dashboard"));
    children.push(
      para(`Beneficiaries reached: ${m.beneficiariesReached.toLocaleString()}`, { bold: true }),
      para(`Partnerships formed: ${m.partnershipsFormed.toLocaleString()}`, { bold: true }),
      para(`Projects launched: ${m.projectsLaunched.toLocaleString()}`, { bold: true }),
    );
    if (m.impactGrowth?.length) {
      children.push(subheading("Impact Growth"), ...bulletList(m.impactGrowth.map((p) => `${p.period}: ${p.value}`)));
    }
  }

  // Risks
  if (report?.risks) {
    children.push(heading("8. Risks & Assumptions"));
    children.push(subheading("Key Risks"), ...bulletList(report.risks.keyRisks));
    children.push(subheading("Dependencies"), ...bulletList(report.risks.dependencies));
    children.push(subheading("Mitigation"), ...bulletList(report.risks.mitigation));
  }

  // Future Commitments
  if (report?.futureCommitments) {
    children.push(heading("9. Future Commitments"));
    children.push(subheading("Next Year Goals"), ...bulletList(report.futureCommitments.nextYearGoals));
    children.push(subheading("Expansion Plans"), ...bulletList(report.futureCommitments.expansionPlans));
    children.push(subheading("SDG Roadmap"), ...bulletList(report.futureCommitments.sdgRoadmap));
  }

  // Appendix
  children.push(heading("10. Appendix"));
  children.push(subheading("Organization Profile"));
  ([
    ["Type", state.orgType],
    ["Industry", state.industry],
    ["Country", state.country],
    ["Website", state.website],
    ["Reporting Period", state.reportingPeriod],
  ] as Array<[string, string]>).forEach(([k, v]) => {
    if (v) children.push(para(`${k}: ${v}`));
  });

  const doc = new Document({
    creator: "ImpactLabs",
    title: reportTitle(state),
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${safeFileName(state)}.docx`);
}
