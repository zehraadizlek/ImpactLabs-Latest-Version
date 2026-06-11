import React from "react";
import { AppState } from "@/lib/state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, BarChart3, Target, Sparkles } from "lucide-react";

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export default function Step0Welcome({ state, updateState }: Props) {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />
      
      <div className="absolute top-0 left-0 right-0 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold tracking-tight">Impact<span className="text-primary">Labs</span></div>
        <div className="text-sm text-muted-foreground font-medium">by BV Labs</div>
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 pt-20">
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-semibold glass-card text-primary border-primary/30">17 SDGs Covered</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold glass-card text-primary border-primary/30">AI-Powered</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold glass-card text-primary border-primary/30">5-Step Wizard</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
          Build Impact Reports <br className="hidden md:block"/>
          <span className="text-gradient">That Actually Matter</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Most organizations report backwards. ImpactLabs guides you through the right methodology — starting from the change you want to create.
        </p>

        <div className="glass-card max-w-xl mx-auto p-6 rounded-2xl text-left space-y-6 mt-12 mb-12">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b border-border/30 pb-2">Organization Details</h3>
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-muted-foreground">Organization Name</Label>
              <Input 
                id="orgName"
                placeholder="e.g. Acme Sustainability" 
                value={state.orgName} 
                onChange={e => updateState({ orgName: e.target.value })}
                data-testid="input-org-name"
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector" className="text-muted-foreground">Sector</Label>
              <Select 
                value={state.sector} 
                onValueChange={v => updateState({ sector: v })}
              >
                <SelectTrigger id="sector" data-testid="select-sector" className="glass-input">
                  <SelectValue placeholder="Select your sector..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1530] border-border/30 text-foreground">
                  <SelectItem value="NGO">NGO</SelectItem>
                  <SelectItem value="Startup">Startup</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="Public Sector">Public Sector</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <button 
            className="btn-gradient w-full py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2"
            onClick={() => updateState({ step: 1 })}
            data-testid="btn-get-started"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16">
          <div className="glass-card p-6 rounded-xl space-y-3">
            <Target className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-lg">Reverse Impact Logic</h3>
            <p className="text-sm text-muted-foreground">Define your long-term goals first, then trace back to the activities required to make them happen.</p>
          </div>
          <div className="glass-card p-6 rounded-xl space-y-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-lg">AI Assistance</h3>
            <p className="text-sm text-muted-foreground">Generate comprehensive Theory of Change frameworks with our fine-tuned impact models.</p>
          </div>
          <div className="glass-card p-6 rounded-xl space-y-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h3 className="font-semibold text-lg">Structured Methodology</h3>
            <p className="text-sm text-muted-foreground">Follow a proven 5-step process that aligns with global sustainability reporting standards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
