import React from "react";
import { AppState } from "@/lib/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <h2 className="text-3xl font-semibold text-primary mb-2">Stakeholders</h2>
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-primary-foreground/90">
          <p className="font-medium text-primary mb-1">Who is affected?</p>
          <p className="text-sm text-foreground/80">
            Your primary beneficiary is NOT necessarily your customer. They are the group whose lives you are trying to improve.
          </p>
        </div>
      </div>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Primary Beneficiary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Group Name</Label>
            <Input 
              placeholder="e.g. Smallholder farmers in Kenya" 
              value={state.primaryBeneficiary.name}
              onChange={e => updateState({ primaryBeneficiary: { ...state.primaryBeneficiary, name: e.target.value }})}
            />
          </div>
          <div className="space-y-2">
            <Label>How are they affected?</Label>
            <Textarea 
              placeholder="Describe the problem they face and how your intervention changes their situation."
              value={state.primaryBeneficiary.affected}
              onChange={e => updateState({ primaryBeneficiary: { ...state.primaryBeneficiary, affected: e.target.value }})}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium">Secondary Stakeholders</h3>
          {state.secondaryStakeholders.length < 4 && (
            <Button variant="outline" size="sm" onClick={addSecondary}>+ Add Stakeholder</Button>
          )}
        </div>
        
        {state.secondaryStakeholders.map((sh, idx) => (
          <Card key={idx}>
            <CardContent className="p-4 space-y-4 relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 text-destructive"
                onClick={() => removeSecondary(idx)}
              >
                Remove
              </Button>
              <div className="space-y-2 pt-2">
                <Label>Group Name</Label>
                <Input 
                  value={sh.name}
                  onChange={e => updateSecondary(idx, "name", e.target.value)}
                  placeholder="e.g. Local government"
                />
              </div>
              <div className="space-y-2">
                <Label>How are they affected?</Label>
                <Textarea 
                  value={sh.affected}
                  onChange={e => updateSecondary(idx, "affected", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
