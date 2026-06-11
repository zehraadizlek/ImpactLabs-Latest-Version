import React from "react";
import { AppState } from "@/lib/state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuggestKpis } from "@workspace/api-client-react";
import { Loader2, Sparkles, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Step4Measurement({ state, updateState }: { state: AppState, updateState: (u: Partial<AppState>) => void }) {
  const { toast } = useToast();
  const items = [...state.outputs, ...state.outcomes].filter(Boolean);
  const suggest = useSuggestKpis();

  const handleSuggest = () => {
    if (items.length === 0) return;
    
    suggest.mutate({
      data: {
        sector: state.industry || state.sector || "General",
        items: items
      }
    }, {
      onSuccess: (result) => {
        const newMeas = { ...state.measurements };
        result.kpis.forEach(kpi => {
          if (kpi.item) {
            newMeas[kpi.item] = {
              indicator: kpi.indicator || "",
              baseline: kpi.baseline || "0",
              target: kpi.target || "",
              frequency: kpi.frequency || "Annually"
            };
          }
        });
        updateState({ measurements: newMeas });
        toast({
          title: "KPIs Suggested",
          description: "AI has filled in suggested measurement metrics for your outputs and outcomes.",
        });
      },
      onError: () => {
        toast({
          title: "Generation Failed",
          description: "Could not suggest KPIs at this time.",
          variant: "destructive"
        });
      }
    });
  };

  const updateMeasurement = (item: string, field: "indicator" | "baseline" | "target" | "frequency", value: string) => {
    const meas = state.measurements[item] || { indicator: "", baseline: "", target: "", frequency: "" };
    updateState({
      measurements: {
        ...state.measurements,
        [item]: { ...meas, [field]: value }
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Data & Measurement</h2>
          <div className="glass-card p-4 rounded-lg max-w-2xl mt-4">
            <p className="font-semibold text-primary mb-1 text-sm">How will you prove it?</p>
            <p className="text-sm text-muted-foreground italic">
              For each output and outcome, define the metric, the current state (baseline), and what you aim to achieve (target).
            </p>
          </div>
        </div>
        
        {items.length > 0 && (
          <button 
            onClick={handleSuggest} 
            disabled={suggest.isPending}
            className="glass-card hover:bg-primary/10 border-primary/40 px-5 py-3 rounded-xl font-semibold flex items-center gap-2 text-sm text-primary transition-all disabled:opacity-50"
          >
            {suggest.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Suggesting...</> : <><Sparkles className="w-4 h-4"/> AI Suggest KPIs</>}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border/30 rounded-xl glass-card flex flex-col items-center">
          <Activity className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium text-lg text-foreground/70">No outputs or outcomes defined.</p>
          <p className="text-sm">Please fill out Outputs and Outcomes in the previous step first.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item, idx) => {
            const meas = state.measurements[item] || { indicator: "", baseline: "", target: "", frequency: "" };
            return (
              <div key={idx} className="glass-card rounded-xl overflow-hidden shadow-sm">
                <div className="bg-white/5 p-4 border-b border-border/30 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <h3 className="text-base font-semibold text-foreground/90">{item}</h3>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Indicator</Label>
                    <Input 
                      placeholder="e.g. # of workshops"
                      value={meas.indicator}
                      onChange={e => updateMeasurement(item, "indicator", e.target.value)}
                      className="glass-input h-10 text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Baseline</Label>
                    <Input 
                      placeholder="Current: 0"
                      value={meas.baseline}
                      onChange={e => updateMeasurement(item, "baseline", e.target.value)}
                      className="glass-input h-10 text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Target</Label>
                    <Input 
                      placeholder="Goal: 50"
                      value={meas.target}
                      onChange={e => updateMeasurement(item, "target", e.target.value)}
                      className="glass-input h-10 text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Frequency</Label>
                    <Select value={meas.frequency} onValueChange={v => updateMeasurement(item, "frequency", v)}>
                      <SelectTrigger className="glass-input h-10 text-sm font-medium">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1530] border-border/30 text-foreground">
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Bi-Annually">Bi-Annually</SelectItem>
                        <SelectItem value="Annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}
