import React from "react";
import { AppState } from "@/lib/state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateTheoryOfChange } from "@workspace/api-client-react";
import { Loader2, Sparkles, Plus, X, Settings, LayoutGrid, Target, Globe2, Briefcase } from "lucide-react";

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

  const addKeyProgram = () => {
    updateState({ keyPrograms: [...state.keyPrograms, { name: "", description: "" }] });
  };

  const removeKeyProgram = (idx: number) => {
    updateState({ keyPrograms: state.keyPrograms.filter((_, i) => i !== idx) });
  };

  const updateKeyProgram = (idx: number, field: "name" | "description", val: string) => {
    const list = [...state.keyPrograms];
    list[idx] = { ...list[idx], [field]: val };
    updateState({ keyPrograms: list });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Programs & Theory of Change</h2>
        <div className="glass-card p-4 rounded-lg mt-4 max-w-2xl">
          <p className="font-semibold text-primary mb-1 text-sm">How do you create change?</p>
          <p className="text-sm text-muted-foreground italic">
            List your key programs, then build out the logical model that connects your activities to long-term impact.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" /> Key Programs
            </h3>
            <p className="text-sm text-muted-foreground italic mt-1">Major initiatives or projects you run.</p>
          </div>
          <button 
            className="glass-card hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors border-white/10" 
            onClick={addKeyProgram}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Program
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.keyPrograms.map((prog, idx) => (
            <div key={idx} className="glass-card p-5 rounded-xl space-y-4 relative group hover:border-primary/40 transition-colors">
              <button 
                className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 transition-colors bg-black/20 p-1.5 rounded-md opacity-0 group-hover:opacity-100"
                onClick={() => removeKeyProgram(idx)}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Program Name</label>
                <Input 
                  value={prog.name} 
                  onChange={e => updateKeyProgram(idx, "name", e.target.value)} 
                  placeholder="e.g. Clean Water Initiative"
                  className="glass-input h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Description</label>
                <Textarea 
                  value={prog.description} 
                  onChange={e => updateKeyProgram(idx, "description", e.target.value)} 
                  placeholder="What does this program do?"
                  className="glass-input h-20 resize-none"
                />
              </div>
            </div>
          ))}
          {state.keyPrograms.length === 0 && (
            <div className="md:col-span-2 text-center py-8 border border-dashed border-border/30 rounded-xl text-muted-foreground glass-card bg-black/20 text-sm">
              No key programs added. Add programs to highlight specific initiatives.
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/30 pt-8">
        <h3 className="text-xl font-semibold mb-6">Theory of Change Model</h3>
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
          <div className="glass-card p-5 rounded-xl space-y-4 shadow-sm border-teal-500/30 bg-teal-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-teal-500">
              <Target className="w-24 h-24" />
            </div>
            <div className="border-b border-teal-500/20 pb-3 relative z-10">
              <h3 className="font-bold text-lg text-teal-400 flex items-center gap-2"><Target className="w-5 h-5" /> Outcomes</h3>
              <p className="text-xs text-teal-400/70 italic mt-1">Changes in beneficiaries</p>
            </div>
            <div className="space-y-3 relative z-10">
              {state.outcomes.map((out, i) => (
                <div key={i} className="flex gap-2">
                  <Input className="glass-input border-teal-500/30 text-sm h-10 bg-teal-950/20" value={out} onChange={e => updateList("outcomes", i, e.target.value)} />
                </div>
              ))}
              {state.outcomes.length === 0 && (
                <div className="text-xs text-teal-300/50 italic py-4 text-center">AI will populate these</div>
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
    </div>
  );
}