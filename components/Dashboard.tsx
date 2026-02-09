
import React, { useState, useEffect, useMemo } from 'react';
import { IngestedItem, IndustryMode, DailyBrief } from '../types';
import { generateDailyBrief } from '../services/gemini';

interface DashboardProps {
  items: IngestedItem[];
  activeMode: IndustryMode;
}

const Dashboard: React.FC<DashboardProps> = ({ items, activeMode }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [brief, setBrief] = useState<DailyBrief | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBrief = async () => {
      try {
        const data = await generateDailyBrief(items, activeMode);
        setBrief(data);
      } catch (e) {
        console.error("Plan update failed", e);
      }
    };
    if (items.length > 0) fetchBrief();
  }, [items, activeMode]);

  const statusLabel = useMemo(() => {
    const hours = currentTime.getHours();
    if (hours >= 8 && hours < 18) return 'Active Day';
    if (hours >= 18 && hours < 23) return 'Evening Reflection';
    return 'Resting';
  }, [currentTime]);

  const filteredItems = useMemo(() => 
    items.filter(i => i.mode === activeMode || i.mode === IndustryMode.GENERAL), 
  [items, activeMode]);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Daily View</h1>
          <p className="text-slate-400 text-sm mt-1">Current Status: <span className="text-blue-400 font-bold">{statusLabel}</span></p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-light text-slate-300">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Today's Plan</h3>
          <ul className="space-y-3">
            {brief?.schedule.length ? brief.schedule.map((s, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> {s}
              </li>
            )) : <li className="text-sm italic text-slate-600">No tasks logged yet.</li>}
          </ul>
        </div>
        
        <div className="bg-blue-600 p-6 rounded-2xl shadow-xl shadow-blue-900/30 flex flex-col justify-center">
          <h3 className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-4">Main Focus</h3>
          <p className="text-2xl font-bold text-white leading-tight">
            {brief?.bigWin || "Add info below to define your goal."}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Helpful Tip</h3>
          <p className="text-sm text-slate-300 italic leading-relaxed">
            "{brief?.creativeTip || "Stay focused on one thing at a time for better results."}"
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <h2 className="text-xl font-bold text-white">Recent Updates</h2>
        {filteredItems.length === 0 ? (
          <div className="p-16 text-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600">
            Everything is quiet. Use the input below to add notes or tasks.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.slice(0, 9).map(item => (
              <div key={item.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-950 text-blue-400 rounded-md border border-blue-900 uppercase">
                    {item.type}
                  </span>
                  <span className="text-[10px] text-slate-600">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-sm text-slate-200">{item.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
