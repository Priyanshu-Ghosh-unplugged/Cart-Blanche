import React from 'react';
import { Shield, Sparkles, CheckCircle2, Lock, ArrowRight, Zap } from 'lucide-react';

interface HeroMarqueeProps {
  onExplorePresets: () => void;
}

export const HeroMarquee: React.FC<HeroMarqueeProps> = ({ onExplorePresets }) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-6 border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          {/* Tagline Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wider uppercase shadow-lg shadow-purple-950/50">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>The Universal Autonomous Checkout for the Fragmented Web</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            One Goal. <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200 bg-clip-text text-transparent">Multi-Store Checkout.</span> Powered by Prava.
          </h1>

          {/* Body Description */}
          <p className="text-base sm:text-lg text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            CartBlanche extracts your Bill of Materials from any YouTube link, Reddit thread, or prompt. Then it spawns parallel headless agents to checkout across multiple online stores safely with strictly capped <strong className="text-white underline decoration-purple-500 underline-offset-4">Prava virtual cards</strong>.
          </p>

          {/* Quick Metrics Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
            <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Card Exposure</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Strictly Capped Spend Limits</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Parallel Multi-Tab Browser Execution</span>
            </div>
          </div>

        </div>
      </div>

      {/* Curvilinear Infinite Marquee Ribbon (Inspired by Reference Image aesthetic) */}
      <div className="mt-8 relative w-full overflow-hidden border-y border-purple-500/20 bg-purple-950/30 py-2.5 backdrop-blur-md">
        <div className="animate-marquee whitespace-nowrap flex items-center space-x-8 text-xs font-semibold uppercase tracking-widest text-purple-200/90">
          <span>❖ Autonomous Procurement Agent</span>
          <span>•</span>
          <span>🔒 Prava Single-Use Virtual Cards</span>
          <span>•</span>
          <span>⚡ Parallel Playwright Execution Engine</span>
          <span>•</span>
          <span>🛡️ 100% Fraud & Overspend Protected</span>
          <span>•</span>
          <span>❖ Universal Multi-Merchant Checkout</span>
          <span>•</span>
          <span>🔒 Prava Single-Use Virtual Cards</span>
          <span>•</span>
          <span>⚡ Parallel Playwright Execution Engine</span>
          <span>•</span>
          <span>🛡️ 100% Fraud & Overspend Protected</span>
        </div>
      </div>

    </div>
  );
};
