import React from "react";
import { AppState } from "@/lib/state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <h2 className="text-3xl font-semibold text-primary mb-2">Data & Measurement</h2>
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-primary-foreground/90">
          <p className="font-medium text-primary mb-1">How will you prove it?</p>
          <p className="text-sm text-foreground/80">
            For each output and outcome, define the metric, the current state (baseline), and what you aim to achieve (target).
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          Please fill out Outputs and Outcomes in the previous step first.
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item, idx) => {
            const meas = state.measurements[item] || { indicator: "", baseline: "", target: "", frequency: "" };
            return (
              <Card key={idx}>
                <CardHeader className="bg-muted/50 pb-4">
                  <CardTitle className="text-base font-medium">{item}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Indicator</Label>
                    <Input 
                      placeholder="e.g. # of workshops held"
                      value={meas.indicator}
                      onChange={e => updateMeasurement(item, "indicator", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Baseline</Label>
                    <Input 
                      placeholder="Current: 0"
                      value={meas.baseline}
                      onChange={e => updateMeasurement(item, "baseline", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target</Label>
                    <Input 
                      placeholder="Goal: 50"
                      value={meas.target}
                      onChange={e => updateMeasurement(item, "target", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={meas.frequency} onValueChange={v => updateMeasurement(item, "frequency", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
