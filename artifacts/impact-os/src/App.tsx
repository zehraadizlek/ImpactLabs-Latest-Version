import React, { useEffect, useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppState, loadState, saveState } from "@/lib/state";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

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
    document.documentElement.classList.add('dark');
  }, [state]);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => updateState({ step: Math.min(5, state.step + 1) });
  const prevStep = () => updateState({ step: Math.max(0, state.step - 1) });
  const goHome = () => updateState({ step: 0 });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-hidden dark">
      {state.step > 0 && <div className="bg-blob-1" />}
      {state.step > 0 && <div className="bg-blob-2" />}

      {state.step > 0 && state.step < 5 && (
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/20 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button onClick={goHome} className="font-bold text-lg tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="btn-home" aria-label="Return to home">
              <Home className="w-4 h-4 text-primary" />
              Impact<span className="text-primary">Labs</span>
            </button>
            <div className="flex-1 max-w-md h-2 bg-[#1a2040] rounded-full overflow-hidden">
              <div 
                className="h-full btn-gradient transition-all duration-300"
                style={{ width: `${(state.step / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Step {state.step} of 5</span>
          </div>
        </div>
      )}

      <main className="flex-1 p-6 pb-32 max-w-5xl mx-auto w-full relative z-10">
        {state.step === 0 && <Step0Welcome state={state} updateState={updateState} />}
        {state.step === 1 && <Step1Sdgs state={state} updateState={updateState} />}
        {state.step === 2 && <Step2Stakeholders state={state} updateState={updateState} />}
        {state.step === 3 && <Step3TheoryOfChange state={state} updateState={updateState} />}
        {state.step === 4 && <Step4Measurement state={state} updateState={updateState} />}
        {state.step === 5 && <Step5Preview state={state} updateState={updateState} goHome={goHome} />}
      </main>

      {state.step < 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur border-t border-border/20 p-4 z-20">
          <div className="max-w-4xl mx-auto flex justify-between">
            {state.step > 0 ? (
              <button className="btn-ghost px-4 py-2 rounded-lg text-sm font-medium" onClick={prevStep} data-testid="btn-back">
                Back
              </button>
            ) : <div />}
            {state.step > 0 && (
              <button className="btn-gradient px-6 py-2 rounded-lg text-sm font-medium shadow-lg" onClick={nextStep} data-testid="btn-continue">
                Continue
              </button>
            )}
          </div>
        </div>
      )}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
