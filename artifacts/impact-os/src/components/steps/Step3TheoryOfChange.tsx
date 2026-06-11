import React from "react";
import { AppState } from "@/lib/state";
import { Input } from "@/components/ui/input";
import { useGenerateTheoryOfChange } from "@workspace/api-client-react";
import { Loader2, Sparkles, Plus, X } from "lucide-react";

export default function Step3TheoryOfChange({ state, updateState }: { state: AppState, updateState: (u: Partial<AppState>) => void }) {
  const generate = useGenerateTheoryOfChange();

  const handleGenerate = () => {
    generate.mutate({
      data: {
        sdgs: state.selectedSdgs.map(String),
        beneficiary: state.primaryBeneficiary.name,
        activities: state.activities.filter(Boolean),
        outputs: state.outputs.filter(Boolean)
      }
    }, {
      onSuccess: (result) => {
        updateState({
          outcomes: result.outcomes || [],
          impact: result.impact || []
        });
      }
    });
  };

  const updateList = (field: "activities" | "outputs" | "outcomes" | "impact", idx: number, val: string) => {
    const list = [...state[field]];
    list[idx] = val;
    updateState({ [field]: list });
  };

  const addList = (field: "activities" | "outputs") => {
    updateState({ [field]: [...state[field], ""] });
  };

  const removeList = (field: "activities" | "outputs", idx: number) => {
    updateState({ [field]: state[field].filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Theory of Change</h2>
        <div className="glass-card p-4 rounded-lg">
          <p className="font-semibold text-primary mb-1 text-sm">How do you create change?</p>
          <p className="text-sm text-muted-foreground italic">
            Outcomes are medium-term changes in your beneficiaries. Impact is the long-term systemic change. You fill out Activities and Outputs, and we can help generate the rest.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Activities */}
        <div className="glass-card p-4 rounded-xl space-y-4">
          <div className="border-b border-border/30 pb-2">
            <h3 className="font-semibold text-lg">Activities</h3>
            <p className="text-xs text-muted-foreground italic">What you do</p>
          </div>
          {state.activities.map((act, i) => (
            <div key={i} className="flex gap-2">
              <Input className="glass-input text-sm h-9" value={act} onChange={e => updateList("activities", i, e.target.value)} />
              <button className="text-muted-foreground hover:text-white transition-colors" onClick={() => removeList("activities", i)}><X className="w-4 h-4"/></button>
            </div>
          ))}
          <button className="btn-ghost w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1" onClick={() => addList("activities")}><Plus className="w-3 h-3"/> Add</button>
        </div>

        {/* Outputs */}
        <div className="glass-card p-4 rounded-xl space-y-4">
          <div className="border-b border-border/30 pb-2">
            <h3 className="font-semibold text-lg">Outputs</h3>
            <p className="text-xs text-muted-foreground italic">Direct results</p>
          </div>
          {state.outputs.map((out, i) => (
            <div key={i} className="flex gap-2">
              <Input className="glass-input text-sm h-9" value={out} onChange={e => updateList("outputs", i, e.target.value)} />
              <button className="text-muted-foreground hover:text-white transition-colors" onClick={() => removeList("outputs", i)}><X className="w-4 h-4"/></button>
            </div>
          ))}
          <button className="btn-ghost w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1" onClick={() => addList("outputs")}><Plus className="w-3 h-3"/> Add</button>
        </div>

        {/* Outcomes */}
        <div className="glass-card p-4 rounded-xl space-y-4 border-primary/30 bg-primary/5">
          <div className="border-b border-border/30 pb-2">
            <h3 className="font-semibold text-lg text-primary">Outcomes</h3>
            <p className="text-xs text-primary/70 italic">Changes in beneficiaries</p>
          </div>
          {state.outcomes.map((out, i) => (
            <div key={i} className="flex gap-2">
              <Input className="glass-input border-primary/30 text-sm h-9" value={out} onChange={e => updateList("outcomes", i, e.target.value)} />
            </div>
          ))}
        </div>

        {/* Impact */}
        <div className="glass-card p-4 rounded-xl space-y-4 border-primary/30 bg-primary/5">
          <div className="border-b border-border/30 pb-2">
            <h3 className="font-semibold text-lg text-primary">Impact</h3>
            <p className="text-xs text-primary/70 italic">Systemic change</p>
          </div>
          {state.impact.map((imp, i) => (
            <div key={i} className="flex gap-2">
              <Input className="glass-input border-primary/30 text-sm h-9" value={imp} onChange={e => updateList("impact", i, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button 
          onClick={handleGenerate} 
          disabled={generate.isPending}
          className="btn-gradient px-6 py-3 rounded-xl font-semibold flex items-center gap-2 text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {generate.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4"/> Generate Outcomes & Impact with AI</>}
        </button>
      </div>
    </div>
  );
}
