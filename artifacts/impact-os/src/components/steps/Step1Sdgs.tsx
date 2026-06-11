import React from "react";
import { AppState } from "@/lib/state";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";

const SDGS = [
  { id: 1, name: "No Poverty" },
  { id: 2, name: "Zero Hunger" },
  { id: 3, name: "Good Health" },
  { id: 4, name: "Quality Education" },
  { id: 5, name: "Gender Equality" },
  { id: 6, name: "Clean Water" },
  { id: 7, name: "Affordable Energy" },
  { id: 8, name: "Decent Work" },
  { id: 9, name: "Industry Innovation" },
  { id: 10, name: "Reduced Inequalities" },
  { id: 11, name: "Sustainable Cities" },
  { id: 12, name: "Responsible Consumption" },
  { id: 13, name: "Climate Action" },
  { id: 14, name: "Life Below Water" },
  { id: 15, name: "Life on Land" },
  { id: 16, name: "Peace & Justice" },
  { id: 17, name: "Partnerships" },
];

export default function Step1Sdgs({ state, updateState }: { state: AppState, updateState: (u: Partial<AppState>) => void }) {
  const toggleSdg = (id: number) => {
    const selected = state.selectedSdgs.includes(id)
      ? state.selectedSdgs.filter(s => s !== id)
      : [...state.selectedSdgs, id].slice(0, 3);
    updateState({ selectedSdgs: selected });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Choose Your Impact Focus</h2>
        <div className="glass-card p-4 rounded-lg">
          <p className="font-semibold text-primary mb-1 text-sm">Why this matters</p>
          <p className="text-sm text-muted-foreground italic">
            Start from the end. By selecting 1-3 Sustainable Development Goals, you define the long-term systemic change you aim to contribute to.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SDGS.map(sdg => {
          const isSelected = state.selectedSdgs.includes(sdg.id);
          return (
            <button
              key={sdg.id}
              onClick={() => toggleSdg(sdg.id)}
              className={`relative flex items-center p-3 rounded-lg text-left transition-all ${
                isSelected 
                  ? 'glass-card border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'glass-card-interactive hover:border-white/20'
              }`}
              data-testid={`btn-sdg-${sdg.id}`}
            >
              <div className="flex-1">
                <span className={`font-bold text-lg mr-2 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>{sdg.id}</span>
                <span className="font-medium text-sm leading-tight">
                  {sdg.name}
                </span>
              </div>
              {isSelected && (
                <div className="ml-2 text-primary shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {state.selectedSdgs.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-border/30">
          <h3 className="text-xl font-semibold">Describe your desired impact</h3>
          <p className="text-sm text-muted-foreground italic">Think about the world AFTER your work. What is different?</p>
          
          <div className="grid gap-4">
            {state.selectedSdgs.map(id => {
              const sdg = SDGS.find(s => s.id === id)!;
              return (
                <div key={id} className="glass-card p-5 rounded-xl space-y-3">
                  <Label className="text-base text-foreground font-medium">What specific change do you want to create in <span className="text-primary">{sdg.name}</span>?</Label>
                  <Textarea 
                    placeholder="e.g., We aim to reduce plastic waste in coastal communities..."
                    value={state.sdgChanges[id] || ""}
                    onChange={e => updateState({ sdgChanges: { ...state.sdgChanges, [id]: e.target.value }})}
                    className="min-h-[100px] glass-input"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
