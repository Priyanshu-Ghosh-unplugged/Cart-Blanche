import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShieldCheck, Download, ExternalLink, RefreshCw, PackageCheck, Sparkles, CreditCard } from 'lucide-react';
import { BomItem, MerchantName } from '../types';

interface OrderConfirmationProps {
  scenarioTitle: string;
  bomItems: BomItem[];
  approvedLimit: number;
  totalPaid: number;
  onReset: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  scenarioTitle,
  bomItems,
  approvedLimit,
  totalPaid,
  onReset
}) => {
  // Fire celebration confetti when mounted
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti playback');
    }
  }, []);

  // Group items by merchant
  const merchantGroups = bomItems.reduce((acc, item) => {
    if (!acc[item.merchant]) {
      acc[item.merchant] = [];
    }
    acc[item.merchant].push(item);
    return acc;
  }, {} as Record<MerchantName, BomItem[]>);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-emerald-500/40 text-center space-y-4 relative overflow-hidden shadow-2xl shadow-emerald-950/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Autonomous Checkout Completed</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          All Orders Successfully Executed!
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          CartBlanche used single-use <strong className="text-white">Prava virtual cards</strong> to complete orders across <strong className="text-emerald-400">{Object.keys(merchantGroups).length} merchants</strong> simultaneously.
        </p>

        {/* Financial Protection Stats Pill */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
          <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl">
            <span className="text-slate-400">Total Authorized Cap: </span>
            <span className="text-white font-bold">${approvedLimit.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl">
            <span className="text-slate-400">Actual Spent: </span>
            <span className="text-emerald-400 font-bold">${totalPaid.toFixed(2)}</span>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl">
            <span className="text-slate-400">Card Leakage Risk: </span>
            <span className="text-purple-300 font-bold">$0.00 (Single-Use Auto-Burned)</span>
          </div>
        </div>
      </div>

      {/* Order Receipts Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
          <PackageCheck className="w-5 h-5 text-purple-400" />
          <span>Merchant Order Confirmation Screenshots ({Object.keys(merchantGroups).length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(merchantGroups).map(([merchant, items], idx) => {
            const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const orderNum = `ORD-${merchant.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

            return (
              <div
                key={merchant}
                className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4 flex flex-col justify-between shadow-lg"
              >
                <div className="space-y-3">
                  {/* Merchant Badge & Screenshot mockup */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-sm text-white">{merchant}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                      Confirmed
                    </span>
                  </div>

                  {/* Simulated Receipt Screenshot Frame */}
                  <div className="relative h-40 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>{orderNum}</span>
                      <span className="text-emerald-400">Paid with Prava</span>
                    </div>

                    <div className="text-center space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-white">Order Confirmed</p>
                      <p className="text-[10px] text-slate-400">{items.length} Items • Standard Shipping</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-900 pt-1 font-mono">
                      <span>Card: 4532 •••• 8821</span>
                      <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div className="space-y-2 text-xs">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Purchased Items:
                    </p>
                    {items.map((i) => (
                      <div key={i.id} className="flex justify-between text-slate-200 text-xs">
                        <span className="truncate max-w-[170px]">{i.title}</span>
                        <span className="font-bold text-white">${(i.price * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Est. Delivery:</span>
                  <span className="font-semibold text-slate-200">2-3 Business Days</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset & Start New Order */}
      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-purple-600/30 inline-flex items-center space-x-2 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Start Another Autonomous Procurement</span>
        </button>
      </div>

    </div>
  );
};
