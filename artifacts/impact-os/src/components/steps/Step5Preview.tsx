import React from "react";
import { AppState, generateShareUrl } from "@/lib/state";
import { useToast } from "@/hooks/use-toast";
import { Printer, Share2 } from "lucide-react";

export default function Step5Preview({ state, updateState }: { state: AppState, updateState: (u: Partial<AppState>) => void }) {
  const { toast } = useToast();

  const handleShare = () => {
    const url = generateShareUrl(state);
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "A shareable link to this report has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Review & Export</h2>
          <p className="text-muted-foreground italic">Your impact report is ready.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button className="btn-ghost px-4 py-2 rounded-lg text-sm font-semibold flex items-center" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share Link
          </button>
          <button className="btn-gradient px-4 py-2 rounded-lg text-sm font-semibold flex items-center" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print / PDF
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-8 md:p-12 space-y-12 print:shadow-none print:bg-white print:border-none print:text-black print:p-0">
        <div className="text-center space-y-6 border-b border-border/30 pb-12 print:border-gray-200">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold glass-card text-primary border-primary/30 mb-2 print:border-gray-300 print:text-gray-600 print:bg-gray-100">
            {state.sector || "Sector not specified"}
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gradient print:text-black">{state.orgName || "Untitled Organization"}</h1>
          <p className="text-xl text-muted-foreground font-medium print:text-gray-600">Impact Report</p>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold border-b border-border/30 pb-3 print:border-gray-200 print:text-black">Theory of Change</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold text-xs text-primary uppercase tracking-wider mb-4 print:text-gray-800">Activities</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/90 print:text-black">
                {state.activities.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xs text-primary uppercase tracking-wider mb-4 print:text-gray-800">Outputs</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/90 print:text-black">
                {state.outputs.filter(Boolean).map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xs text-primary uppercase tracking-wider mb-4 print:text-gray-800">Outcomes</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/90 print:text-black">
                {state.outcomes.filter(Boolean).map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xs text-primary uppercase tracking-wider mb-4 print:text-gray-800">Impact</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-foreground/90 print:text-black">
                {state.impact.filter(Boolean).map((i, idx) => <li key={idx}>{i}</li>)}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-16 text-center print:pt-32">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest print:text-gray-400">Generated with</p>
          <div className="text-lg font-bold tracking-tight mt-1 text-foreground/80 print:text-gray-500">Impact<span className="text-primary">Labs</span> <span className="font-normal text-sm opacity-50">by BV Labs</span></div>
        </div>
      </div>
    </div>
  );
}
