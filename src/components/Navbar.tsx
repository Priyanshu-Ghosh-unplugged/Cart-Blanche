import React, { useState } from 'react';
import { ShieldCheck, Zap, RefreshCw, Volume2, VolumeX, Sparkles, CreditCard, Terminal } from 'lucide-react';
import { PravaTransactionDashboard } from './PravaTransactionDashboard';

interface NavbarProps {
  onReset: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeScenarioId?: string;
  onSelectScenario: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReset,
  soundEnabled,
  onToggleSound,
  activeScenarioId,
  onSelectScenario
}) => {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-purple-400 p-[1px] shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400 fill-purple-400/20 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
                  CartBlanche
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold tracking-wide">
                  OmniCart
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Universal Autonomous Procurement Engine
              </p>
            </div>
          </div>

          {/* Prava Security Status Chip & Dashboard Trigger */}
          <button
            onClick={() => setIsDashboardOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Prava Transactions (API Audit)</span>
            <Terminal className="w-3.5 h-3.5 text-purple-400 ml-1" />
          </button>

          {/* Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Scenario Selector Pill */}
            <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 space-x-1">
              <button
                onClick={() => onSelectScenario('smart-mirror')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  activeScenarioId === 'smart-mirror'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Smart Mirror
              </button>
              <button
                onClick={() => onSelectScenario('lg-washer-fix')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  activeScenarioId === 'lg-washer-fix'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                LG Washer Repair
              </button>
              <button
                onClick={() => onSelectScenario('gaming-pc-rig')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  activeScenarioId === 'gaming-pc-rig'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Custom PC
              </button>
            </div>

            {/* Audio FX Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Disable Audio FX' : 'Enable Audio FX'}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Reset App State */}
            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">New Goal</span>
            </button>
          </div>

        </div>
      </header>

      {/* Live Prava Transactions Audit Dashboard */}
      <PravaTransactionDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
    </>
  );
};
