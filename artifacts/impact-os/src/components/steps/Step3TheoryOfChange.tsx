import React from "react";
import { AppState } from "@/lib/state";
import { Input } from "@/components/ui/input";
import { useGenerateTheoryOfChange } from "@workspace/api-client-react";
import { Loader2, Sparkles, Plus, X, Settings, LayoutGrid, Target, Globe2 } from "lucide-react";

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
        <div className="glass-card p-4 rounded-lg mt-4 max-w-2xl">
          <p className="font-semibold text-primary mb-1 text-sm">How do you create change?</p>
          <p className="text-sm text-muted-foreground italic">
            Outcomes are medium-term changes in your beneficiaries. Impact is the long-term systemic change. You fill out Activities and Outputs, and we can help generate the rest.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
        {/* Activities */}
        <div className="glass-card p-5 rounded-xl space-y-4 shadow-sm border-slate-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Settings className="w-24 h-24" />
          </div>
          <div className="border-b border-border/30 pb-3 relative z-10">
            <h3 className="font-bold text-lg flex items-center gap-2"><Settings className="w-5 h-5 text-slate-400" /> Activities</h3>
            <p className="text-xs text-muted-foreground italic mt-1">What you do</p>
          </div>
          <div className="space-y-3 relative z-10">
            {state.activities.map((act, i) => (
              <div key={i} className="flex gap-2 group">
                <Input className="glass-input text-sm h-10" value={act} onChange={e => updateList("activities", i, e.target.value)} />
                <button className="text-muted-foreground hover:text-red-400 transition-colors p-2 bg-black/20 rounded-md shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeList("activities", i)}>
                  <X className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>
          <button className="glass-card hover:bg-white/10 border-white/10 w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors relative z-10" onClick={() => addList("activities")}>
            <Plus className="w-4 h-4"/> Add Activity
          </button>
        </div>

        {/* Outputs */}
        <div className="glass-card p-5 rounded-xl space-y-4 shadow-sm border-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <LayoutGrid className="w-24 h-24" />
          </div>
          <div className="border-b border-border/30 pb-3 relative z-10">
            <h3 className="font-bold text-lg flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-blue-400" /> Outputs</h3>
            <p className="text-xs text-muted-foreground italic mt-1">Direct results</p>
          </div>
          <div className="space-y-3 relative z-10">
            {state.outputs.map((out, i) => (
              <div key={i} className="flex gap-2 group">
                <Input className="glass-input text-sm h-10" value={out} onChange={e => updateList("outputs", i, e.target.value)} />
                <button className="text-muted-foreground hover:text-red-400 transition-colors p-2 bg-black/20 rounded-md shrink-0 opacity-0 group-hover:opacity-100" onClick={() => removeList("outputs", i)}>
                  <X className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>
          <button className="glass-card hover:bg-white/10 border-white/10 w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors relative z-10" onClick={() => addList("outputs")}>
            <Plus className="w-4 h-4"/> Add Output
          </button>
        </div>

        {/* Outcomes */}
        <div className="glass-card p-5 rounded-xl space-y-4 shadow-sm border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-indigo-500">
            <Target className="w-24 h-24" />
          </div>
          <div className="border-b border-indigo-500/20 pb-3 relative z-10">
            <h3 className="font-bold text-lg text-indigo-400 flex items-center gap-2"><Target className="w-5 h-5" /> Outcomes</h3>
            <p className="text-xs text-indigo-400/70 italic mt-1">Changes in beneficiaries</p>
          </div>
          <div className="space-y-3 relative z-10">
            {state.outcomes.map((out, i) => (
              <div key={i} className="flex gap-2">
                <Input className="glass-input border-indigo-500/30 text-sm h-10 bg-indigo-950/20" value={out} onChange={e => updateList("outcomes", i, e.target.value)} />
              </div>
            ))}
            {state.outcomes.length === 0 && (
              <div className="text-xs text-indigo-300/50 italic py-4 text-center">AI will populate these</div>
            )}
          </div>
        </div>

        {/* Impact */}
        <div className="glass-card p-5 rounded-xl space-y-4 shadow-sm border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-emerald-500">
            <Globe2 className="w-24 h-24" />
          </div>
          <div className="border-b border-emerald-500/20 pb-3 relative z-10">
            <h3 className="font-bold text-lg text-emerald-400 flex items-center gap-2"><Globe2 className="w-5 h-5" /> Impact</h3>
            <p className="text-xs text-emerald-400/70 italic mt-1">Systemic change</p>
          </div>
          <div className="space-y-3 relative z-10">
            {state.impact.map((imp, i) => (
              <div key={i} className="flex gap-2">
                <Input className="glass-input border-emerald-500/30 text-sm h-10 bg-emerald-950/20" value={imp} onChange={e => updateList("impact", i, e.target.value)} />
              </div>
            ))}
            {state.impact.length === 0 && (
              <div className="text-xs text-emerald-300/50 italic py-4 text-center">AI will populate these</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={handleGenerate} 
          disabled={generate.isPending || (state.activities.filter(Boolean).length === 0 && state.outputs.filter(Boolean).length === 0)}
          className="btn-gradient px-8 py-4 rounded-xl font-bold flex items-center gap-3 text-base shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
        >
          {generate.isPending ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing Framework...</>
          ) : (
            <><Sparkles className="w-5 h-5"/> Generate Outcomes & Impact with AI</>
          )}
        </button>
      </div>
    </div>
  );
}
