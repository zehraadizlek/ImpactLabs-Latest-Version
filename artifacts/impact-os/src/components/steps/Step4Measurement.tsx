import React from "react";
import { AppState } from "@/lib/state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuggestKpis } from "@workspace/api-client-react";
import { Loader2, Sparkles, Activity, Plus, X, BarChart2 } from "lucide-react";
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

  const addKeyMetric = () => {
    updateState({ keyMetrics: [...state.keyMetrics, { label: "", value: "" }] });
  };

  const removeKeyMetric = (idx: number) => {
    updateState({ keyMetrics: state.keyMetrics.filter((_, i) => i !== idx) });
  };

  const updateKeyMetric = (idx: number, field: "label" | "value", val: string) => {
    const list = [...state.keyMetrics];
    list[idx] = { ...list[idx], [field]: val };
    updateState({ keyMetrics: list });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Data & Measurement</h2>
          <div className="glass-card p-4 rounded-lg max-w-2xl mt-4">
            <p className="font-semibold text-primary mb-1 text-sm">How will you prove it?</p>
            <p className="text-sm text-muted-foreground italic">
              Define the top-level numbers you want to highlight, and build a framework for tracking your outputs and outcomes.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-primary" /> Key Metrics
            </h3>
            <p className="text-sm text-muted-foreground italic mt-1">High-level snapshot numbers (e.g. "$10M Raised", "50K Trees Planted").</p>
          </div>
          <button 
            className="glass-card hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors border-white/10" 
            onClick={addKeyMetric}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Metric
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {state.keyMetrics.map((metric, idx) => (
            <div key={idx} className="glass-card p-4 rounded-xl space-y-3 relative group">
              <button 
                className="absolute top-2 right-2 text-muted-foreground hover:text-red-400 transition-colors bg-black/20 p-1.5 rounded-md opacity-0 group-hover:opacity-100"
                onClick={() => removeKeyMetric(idx)}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-1.5 mt-2">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Metric Label</Label>
                <Input 
                  value={metric.label} 
                  onChange={e => updateKeyMetric(idx, "label", e.target.value)} 
                  placeholder="e.g. Lives Impacted"
                  className="glass-input h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Value</Label>
                <Input 
                  value={metric.value} 
                  onChange={e => updateKeyMetric(idx, "value", e.target.value)} 
                  placeholder="e.g. 15,000"
                  className="glass-input h-9 text-base font-semibold text-primary"
                />
              </div>
            </div>
          ))}
          {state.keyMetrics.length === 0 && (
            <div className="md:col-span-3 text-center py-6 border border-dashed border-border/30 rounded-xl text-muted-foreground glass-card bg-black/20 text-sm">
              No key metrics added. These appear prominently in the report dashboard.
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/30 pt-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Measurement Framework
            </h3>
            <p className="text-sm text-muted-foreground italic mt-1">Detailed tracking for your Theory of Change items.</p>
          </div>
          {items.length > 0 && (
            <button 
              onClick={handleSuggest} 
              disabled={suggest.isPending}
              className="glass-card hover:bg-primary/10 border-primary/40 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm text-primary transition-all disabled:opacity-50"
            >
              {suggest.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Suggesting...</> : <><Sparkles className="w-4 h-4"/> AI Suggest KPIs</>}
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border/30 rounded-xl glass-card flex flex-col items-center">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium text-lg text-foreground/70">No outputs or outcomes defined.</p>
            <p className="text-sm">Please fill out Outputs and Outcomes in the previous step first.</p>
          </div>
        ) : (
          <div className="space-y-4">
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
                        className="glass-input h-10 text-sm font-medium text-primary"
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
    </div>
  );
}