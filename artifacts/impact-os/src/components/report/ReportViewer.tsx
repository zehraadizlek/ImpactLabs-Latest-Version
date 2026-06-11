import React from "react";
import { AppState, GeneratedReport } from "@/lib/state";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Users, FileText, Anchor, Globe, MoveRight, ChevronRight, Activity, Zap, Milestone } from "lucide-react";

export default function ReportViewer({ state, isGenerated }: { state: AppState, isGenerated: boolean }) {
  if (!isGenerated || !state.generatedReport) return null;
  const report: GeneratedReport = state.generatedReport;

  // Layout utilities
  const sectionClass = "report-section glass-card rounded-3xl p-8 md:p-12 mb-12 shadow-xl border-t border-t-white/10 relative overflow-hidden print:shadow-none print:p-0 print:rounded-none";
  const titleClass = "text-4xl md:text-5xl font-display font-bold tracking-tight mb-8 text-foreground print:text-black";
  const subheadingClass = "text-2xl font-display font-semibold mb-6 text-foreground print:text-black";

  // Recharts colors
  const COLORS = ['#3b82f6', '#0ea5e9', '#06b6d4', '#0284c7', '#2563eb'];

  return (
    <div className="space-y-16 mt-8 max-w-5xl mx-auto text-left relative z-10 animate-in fade-in duration-1000">
      
      {/* 1. Cover */}
      <div className={`${sectionClass} min-h-[70vh] flex flex-col justify-center text-center print-page-break`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none print:hidden" />
        
        {state.logo && (
          <div className="w-40 h-40 mx-auto mb-10 bg-white/5 rounded-3xl p-6 flex items-center justify-center border border-white/10 shadow-2xl print:border-none print:bg-transparent print:shadow-none print:p-0">
            <img src={state.logo} alt="Organization Logo" className="max-w-full max-h-full object-contain drop-shadow-lg" />
          </div>
        )}
        
        <div className="inline-flex px-5 py-2 rounded-full text-sm font-bold glass-card text-primary border-primary/30 mx-auto mb-8 uppercase tracking-widest print:border-gray-300 print:text-gray-600 print:bg-gray-100">
          Impact Report {state.reportingPeriod ? ` • ${state.reportingPeriod}` : ""}
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-gradient mb-8 leading-tight print:text-black">
          {state.orgName || "Organization"}
        </h1>

        {report.heroMetric && (
          <div className="mt-12 glass-card p-8 rounded-3xl max-w-2xl mx-auto border-t border-t-primary/50 shadow-[0_10px_40px_rgba(59,130,246,0.15)] print:border-t-2 print:border-gray-800 print:shadow-none">
            <div className="text-6xl md:text-8xl font-display font-black text-white mb-2 print:text-black">
              {report.heroMetric.value}
            </div>
            <div className="text-xl font-bold text-primary uppercase tracking-wider mb-3 print:text-gray-800">
              {report.heroMetric.label}
            </div>
            <p className="text-muted-foreground italic print:text-gray-600">
              {report.heroMetric.context}
            </p>
          </div>
        )}
      </div>

      {/* 2. Impact At A Glance */}
      <div className={`${sectionClass} print-page-break`}>
        <h2 className={titleClass}>Impact At A Glance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {report.glanceKpis.map((kpi, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl print-avoid-break print:border-gray-300 print:bg-gray-50">
              <div className="text-4xl font-display font-bold text-white mb-2 print:text-black">{kpi.value}</div>
              <div className="text-sm font-bold text-primary uppercase tracking-wider mb-2 print:text-gray-700">{kpi.label}</div>
              {kpi.change && <div className="text-xs text-muted-foreground bg-white/5 inline-block px-2 py-1 rounded print:bg-transparent print:p-0 print:text-gray-500">{kpi.change}</div>}
            </div>
          ))}
        </div>
        
        {report.achievementsTimeline.length > 0 && (
          <div className="mt-12 print-avoid-break">
            <h3 className={subheadingClass}>Key Milestones</h3>
            <div className="space-y-6">
              {report.achievementsTimeline.map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-32 shrink-0 text-sm font-bold text-primary pt-1 print:text-gray-800">{item.date}</div>
                  <div className="w-4 flex flex-col items-center">
                    <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary group-hover:bg-primary transition-colors print:bg-white print:border-gray-400" />
                    {i !== report.achievementsTimeline.length - 1 && <div className="w-px h-full bg-border/50 my-1 print:bg-gray-300" />}
                  </div>
                  <div className="pb-6 pt-0.5">
                    <h4 className="text-lg font-bold mb-1 print:text-black">{item.title}</h4>
                    <p className="text-muted-foreground print:text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Organization Overview */}
      <div className={`${sectionClass} print-page-break`}>
        <h2 className={titleClass}>Organization Overview</h2>
        <div className="grid md:grid-cols-2 gap-8 print-avoid-break">
          <div className="glass-card p-8 rounded-2xl print:border-gray-300">
            <div className="flex items-center gap-3 mb-4 text-primary print:text-gray-800">
              <Anchor className="w-6 h-6" />
              <h3 className="text-xl font-bold uppercase tracking-wide">Mission</h3>
            </div>
            <p className="text-lg text-foreground/90 leading-relaxed print:text-black">{report.overview.mission}</p>
          </div>
          <div className="glass-card p-8 rounded-2xl print:border-gray-300">
            <div className="flex items-center gap-3 mb-4 text-secondary print:text-gray-800">
              <Target className="w-6 h-6" />
              <h3 className="text-xl font-bold uppercase tracking-wide">Vision</h3>
            </div>
            <p className="text-lg text-foreground/90 leading-relaxed print:text-black">{report.overview.vision}</p>
          </div>
          <div className="glass-card p-8 rounded-2xl print:border-gray-300">
            <div className="flex items-center gap-3 mb-4 text-emerald-400 print:text-gray-800">
              <Activity className="w-6 h-6" />
              <h3 className="text-xl font-bold uppercase tracking-wide">The Problem</h3>
            </div>
            <p className="text-foreground/80 leading-relaxed print:text-black">{report.overview.problem}</p>
          </div>
          <div className="glass-card p-8 rounded-2xl print:border-gray-300">
            <div className="flex items-center gap-3 mb-4 text-amber-400 print:text-gray-800">
              <Users className="w-6 h-6" />
              <h3 className="text-xl font-bold uppercase tracking-wide">Target Beneficiaries</h3>
            </div>
            <p className="text-foreground/80 leading-relaxed print:text-black">{report.overview.targetBeneficiaries}</p>
          </div>
        </div>
      </div>

      {/* 4. Programs & Initiatives */}
      {report.programs && report.programs.length > 0 && (
        <div className={`${sectionClass} print-page-break`}>
          <h2 className={titleClass}>Programs & Initiatives</h2>
          <div className="space-y-12">
            {report.programs.map((prog, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl print-avoid-break print:border-gray-300">
                <h3 className="text-3xl font-display font-bold mb-3 text-white print:text-black">{prog.name}</h3>
                <p className="text-lg text-muted-foreground mb-8 print:text-gray-700">{prog.objective}</p>
                
                {prog.metrics && prog.metrics.length > 0 && (
                  <div className="flex gap-6 mb-8 pb-8 border-b border-white/10 print:border-gray-200">
                    {prog.metrics.map((m, mi) => (
                      <div key={mi}>
                        <div className="text-2xl font-bold text-primary print:text-black">{m.value}</div>
                        <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider print:text-gray-600">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-bold text-white mb-3 print:text-black">Activities</h4>
                    <ul className="space-y-2">
                      {prog.activities.map((act, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-foreground/80 print:text-gray-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" /> <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-3 print:text-black">Outputs</h4>
                    <ul className="space-y-2">
                      {prog.outputs.map((out, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-foreground/80 print:text-gray-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" /> <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-3 print:text-black">Outcomes</h4>
                    <ul className="space-y-2">
                      {prog.outcomes.map((out, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-foreground/80 print:text-gray-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5" /> <span>{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Beneficiary Impact */}
      <div className={`${sectionClass} print-page-break`}>
        <h2 className={titleClass}>Beneficiary Impact</h2>
        
        {report.beneficiaryImpact.profiles.length > 0 && (
          <div className="space-y-8 mb-16">
            {report.beneficiaryImpact.profiles.map((profile, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl border-l-4 border-l-secondary print-avoid-break print:border-gray-300 print:border-l-secondary">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-display font-bold text-white print:text-black">{profile.name}</h3>
                    <div className="text-secondary font-medium uppercase tracking-wider text-sm print:text-gray-600">{profile.group}</div>
                  </div>
                </div>
                
                <p className="text-lg leading-relaxed text-foreground/90 italic border-l-2 border-white/20 pl-6 my-6 print:text-black print:border-gray-300">
                  "{profile.quote}"
                </p>
                
                <p className="text-foreground/80 mb-8 print:text-gray-700 leading-relaxed">
                  {profile.story}
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 bg-black/20 p-6 rounded-2xl print:bg-gray-50 print:border print:border-gray-200">
                  <div>
                    <div className="text-xs uppercase font-bold text-muted-foreground mb-1 tracking-wider print:text-gray-500">Before</div>
                    <p className="text-sm font-medium print:text-gray-800">{profile.before}</p>
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-secondary mb-1 tracking-wider print:text-secondary">After</div>
                    <p className="text-sm font-medium text-white print:text-black">{profile.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {report.beneficiaryImpact.testimonials.length > 0 && (
          <div className="print-avoid-break">
            <h3 className={subheadingClass}>Testimonials</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {report.beneficiaryImpact.testimonials.map((test, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl print:border-gray-300">
                  <p className="text-foreground/90 italic mb-4 print:text-gray-800">"{test.quote}"</p>
                  <div className="font-bold text-white print:text-black">{test.author}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider print:text-gray-500">{test.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Impact Dashboard */}
      <div className={`${sectionClass} print-page-break`}>
        <h2 className={titleClass}>Impact Dashboard</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 print-avoid-break">
          {report.dashboard.metrics.map((m, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl text-center print:border-gray-300">
              <div className="text-3xl font-display font-bold text-white mb-1 print:text-black">
                {m.value}<span className="text-lg text-muted-foreground ml-1 print:text-gray-500">{m.unit}</span>
              </div>
              <div className="text-xs uppercase font-bold tracking-wider text-primary mb-2 print:text-gray-700">{m.label}</div>
              {m.change && <div className="text-xs text-emerald-400 print:text-gray-600">{m.change}</div>}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {report.dashboard.growthSeries.length > 0 && (
            <div className="glass-card p-6 rounded-3xl print-avoid-break print:border-gray-300">
              <h3 className="text-lg font-bold mb-6 print:text-black">Growth Over Time</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={report.dashboard.growthSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorGrowth)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {report.dashboard.distribution.length > 0 && (
            <div className="glass-card p-6 rounded-3xl print-avoid-break print:border-gray-300">
              <h3 className="text-lg font-bold mb-6 print:text-black">Impact Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={report.dashboard.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {report.dashboard.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {report.dashboard.distribution.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm print:text-black">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {report.dashboard.progressBars.length > 0 && (
            <div className="glass-card p-6 rounded-3xl print-avoid-break print:border-gray-300">
              <h3 className="text-lg font-bold mb-6 print:text-black">Goal Progress</h3>
              <div className="space-y-6">
                {report.dashboard.progressBars.map((pb, i) => {
                  const pct = pb.target > 0 ? Math.min(100, Math.round((pb.current / pb.target) * 100)) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2 print:text-black">
                        <span className="font-bold">{pb.label}</span>
                        <span className="text-muted-foreground print:text-gray-600">
                          {pb.current.toLocaleString()} / {pb.target.toLocaleString()} {pb.unit}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2.5 print:bg-gray-200">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {report.dashboard.geographic.length > 0 && (
            <div className="glass-card p-6 rounded-3xl print-avoid-break print:border-gray-300">
              <h3 className="text-lg font-bold mb-6 print:text-black">Geographic Reach</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.dashboard.geographic} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="region" type="category" stroke="#e2e8f0" fontSize={12} tickLine={false} axisLine={false} width={80} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. Theory of Change */}
      <div className={`${sectionClass} print-page-break`}>
        <h2 className={titleClass}>Theory of Change</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 print-avoid-break">
          {[
            { title: "Inputs", items: report.theoryOfChange.inputs, icon: <Zap className="w-5 h-5"/>, color: "text-slate-400" },
            { title: "Activities", items: report.theoryOfChange.activities, icon: <Activity className="w-5 h-5"/>, color: "text-blue-400" },
            { title: "Outputs", items: report.theoryOfChange.outputs, icon: <FileText className="w-5 h-5"/>, color: "text-cyan-400" },
            { title: "Outcomes", items: report.theoryOfChange.outcomes, icon: <Target className="w-5 h-5"/>, color: "text-teal-400" },
            { title: "Impact", items: report.theoryOfChange.longTermImpact, icon: <Globe className="w-5 h-5"/>, color: "text-emerald-400" },
          ].map((col, i) => (
            <div key={i} className="flex flex-col relative print:border-gray-300">
              <div className="glass-card p-4 rounded-t-2xl border-b-0 flex flex-col items-center text-center pb-6 print:border-gray-300">
                <div className={`${col.color} mb-2`}>{col.icon}</div>
                <h4 className="font-bold uppercase tracking-wider text-xs print:text-black">{col.title}</h4>
              </div>
              <div className="glass-card p-4 rounded-b-2xl flex-1 space-y-3 pt-6 print:border-gray-300 print:border-t-0">
                {col.items.map((item, idx) => (
                  <div key={idx} className="bg-white/5 p-3 rounded-lg text-sm border-l-2 print:bg-white print:border print:border-gray-200 print:text-black" style={{ borderLeftColor: 'currentColor' }}>
                    {item}
                  </div>
                ))}
                {col.items.length === 0 && <div className="text-xs text-muted-foreground text-center italic py-2">—</div>}
              </div>
              {i < 4 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-background rounded-full items-center justify-center text-muted-foreground print:hidden">
                  <MoveRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 8. Measurement Framework */}
      <div className={`${sectionClass} print-page-break`}>
        <h2 className={titleClass}>Measurement Framework</h2>
        <div className="overflow-x-auto print-avoid-break">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-primary/30 print:border-gray-400">
                <th className="py-4 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Metric / Indicator</th>
                <th className="py-4 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Baseline</th>
                <th className="py-4 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Target</th>
                <th className="py-4 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Current</th>
                <th className="py-4 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Data Source</th>
                <th className="py-4 px-4 font-bold text-muted-foreground uppercase tracking-wider text-xs print:text-gray-700">Freq.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10 print:divide-gray-200">
              {report.measurementFramework.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors print:hover:bg-transparent print:text-black">
                  <td className="py-4 px-4 font-medium max-w-[200px]">{row.metric}</td>
                  <td className="py-4 px-4">{row.baseline || "—"}</td>
                  <td className="py-4 px-4 text-primary font-bold">{row.target || "—"}</td>
                  <td className="py-4 px-4 font-semibold">{row.current || "—"}</td>
                  <td className="py-4 px-4 text-xs text-muted-foreground print:text-gray-600">{row.dataSource || "—"}</td>
                  <td className="py-4 px-4 text-xs text-muted-foreground print:text-gray-600">{row.frequency || "—"}</td>
                </tr>
              ))}
              {report.measurementFramework.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground italic">No metrics defined in framework.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. Challenges & Learnings */}
      <div className={`${sectionClass} print-page-break`}>
        <h2 className={titleClass}>Challenges & Learnings</h2>
        
        {report.challengesLearnings.challenges.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-10 print-avoid-break">
            {report.challengesLearnings.challenges.map((c, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl print:border-gray-300">
                <h4 className="font-bold text-lg mb-3 text-white print:text-black">{c.challenge}</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs uppercase font-bold text-primary tracking-wider print:text-gray-700 block mb-1">Lesson Learned</span>
                    <p className="text-sm text-foreground/80 print:text-black">{c.lesson}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-secondary tracking-wider print:text-gray-700 block mb-1">Strategic Adaptation</span>
                    <p className="text-sm text-foreground/80 print:text-black">{c.adaptation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 print-avoid-break">
          {report.challengesLearnings.risks.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 print:text-black"><Target className="w-5 h-5 text-amber-400"/> Ongoing Risks</h3>
              <ul className="space-y-2">
                {report.challengesLearnings.risks.map((r, i) => (
                  <li key={i} className="flex gap-3 text-foreground/90 print:text-black">
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.challengesLearnings.futureImprovements.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 print:text-black"><Activity className="w-5 h-5 text-emerald-400"/> Future Improvements</h3>
              <ul className="space-y-2">
                {report.challengesLearnings.futureImprovements.map((r, i) => (
                  <li key={i} className="flex gap-3 text-foreground/90 print:text-black">
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 10. Future Commitments */}
      <div className={`${sectionClass} print-page-break`}>
        <h2 className={titleClass}>Looking Ahead</h2>
        
        <div className="glass-card p-8 rounded-3xl mb-10 bg-gradient-to-br from-primary/10 to-transparent border-t-primary/30 print-avoid-break print:bg-none print:border-gray-300">
          <h3 className="text-xs uppercase font-bold tracking-widest text-primary mb-3 print:text-gray-600">Long-Term Vision</h3>
          <p className="text-2xl font-display font-semibold leading-relaxed print:text-black">{report.futureCommitments.longTermVision}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 print-avoid-break">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 print:text-black"><Milestone className="w-5 h-5 text-primary"/> Strategic Roadmap</h3>
            <div className="space-y-4">
              {report.futureCommitments.roadmap.map((m, i) => (
                <div key={i} className="flex gap-4 glass-card p-4 rounded-xl print:border-gray-200">
                  <div className="w-24 shrink-0 font-bold text-primary text-sm pt-0.5 print:text-gray-800">{m.period}</div>
                  <div className="text-foreground/90 print:text-black">{m.goal}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold mb-4 print:text-black">Next Year Goals</h3>
              <ul className="space-y-2">
                {report.futureCommitments.nextYearGoals.map((g, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground/80 print:text-black">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0 mt-1.5" /> <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 print:text-black">Expansion Plans</h3>
              <ul className="space-y-2">
                {report.futureCommitments.expansionPlans.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground/80 print:text-black">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" /> <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 11. Appendix */}
      <div className={`${sectionClass} print-page-break opacity-80 hover:opacity-100 transition-opacity`}>
        <h2 className="text-3xl font-display font-bold tracking-tight mb-8 text-foreground print:text-black">Appendix</h2>
        
        <div className="grid md:grid-cols-2 gap-12 print-avoid-break">
          <div>
            <h3 className="font-bold uppercase text-xs tracking-widest text-muted-foreground mb-4 print:text-gray-600">Methodology</h3>
            <p className="text-sm text-foreground/80 leading-relaxed mb-8 print:text-black">{report.appendix.methodology}</p>
            
            <h3 className="font-bold uppercase text-xs tracking-widest text-muted-foreground mb-4 print:text-gray-600">Data Sources</h3>
            <ul className="list-disc pl-4 text-sm text-foreground/80 space-y-1 print:text-black">
              {report.appendix.dataSources.map((ds, i) => <li key={i}>{ds}</li>)}
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold uppercase text-xs tracking-widest text-muted-foreground mb-4 print:text-gray-600">Organization Profile</h3>
            <div className="glass-card p-6 rounded-xl space-y-3 text-sm print:border-gray-200">
              <div className="flex justify-between border-b border-white/5 pb-2 print:border-gray-200 print:text-black">
                <span className="text-muted-foreground print:text-gray-600">Type</span> <strong>{state.orgType || "—"}</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 print:border-gray-200 print:text-black">
                <span className="text-muted-foreground print:text-gray-600">Industry</span> <strong>{state.industry || "—"}</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 print:border-gray-200 print:text-black">
                <span className="text-muted-foreground print:text-gray-600">Location</span> <strong>{state.country || "—"}</strong>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 print:border-gray-200 print:text-black">
                <span className="text-muted-foreground print:text-gray-600">Website</span> <strong>{state.website || "—"}</strong>
              </div>
              <div className="flex justify-between print:text-black">
                <span className="text-muted-foreground print:text-gray-600">Period</span> <strong>{state.reportingPeriod || "—"}</strong>
              </div>
            </div>

            {report.appendix.reportingNotes && (
              <div className="mt-6 pt-6 border-t border-border/20 print:border-gray-200">
                <h3 className="font-bold uppercase text-xs tracking-widest text-muted-foreground mb-2 print:text-gray-600">Reporting Notes</h3>
                <p className="text-xs text-muted-foreground italic print:text-gray-500">{report.appendix.reportingNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}