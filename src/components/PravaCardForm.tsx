import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PravaSDK } from '@prava-sdk/core';

const PUBLISHABLE_KEY = (typeof process !== 'undefined' && process.env ? process.env.NEXT_PUBLIC_PUBLISHABLE_KEY : (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_PUBLISHABLE_KEY : undefined)) || 'pk_test_zxabNnRp9FZg0Ao33QJVOwWQy182hhG376iKaRe6qsg';

interface PravaCardFormProps {
  session: {
    session_token: string;
    iframe_url: string;
    session_id?: string;
  };
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export const PravaCardForm: React.FC<PravaCardFormProps> = ({ session, onSuccess, onError }) => {
  const sdkRef = useRef<PravaSDK | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  const [loading, setLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountSdk = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSdkReady(false);

    if (sdkRef.current) {
      sdkRef.current.destroy();
      sdkRef.current = null;
    }

    try {
      console.log('[Prava SDK SKILL.md] Initializing SDK with publishableKey:', PUBLISHABLE_KEY);
      const sdk = new PravaSDK({ publishableKey: PUBLISHABLE_KEY });
      sdkRef.current = sdk;

      if (containerRef.current) {
        await sdk.collectPAN({
          sessionToken: session.session_token,
          iframeUrl: session.iframe_url,
          container: containerRef.current,
          onReady: () => {
            setSdkReady(true);
            setLoading(false);
          },
          onChange: (state: any) => {
            console.log('[Prava SDK SKILL.md] Field Validation:', state);
          },
          onSuccess: (result: any) => {
            console.log('[Prava SDK SKILL.md] Card Enrolled:', result);
            onSuccess?.(result);
          },
          onError: (err: any) => {
            setError(err.message || 'Prava Card Collector Error');
            onError?.(err);
          },
        });
      }
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      onError?.(err instanceof Error ? err : new Error(msg));
      setLoading(false);
    }
  }, [session, onSuccess, onError]);

  // Strict Mode mount handling
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      mountSdk();
    }
    return () => {
      sdkRef.current?.destroy();
      sdkRef.current = null;
      hasStarted.current = false;
    };
  }, [mountSdk]);

  // MutationObserver & 5s fallback timeout for onReady
  useEffect(() => {
    const container = containerRef.current;
    if (!container || sdkReady) return;

    const hideLoading = () => {
      setSdkReady(true);
      setLoading(false);
    };

    const observer = new MutationObserver(() => {
      if (container.querySelector('iframe')) hideLoading();
    });
    observer.observe(container, { childList: true, subtree: true });

    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [sdkReady]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
        <span className="font-semibold text-purple-400">Prava PCI-DSS Card Collector & Passkey Vault</span>
        <span className="font-mono text-[10px] bg-purple-950 px-2 py-0.5 rounded text-purple-300">@prava-sdk/core v1.1.0</span>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex justify-between items-center">
          <span>Error: {error}</span>
          <button onClick={mountSdk} className="underline font-bold text-white ml-2">Try Again</button>
        </div>
      )}

      {loading && !sdkReady && !error && (
        <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
          Loading secure Prava Visa Card Vault frame...
        </div>
      )}

      <div
        ref={containerRef}
        id="prava-card-form"
        className="w-full min-h-[160px] bg-slate-950 rounded-xl overflow-hidden p-2 border border-slate-800/80"
      >
        <iframe
          src={session.iframe_url}
          title="Prava PCI Card Collection"
          className="w-full h-44 border-0 rounded-lg"
          allow="payment; publickey-credentials-get; publickey-credentials-create"
        />
      </div>

      <p className="text-[10px] text-slate-500 text-center">
        Network Tokenized Payments protected by Visa Passkey (Biometrics) • Sandbox OTP: <strong className="text-purple-300 font-mono">456789</strong>
      </p>
    </div>
  );
};
