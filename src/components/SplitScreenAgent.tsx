import React, { useState, useEffect } from 'react';
import { BrowserTabState, ExecutionStep, MerchantName, PravaCard } from '../types';
import {
  Globe,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  ShoppingCart,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Zap,
  Sliders,
  UserCheck,
  Bot
} from 'lucide-react';

interface SplitScreenAgentProps {
  tabs: BrowserTabState[];
  onUpdateTabs: (updatedTabs: BrowserTabState[]) => void;
  onTriggerHitl: (message: string) => void;
  onCompleteAllOrders: () => void;
}

export const SplitScreenAgent: React.FC<SplitScreenAgentProps> = ({
  tabs,
  onUpdateTabs,
  onTriggerHitl,
  onCompleteAllOrders
}) => {
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.tabId || 'tab_1');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Guardrail Mode Toggle: Fully Autonomous (Zero Pauses) vs Human-in-the-Loop Guardrail
  const [isFullyAutonomous, setIsFullyAutonomous] = useState<boolean>(true);

  // Simulation execution tick engine
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      let allFinished = true;
      let hitlTriggered = false;

      const newTabs = tabs.map((tab) => {
        if (tab.status === 'completed' || tab.status === 'paused') {
          if (tab.status !== 'completed') allFinished = false;
          return tab;
        }

        allFinished = false;

        const nextStepIdx = tab.currentStepIndex + 1;

        // Check if HITL guardrail is enabled and step requires user verification
        if (!isFullyAutonomous && tab.merchantName === 'Adafruit' && nextStepIdx === 2 && !hitlTriggered) {
          hitlTriggered = true;
          onTriggerHitl('Adafruit checkout requires confirming your shipping ZIP code (90210). Confirm to authorize agent autofill?');
          return {
            ...tab,
            status: 'paused' as const,
            steps: tab.steps.map((s, idx) =>
              idx === 2 ? { ...s, status: 'hitl_paused' as const } : s
            )
          };
        }

        if (nextStepIdx < tab.steps.length) {
          const updatedSteps = tab.steps.map((s, idx) => {
            if (idx < nextStepIdx) return { ...s, status: 'completed' as const };
            if (idx === nextStepIdx) return { ...s, status: 'in_progress' as const };
            return s;
          });

          const currentStep = updatedSteps[nextStepIdx];
          const logMsg = `[${tab.merchantName}] ${currentStep.logMessage}`;
          setLogs((prev) => [logMsg, ...prev.slice(0, 19)]);

          return {
            ...tab,
            status: 'running' as const,
            currentStepIndex: nextStepIdx,
            steps: updatedSteps
          };
        } else {
          // Completed all steps in this tab
          const completedSteps = tab.steps.map((s) => ({ ...s, status: 'completed' as const }));
          const logMsg = `[${tab.merchantName}] ✅ Order checkout completed successfully with Prava card!`;
          setLogs((prev) => [logMsg, ...prev.slice(0, 19)]);

          return {
            ...tab,
            status: 'completed' as const,
            currentStepIndex: tab.steps.length - 1,
            steps: completedSteps
          };
        }
      });

      onUpdateTabs(newTabs);

      if (allFinished && tabs.every((t) => t.status === 'completed')) {
        setIsPlaying(false);
        setTimeout(() => {
          onCompleteAllOrders();
        }, 1000);
      }
    }, 1500 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, isFullyAutonomous, tabs, onUpdateTabs, onTriggerHitl, onCompleteAllOrders]);

  const activeTab = tabs.find((t) => t.tabId === activeTabId) || tabs[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-base sm:text-lg flex items-center space-x-2">
              <span>Parallel Multi-Store Agent Engine</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                {tabs.filter((t) => t.status === 'completed').length} / {tabs.length} Completed
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous Playwright web-driver navigating {tabs.length} stores simultaneously with Prava card injection.
            </p>
          </div>
        </div>

        {/* Playback Controls, Autonomous Toggle & Speed Slider */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Autonomous Mode Switch */}
          <button
            onClick={() => setIsFullyAutonomous(!isFullyAutonomous)}
            title={isFullyAutonomous ? 'Switch to Human-in-the-Loop Guardrail Mode' : 'Switch to 100% Fully Autonomous Mode'}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isFullyAutonomous
                ? 'bg-purple-950/80 border-purple-500/60 text-purple-300 shadow-sm'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-300'
            }`}
          >
            {isFullyAutonomous ? (
              <>
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>100% Fully Autonomous</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>HITL Guardrail Active</span>
              </>
            )}
          </button>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex items-center space-x-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 2 : 1)}
              className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              {speedMultiplier}x Speed
            </button>
          </div>
        </div>

      </div>

      {/* Split Screen 3-Browser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {tabs.map((tab) => {
          const isSelected = tab.tabId === activeTabId;
          const currentStep = tab.steps[tab.currentStepIndex];

          return (
            <div
              key={tab.tabId}
              onClick={() => setActiveTabId(tab.tabId)}
              className={`glass-panel rounded-2xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-purple-500/80 ring-2 ring-purple-500/50 shadow-xl shadow-purple-950/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Browser Address Bar Header */}
              <div className="bg-slate-900/90 border-b border-slate-800 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-bold text-white flex items-center space-x-1.5 ml-1">
                      <span>{tab.merchantName}</span>
                    </span>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                    tab.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : tab.status === 'paused'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse'
                  }`}>
                    {tab.status}
                  </span>
                </div>

                {/* Simulated URL Bar */}
                <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-400 font-mono border border-slate-800 truncate">
                  <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{tab.currentUrl}</span>
                </div>
              </div>

              {/* Live Web Canvas Frame Simulation */}
              <div className="relative h-64 bg-slate-950 p-4 flex flex-col justify-between overflow-hidden">
                
                {/* Scanning Beam (Active execution feedback) */}
                {tab.status === 'running' && (
                  <div className="animate-scan-beam" />
                )}

                {/* Active Action Display Overlay */}
                <div className="space-y-3 relative z-10">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-purple-400 font-semibold uppercase tracking-wider">
                        Step {tab.currentStepIndex + 1} of {tab.steps.length}
                      </span>
                      {currentStep?.activeSelector && (
                        <code className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-amber-300">
                          {currentStep.activeSelector}
                        </code>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white">
                      {currentStep?.title}
                    </p>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {currentStep?.logMessage}
                    </p>
                  </div>
                </div>

                {/* Prava Card Injection Floating Badge */}
                {currentStep?.actionType === 'inject_prava_card' && (
                  <div className="relative z-10 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-bounce">
                    <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono">Injecting Prava Card: 4622 •••• •••• 2416</span>
                  </div>
                )}

                {/* Step Indicators */}
                <div className="relative z-10 pt-2 border-t border-slate-900 flex justify-between">
                  {tab.steps.map((s, idx) => (
                    <div
                      key={s.stepId}
                      title={s.title}
                      className={`h-1.5 flex-1 rounded-full mx-0.5 transition-all ${
                        s.status === 'completed'
                          ? 'bg-emerald-400'
                          : s.status === 'in_progress'
                          ? 'bg-purple-500 animate-pulse'
                          : s.status === 'hitl_paused'
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

              </div>

              {/* Card Footer Summary */}
              <div className="bg-slate-900/60 p-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Merchant Total:</span>
                <span className="font-bold text-white">${tab.cartTotal.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Real-Time Action Log Stream */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Agentic Orchestration Live Console</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Stream: Live WebSockets</span>
        </div>

        <div className="h-32 overflow-y-auto font-mono text-xs space-y-1 pr-2 text-slate-300">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center space-x-2">
              <span className="text-purple-500 text-[10px]">›</span>
              <span className={log.includes('✅') ? 'text-emerald-400 font-bold' : log.includes('Prava') ? 'text-purple-300' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-slate-500 italic">Initializing Playwright virtual browser workers...</p>
          )}
        </div>
      </div>

    </div>
  );
};
