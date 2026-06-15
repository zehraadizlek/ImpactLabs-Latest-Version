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
const EXPORT_BG = "#0a1024";

/* ------------------------------------------------------------------ */
/* Shared: fixed offscreen export render + canvas slicing             */
/* ------------------------------------------------------------------ */
/*
 * Visual exports (PDF/PPTX) never capture the live, responsive layout.
 * Instead we clone the rendered report into a hidden, fixed-width,
 * `.export-mode` container (animations / transitions / transforms /
 * sticky positioning neutralized), rasterize it once with html2canvas,
 * then slice that single canvas into exact, card-aware pages. This keeps
 * text, charts and cards in their exact positions with no shifting,
 * cropping or stretching.
 */

interface Block {
  top: number;
  bottom: number;
}

interface CaptureResult {
  canvas: HTMLCanvasElement;
  widthCss: number;
  heightCss: number;
  /** Height clamped to the bottom-most content block (drops trailing whitespace). */
  contentHeightCss: number;
  /** Bottom of the deepest real content (pre-pad); pages starting below it are blank. */
  contentBottom: number;
  scale: number;
  blocks: Block[];
}

async function captureReport(): Promise<CaptureResult> {
  const live = document.querySelector<HTMLElement>("[data-report-root]");
  if (!live) {
    throw new Error("Report content is not available to export.");
  }

  const widthCss = Math.round(live.getBoundingClientRect().width) || live.offsetWidth || 1024;

  // Hidden, fixed-dimension, export-only container — not the live responsive DOM.
  const holder = document.createElement("div");
  holder.className = "export-mode dark";
  holder.style.cssText = [
    "position:fixed",
    "left:-100000px",
    "top:0",
    `width:${widthCss}px`,
    `background:${EXPORT_BG}`,
    "margin:0",
    "padding:0",
    "z-index:-1",
    "pointer-events:none",
  ].join(";");

  const clone = live.cloneNode(true) as HTMLElement;
  clone.style.margin = "0";
  clone.style.marginTop = "0";
  clone.style.maxWidth = "none";
  clone.style.width = `${widthCss}px`;
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    // Let fonts and layout settle so charts/text are fully painted before capture.
    const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
    if (fonts?.ready) {
      await fonts.ready;
    }
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );

    const heightCss = Math.ceil(clone.scrollHeight);

    // Treat leaf cards / tables as unbreakable units so page cuts never split them.
    const cloneTop = clone.getBoundingClientRect().top;
    const blocks: Block[] = Array.from(clone.querySelectorAll<HTMLElement>(".glass-card, table"))
      .filter((el) => !el.querySelector(".glass-card"))
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { top: r.top - cloneTop, bottom: r.bottom - cloneTop };
      })
      .sort((a, b) => a.top - b.top);

    // Clamp the paginated height to the deepest real content: the lowest unbreakable
    // block (leaf cards/tables, which bound the charts) or the lowest text leaf. Charts
    // live inside blocks, so block bottoms cover them; restricting the per-element scan
    // to text leaves ends the last page right after the final words (e.g. the Appendix
    // reporting notes) instead of at a section card's trailing glass padding, which would
    // otherwise spill a near-blank final page. Using leaf cards alone would crop the
    // notes; using full section boxes would re-introduce the blank page via their padding.
    let contentBottom = blocks.length ? Math.max(...blocks.map((b) => b.bottom)) : 0;
    clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
      if (el.children.length > 0) return; // leaves only
      if ((el.textContent ?? "").trim().length === 0) return; // text leaves only
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      contentBottom = Math.max(contentBottom, r.bottom - cloneTop);
    });
    if (contentBottom <= 0) contentBottom = heightCss;
    const contentHeightCss = Math.min(heightCss, Math.ceil(contentBottom) + 12);

    // Keep the canvas within browser size limits even for very long reports: scale up
    // to 2x for crispness, but allow scaling below 1 so tall reports stay under the
    // browser's max canvas height instead of producing a blank/failed capture.
    const scale = Math.max(0.5, Math.min(2, 16000 / Math.max(heightCss, 1)));

    const html2canvas = (await import("html2canvas-pro")).default;
    const canvas = await html2canvas(clone, {
      scale,
      backgroundColor: EXPORT_BG,
      useCORS: true,
      logging: false,
      width: widthCss,
      height: heightCss,
      windowWidth: Math.max(widthCss, window.innerWidth),
      windowHeight: window.innerHeight,
    });

    return { canvas, widthCss, heightCss, contentHeightCss, contentBottom, scale, blocks };
  } finally {
    document.body.removeChild(holder);
  }
}

/** Split [0, heightCss] into page ranges of <= pageHeightCss, snapping cuts to card edges. */
function paginate(heightCss: number, pageHeightCss: number, blocks: Block[]): Array<[number, number]> {
  const pages: Array<[number, number]> = [];
  const EPS = 2;
  let top = 0;
  let guard = 0;
  while (top < heightCss - EPS && guard < 4000) {
    guard++;
    let cut = Math.min(top + pageHeightCss, heightCss);
    if (cut < heightCss - EPS) {
      const straddler = blocks
        .filter((b) => b.top < cut - EPS && b.bottom > cut + EPS)
        .sort((a, b) => a.top - b.top)[0];
      // Push the block to the next page, but only if it fits a page on its own
      // and we still make forward progress (otherwise allow an oversized split).
      if (straddler && straddler.top > top + EPS && straddler.bottom - straddler.top <= pageHeightCss) {
        cut = straddler.top;
      }
    }
    if (cut <= top + EPS) {
      cut = Math.min(top + pageHeightCss, heightCss);
    }
    pages.push([top, cut]);
    top = cut;
  }
  if (!pages.length) pages.push([0, heightCss]);
  return pages;
}

function sliceToDataURL(
  source: HTMLCanvasElement,
  topCss: number,
  bottomCss: number,
  scale: number,
): string {
  const sy = Math.max(0, Math.round(topCss * scale));
  const sh = Math.max(1, Math.round((bottomCss - topCss) * scale));
  const tmp = document.createElement("canvas");
  tmp.width = source.width;
  tmp.height = sh;
  const ctx = tmp.getContext("2d");
  if (ctx) {
    ctx.fillStyle = EXPORT_BG;
    ctx.fillRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(source, 0, sy, source.width, sh, 0, 0, source.width, sh);
  }
  return tmp.toDataURL("image/jpeg", 0.95);
}

/* ------------------------------------------------------------------ */
/* PDF (A4, fixed export layout)                                      */
/* ------------------------------------------------------------------ */

export async function exportPDF(state: AppState): Promise<void> {
  const { canvas, widthCss, contentHeightCss, contentBottom, scale, blocks } = await captureReport();
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "px", format: "a4", orientation: "portrait", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Page slices share the A4 aspect ratio so each slice fills a page without stretching.
  const pageHeightCss = widthCss * (pageH / pageW);
  // Drop any trailing page that begins below the real content: the breathing-room pad on
  // contentHeightCss can otherwise spill a sliver onto an extra, near-blank final page.
  const pages = paginate(contentHeightCss, pageHeightCss, blocks).filter(([t]) => t < contentBottom - 2);
  if (!pages.length) pages.push([0, Math.min(contentHeightCss, pageHeightCss)]);

  pages.forEach(([t, b], i) => {
    const dataUrl = sliceToDataURL(canvas, t, b, scale);
    const imgH = Math.min(pageH, (b - t) * (pageW / widthCss));
    if (i > 0) pdf.addPage();
    pdf.addImage(dataUrl, "JPEG", 0, 0, pageW, imgH, undefined, "FAST");
  });

  pdf.save(`${safeFileName(state)}.pdf`);
}

/* ------------------------------------------------------------------ */
/* PPTX (16:9 slides from the fixed export layout)                    */
/* ------------------------------------------------------------------ */

export async function exportPPTX(state: AppState): Promise<void> {
  const { canvas, widthCss, contentHeightCss, contentBottom, scale, blocks } = await captureReport();

  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
  pptx.layout = "WIDE";
  pptx.author = "ImpactLabs";
  pptx.company = state.orgName || "ImpactLabs";
  pptx.title = reportTitle(state);

  const SLIDE_W = 13.333;
  const SLIDE_H = 7.5;

  // 16:9 slices keep aspect ratio so images are never stretched on the slide.
  const slideHeightCss = widthCss * (SLIDE_H / SLIDE_W);
  // Drop any trailing slice that begins below the real content (see exportPDF note).
  const pages = paginate(contentHeightCss, slideHeightCss, blocks).filter(([t]) => t < contentBottom - 2);
  if (!pages.length) pages.push([0, Math.min(contentHeightCss, slideHeightCss)]);

  pages.forEach(([t, b]) => {
    const slide = pptx.addSlide();
    slide.background = { color: NAVY };
    const dataUrl = sliceToDataURL(canvas, t, b, scale);
    const hIn = Math.min(SLIDE_H, (b - t) * (SLIDE_W / widthCss));
    const y = Math.max(0, (SLIDE_H - hIn) / 2);
    slide.addImage({ data: dataUrl, x: 0, y, w: SLIDE_W, h: hIn });
  });

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
