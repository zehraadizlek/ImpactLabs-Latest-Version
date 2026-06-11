import React from "react";
import { AppState } from "@/lib/state";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, UserPlus, X, Heart } from "lucide-react";

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

  const addBeneficiaryGroup = () => {
    updateState({ beneficiaryGroups: [...state.beneficiaryGroups, ""] });
  };

  const removeBeneficiaryGroup = (idx: number) => {
    updateState({ beneficiaryGroups: state.beneficiaryGroups.filter((_, i) => i !== idx) });
  };

  const updateBeneficiaryGroup = (idx: number, val: string) => {
    const list = [...state.beneficiaryGroups];
    list[idx] = val;
    updateState({ beneficiaryGroups: list });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Stakeholders & Beneficiaries</h2>
          <div className="glass-card p-4 rounded-lg mt-4 max-w-2xl">
            <p className="font-semibold text-primary mb-1 text-sm">Who is affected?</p>
            <p className="text-sm text-muted-foreground italic">
              Identify the core groups your organization serves and impacts.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card border-primary/40 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.1)] relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div className="p-4 border-b border-border/30 bg-primary/5 flex items-center gap-3">
          <Heart className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground/90">Primary Beneficiary</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Group Name</Label>
            <Input 
              placeholder="e.g. Smallholder farmers in Kenya" 
              value={state.primaryBeneficiary.name}
              onChange={e => updateState({ primaryBeneficiary: { ...state.primaryBeneficiary, name: e.target.value }})}
              className="glass-input h-11 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">How are they affected?</Label>
            <Textarea 
              placeholder="Describe the problem they face and how your intervention changes their situation."
              value={state.primaryBeneficiary.affected}
              onChange={e => updateState({ primaryBeneficiary: { ...state.primaryBeneficiary, affected: e.target.value }})}
              className="glass-input h-24 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              Specific Beneficiary Groups
            </h3>
            <p className="text-sm text-muted-foreground italic mt-1">List particular subsets of your beneficiaries (e.g. "Youth aged 15-24", "Rural women").</p>
          </div>
          <button 
            className="glass-card hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors border-white/10" 
            onClick={addBeneficiaryGroup}
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Group
          </button>
        </div>
        
        <div className="space-y-3">
          {state.beneficiaryGroups.map((group, idx) => (
            <div key={idx} className="flex gap-2 group">
              <Input 
                className="glass-input text-sm h-11" 
                placeholder="Beneficiary group description" 
                value={group} 
                onChange={e => updateBeneficiaryGroup(idx, e.target.value)} 
              />
              <button 
                className="text-muted-foreground hover:text-red-400 transition-colors p-2 bg-black/20 rounded-md shrink-0 opacity-0 group-hover:opacity-100 flex items-center justify-center w-11 h-11" 
                onClick={() => removeBeneficiaryGroup(idx)}
              >
                <X className="w-4 h-4"/>
              </button>
            </div>
          ))}
          {state.beneficiaryGroups.length === 0 && (
            <div className="text-center py-6 border border-dashed border-border/30 rounded-xl text-muted-foreground glass-card bg-black/20 text-sm">
              No specific beneficiary groups added yet.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              Secondary Stakeholders
            </h3>
            <p className="text-sm text-muted-foreground italic mt-1">Other groups indirectly impacted by your activities.</p>
          </div>
          {state.secondaryStakeholders.length < 4 && (
            <button 
              className="glass-card hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors border-white/10" 
              onClick={addSecondary}
            >
              <UserPlus className="w-4 h-4 mr-2" /> Add Stakeholder
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.secondaryStakeholders.map((sh, idx) => (
            <div key={idx} className="glass-card rounded-xl relative p-5 group hover:border-white/20 transition-all">
              <button 
                className="absolute top-4 right-4 text-muted-foreground hover:text-red-400 transition-colors bg-black/20 p-1.5 rounded-md"
                onClick={() => removeSecondary(idx)}
                title="Remove stakeholder"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-5 mt-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Group Name</Label>
                  <Input 
                    value={sh.name}
                    onChange={e => updateSecondary(idx, "name", e.target.value)}
                    placeholder="e.g. Local government"
                    className="glass-input h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">How are they affected?</Label>
                  <Textarea 
                    value={sh.affected}
                    onChange={e => updateSecondary(idx, "affected", e.target.value)}
                    className="glass-input h-20 resize-none"
                    placeholder="Describe their involvement..."
                  />
                </div>
              </div>
            </div>
          ))}
          {state.secondaryStakeholders.length === 0 && (
            <div className="md:col-span-2 text-center py-10 border border-dashed border-border/30 rounded-xl text-muted-foreground glass-card bg-black/20 text-sm">
              No secondary stakeholders added.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}