import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplet, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { fundWithFriendbot } from '../services/stellarService';

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAddress: string;
  onFundingSuccess: () => void;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({
  isOpen,
  onClose,
  connectedAddress,
  onFundingSuccess,
}) => {
  const [customKey, setCustomKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const targetAddress = connectedAddress || customKey;

  const handleFund = async () => {
    if (!targetAddress || targetAddress.trim() === '') {
      setResult({ success: false, message: 'Please connect wallet or provide a valid Stellar Public Key.' });
      return;
    }

    setLoading(true);
    setResult(null);

    const res = await fundWithFriendbot(targetAddress.trim());
    setLoading(false);
    setResult(res);

    if (res.success) {
      onFundingSuccess();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#060911]/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0d1322] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <Droplet className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-tech">
                Stellar Friendbot Faucet
              </h2>
              <p className="text-xs text-slate-400">
                Fund any Testnet account with 10,000 free XLM
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-tech">
                Target Public Key (G...)
              </label>
              <input
                type="text"
                placeholder="G..."
                value={connectedAddress ? connectedAddress : customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                disabled={Boolean(connectedAddress)}
                className="w-full px-4 py-3 rounded-xl glass-input text-xs font-mono text-cyan-300 disabled:opacity-80"
              />
              {connectedAddress && (
                <p className="text-[10px] text-cyan-400/80 mt-1 font-tech">
                  ✓ Auto-filled from connected Freighter wallet
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300 font-bold font-tech">What is Friendbot?</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Friendbot is Stellar's official testnet funding service. Clicking below sends 10,000 native testnet XLM directly to your account address on Stellar Testnet.
              </p>
            </div>

            {/* Result Message */}
            {result && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  result.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{result.message}</span>
              </div>
            )}

            {/* Fund Action Button */}
            <button
              onClick={handleFund}
              disabled={loading || (!connectedAddress && !customKey.trim())}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider font-tech shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Requesting 10,000 XLM from Friendbot...</span>
                </>
              ) : (
                <>
                  <Droplet className="w-4 h-4" />
                  <span>Request 10,000 Testnet XLM</span>
                </>
              )}
            </button>

            <a
              href="https://laboratory.stellar.org/#account-creator?network=test"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-xs text-slate-400 hover:text-cyan-300 underline font-tech pt-1"
            >
              Or open Stellar Laboratory Faucet <ExternalLink className="inline w-3 h-3 ml-0.5" />
            </a>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
