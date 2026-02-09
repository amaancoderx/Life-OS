
import React from 'react';
import { AppSection, IndustryMode } from '../types';

interface HeaderProps {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  activeMode: IndustryMode;
  setActiveMode: (mode: IndustryMode) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, activeMode, setActiveMode }) => {
  const sectionLabels: Record<AppSection, string> = {
    [AppSection.DASHBOARD]: 'Day View',
    [AppSection.AGENT]: 'Strategist',
    [AppSection.VISUALIZER]: 'Visualizer',
    [AppSection.VOICE_INTERFACE]: 'Talk',
  };

  return (
    <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm shadow-lg shadow-blue-500/20">L</div>
          LIFE <span className="text-blue-400">OS</span>
        </div>
        
        <div className="flex gap-2 bg-slate-950/80 p-1 rounded-lg border border-white/5">
          {Object.values(IndustryMode).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded-md ${
                activeMode === m
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      
      <nav className="flex gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0">
        {Object.keys(AppSection).map((key) => {
          const section = AppSection[key as keyof typeof AppSection];
          return (
            <button
              key={key}
              onClick={() => setActiveSection(section)}
              className={`px-3 py-1 text-xs md:text-sm font-semibold transition-all rounded-lg whitespace-nowrap ${
                activeSection === section
                  ? 'text-blue-400 bg-blue-400/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sectionLabels[section]}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default Header;
