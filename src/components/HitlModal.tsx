import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

interface HitlModalProps {
  isOpen: boolean;
  message: string;
  onResolve: (userInput?: string) => void;
}

export const HitlModal: React.FC<HitlModalProps> = ({ isOpen, message, onResolve }) => {
  const [zipInput, setZipInput] = useState('90210');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onResolve(zipInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl shadow-amber-950/50 space-y-6">
        
        {/* Header Icon */}
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[11px] font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Human-in-the-Loop Active</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">
              Agent Assistance Required
            </h3>
          </div>
        </div>

        {/* Message Content */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Web Automation Guardrail
          </p>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* User Quick Input */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Billing ZIP / Postal Code Confirmation:
          </label>
          <input
            type="text"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Resume Autonomous Agent</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

      </div>
    </div>
  );
};
