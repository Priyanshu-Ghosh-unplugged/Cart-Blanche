import React from 'react';
import { BomItem, MerchantName } from '../types';
import { ShoppingCart, ShieldCheck, Store, ArrowRight, ExternalLink, Check, Info } from 'lucide-react';

interface BomExtractorCardProps {
  scenarioTitle: string;
  description: string;
  bomItems: BomItem[];
  totalAmount: number;
  suggestedLimit: number;
  merchantCount: number;
  onOpenPravaApproval: () => void;
}

export const BomExtractorCard: React.FC<BomExtractorCardProps> = ({
  scenarioTitle,
  description,
  bomItems,
  totalAmount,
  suggestedLimit,
  merchantCount,
  onOpenPravaApproval
}) => {
  // Group items by merchant
  const merchantGroups = bomItems.reduce((acc, item) => {
    if (!acc[item.merchant]) {
      acc[item.merchant] = [];
    }
    acc[item.merchant].push(item);
    return acc;
  }, {} as Record<MerchantName, BomItem[]>);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="glass-panel rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold uppercase tracking-wider">
                OpenAI Extracted BOM
              </span>
              <span className="text-xs text-slate-400">
                {bomItems.length} Total Parts Found Across {merchantCount} Stores
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              {scenarioTitle}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {description}
            </p>
          </div>

          {/* Price Overview Pill */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center space-x-4 shrink-0">
            <div>
              <p className="text-xs text-slate-400 font-medium">Estimated Order Total</p>
              <p className="text-2xl font-black text-white">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div>
              <p className="text-xs text-purple-400 font-medium">Suggested Prava Cap</p>
              <p className="text-xl font-bold text-purple-300">${suggestedLimit.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Merchant Item Breakdown Groups */}
        <div className="space-y-6">
          {Object.entries(merchantGroups).map(([merchant, items]) => {
            const merchantTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const merchantColor = items[0].merchantColor || '#7C3AED';

            return (
              <div
                key={merchant}
                className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 space-y-4 overflow-hidden"
              >
                {/* Merchant Subheader */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow"
                      style={{ backgroundColor: merchantColor }}
                    >
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white flex items-center space-x-2">
                        <span>{merchant}</span>
                        <span className="text-xs font-normal text-slate-400">
                          ({items.length} {items.length === 1 ? 'item' : 'items'})
                        </span>
                      </h3>
                      <p className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Ready for Prava Virtual Card Checkout</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Store Subtotal: </span>
                    <span className="text-base font-bold text-white">${merchantTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="divide-y divide-slate-800/50">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-950"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-100 hover:text-purple-300 transition-colors">
                            {item.title}
                          </p>
                          {item.spec && (
                            <p className="text-xs text-slate-400 mt-0.5">{item.spec}</p>
                          )}
                          <div className="flex items-center space-x-3 mt-1 text-[11px]">
                            <span className="text-slate-400">SKU: <code className="text-slate-300">{item.sku}</code></span>
                            <span className="text-slate-500">•</span>
                            <span className="text-emerald-400 font-medium capitalize">In Stock</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-6 text-right shrink-0">
                        <div>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

        {/* Prava Authorization Call to Action */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-5 rounded-2xl border-purple-500/20">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Prava Trust Protection Active</p>
              <p className="text-xs text-slate-300">
                Generate merchant-locked virtual card with capped budget limit of <strong>${suggestedLimit.toFixed(2)}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPravaApproval}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02]"
          >
            <span>Approve ${suggestedLimit.toFixed(2)} Prava Limit</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
