import React from "react";
import { AppState } from "@/lib/state";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SDGS = [
  { id: 1, name: "No Poverty", color: "#E5243B" },
  { id: 2, name: "Zero Hunger", color: "#DDA63A" },
  { id: 3, name: "Good Health", color: "#4C9F38" },
  { id: 4, name: "Quality Education", color: "#C5192D" },
  { id: 5, name: "Gender Equality", color: "#FF3A21" },
  { id: 6, name: "Clean Water", color: "#26BDE2" },
  { id: 7, name: "Affordable Energy", color: "#FCC30B" },
  { id: 8, name: "Decent Work", color: "#A21942" },
  { id: 9, name: "Industry Innovation", color: "#FD6925" },
  { id: 10, name: "Reduced Inequalities", color: "#DD1367" },
  { id: 11, name: "Sustainable Cities", color: "#FD9D24" },
  { id: 12, name: "Responsible Consumption", color: "#BF8B2E" },
  { id: 13, name: "Climate Action", color: "#3F7E44" },
  { id: 14, name: "Life Below Water", color: "#0A97D9" },
  { id: 15, name: "Life on Land", color: "#56C02B" },
  { id: 16, name: "Peace & Justice", color: "#00689D" },
  { id: 17, name: "Partnerships", color: "#19486A" },
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
        <h2 className="text-3xl font-semibold text-primary mb-2">Choose Your Impact Focus</h2>
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-primary-foreground/90">
          <p className="font-medium text-primary mb-1">Why this matters</p>
          <p className="text-sm text-foreground/80">
            Start from the end. By selecting 1-3 Sustainable Development Goals, you define the long-term systemic change you aim to contribute to.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {SDGS.map(sdg => {
          const isSelected = state.selectedSdgs.includes(sdg.id);
          return (
            <button
              key={sdg.id}
              onClick={() => toggleSdg(sdg.id)}
              className={`relative flex flex-col items-start p-4 rounded-xl text-left transition-all hover:-translate-y-1 overflow-hidden ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-2 ring-border/50'}`}
              style={{ backgroundColor: sdg.color }}
              data-testid={`btn-sdg-${sdg.id}`}
            >
              <span className="text-white/80 font-bold text-lg mb-1">{sdg.id}</span>
              <span className="text-white font-semibold leading-tight text-sm">
                {sdg.name.toUpperCase()}
              </span>
              {isSelected && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {state.selectedSdgs.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-border">
          <h3 className="text-xl font-medium">Describe your desired impact</h3>
          <p className="text-sm text-muted-foreground">Think about the world AFTER your work. What is different?</p>
          
          {state.selectedSdgs.map(id => {
            const sdg = SDGS.find(s => s.id === id)!;
            return (
              <div key={id} className="space-y-2">
                <Label>What specific change do you want to create in {sdg.name}?</Label>
                <Textarea 
                  placeholder="e.g., We aim to reduce plastic waste in coastal communities..."
                  value={state.sdgChanges[id] || ""}
                  onChange={e => updateState({ sdgChanges: { ...state.sdgChanges, [id]: e.target.value }})}
                  className="min-h-[100px]"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
