import React from "react";
import { AppState } from "@/lib/state";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Step2Stakeholders({ state, updateState }: { state: AppState, updateState: (u: Partial<AppState>) => void }) {
  
  const addSecondary = () => {
    if (state.secondaryStakeholders.length >= 4) return;
    updateState({
      secondaryStakeholders: [...state.secondaryStakeholders, { name: "", affected: "" }]
    });
  };

  const removeSecondary = (index: number) => {
    updateState({
      secondaryStakeholders: state.secondaryStakeholders.filter((_, i) => i !== index)
    });
  };

  const updateSecondary = (index: number, field: "name" | "affected", value: string) => {
    const updated = [...state.secondaryStakeholders];
    updated[index] = { ...updated[index], [field]: value };
    updateState({ secondaryStakeholders: updated });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Stakeholders</h2>
        <div className="glass-card p-4 rounded-lg">
          <p className="font-semibold text-primary mb-1 text-sm">Who is affected?</p>
          <p className="text-sm text-muted-foreground italic">
            Your primary beneficiary is NOT necessarily your customer. They are the group whose lives you are trying to improve.
          </p>
        </div>
      </div>

      <div className="glass-card border-primary/40 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.1)]">
        <div className="p-4 border-b border-border/30 bg-primary/5">
          <h3 className="text-xl font-semibold text-primary">Primary Beneficiary</h3>
        </div>
        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Group Name</Label>
            <Input 
              placeholder="e.g. Smallholder farmers in Kenya" 
              value={state.primaryBeneficiary.name}
              onChange={e => updateState({ primaryBeneficiary: { ...state.primaryBeneficiary, name: e.target.value }})}
              className="glass-input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">How are they affected?</Label>
            <Textarea 
              placeholder="Describe the problem they face and how your intervention changes their situation."
              value={state.primaryBeneficiary.affected}
              onChange={e => updateState({ primaryBeneficiary: { ...state.primaryBeneficiary, affected: e.target.value }})}
              className="glass-input h-24"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Secondary Stakeholders</h3>
          {state.secondaryStakeholders.length < 4 && (
            <button className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider" onClick={addSecondary}>+ Add Stakeholder</button>
          )}
        </div>
        
        {state.secondaryStakeholders.map((sh, idx) => (
          <div key={idx} className="glass-card rounded-xl relative p-5">
            <button 
              className="absolute top-4 right-4 text-xs font-semibold text-red-400 hover:text-red-300 uppercase tracking-wider transition-colors"
              onClick={() => removeSecondary(idx)}
            >
              Remove
            </button>
            <div className="space-y-5 mt-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Group Name</Label>
                <Input 
                  value={sh.name}
                  onChange={e => updateSecondary(idx, "name", e.target.value)}
                  placeholder="e.g. Local government"
                  className="glass-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">How are they affected?</Label>
                <Textarea 
                  value={sh.affected}
                  onChange={e => updateSecondary(idx, "affected", e.target.value)}
                  className="glass-input h-20"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
