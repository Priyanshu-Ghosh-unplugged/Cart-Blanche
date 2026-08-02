import React, { useState } from 'react';
import { Search, Sparkles, Link as LinkIcon, Cpu, Wrench, Tv, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { PRESET_SCENARIOS } from '../data/presetScenarios';

interface GoalInputSectionProps {
  onAnalyzeGoal: (input: string) => void;
  isAnalyzing: boolean;
  activeScenarioId?: string;
}

export const GoalInputSection: React.FC<GoalInputSectionProps> = ({
  onAnalyzeGoal,
  isAnalyzing,
  activeScenarioId
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isAnalyzing) return;
    onAnalyzeGoal(inputValue);
  };

  const handleSelectPreset = (scenarioId: string) => {
    const target = PRESET_SCENARIOS.find((s) => s.id === scenarioId);
    if (target) {
      setInputValue(target.inputUrlOrPrompt);
      onAnalyzeGoal(target.inputUrlOrPrompt);
    }
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tv': return <Tv className="w-4 h-4 text-purple-400" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-sky-400" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-red-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      default: return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 relative z-20">
      
      {/* Input Box Glass Panel */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-800/80">
        
        <form onSubmit={handleSubmit} className="relative space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Input Field */}
            <div className="relative w-full flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste YouTube tutorial URL, Reddit thread, or prompt ('Buy parts for Smart Mirror DIY')..."
                disabled={isAnalyzing}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-inner disabled:opacity-50"
              />
              {isAnalyzing && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isAnalyzing}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting BOM...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse & Extract BOM</span>
                </>
              )}
            </button>

          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quick Launch Procurement Projects:
              </span>
              <span className="text-[11px] text-purple-400 font-medium">
                OpenAI gpt-4o API Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESET_SCENARIOS.map((scenario) => {
                const isActive = activeScenarioId === scenario.id;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => handleSelectPreset(scenario.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-purple-950/70 border-purple-500/80 ring-1 ring-purple-500'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                        {getPresetIcon(scenario.iconName)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-100 truncate">
                          {scenario.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {scenario.merchantCount} Merchants • ${scenario.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                  </button>
                );
              })}
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
