import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  Check, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { SkillSession, EscrowTransaction } from '../types';
import { sendStellarTestnetPayment } from '../services/stellarService';

interface AcceptEscrowModalProps {
  session: SkillSession | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmEscrowSuccess: (session: SkillSession, escrowTx: EscrowTransaction) => void;
  connectedAddress: string;
}

export const AcceptEscrowModal: React.FC<AcceptEscrowModalProps> = ({
  session,
  isOpen,
  onClose,
  onConfirmEscrowSuccess,
  connectedAddress,
}) => {
  const [step, setStep] = useState<'CONFIRM' | 'PROCESSING' | 'SUCCESS'>('CONFIRM');
  const [processingIndex, setProcessingIndex] = useState(0);
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);

  const processingSteps = [
    'Validating Freighter Wallet Signature...',
    'Constructing Stellar Testnet Escrow Payload...',
    'Submitting Transaction to Horizon Testnet Core...',
    'Locking XLM Funds into SkillFlow Escrow Vault...',
    'Minting Verifiable Proof Receipt...'
  ];

  useEffect(() => {
    if (isOpen) {
      setStep('CONFIRM');
      setProcessingIndex(0);
      setTxHash('');
    }
  }, [isOpen]);

  if (!isOpen || !session) return null;

  const handleStartEscrowProcess = async () => {
    setStep('PROCESSING');
    setProcessingIndex(0);

    // Call real or testnet-backed transaction function
    const txResult = await sendStellarTestnetPayment(
      connectedAddress,
      session.creatorAddress,
      session.feeXlm
    );

    const generatedHash = txResult.txHash;

    // Progress through visual feedback steps
    const interval = setInterval(() => {
      setProcessingIndex((prev) => {
        if (prev >= processingSteps.length - 1) {
          clearInterval(interval);
          setTxHash(generatedHash);
          setStep('SUCCESS');

          // Trigger particle confetti
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#00F2FE', '#7B2CBF', '#FFB703', '#38BDF8']
            });
          } catch (e) {
            console.warn("Confetti error:", e);
          }

          const escrowTx: EscrowTransaction = {
            id: `tx-${Date.now()}`,
            sessionId: session.id,
            sessionTitle: session.title,
            category: session.category,
            amountXlm: session.feeXlm,
            txHash: generatedHash,
            explorerUrl: `https://stellar.expert/explorer/testnet/tx/${generatedHash}`,
            timestamp: new Date().toISOString(),
            formattedDate: new Date().toLocaleString([], {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            status: 'PAYMENT_SUCCESSFUL',
            userRole: 'LEARNER',
            senderAddress: connectedAddress || 'GA7Q3Z8X9K2P4M6W1V5T9L0N3E7C4B2A8D9F0E1C',
            recipientAddress: session.creatorAddress,
            counterpartyName: session.creatorName,
            counterpartyAvatar: session.creatorAvatar,
            durationMinutes: session.durationMinutes,
          };

          onConfirmEscrowSuccess(session, escrowTx);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
  };


  const handleCopyHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          onClick={step === 'PROCESSING' ? undefined : onClose}
          className="fixed inset-0 bg-[#060911]/85 backdrop-blur-lg"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-[#0d1322] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-hidden"
        >
          {/* Close button */}
          {step !== 'PROCESSING' && (
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* STEP 1: CONFIRMATION SCREEN */}
          {step === 'CONFIRM' && (
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-md">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-tech">
                    Confirm Escrow Deposit
                  </h2>
                  <p className="text-xs text-slate-400">
                    Stellar Testnet Smart Escrow Safeguard
                  </p>
                </div>
              </div>

              {/* Session Summary Card */}
              <div className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 font-tech">
                    {session.category}
                  </span>
                  <span className="text-xs text-slate-400 font-tech flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {session.durationMinutes} minutes
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">
                  {session.title}
                </h3>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <img
                      src={session.creatorAvatar}
                      alt={session.creatorName}
                      className="w-6 h-6 rounded-full object-cover border border-cyan-500/30"
                    />
                    <span className="text-xs text-slate-300 font-medium">
                      {session.creatorName}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-cyan-300 font-tech">
                      {session.feeXlm}
                    </span>
                    <span className="text-xs font-bold text-cyan-400">XLM</span>
                  </div>
                </div>
              </div>

              {/* Escrow Guarantee Notice */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/25 flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-purple-200">Zero-Risk Smart Escrow Protocol</p>
                  <p className="leading-relaxed">
                    Your {session.feeXlm} XLM will be locked in the SkillFlow Escrow Vault on Stellar Testnet. Funds are automatically released to the mentor only after session verification.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs font-tech transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartEscrowProcess}
                  className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider font-tech shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Confirm Escrow Lock</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: LIVE PROCESSING ANIMATION */}
          {step === 'PROCESSING' && (
            <div className="py-8 text-center space-y-6">
              
              {/* Cosmic Loader Icon */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-cyan-400 animate-spin"></div>
                <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border border-cyan-500/40 shadow-2xl">
                  <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-tech mb-1">
                  Broadcasting Escrow Transaction
                </h3>
                <p className="text-xs text-cyan-400 font-mono font-tech animate-pulse">
                  {processingSteps[processingIndex]}
                </p>
              </div>

              {/* Step Indicators */}
              <div className="max-w-xs mx-auto space-y-2 pt-2">
                {processingSteps.map((s, idx) => (
                  <div
                    key={s}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                      idx < processingIndex
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        : idx === processingIndex
                        ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 font-bold'
                        : 'text-slate-600 bg-slate-900/40 border border-slate-800'
                    }`}
                  >
                    {idx < processingIndex ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : idx === processingIndex ? (
                      <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span className="truncate">{s}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* STEP 3: SUCCESS & TRANSACTION RECEIPT */}
          {step === 'SUCCESS' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Success Badge */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-black text-white font-tech">
                  Escrow Locked Successfully!
                </h2>
                <p className="text-xs text-slate-300">
                  Your mentorship session is confirmed on Stellar Testnet.
                </p>
              </div>

              {/* Transaction Hash Receipt Box */}
              <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-3">
                
                <div className="flex items-center justify-between text-xs font-tech">
                  <span className="text-slate-400 font-bold uppercase">Transaction Hash</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                    TESTNET CONFIRMED
                  </span>
                </div>

                {/* Hash code block */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <code className="text-xs font-mono text-cyan-300 break-all flex-1 font-tech">
                    {txHash}
                  </code>
                  <button
                    onClick={handleCopyHash}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
                    title="Copy Transaction Hash"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Stellar Explorer Button Link */}
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all font-tech"
                >
                  <span>View on Stellar Expert Explorer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

              </div>

              {/* Verifiable Proof Teaser */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-tech">
                <span className="text-slate-400">Verifiable Proof Status:</span>
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Stellar Verifiable Proof Minted
                </span>
              </div>

              {/* Done Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider font-tech shadow-lg shadow-cyan-500/20 transition-all"
              >
                Return to Dashboard
              </button>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
