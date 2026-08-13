import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  History, 
  Copy, 
  Check, 
  CheckCircle2, 
  Clock, 
  Search, 
  Zap, 
  GraduationCap,
  Calendar,
  Wallet,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import type { EscrowTransaction } from '../types';

interface TransactionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: EscrowTransaction[];
  connectedAddress: string;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
}

export const TransactionHistoryDrawer: React.FC<TransactionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  transactions,
  connectedAddress,
  onDeleteHistoryItem,
  onClearAllHistory,
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'LEARNER' | 'MENTOR'>('ALL');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredTransactions = transactions.filter((tx) => {
    // Role filter
    if (roleFilter === 'LEARNER' && tx.userRole === 'MENTOR') return false;
    if (roleFilter === 'MENTOR' && tx.userRole === 'LEARNER') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.sessionTitle.toLowerCase().includes(q);
      const matchHash = tx.txHash.toLowerCase().includes(q);
      const matchCat = tx.category ? tx.category.toLowerCase().includes(q) : false;
      const matchName = tx.counterpartyName ? tx.counterpartyName.toLowerCase().includes(q) : false;
      const matchPayer = tx.payerName ? tx.payerName.toLowerCase().includes(q) : false;
      return matchTitle || matchHash || matchCat || matchName || matchPayer;
    }

    return true;
  });

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#05070f]/85 backdrop-blur-xl"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          
          {/* Slide-Over Drawer Window */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-screen max-w-lg bg-[#090e1a] border-l border-cyan-500/30 shadow-2xl p-6 sm:p-7 flex flex-col justify-between"
          >
            
            <div className="space-y-5 flex-1 overflow-hidden flex flex-col">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-white font-tech">
                      Skill & Payment History
                    </h2>
                    <p className="text-xs text-slate-400 font-mono">
                      Wallet: {connectedAddress ? formatAddress(connectedAddress) : 'Demo Wallet'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {transactions.length > 0 && (
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-colors text-xs font-bold font-tech"
                      title="Clear All History"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Clear All Confirmation Banner */}
              {showClearConfirm && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-rose-300 font-bold text-xs font-tech">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Clear all transaction logs for this wallet?
                  </div>
                  <div className="flex gap-2 pt-1 font-tech">
                    <button
                      onClick={() => {
                        onClearAllHistory();
                        setShowClearConfirm(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-500 text-slate-950 font-bold text-xs"
                    >
                      Yes, Clear All
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Role Filter Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 font-tech">
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    roleFilter === 'ALL'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({transactions.length})
                </button>

                <button
                  onClick={() => setRoleFilter('LEARNER')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    roleFilter === 'LEARNER'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'text-slate-400 hover:text-purple-300'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Booked
                </button>

                <button
                  onClick={() => setRoleFilter('MENTOR')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    roleFilter === 'MENTOR'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Offered
                </button>
              </div>

              {/* Search Field */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search history by title, hash, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium placeholder-slate-500"
                />
              </div>

              {/* History Cards Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-3 glass-panel rounded-3xl p-6 border border-slate-800">
                    <ShieldCheck className="w-12 h-12 mx-auto text-slate-600" />
                    <p className="text-base font-bold font-tech text-white">No Payment History Recorded</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Book a skill session or deposit XLM into escrow to record your first real transaction on Stellar Testnet!
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="group/card relative p-5 rounded-3xl glass-card border border-cyan-500/25 space-y-3 hover:border-cyan-500/40 transition-all shadow-lg"
                    >
                      {/* Delete Item Trash Button */}
                      <button
                        onClick={() => onDeleteHistoryItem(tx.id)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete this transaction log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Card Header: Status & Role */}
                      <div className="flex items-center justify-between pr-8">
                        {/* Status Badge */}
                        <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider font-tech flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          PAYMENT SUCCESSFUL
                        </span>

                        {/* Role Tag */}
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-tech">
                          {tx.userRole === 'LEARNER' ? 'Learner (Booked)' : 'Mentor (Offered)'}
                        </span>
                      </div>

                      {/* Session Title */}
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {tx.sessionTitle}
                      </h3>

                      {/* Category & Duration */}
                      <div className="flex items-center justify-between text-xs text-slate-400 font-tech">
                        <span className="text-cyan-400 font-mono font-semibold">{tx.category || 'Skill Mentorship'}</span>
                        {tx.durationMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {tx.durationMinutes} minutes
                          </span>
                        )}
                      </div>

                      {/* Mentor / Learner Name Info */}
                      {tx.counterpartyName && (
                        <div className="flex items-center gap-2 pt-1">
                          <img
                            src={tx.counterpartyAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                            alt={tx.counterpartyName}
                            className="w-5 h-5 rounded-full object-cover border border-cyan-500/30"
                          />
                          <span className="text-xs text-slate-300 font-medium">
                            {tx.userRole === 'LEARNER' ? 'Mentor: ' : 'Learner: '}
                            <strong className="text-white">{tx.counterpartyName}</strong>
                          </span>
                        </div>
                      )}

                      {/* Amount & Date */}
                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-tech">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tx.formattedDate || new Date(tx.timestamp).toLocaleString()}</span>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-cyan-300 font-tech">
                            {tx.amountXlm}
                          </span>
                          <span className="text-xs font-bold text-cyan-400">XLM</span>
                        </div>
                      </div>

                      {/* Hash Code Block */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-tech block">
                          Transaction Hash:
                        </span>
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
                          <span className="truncate flex-1 font-tech">{tx.txHash}</span>
                          <button
                            onClick={() => handleCopy(tx.txHash)}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 transition-colors shrink-0"
                            title="Copy Transaction Hash"
                          >
                            {copiedHash === tx.txHash ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* External Stellar Explorer Button */}
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition-all font-tech"
                      >
                        <span>Verify on Stellar Expert Explorer</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 font-tech flex items-center justify-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                Individual items can be deleted or managed anytime
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
