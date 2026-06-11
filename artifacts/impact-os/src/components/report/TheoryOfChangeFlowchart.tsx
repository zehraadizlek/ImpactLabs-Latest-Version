import React from "react";
import { AppState } from "@/lib/state";
import { ArrowRight, Settings, LayoutGrid, Target, Globe2 } from "lucide-react";

export default function TheoryOfChangeFlowchart({ state }: { state: AppState }) {
  const columns = [
    { title: "Activities", icon: <Settings className="w-5 h-5"/>, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30", items: state.activities.filter(Boolean), desc: "What you do" },
    { title: "Outputs", icon: <LayoutGrid className="w-5 h-5"/>, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", items: state.outputs.filter(Boolean), desc: "Direct products/services" },
    { title: "Outcomes", icon: <Target className="w-5 h-5"/>, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/30", items: state.outcomes.filter(Boolean), desc: "Changes in beneficiaries" },
    { title: "Impact", icon: <Globe2 className="w-5 h-5"/>, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", items: state.impact.filter(Boolean), desc: "Long-term systemic change" },
  ];

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[800px] grid grid-cols-4 gap-4 relative">
        {/* Connecting Arrows Background */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/20 -z-10 hidden md:block print:hidden" />
        
        {columns.map((col, idx) => (
          <div key={col.title} className="flex flex-col relative">
            <div className={`mb-4 flex flex-col items-center text-center p-3 rounded-xl border ${col.border} ${col.bg} print:border-gray-300 print:bg-white`}>
              <div className={`${col.color} mb-2 print:text-black`}>{col.icon}</div>
              <h4 className="font-bold text-sm tracking-wide uppercase print:text-black">{col.title}</h4>
              <span className="text-[10px] text-muted-foreground mt-1 print:text-gray-500">{col.desc}</span>
            </div>
            
            <div className="flex-1 space-y-3">
              {col.items.length === 0 ? (
                <div className="text-xs text-center text-muted-foreground py-4 italic border border-dashed border-border/30 rounded-lg">None specified</div>
              ) : (
                col.items.map((item, i) => (
                  <div key={i} className="glass-card p-3 rounded-lg text-sm border-l-2 print:bg-white print:border-gray-200 print:text-black" style={{ borderLeftColor: 'currentColor' }}>
                    {item}
                  </div>
                ))
              )}
            </div>

            {idx < columns.length - 1 && (
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 z-10 bg-background rounded-full print:hidden">
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
