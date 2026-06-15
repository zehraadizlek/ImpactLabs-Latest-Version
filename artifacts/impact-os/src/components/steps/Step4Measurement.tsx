import React from "react";
import { AppState } from "@/lib/state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSuggestKpis } from "@workspace/api-client-react";
import { Loader2, Sparkles, Activity, Plus, X, BarChart2, HelpCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TIPS = {
  indicator: "A specific, measurable metric showing whether you're achieving this. Examples: # of workshops held, % of users reporting improved skills, tonnes of CO₂ avoided",
  baseline: "Where you are RIGHT NOW before the program — your starting point. Examples: 0 (if brand new), 200 users, 12% satisfaction score",
  target: "The specific number you aim to reach by period end. Examples: 500 users trained, 40% reduction in waste",
  frequency: "How often you will collect and review this data",
} as const;

const FREQUENCIES: { value: string; desc: string }[] = [
  { value: "Weekly", desc: "Fast-moving KPIs" },
  { value: "Monthly", desc: "Operational metrics" },
  { value: "Quarterly", desc: "Strategic progress" },
  { value: "Bi-Annually", desc: "Program milestones" },
  { value: "Annually", desc: "Long-term impact" },
];

const OUTPUT_COLOR = "#3b82f6";
const OUTCOME_COLOR = "#2dd4bf";

function FieldTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="What's this?" className="text-muted-foreground/70 hover:text-primary transition-colors">
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}

export default function Step4Measurement({ state, updateState }: { state: AppState, updateState: (u: Partial<AppState>) => void }) {
  const { toast } = useToast();
  const outputItems = state.outputs.filter(Boolean).map(name => ({ name, type: "output" as const }));
  const outcomeItems = state.outcomes.filter(Boolean).map(name => ({ name, type: "outcome" as const }));
  const items = [...outputItems, ...outcomeItems];
  const suggest = useSuggestKpis();

  const isDefined = (name: string) => {
    const m = state.measurements[name];
    return !!m && (!!m.indicator?.trim() || !!m.target?.trim());
  };
  const definedCount = items.filter(i => isDefined(i.name)).length;

  const handleSuggest = () => {
    if (items.length === 0) return;

    suggest.mutate({
      data: {
        sector: state.industry || state.sector || "General",
        items: items.map(i => i.name)
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
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                {definedCount} / {items.length} filled
              </span>
              <button 
                onClick={handleSuggest} 
                disabled={suggest.isPending}
                className="glass-card hover:bg-primary/10 border-primary/40 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm text-primary transition-all disabled:opacity-50"
              >
                {suggest.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Suggesting...</> : <><Sparkles className="w-4 h-4"/> AI Suggest KPIs</>}
              </button>
            </div>
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
            <div className="glass-card bg-black/20 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="font-bold text-foreground/90">Indicator</p>
                <p className="text-muted-foreground mt-0.5">The metric you track</p>
              </div>
              <div>
                <p className="font-bold text-foreground/90">Baseline</p>
                <p className="text-muted-foreground mt-0.5">Where you stand today</p>
              </div>
              <div>
                <p className="font-bold text-foreground/90">Target</p>
                <p className="text-muted-foreground mt-0.5">Where you aim to be</p>
              </div>
              <div>
                <p className="font-bold text-foreground/90">Frequency</p>
                <p className="text-muted-foreground mt-0.5">How often you check</p>
              </div>
            </div>

            {items.map(({ name, type }, idx) => {
              const meas = state.measurements[name] || { indicator: "", baseline: "", target: "", frequency: "" };
              const defined = isDefined(name);
              const typeColor = type === "output" ? OUTPUT_COLOR : OUTCOME_COLOR;
              return (
                <div key={idx} className="glass-card rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-white/5 p-4 border-b border-border/30 flex items-center gap-3 flex-wrap">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeColor }} />
                    <h3 className="text-base font-semibold text-foreground/90">{name}</h3>
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border"
                      style={{ color: typeColor, borderColor: `${typeColor}66`, backgroundColor: `${typeColor}1a` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColor }} />
                      {type === "output" ? "Output" : "Outcome"}
                    </span>
                    {defined && (
                      <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30">
                        <Check className="w-3 h-3" /> Defined
                      </span>
                    )}
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-5">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        Indicator <FieldTip text={TIPS.indicator} />
                      </Label>
                      <Input 
                        placeholder="e.g. # of workshops"
                        value={meas.indicator}
                        onChange={e => updateMeasurement(name, "indicator", e.target.value)}
                        className="glass-input h-10 text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        Baseline <FieldTip text={TIPS.baseline} />
                      </Label>
                      <Input 
                        placeholder="Current: 0"
                        value={meas.baseline}
                        onChange={e => updateMeasurement(name, "baseline", e.target.value)}
                        className="glass-input h-10 text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        Target <FieldTip text={TIPS.target} />
                      </Label>
                      <Input 
                        placeholder="Goal: 50"
                        value={meas.target}
                        onChange={e => updateMeasurement(name, "target", e.target.value)}
                        className="glass-input h-10 text-sm font-medium text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        Frequency <FieldTip text={TIPS.frequency} />
                      </Label>
                      <Select value={meas.frequency} onValueChange={v => updateMeasurement(name, "frequency", v)}>
                        <SelectTrigger className="glass-input h-10 text-sm font-medium">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0d1530] border-border/30 text-foreground">
                          {FREQUENCIES.map(f => (
                            <SelectItem key={f.value} value={f.value}>
                              <span className="flex items-center gap-2">
                                <span className="font-medium">{f.value}</span>
                                <span className="text-xs text-muted-foreground">({f.desc})</span>
                              </span>
                            </SelectItem>
                          ))}
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
