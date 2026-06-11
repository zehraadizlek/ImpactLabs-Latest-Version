import React from "react";
import { ProgressMetrics } from "@/lib/state";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ProgressCharts({ metrics }: { metrics: ProgressMetrics }) {
  const { beneficiariesReached, partnershipsFormed, projectsLaunched, impactGrowth } = metrics;

  const statCards = [
    { label: "Beneficiaries Reached", value: beneficiariesReached, format: "number" },
    { label: "Partnerships Formed", value: partnershipsFormed, format: "number" },
    { label: "Projects Launched", value: projectsLaunched, format: "number" },
  ];

  const barData = statCards.map(s => ({
    name: s.label.split(' ')[0], // short name
    value: s.value
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-xl border-t-4 border-t-primary text-center print:border-gray-300 print:bg-gray-50">
            <div className="text-4xl font-bold text-gradient mb-2 print:text-black">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider print:text-gray-600">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {impactGrowth && impactGrowth.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6 rounded-xl print:border-gray-200">
            <h4 className="font-bold text-lg mb-6 print:text-black">Impact Growth Trajectory</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={impactGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.toLocaleString()} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1530', borderColor: 'rgba(59,130,246,0.3)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl print:border-gray-200 hidden md:block">
            <h4 className="font-bold text-lg mb-6 print:text-black">Key Metrics Overview</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1530', borderColor: 'rgba(59,130,246,0.3)', borderRadius: '8px' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
