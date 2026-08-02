import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, X, CreditCard, Terminal, CheckCircle2, AlertCircle, ExternalLink, Code } from 'lucide-react';
import { ApiClient } from '../services/apiClient';

interface PravaTransactionDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PravaTransactionDashboard: React.FC<PravaTransactionDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'api_logs' | 'virtual_cards'>('api_logs');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3002/api/prava/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        if (data.transactions && data.transactions.length > 0 && !selectedTx) {
          setSelectedTx(data.transactions[0]);
        }
      }
    } catch (e) {
      console.warn('Prava transactions audit fetch error', e);
    }

    try {
      const cardRes = await fetch('http://localhost:3002/api/prava/cards');
      if (cardRes.ok) {
        const cardData = await cardRes.json();
        setCards(cardData.cards || []);
      }
    } catch (e) {
      console.warn('Prava cards fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAuditLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl border border-purple-500/40 p-6 sm:p-8 shadow-2xl shadow-purple-950/60 overflow-hidden my-6 max-h-[90vh] flex flex-col justify-between">
        
        {/* Ambient Backlight */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-3 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Terminal className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Prava API Network & Transaction Inspector</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Live Prava Gateway API Audit Logs (https://sandbox.api.prava.space)
              </h2>
            </div>
          </div>
        </div>

        {/* Tabs & Controls */}
        <div className="flex items-center justify-between py-3">
          <div className="flex space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('api_logs')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'api_logs'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              HTTP Request Logs ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('virtual_cards')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'virtual_cards'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tokenized Cards ({cards.length})
            </button>
          </div>

          <button
            onClick={fetchAuditLogs}
            disabled={isLoading}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Audit Logs</span>
          </button>
        </div>

        {/* Main Content Pane */}
        {activeTab === 'api_logs' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[360px] overflow-hidden py-2">
            
            {/* Transactions List */}
            <div className="lg:col-span-5 border border-slate-800 bg-slate-900/60 rounded-2xl overflow-y-auto max-h-[360px] divide-y divide-slate-800">
              {transactions.map((tx) => {
                const isSelected = selectedTx?.id === tx.id;
                let reqObj = {};
                let resObj = {};
                try { reqObj = JSON.parse(tx.request_payload); } catch (e) {}
                try { resObj = JSON.parse(tx.response_payload); } catch (e) {}

                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className={`p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/80 border-l-4 border-purple-500'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-white uppercase">{tx.http_method}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {tx.http_status} OK
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200 mt-1 truncate">
                      {tx.merchant_name}
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span className="font-mono text-purple-300">{tx.transaction_id}</span>
                      <span>{new Date(tx.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}

              {transactions.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No Prava API audit transactions recorded in SQLite yet.
                </div>
              )}
            </div>

            {/* Request / Response JSON Inspector */}
            <div className="lg:col-span-7 border border-slate-800 bg-slate-950 rounded-2xl p-4 overflow-y-auto max-h-[360px] space-y-3 font-mono text-xs">
              {selectedTx ? (
                <>
                  <div className="pb-2 border-b border-slate-900 flex justify-between items-center">
                    <span className="text-purple-400 font-bold">{selectedTx.transaction_id}</span>
                    <span className="text-slate-400 text-[11px]">{selectedTx.created_at}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider block mb-1">
                      Endpoint Target:
                    </span>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 text-[11px] truncate">
                      {selectedTx.endpoint_url}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider block mb-1">
                      Request Payload (Sent to Prava Sandbox API):
                    </span>
                    <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-emerald-400 text-[11px] overflow-x-auto">
                      {selectedTx.request_payload}
                    </pre>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider block mb-1">
                      Response Payload (Returned from Prava Gateway):
                    </span>
                    <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-purple-300 text-[11px] overflow-x-auto">
                      {selectedTx.response_payload}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Select a transaction from the left pane to inspect request & response JSON.
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Tokenized Cards View */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-[360px] overflow-y-auto py-2">
            {cards.map((card) => (
              <div
                key={card.card_id}
                className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 bg-slate-900/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{card.merchant_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase">
                    {card.status}
                  </span>
                </div>

                <div className="font-mono text-sm text-purple-300 font-bold tracking-wider">
                  {card.masked_card_number}
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                  <span>Authorized Cap: <strong className="text-white">${card.limit_amount.toFixed(2)}</strong></span>
                  <span>Spent: <strong className="text-emerald-400">${card.spent_amount.toFixed(2)}</strong></span>
                </div>
              </div>
            ))}

            {cards.length === 0 && (
              <div className="col-span-2 p-8 text-center text-xs text-slate-500">
                No Prava virtual cards tokenized in SQLite yet.
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Prava Sandbox Endpoint: <code className="text-purple-300">https://sandbox.api.prava.space</code></span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
