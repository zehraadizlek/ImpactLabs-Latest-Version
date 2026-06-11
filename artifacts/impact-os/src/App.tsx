import React, { useEffect, useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppState, loadState, saveState } from "@/lib/state";
import { Button } from "@/components/ui/button";

import Step0Welcome from "./components/steps/Step0Welcome";
import Step1Sdgs from "./components/steps/Step1Sdgs";
import Step2Stakeholders from "./components/steps/Step2Stakeholders";
import Step3TheoryOfChange from "./components/steps/Step3TheoryOfChange";
import Step4Measurement from "./components/steps/Step4Measurement";
import Step5Preview from "./components/steps/Step5Preview";

const queryClient = new QueryClient();

export default function App() {
  const [state, setState] = useState<AppState>(loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => updateState({ step: Math.min(5, state.step + 1) });
  const prevStep = () => updateState({ step: Math.max(0, state.step - 1) });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {state.step > 0 && state.step < 5 && (
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(state.step / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Step {state.step} of 4</span>
          </div>
        </div>
      )}

      <main className="flex-1 p-6 pb-32 max-w-5xl mx-auto w-full">
        {state.step === 0 && <Step0Welcome state={state} updateState={updateState} />}
        {state.step === 1 && <Step1Sdgs state={state} updateState={updateState} />}
        {state.step === 2 && <Step2Stakeholders state={state} updateState={updateState} />}
        {state.step === 3 && <Step3TheoryOfChange state={state} updateState={updateState} />}
        {state.step === 4 && <Step4Measurement state={state} updateState={updateState} />}
        {state.step === 5 && <Step5Preview state={state} updateState={updateState} />}
      </main>

      {state.step < 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur border-t p-4 z-10">
          <div className="max-w-4xl mx-auto flex justify-between">
            {state.step > 0 ? (
              <Button variant="outline" onClick={prevStep} data-testid="btn-back">
                Back
              </Button>
            ) : <div />}
            <Button onClick={nextStep} data-testid="btn-continue">
              {state.step === 0 ? "Start your report" : "Continue"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
