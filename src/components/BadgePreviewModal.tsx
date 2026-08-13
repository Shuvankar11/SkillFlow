import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, ShieldCheck, Sparkles, CheckCircle2, Lock } from 'lucide-react';

interface BadgePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BADGES = [
  {
    id: 'b1',
    title: 'Stellar Escrow Master',
    level: 'Verified Protocol Credential',
    status: 'UNLOCKED',
    icon: Award,
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    borderColor: 'border-cyan-400/50',
    textColor: 'text-cyan-300',
    description: 'Awarded for initiating or fulfilling peer mentorship escrows on Stellar Horizon testnet.',
    criteria: ['Connect Freighter Wallet', 'Interact with Horizon Node', 'Lock XLM in Smart Escrow']
  },
  {
    id: 'b2',
    title: 'Horizon Node Pioneer',
    level: 'Verified Protocol Credential',
    status: 'UNLOCKED',
    icon: ShieldCheck,
    gradient: 'from-purple-500 via-violet-600 to-pink-600',
    borderColor: 'border-purple-400/50',
    textColor: 'text-purple-300',
    description: 'Verified real-time RPC query & transaction hash signature on Stellar Horizon core nodes.',
    criteria: ['Read Live XLM Balances', 'Generate Explorer Tx Hash', 'Testnet Settlement Confirmed']
  },
  {
    id: 'b3',
    title: 'MST Token Scholar',
    level: 'Reserved Yield Protocol',
    status: 'LOCKED',
    icon: Sparkles,
    gradient: 'from-amber-500 via-orange-600 to-yellow-600',
    borderColor: 'border-amber-400/50',
    textColor: 'text-amber-300',
    description: 'Earn MentorshipTokens (MST) automatically upon completing verifiable skill transfers.',
    criteria: ['0.0 MST Pill Reserved', 'Verifiable ZK-Proof Release', 'Soroban Smart Contract Settlement']
  }
];

export const BadgePreviewModal: React.FC<BadgePreviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#05070f]/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-[#090e1a] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <Award className="w-6 h-6 text-cyan-400 animate-pulse" />
              <h2 className="text-2xl font-black text-white font-tech">
                Verifiable Skill Credentials
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Interactive 3D preview of protocol badges & MST token proof credentials.
            </p>
          </div>

          {/* Badges Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BADGES.map((b) => {
              const IconComp = b.icon;
              const isUnlocked = b.status === 'UNLOCKED';

              return (
                <motion.div
                  key={b.id}
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`relative rounded-3xl p-6 glass-panel border ${b.borderColor} flex flex-col justify-between overflow-hidden group`}
                >
                  {/* Ambient glow */}
                  <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${b.gradient} opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition-opacity`}></div>

                  <div>
                    {/* Badge Icon 3D Container */}
                    <div className="relative w-20 h-20 mx-auto mb-4 animate-float-3d">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-tr ${b.gradient} opacity-80 blur-md group-hover:blur-lg transition-all`}></div>
                      <div className="relative w-full h-full rounded-2xl bg-[#090e1a] border border-white/20 flex items-center justify-center text-white shadow-2xl">
                        <IconComp className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <span className={`text-[10px] font-extrabold uppercase font-tech px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 ${b.textColor}`}>
                        {b.level}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2 font-tech">
                        {b.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                        {b.description}
                      </p>
                    </div>

                    {/* Criteria list */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-800/80 mb-6">
                      <p className="text-[10px] uppercase font-bold text-slate-400 font-tech">Verification Requirements:</p>
                      {b.criteria.map((c) => (
                        <div key={c} className="flex items-center gap-1.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="text-[11px]">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Button */}
                  <div className="pt-2">
                    {isUnlocked ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 font-tech">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Credential Verified
                      </div>
                    ) : (
                      <div className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold text-center flex items-center justify-center gap-1.5 font-tech">
                        <Lock className="w-4 h-4 text-slate-500" />
                        Level 2 Reserved
                      </div>
                    )}
                  </div>

                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs font-tech transition-colors"
            >
              Close Credentials Window
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
