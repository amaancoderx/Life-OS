
import React, { useState } from 'react';
import { parseUnifiedInput } from '../services/gemini';
import { IngestedItem, IndustryMode } from '../types';

interface GlobalCaptureProps {
  onIngest: (item: IngestedItem) => void;
  activeMode: IndustryMode;
}

const GlobalCapture: React.FC<GlobalCaptureProps> = ({ onIngest, activeMode }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const placeholders = {
    [IndustryMode.ACADEMIC]: "Enter a task or deadline...",
    [IndustryMode.ECOMMERCE]: "Log a sale or inventory change...",
    [IndustryMode.CREATIVE]: "Jot down an idea or inspiration...",
    [IndustryMode.GENERAL]: "Add anything to your day..."
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const parsed = await parseUnifiedInput(input, activeMode);
      const newItem: IngestedItem = {
        id: crypto.randomUUID(),
        type: parsed.type || 'NOTE',
        content: parsed.content || input,
        timestamp: Date.now(),
        mode: activeMode,
        metadata: parsed.metadata
      };
      onIngest(newItem);
      setInput('');
    } catch (error) {
      console.error('Adding failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
      <form 
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex items-center p-2 backdrop-blur-xl"
      >
        <div className="pl-4 pr-2">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-blue-400 animate-pulse' : 'bg-slate-700'}`}></div>
        </div>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={loading ? "Processing..." : placeholders[activeMode]}
          className="flex-1 bg-transparent border-none outline-none text-sm py-4 text-white placeholder:text-slate-600"
          autoFocus
        />
        <button 
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-8 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-lg"
        >
          {loading ? 'Adding' : 'Add Info'}
        </button>
      </form>
    </div>
  );
};

export default GlobalCapture;
