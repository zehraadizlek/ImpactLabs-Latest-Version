import React, { useRef } from "react";
import { AppState } from "@/lib/state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, BarChart3, Target, Sparkles, Upload, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export default function Step0Welcome({ state, updateState }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateState({ logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

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

        <div className="glass-card max-w-2xl mx-auto p-8 rounded-2xl text-left space-y-6 mt-12 mb-12 relative z-10">
          <div className="space-y-6">
            <h3 className="font-semibold text-xl border-b border-border/30 pb-3">Organization Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="orgName" className="text-muted-foreground uppercase text-xs tracking-wider">Organization Name *</Label>
                <Input 
                  id="orgName"
                  placeholder="e.g. Acme Sustainability" 
                  value={state.orgName} 
                  onChange={e => updateState({ orgName: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgType" className="text-muted-foreground uppercase text-xs tracking-wider">Organization Type</Label>
                <Select value={state.orgType} onValueChange={v => updateState({ orgType: v })}>
                  <SelectTrigger id="orgType" className="glass-input">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1530] border-border/30 text-foreground">
                    <SelectItem value="Startup">Startup</SelectItem>
                    <SelectItem value="NGO">NGO</SelectItem>
                    <SelectItem value="Social Enterprise">Social Enterprise</SelectItem>
                    <SelectItem value="Company">Company</SelectItem>
                    <SelectItem value="Student Project">Student Project</SelectItem>
                    <SelectItem value="Government Initiative">Government Initiative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-muted-foreground uppercase text-xs tracking-wider">Industry</Label>
                <Input 
                  id="industry"
                  placeholder="e.g. EdTech, Renewables" 
                  value={state.industry} 
                  onChange={e => updateState({ industry: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-muted-foreground uppercase text-xs tracking-wider">Country / Region</Label>
                <Input 
                  id="country"
                  placeholder="e.g. Global, Kenya, EU" 
                  value={state.country} 
                  onChange={e => updateState({ country: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-muted-foreground uppercase text-xs tracking-wider">Website</Label>
                <Input 
                  id="website"
                  placeholder="https://..." 
                  value={state.website} 
                  onChange={e => updateState({ website: e.target.value })}
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportingPeriod" className="text-muted-foreground uppercase text-xs tracking-wider">Reporting Period</Label>
                <Input 
                  id="reportingPeriod"
                  placeholder="e.g. 2023-2024 or Q4 2023" 
                  value={state.reportingPeriod} 
                  onChange={e => updateState({ reportingPeriod: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground uppercase text-xs tracking-wider">Organization Logo (Optional)</Label>
              <div className="flex items-center gap-4">
                {state.logo ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border/30 bg-white/5 flex items-center justify-center">
                    <img src={state.logo} alt="Logo preview" className="max-w-full max-h-full object-contain p-2" />
                    <button 
                      onClick={() => updateState({ logo: "" })}
                      className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div 
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-border/30 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-white/5 transition-colors glass-card"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground flex-1">
                  Upload a high-resolution logo for your report cover. PNG or JPG, max 2MB.
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission" className="text-muted-foreground uppercase text-xs tracking-wider">Mission Statement</Label>
              <Textarea 
                id="mission"
                placeholder="What is your organization's core mission?" 
                value={state.mission} 
                onChange={e => updateState({ mission: e.target.value })}
                className="glass-input min-h-[100px]"
              />
            </div>
          </div>
          <button 
            className="btn-gradient w-full py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => updateState({ step: 1 })}
            disabled={!state.orgName.trim()}
          >
            Continue to SDGs <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-16 relative z-10">
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