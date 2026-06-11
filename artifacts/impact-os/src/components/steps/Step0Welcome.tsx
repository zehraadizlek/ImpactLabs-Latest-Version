import React from "react";
import { AppState } from "@/lib/state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export default function Step0Welcome({ state, updateState }: Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-primary">Build your Impact Report the right way</h1>
        <p className="text-lg text-muted-foreground">
          Reverse impact logic starts from the change you want to see, then traces back to the activities required to make it happen. Let's start with who you are.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input 
              id="orgName"
              placeholder="e.g. Acme Sustainability" 
              value={state.orgName} 
              onChange={e => updateState({ orgName: e.target.value })}
              data-testid="input-org-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select 
              value={state.sector} 
              onValueChange={v => updateState({ sector: v })}
            >
              <SelectTrigger id="sector" data-testid="select-sector">
                <SelectValue placeholder="Select your sector..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NGO">NGO</SelectItem>
                <SelectItem value="Startup">Startup</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
                <SelectItem value="Public Sector">Public Sector</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
