import React from "react";
import { AppState } from "@/lib/state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Step4Measurement({ state, updateState }: { state: AppState, updateState: (u: Partial<AppState>) => void }) {
  const items = [...state.outputs, ...state.outcomes].filter(Boolean);

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Data & Measurement</h2>
        <div className="glass-card p-4 rounded-lg">
          <p className="font-semibold text-primary mb-1 text-sm">How will you prove it?</p>
          <p className="text-sm text-muted-foreground italic">
            For each output and outcome, define the metric, the current state (baseline), and what you aim to achieve (target).
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border/30 rounded-xl glass-card">
          Please fill out Outputs and Outcomes in the previous step first.
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item, idx) => {
            const meas = state.measurements[item] || { indicator: "", baseline: "", target: "", frequency: "" };
            return (
              <div key={idx} className="glass-card rounded-xl overflow-hidden">
                <div className="bg-black/20 p-4 border-b border-border/30">
                  <h3 className="text-base font-semibold">{item}</h3>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Indicator</Label>
                    <Input 
                      placeholder="e.g. # of workshops"
                      value={meas.indicator}
                      onChange={e => updateMeasurement(item, "indicator", e.target.value)}
                      className="glass-input h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Baseline</Label>
                    <Input 
                      placeholder="Current: 0"
                      value={meas.baseline}
                      onChange={e => updateMeasurement(item, "baseline", e.target.value)}
                      className="glass-input h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Target</Label>
                    <Input 
                      placeholder="Goal: 50"
                      value={meas.target}
                      onChange={e => updateMeasurement(item, "target", e.target.value)}
                      className="glass-input h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">Frequency</Label>
                    <Select value={meas.frequency} onValueChange={v => updateMeasurement(item, "frequency", v)}>
                      <SelectTrigger className="glass-input h-9 text-sm">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1530] border-border/30 text-foreground">
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
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
