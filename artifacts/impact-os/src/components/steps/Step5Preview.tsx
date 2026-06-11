import React from "react";
import { AppState, generateShareUrl } from "@/lib/state";
import { Button } from "@/components/ui/button";
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
          <h2 className="text-3xl font-semibold text-primary mb-2">Review & Export</h2>
          <p className="text-muted-foreground">Your impact report is ready.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share Link
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print / PDF
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-8 md:p-12 space-y-12 text-foreground print:shadow-none print:border-none print:p-0">
        <div className="text-center space-y-4 border-b pb-12">
          <h1 className="text-5xl font-bold tracking-tight text-primary">{state.orgName || "Untitled Organization"}</h1>
          <p className="text-xl text-muted-foreground">Impact Report • {state.sector}</p>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-primary border-b pb-2">Theory of Change</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">Activities</h4>
              <ul className="list-disc pl-5 space-y-2">
                {state.activities.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">Outputs</h4>
              <ul className="list-disc pl-5 space-y-2">
                {state.outputs.filter(Boolean).map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">Outcomes</h4>
              <ul className="list-disc pl-5 space-y-2">
                {state.outcomes.filter(Boolean).map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">Impact</h4>
              <ul className="list-disc pl-5 space-y-2">
                {state.impact.filter(Boolean).map((i, idx) => <li key={idx}>{i}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
