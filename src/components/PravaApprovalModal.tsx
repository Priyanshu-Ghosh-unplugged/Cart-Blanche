import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, CreditCard, ArrowRight, X, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { MerchantName, PravaCard } from '../types';
import { PravaService } from '../services/pravaService';
import { PravaCardForm } from './PravaCardForm';

interface PravaApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchants: MerchantName[];
  orderTotal: number;
  defaultLimit: number;
  onApproveAndExecute: (approvedLimit: number, generatedCards: PravaCard[]) => void;
}

export const PravaApprovalModal: React.FC<PravaApprovalModalProps> = ({
  isOpen,
  onClose,
  merchants,
  orderTotal,
  defaultLimit,
  onApproveAndExecute
}) => {
  const [approvedLimit, setApprovedLimit] = useState<number>(defaultLimit);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [pravaConfigMask, setPravaConfigMask] = useState<string>('4532 •••• •••• 4412');
  
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('http://localhost:3002/api/prava/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config?.maskedCardNumber) {
          setPravaConfigMask(data.config.maskedCardNumber);
        }
      })
      .catch(() => {});
      
    return () => stopPolling();
  }, []);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setPolling(false);
  };

  const startPolling = (sessionId: string) => {
    setPolling(true);
    const doPoll = async () => {
      try {
        const res = await fetch(`http://localhost:3002/api/prava/sessions/${sessionId}/result`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.result) {
          const result = data.result;
          if (result.status === 'completed') {
            stopPolling();
            // Issue cards
            const limitPerCard = Number((approvedLimit / (merchants.length || 1)).toFixed(2));
            const issueRes = await fetch('http://localhost:3002/api/prava/cards/issue', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId,
                merchants: merchants.map(m => ({ name: m, limit: limitPerCard }))
              })
            });
            const issueData = await issueRes.json();
            if (issueData.success && issueData.cards) {
              const generatedCards = issueData.cards.map((c: any) => ({
                cardId: c.card_id,
                merchantName: c.merchant_name,
                cardNumber: c.card_number,
                maskedCardNumber: c.masked_card_number,
                expDate: c.exp_date,
                cvv: c.cvv,
                cardHolder: c.card_holder,
                limitAmount: c.limit_amount,
                spentAmount: c.spent_amount,
                status: c.status,
                merchantLock: c.merchant_lock,
                generatedAt: c.generated_at
              }));
              setIsAuthorizing(false);
              onApproveAndExecute(approvedLimit, generatedCards);
            } else {
              setError('Failed to issue virtual cards');
              setIsAuthorizing(false);
            }
          } else if (result.status === 'failed') {
            stopPolling();
            setError('Payment session failed');
            setIsAuthorizing(false);
          }
        }
      } catch { /* ignore transient */ }
    };
    doPoll();
    pollingRef.current = setInterval(doPoll, 3000);
  };

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    setError(null);
    setLoadingSession(true);
    
    try {
      const baseLimit = (!approvedLimit || approvedLimit <= 0) ? 150.00 : approvedLimit;
      const limitPerCard = Number((baseLimit / (merchants.length || 1)).toFixed(2));
      
      const res = await fetch('http://localhost:3002/api/prava/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: baseLimit,
          merchants: merchants.map(m => ({ name: m, limit: limitPerCard }))
        })
      });
      
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        startPolling(data.session.session_id);
      } else {
        throw new Error(data.error || 'Failed to create session');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating Prava session');
      setIsAuthorizing(false);
    } finally {
      setLoadingSession(false);
    }
  };

  if (!isOpen) return null;

  const cardPreviews = merchants.map((merchant) => ({
    merchant,
    card: PravaService.generateVirtualCard(merchant, approvedLimit / merchants.length)
  }));

  const isIdle = !session && !loadingSession && !isAuthorizing && !error;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-purple-500/30 p-6 sm:p-8 shadow-2xl shadow-purple-950/60 overflow-hidden my-8">
        
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Prava Virtual Card API Gateway (Configured & Active)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Approve Prava Virtual Card Budget Limit
          </h2>

          <p className="text-sm text-slate-300">
            CartBlanche will call the <strong className="text-white">Prava API Gateway</strong> to issue <strong className="text-white">{merchants.length} single-use virtual cards</strong> locked specifically to each merchant using your configured Prava card credentials.
          </p>
        </div>

        {!session ? (
          <>
            <div className="mt-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Order Subtotal: </span>
                  <span className="text-sm font-bold text-slate-200">${orderTotal.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-purple-400 font-medium">Authorized Max Cap: </span>
                  <span className="text-2xl font-black text-purple-300">${approvedLimit.toFixed(2)}</span>
                </div>
              </div>

              <input
                type="range"
                min={Math.ceil(orderTotal)}
                max={Math.ceil(orderTotal * 1.5)}
                step={5}
                value={approvedLimit}
                onChange={(e) => setApprovedLimit(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                disabled={isAuthorizing}
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Exact Total (${orderTotal.toFixed(2)})</span>
                <span>Recommended Cap (+5% Buffer)</span>
                <span>Max Cap (${(orderTotal * 1.5).toFixed(2)})</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>Prava Virtual Cards to be Tokenized ({merchants.length}):</span>
                </span>
                <span className="text-emerald-400 text-[11px]">Merchant Locked • Single-Use</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cardPreviews.map(({ merchant, card }, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/60 border border-slate-700/80 shadow-lg text-slate-100 space-y-3 overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 prava-card-glint rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold tracking-widest text-purple-300 uppercase">
                        PRAVA VISA
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        ${(approvedLimit / merchants.length).toFixed(2)} Limit
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-mono text-sm tracking-wider text-white font-semibold">
                        {pravaConfigMask}
                      </p>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>EXP: {card.expDate}</span>
                        <span>CVV: •••</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 truncate">Locked to:</span>
                      <span className="font-bold text-white truncate max-w-[100px]">{merchant}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-semibold transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleAuthorize}
                disabled={isAuthorizing}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-purple-600/40 flex items-center justify-center space-x-2.5 transition-all disabled:opacity-50"
              >
                {isAuthorizing ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin text-purple-300" />
                    <span>Tokenizing via Prava Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Authorize & Launch Parallel Agents</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6">
            <PravaCardForm session={session} onError={(err) => setError(err.message)} />
            {polling && <p className="text-emerald-400 mt-4 text-center text-sm animate-pulse">Waiting for secure payment authorization...</p>}
            {error && <p className="text-red-400 mt-4 text-center text-sm">{error}</p>}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => { setSession(null); stopPolling(); setIsAuthorizing(false); }}
                className="px-6 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:bg-slate-700"
              >
                Cancel Authorization
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
