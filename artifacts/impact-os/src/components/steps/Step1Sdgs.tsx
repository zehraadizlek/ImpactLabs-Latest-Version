import React from "react";
import { AppState } from "@/lib/state";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check } from "lucide-react";
import { SDG_COLORS, SDG_NAMES } from "@/lib/exports";
import { COMMERCIAL_KEY, COMMERCIAL_AREAS, readCommercialAreas } from "@/lib/focus";

const SDGS = Array.from({ length: 17 }, (_, i) => ({
  id: i + 1,
  name: SDG_NAMES[i + 1] || `SDG ${i + 1}`,
  color: `#${SDG_COLORS[i + 1]}`
}));

export default function Step1Sdgs({ state, updateState }: { state: AppState, updateState: (u: Partial<AppState>) => void }) {
  const isCommercialOrg = state.orgType === "Startup" || state.orgType === "Company";
  const [mode, setMode] = React.useState<"sdg" | "commercial">(
    state.sdgChanges[COMMERCIAL_KEY] ? "commercial" : isCommercialOrg ? "commercial" : "sdg"
  );

  const commercialAreas = readCommercialAreas(state.sdgChanges);

  const toggleSdg = (id: number) => {
    const selected = state.selectedSdgs.includes(id)
      ? state.selectedSdgs.filter(s => s !== id)
      : [...state.selectedSdgs, id].slice(0, 5); // Max 5 SDGs
    updateState({ selectedSdgs: selected });
  };

  const toggleCommercialArea = (id: string) => {
    const next = commercialAreas.includes(id)
      ? commercialAreas.filter(a => a !== id)
      : [...commercialAreas, id].slice(0, 5); // Max 5 areas
    updateState({ sdgChanges: { ...state.sdgChanges, [COMMERCIAL_KEY]: JSON.stringify(next) } });
  };

  const updateCommercialNote = (id: string, value: string) => {
    updateState({ sdgChanges: { ...state.sdgChanges, [`comm_${id}`]: value } });
  };

  const count = mode === "commercial" ? commercialAreas.length : state.selectedSdgs.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Impact Focus Areas</h2>
          <div className="glass-card p-4 rounded-lg mt-4 max-w-2xl">
            <p className="font-semibold text-primary mb-1 text-sm">
              {mode === "commercial" ? "Select up to 5 impact areas" : "Select up to 5 SDGs"}
            </p>
            <p className="text-sm text-muted-foreground italic">
              {mode === "commercial"
                ? "Choose the commercial impact dimensions your organization reports on."
                : "Identify the global goals your organization contributes to."}
            </p>
          </div>
        </div>
        <div className="glass-card px-4 py-2 rounded-lg flex items-center gap-2 border-primary/30 shrink-0">
          <span className="text-2xl font-bold text-primary">{count}</span>
          <span className="text-sm font-medium text-muted-foreground">/ 5 Selected</span>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="inline-flex gap-1 glass-card p-1 rounded-xl">
        {(["sdg", "commercial"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === m ? "btn-gradient text-white shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "sdg" ? "UN SDGs" : "Commercial Impact"}
          </button>
        ))}
      </div>

      {mode === "sdg" ? (
        <>
          <div className="flex flex-wrap gap-2">
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
                    backgroundColor: isSelected ? `${sdg.color}20` : undefined,
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                    isSelected
                      ? 'border-2 text-white font-medium'
                      : isDisabled
                        ? 'glass-card opacity-40 cursor-not-allowed'
                        : 'glass-card-interactive hover:border-white/20 text-muted-foreground'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-bold"
                    style={{ backgroundColor: sdg.color, color: '#fff' }}
                  >
                    {sdg.id}
                  </div>
                  {sdg.name}
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
                        className="min-h-[80px] glass-input mt-2"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMMERCIAL_AREAS.map(area => {
              const isSelected = commercialAreas.includes(area.id);
              const isDisabled = !isSelected && commercialAreas.length >= 5;

              return (
                <button
                  key={area.id}
                  onClick={() => toggleCommercialArea(area.id)}
                  disabled={isDisabled}
                  className={`text-left p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : isDisabled
                        ? 'glass-card opacity-40 cursor-not-allowed border-transparent'
                        : 'glass-card-interactive border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary text-white' : 'border border-white/20'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-foreground'}`}>{area.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{area.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {commercialAreas.length > 0 && (
            <div className="space-y-6 pt-8 border-t border-border/30">
              <div className="mb-6">
                <h3 className="text-xl font-semibold">Define success for each area</h3>
                <p className="text-sm text-muted-foreground italic">For each focus area, what does meaningful progress look like?</p>
              </div>

              <div className="grid gap-4">
                {commercialAreas.map(id => {
                  const area = COMMERCIAL_AREAS.find(a => a.id === id);
                  if (!area) return null;
                  return (
                    <div key={id} className="glass-card p-5 rounded-xl space-y-3 border-l-4 border-l-primary">
                      <Label className="text-base text-foreground font-medium">
                        What does success look like for {area.name}?
                      </Label>
                      <Textarea
                        placeholder="e.g., Cut operational carbon emissions by 30% and publish an annual verified ESG report..."
                        value={state.sdgChanges[`comm_${id}`] || ""}
                        onChange={e => updateCommercialNote(id, e.target.value)}
                        className="min-h-[80px] glass-input mt-2"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
