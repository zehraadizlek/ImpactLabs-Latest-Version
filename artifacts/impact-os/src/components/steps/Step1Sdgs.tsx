import React from "react";
import { AppState } from "@/lib/state";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { SDG_COLORS, SDG_NAMES } from "@/lib/exports";

const SDGS = Array.from({ length: 17 }, (_, i) => ({
  id: i + 1,
  name: SDG_NAMES[i + 1] || `SDG ${i + 1}`,
  color: `#${SDG_COLORS[i + 1]}`
}));

export default function Step1Sdgs({ state, updateState }: { state: AppState, updateState: (u: Partial<AppState>) => void }) {
  const toggleSdg = (id: number) => {
    const selected = state.selectedSdgs.includes(id)
      ? state.selectedSdgs.filter(s => s !== id)
      : [...state.selectedSdgs, id].slice(0, 5); // Max 5 SDGs
    updateState({ selectedSdgs: selected });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Choose Your Impact Focus</h2>
          <div className="glass-card p-4 rounded-lg mt-4 max-w-2xl">
            <p className="font-semibold text-primary mb-1 text-sm">Why this matters</p>
            <p className="text-sm text-muted-foreground italic">
              Start from the end. By selecting up to 5 Sustainable Development Goals, you define the long-term systemic change you aim to contribute to.
            </p>
          </div>
        </div>
        <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2 border-primary/30 shrink-0">
          <span className="text-2xl font-bold text-primary">{state.selectedSdgs.length}</span>
          <span className="text-sm font-medium text-muted-foreground">/ 5 Selected</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {SDGS.map(sdg => {
          const isSelected = state.selectedSdgs.includes(sdg.id);
          const isDisabled = !isSelected && state.selectedSdgs.length >= 5;
          
          return (
            <button
              key={sdg.id}
              onClick={() => toggleSdg(sdg.id)}
              disabled={isDisabled}
              style={{
                borderColor: isSelected ? sdg.color : undefined,
                boxShadow: isSelected ? `0 0 15px ${sdg.color}40` : undefined,
              }}
              className={`relative flex flex-col p-4 rounded-xl text-left transition-all ${
                isSelected 
                  ? 'glass-card border-2' 
                  : isDisabled
                    ? 'glass-card opacity-40 cursor-not-allowed'
                    : 'glass-card-interactive hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start w-full mb-3">
                <span 
                  className="font-bold text-2xl"
                  style={{ color: isSelected ? sdg.color : '#94A3B8' }}
                >
                  {sdg.id}
                </span>
                {isSelected && (
                  <div className="shrink-0 rounded-full p-1" style={{ backgroundColor: sdg.color }}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <span className={`font-semibold text-sm leading-tight ${isSelected ? 'text-white' : 'text-muted-foreground'}`}>
                {sdg.name}
              </span>
              
              {isSelected && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl opacity-50" 
                  style={{ backgroundColor: sdg.color }} 
                />
              )}
            </button>
          )
        })}
      </div>

      {state.selectedSdgs.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-border/30">
          <div className="mb-6">
            <h3 className="text-xl font-semibold">Describe your desired impact</h3>
            <p className="text-sm text-muted-foreground italic">Think about the world AFTER your work. What is different?</p>
          </div>
          
          <div className="grid gap-4">
            {state.selectedSdgs.map(id => {
              const sdg = SDGS.find(s => s.id === id)!;
              return (
                <div 
                  key={id} 
                  className="glass-card p-5 rounded-xl space-y-3 border-l-4"
                  style={{ borderLeftColor: sdg.color }}
                >
                  <Label className="text-base text-foreground font-medium flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-white" style={{ backgroundColor: sdg.color }}>
                      {sdg.id}
                    </span>
                    What specific change do you want to create for {sdg.name}?
                  </Label>
                  <Textarea 
                    placeholder="e.g., We aim to provide quality educational resources to 10,000 students in rural areas..."
                    value={state.sdgChanges[id] || ""}
                    onChange={e => updateState({ sdgChanges: { ...state.sdgChanges, [id]: e.target.value }})}
                    className="min-h-[100px] glass-input mt-2"
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
