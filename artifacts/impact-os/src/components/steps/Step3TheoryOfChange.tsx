import React from "react";
import { AppState } from "@/lib/state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGenerateTheoryOfChange } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";

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
        <h2 className="text-3xl font-semibold text-primary mb-2">Theory of Change</h2>
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-primary-foreground/90">
          <p className="font-medium text-primary mb-1">How do you create change?</p>
          <p className="text-sm text-foreground/80">
            Outcomes are medium-term changes in your beneficiaries. Impact is the long-term systemic change. You fill out Activities and Outputs, and we can help generate the rest.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Activities */}
        <div className="space-y-4">
          <h3 className="font-medium border-b pb-2">Activities</h3>
          <p className="text-xs text-muted-foreground">What you do</p>
          {state.activities.map((act, i) => (
            <div key={i} className="flex gap-2">
              <Input value={act} onChange={e => updateList("activities", i, e.target.value)} />
              <Button variant="ghost" size="icon" onClick={() => removeList("activities", i)}>&times;</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addList("activities")} className="w-full">+ Add Activity</Button>
        </div>

        {/* Outputs */}
        <div className="space-y-4">
          <h3 className="font-medium border-b pb-2">Outputs</h3>
          <p className="text-xs text-muted-foreground">Direct results</p>
          {state.outputs.map((out, i) => (
            <div key={i} className="flex gap-2">
              <Input value={out} onChange={e => updateList("outputs", i, e.target.value)} />
              <Button variant="ghost" size="icon" onClick={() => removeList("outputs", i)}>&times;</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addList("outputs")} className="w-full">+ Add Output</Button>
        </div>

        {/* Outcomes */}
        <div className="space-y-4">
          <h3 className="font-medium border-b pb-2">Outcomes</h3>
          <p className="text-xs text-muted-foreground">Changes in beneficiaries</p>
          {state.outcomes.map((out, i) => (
            <div key={i} className="flex gap-2">
              <Input value={out} onChange={e => updateList("outcomes", i, e.target.value)} />
            </div>
          ))}
        </div>

        {/* Impact */}
        <div className="space-y-4">
          <h3 className="font-medium border-b pb-2">Impact</h3>
          <p className="text-xs text-muted-foreground">Long-term systemic change</p>
          {state.impact.map((imp, i) => (
            <div key={i} className="flex gap-2">
              <Input value={imp} onChange={e => updateList("impact", i, e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <Button 
          size="lg" 
          onClick={handleGenerate} 
          disabled={generate.isPending}
          className="w-full md:w-auto"
        >
          {generate.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing your impact logic...</> : "Generate Outcomes & Impact with AI"}
        </Button>
      </div>
    </div>
  );
}
