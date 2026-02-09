
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EnginePanel from './components/EnginePanel';
import VoiceDiagnostic from './components/VoiceDiagnostic';
import Dashboard from './components/Dashboard';
import GlobalCapture from './components/GlobalCapture';
import Visualizer from './components/Visualizer';
import { AppSection, IngestedItem, IndustryMode } from './types';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.DASHBOARD);
  const [activeMode, setActiveMode] = useState<IndustryMode>(IndustryMode.GENERAL);
  const [items, setItems] = useState<IngestedItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('LIFE_OS_STORE');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Storage error", e);
      }
    }
    const savedMode = localStorage.getItem('LIFE_OS_MODE');
    if (savedMode) setActiveMode(savedMode as IndustryMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('LIFE_OS_STORE', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('LIFE_OS_MODE', activeMode);
  }, [activeMode]);

  const handleIngest = (newItem: IngestedItem) => {
    setItems(prev => [newItem, ...prev]);
    setActiveSection(AppSection.DASHBOARD);
  };

  const renderSection = () => {
    switch (activeSection) {
      case AppSection.DASHBOARD:
        return <Dashboard items={items} activeMode={activeMode} />;
      case AppSection.AGENT:
        return <EnginePanel />;
      case AppSection.VISUALIZER:
        return <Visualizer />;
      case AppSection.VOICE_INTERFACE:
        return <VoiceDiagnostic />;
      default:
        return <Dashboard items={items} activeMode={activeMode} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative text-slate-100">
      <Header 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />
      
      <main className="flex-1 w-full max-w-6xl mx-auto py-12 px-6 pb-32">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
               Agent: Life OS v3.0.0 Online
             </span>
          </div>
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
             Engine: Gemini 3 Pro
          </div>
        </div>

        {renderSection()}
      </main>

      <GlobalCapture onIngest={handleIngest} activeMode={activeMode} />

      <footer className="py-12 px-6 text-center border-t border-white/5 bg-slate-950/50 mt-10">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          LIFE OS // Gemini 3 Hackathon Entry // 2025
        </p>
      </footer>
    </div>
  );
};

export default App;
