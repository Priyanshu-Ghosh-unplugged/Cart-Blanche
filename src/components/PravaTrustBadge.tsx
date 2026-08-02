import React from 'react';
import { ShieldCheck, Lock, CreditCard, AlertOctagon, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';
import { PravaService } from '../services/pravaService';

export const PravaTrustBadge: React.FC = () => {
  const metrics = PravaService.getSecurityMetrics();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/80">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-purple-500/20 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>The Trust Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Why Prava Powers CartBlanche
          </h2>

          <p className="text-sm text-slate-300">
            Handing an AI agent your real credit card across 5 unvetted websites is a security nightmare. Prava isolates every transaction with single-use, capped virtual cards.
          </p>
        </div>

        {/* Comparison Cards: Traditional AI vs CartBlanche + Prava */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Traditional Risk */}
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertOctagon className="w-6 h-6" />
              <h3 className="font-bold text-lg text-white">Traditional Agent Risk</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Exposes primary credit card number to unknown third-party merchants.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Zero spend limit controls if agent hallucinates quantity or cart total.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Subscribed to unexpected recurring charges or hidden merchant fees.</span>
              </li>
            </ul>
          </div>

          {/* CartBlanche + Prava Solution */}
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
            <div className="flex items-center space-x-3 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-bold text-lg text-white">CartBlanche + Prava Security</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Single-use Prava virtual cards auto-burn immediately after checkout.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strictly user-approved spending cap prevents any overcharging.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Merchant-locked tokens ensure cards cannot be used on other domains.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Security Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Encryption Standard</p>
            <p className="text-sm font-bold text-white mt-1">256-Bit TLS 1.3</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Card Network</p>
            <p className="text-sm font-bold text-white mt-1">Visa Direct Virtual</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">PCI-DSS Status</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">Level 1 Zero-Leak</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Card Longevity</p>
            <p className="text-sm font-bold text-purple-300 mt-1">24h Auto-Burn</p>
          </div>
        </div>

      </div>
    </div>
  );
};
