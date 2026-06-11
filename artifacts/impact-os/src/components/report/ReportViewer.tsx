import React from "react";
import { AppState } from "@/lib/state";
import { SDG_COLORS, SDG_NAMES } from "@/lib/exports";
import TheoryOfChangeFlowchart from "./TheoryOfChangeFlowchart";
import ProgressCharts from "./ProgressCharts";

export default function ReportViewer({ state, isGenerated }: { state: AppState, isGenerated: boolean }) {
  const report = state.generatedReport;

  // Basic layout classes for pages
  const pageClass = "glass-card rounded-2xl p-8 md:p-12 space-y-8 print:shadow-none print:bg-white print:border-none print:text-black print:p-0 print:mb-12 print:break-after-page";
  const sectionTitleClass = "text-2xl font-bold border-b border-border/30 pb-3 print:border-gray-300 print:text-black mt-12 mb-6";
  const pClass = "text-foreground/90 leading-relaxed print:text-black";

  return (
    <div className="space-y-12">
      {/* 1. Cover Page */}
      <div className={pageClass + " flex flex-col justify-center min-h-[60vh] text-center"}>
        {state.logo && (
          <div className="w-32 h-32 mx-auto mb-8 bg-white/5 rounded-2xl p-4 flex items-center justify-center border border-white/10 print:border-none print:bg-transparent">
            <img src={state.logo} alt="Organization Logo" className="max-w-full max-h-full object-contain" />
          </div>
        )}
        <div className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold glass-card text-primary border-primary/30 mx-auto mb-6 print:border-gray-300 print:text-gray-600 print:bg-gray-100">
          {state.industry || state.sector || "Impact Organization"}
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gradient print:text-black mb-6">
          {state.orgName || "Organization"}
        </h1>
        <h2 className="text-2xl md:text-3xl text-muted-foreground font-medium print:text-gray-600 mb-8">
          Social Impact Report {state.reportingPeriod ? `— ${state.reportingPeriod}` : ""}
        </h2>
        {state.mission && (
          <p className="max-w-2xl mx-auto text-lg italic text-foreground/80 print:text-gray-700 mt-8 border-t border-border/20 pt-8 print:border-gray-200">
            "{state.mission}"
          </p>
        )}
        <div className="pt-20 mt-auto print:pt-32">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest print:text-gray-400">Generated with</p>
          <div className="text-lg font-bold tracking-tight mt-1 text-foreground/80 print:text-gray-500">Impact<span className="text-primary">Labs</span></div>
        </div>
      </div>

      {/* Narrative Sections (only if generated) */}
      {isGenerated && report && (
        <div className={pageClass}>
          {/* 2. Executive Summary */}
          <div>
            <h3 className={sectionTitleClass}>1. Executive Summary</h3>
            <div className="prose prose-invert max-w-none print:prose-p:text-black print:prose-headings:text-black">
              {report.executiveSummary.split('\n\n').map((p, i) => (
                <p key={i} className={pClass}>{p}</p>
              ))}
            </div>
          </div>

          {/* 3. SDG Alignment */}
          <div className="print:break-before-page">
            <h3 className={sectionTitleClass}>2. SDG Alignment</h3>
            <div className="grid gap-6">
              {report.sdgAlignment.map(align => {
                const sdgName = SDG_NAMES[align.sdg];
                const sdgColor = `#${SDG_COLORS[align.sdg] || '3b82f6'}`;
                return (
                  <div key={align.sdg} className="glass-card p-6 rounded-xl border-l-4 print:border-l-4 print:border-gray-200 print:bg-white" style={{ borderLeftColor: sdgColor }}>
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-3 print:text-black">
                      <span className="flex items-center justify-center w-8 h-8 rounded text-sm font-bold text-white print:text-white" style={{ backgroundColor: sdgColor }}>
                        {align.sdg}
                      </span>
                      {sdgName}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <strong className="block text-sm text-primary uppercase tracking-wider mb-1 print:text-gray-700">Why It Matters</strong>
                        <p className={pClass + " text-sm"}>{align.whyItMatters}</p>
                      </div>
                      <div>
                        <strong className="block text-sm text-primary uppercase tracking-wider mb-1 print:text-gray-700">Expected Contribution</strong>
                        <p className={pClass + " text-sm"}>{align.expectedContribution}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 4. Stakeholder Analysis */}
          <div className="print:break-before-page">
            <h3 className={sectionTitleClass}>3. Stakeholder Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-1 glass-card p-6 rounded-xl bg-primary/5 border-primary/30 print:bg-gray-50 print:border-gray-200">
                <h4 className="font-bold text-lg mb-4 text-primary print:text-black">Primary Beneficiary</h4>
                <div className="space-y-2">
                  <strong className="block text-foreground print:text-black">{state.primaryBeneficiary.name || "—"}</strong>
                  <p className="text-sm text-muted-foreground print:text-gray-600">{state.primaryBeneficiary.affected}</p>
                </div>
              </div>
              <div className="md:col-span-2 glass-card p-6 rounded-xl print:border-gray-200">
                <h4 className="font-bold text-lg mb-4 print:text-black">Secondary Stakeholders</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.secondaryStakeholders.map((sh, i) => sh.name && (
                    <div key={i} className="border-l-2 border-border/50 pl-3">
                      <strong className="block text-sm text-foreground print:text-black">{sh.name}</strong>
                      <p className="text-xs text-muted-foreground mt-1 print:text-gray-600">{sh.affected}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="prose prose-invert max-w-none print:prose-p:text-black">
              {report.stakeholderAnalysis.split('\n\n').map((p, i) => (
                <p key={i} className={pClass}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Structural Data (always available, even before AI gen) */}
      <div className={pageClass}>
        {/* 5. Theory of Change */}
        <div>
          <h3 className={sectionTitleClass}>{(isGenerated ? "4. " : "")}Theory of Change</h3>
          {report?.theoryOfChangeNarrative && (
            <div className="prose prose-invert max-w-none mb-8 print:prose-p:text-black">
              {report.theoryOfChangeNarrative.split('\n\n').map((p, i) => (
                <p key={i} className={pClass}>{p}</p>
              ))}
            </div>
          )}
          <TheoryOfChangeFlowchart state={state} />
        </div>

        {isGenerated && report?.impactStrategy && (
          <div className="print:break-before-page">
            <h3 className={sectionTitleClass}>5. Impact Strategy</h3>
            <div className="glass-card p-8 rounded-xl bg-gradient-to-br from-primary/10 to-transparent mb-8 print:bg-none print:border-gray-200">
              <h4 className="text-primary font-bold uppercase tracking-widest text-xs mb-2 print:text-gray-600">Long-Term Vision</h4>
              <p className="text-xl font-medium leading-relaxed print:text-black">{report.impactStrategy.longTermVision}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4 print:text-black">Strategic Objectives</h4>
                <ul className="space-y-3">
                  {report.impactStrategy.strategicObjectives.map((obj, i) => (
                    <li key={i} className="flex gap-3 text-sm print:text-black">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-lg mb-4 print:text-black">Key Initiatives</h4>
                <ul className="space-y-3">
                  {report.impactStrategy.keyInitiatives.map((init, i) => (
                    <li key={i} className="flex gap-3 text-sm print:text-black">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                      <span>{init}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 7. Measurement Framework */}
        <div className="print:break-before-page">
          <h3 className={sectionTitleClass}>{(isGenerated ? "6. " : "")}Measurement Framework</h3>
          {report?.measurementFramework && (
            <p className={pClass + " mb-8"}>{report.measurementFramework}</p>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm print:text-black border-collapse">
              <thead>
                <tr className="border-b-2 border-border/50 print:border-gray-400">
                  <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Outcome / Output</th>
                  <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Indicator</th>
                  <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Baseline</th>
                  <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Target</th>
                  <th className="py-3 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Freq.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 print:divide-gray-200">
                {Object.entries(state.measurements).map(([item, meas], i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors print:hover:bg-transparent">
                    <td className="py-3 px-4 font-medium max-w-[200px] truncate" title={item}>{item}</td>
                    <td className="py-3 px-4">{meas.indicator || "—"}</td>
                    <td className="py-3 px-4">{meas.baseline || "—"}</td>
                    <td className="py-3 px-4 text-primary font-semibold print:text-black">{meas.target || "—"}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground print:text-gray-600">{meas.frequency || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8. Progress Dashboard */}
        {isGenerated && report?.progressMetrics && (
          <div className="print:break-before-page">
            <h3 className={sectionTitleClass}>7. Progress Dashboard</h3>
            <ProgressCharts metrics={report.progressMetrics} />
          </div>
        )}

        {/* 9 & 10. Risks & Commitments */}
        {isGenerated && report && (
          <div className="print:break-before-page">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className={sectionTitleClass + " mt-0"}>8. Risks & Assumptions</h3>
                <div className="space-y-6">
                  <div>
                    <h5 className="font-bold mb-2 print:text-black">Key Risks</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground print:text-gray-800">
                      {report.risks.keyRisks.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2 print:text-black">Dependencies</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground print:text-gray-800">
                      {report.risks.dependencies.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div className="glass-card p-4 rounded-lg bg-emerald-500/10 border-emerald-500/20 print:bg-gray-100 print:border-gray-200">
                    <h5 className="font-bold text-emerald-400 mb-2 print:text-black">Mitigation Strategy</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-emerald-100/80 print:text-gray-700">
                      {report.risks.mitigation.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={sectionTitleClass + " mt-0"}>9. Future Commitments</h3>
                <div className="space-y-6">
                  <div>
                    <h5 className="font-bold mb-2 print:text-black">Next Year Goals</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground print:text-gray-800">
                      {report.futureCommitments.nextYearGoals.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2 print:text-black">Expansion Plans</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground print:text-gray-800">
                      {report.futureCommitments.expansionPlans.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div className="glass-card p-4 rounded-lg bg-primary/10 border-primary/20 print:bg-gray-100 print:border-gray-200">
                    <h5 className="font-bold text-primary mb-2 print:text-black">SDG Roadmap</h5>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-foreground/80 print:text-gray-700">
                      {report.futureCommitments.sdgRoadmap.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appendix */}
        <div className="print:break-before-page">
          <h3 className={sectionTitleClass}>Appendix: Organization Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="glass-card p-4 rounded-lg print:border-gray-200">
              <span className="block text-muted-foreground uppercase text-[10px] tracking-widest print:text-gray-500">Type</span>
              <strong className="print:text-black">{state.orgType || "—"}</strong>
            </div>
            <div className="glass-card p-4 rounded-lg print:border-gray-200">
              <span className="block text-muted-foreground uppercase text-[10px] tracking-widest print:text-gray-500">Industry</span>
              <strong className="print:text-black">{state.industry || "—"}</strong>
            </div>
            <div className="glass-card p-4 rounded-lg print:border-gray-200">
              <span className="block text-muted-foreground uppercase text-[10px] tracking-widest print:text-gray-500">Location</span>
              <strong className="print:text-black">{state.country || "—"}</strong>
            </div>
            <div className="glass-card p-4 rounded-lg print:border-gray-200">
              <span className="block text-muted-foreground uppercase text-[10px] tracking-widest print:text-gray-500">Website</span>
              <strong className="print:text-black truncate block">{state.website || "—"}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
