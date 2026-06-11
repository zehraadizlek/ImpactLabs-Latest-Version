import React, { useState } from "react";
import { AppState, generateShareUrl } from "@/lib/state";
import { useToast } from "@/hooks/use-toast";
import { Printer, Share2, FileText, Download, Sparkles, Loader2, Home } from "lucide-react";
import { useGenerateReport } from "@workspace/api-client-react";
import { exportPDF, exportPPTX, exportDOCX } from "@/lib/exports";
import ReportViewer from "../report/ReportViewer";

export default function Step5Preview({ state, updateState, goHome }: { state: AppState, updateState: (u: Partial<AppState>) => void, goHome: () => void }) {
  const { toast } = useToast();
  const generate = useGenerateReport();
  const [isExporting, setIsExporting] = useState(false);

  const handleShare = () => {
    const url = generateShareUrl(state);
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "A shareable link to this report has been copied to your clipboard.",
    });
  };

  const handleGenerate = () => {
    generate.mutate({
      data: {
        orgName: state.orgName,
        orgType: state.orgType,
        industry: state.industry,
        mission: state.mission,
        country: state.country,
        reportingPeriod: state.reportingPeriod,
        sdgs: state.selectedSdgs.map(String),
        sdgChanges: Object.entries(state.sdgChanges).map(([sdg, change]) => `SDG ${sdg}: ${change}`),
        primaryBeneficiary: state.primaryBeneficiary.name ? `${state.primaryBeneficiary.name}: ${state.primaryBeneficiary.affected}` : undefined,
        secondaryStakeholders: state.secondaryStakeholders.filter(s => s.name).map(s => `${s.name}: ${s.affected}`),
        activities: state.activities.filter(Boolean),
        outputs: state.outputs.filter(Boolean),
        outcomes: state.outcomes.filter(Boolean),
        impact: state.impact.filter(Boolean),
      }
    }, {
      onSuccess: (result) => {
        updateState({ generatedReport: result });
        toast({
          title: "Report Generated",
          description: "Your impact narrative has been completely generated.",
        });
      },
      onError: () => {
        toast({
          title: "Generation Failed",
          description: "Could not generate report at this time.",
          variant: "destructive"
        });
      }
    });
  };

  const handleExport = async (type: 'pptx' | 'docx') => {
    setIsExporting(true);
    try {
      if (type === 'pptx') await exportPPTX(state);
      if (type === 'docx') await exportDOCX(state);
      toast({
        title: "Export Complete",
        description: `Your ${type.toUpperCase()} file has been downloaded.`,
      });
    } catch (e) {
      toast({
        title: "Export Failed",
        description: `Could not export to ${type.toUpperCase()}.`,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Review & Export</h2>
          <p className="text-muted-foreground italic">Your investor-grade impact report.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 print:hidden">
          <button className="btn-ghost px-4 py-2 rounded-lg text-sm font-semibold flex items-center" onClick={goHome} data-testid="btn-home">
            <Home className="w-4 h-4 mr-2" /> Home
          </button>
          <button className="btn-ghost px-4 py-2 rounded-lg text-sm font-semibold flex items-center" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share Link
          </button>
          <button className="btn-ghost px-4 py-2 rounded-lg text-sm font-semibold flex items-center" onClick={() => handleExport('docx')} disabled={isExporting}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />} DOCX
          </button>
          <button className="btn-ghost px-4 py-2 rounded-lg text-sm font-semibold flex items-center" onClick={() => handleExport('pptx')} disabled={isExporting}>
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} PPTX
          </button>
          <button className="glass-card hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold flex items-center border-white/20" onClick={exportPDF}>
            <Printer className="w-4 h-4 mr-2" /> Print / PDF
          </button>
        </div>
      </div>

      {!state.generatedReport && (
        <div className="glass-card border-primary/50 p-8 md:p-12 rounded-2xl text-center space-y-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden print:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <Sparkles className="w-16 h-16 text-primary mx-auto opacity-80" />
            <h3 className="text-2xl md:text-3xl font-bold">Generate the Full Narrative</h3>
            <p className="text-muted-foreground text-lg">
              You've provided all the structural data. Now let our AI consultant write the executive summary, stakeholder analysis, strategy, risks, and commitments to craft a complete, investor-ready document.
            </p>
            
            <button 
              onClick={handleGenerate}
              disabled={generate.isPending}
              className="btn-gradient w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 mx-auto shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all"
            >
              {generate.isPending ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Crafting Report...</>
              ) : (
                <><Sparkles className="w-6 h-6"/> Generate Entire Report with AI</>
              )}
            </button>
            <p className="text-xs text-muted-foreground opacity-60">This may take up to 30 seconds to generate all 11 sections.</p>
          </div>
        </div>
      )}

      {/* The Report Viewer */}
      <ReportViewer state={state} isGenerated={!!state.generatedReport} />
      
    </div>
  );
}
