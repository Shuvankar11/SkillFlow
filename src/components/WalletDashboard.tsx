import React from 'react';
import { 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Droplet,
  Layers,
  TrendingUp,
  Cpu,
  Lock
} from 'lucide-react';
import type { WalletState } from '../types';

interface WalletDashboardProps {
  wallet: WalletState;
  onRefreshBalance: () => void;
  onOpenFaucetModal: () => void;
  totalActiveSessions: number;
  totalEscrowXlm: number;
  isRefreshing: boolean;
}

export const WalletDashboard: React.FC<WalletDashboardProps> = ({
  wallet,
  onRefreshBalance,
  onOpenFaucetModal,
  totalActiveSessions,
  totalEscrowXlm,
  isRefreshing,
}) => {
  return (
    <div className="w-full mb-10">
      {/* Primary AntiGravity Control Hero Panel */}
      <div className="relative overflow-hidden rounded-3xl glass-card border border-cyan-500/30 p-6 sm:p-10 shadow-2xl">
        
        {/* AntiGravity Ambient Lighting Glows */}
        <div className="absolute -top-28 -right-28 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyber-grid opacity-30 pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Balance Hero Section (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-tech">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                Stellar Horizon RPC Node Live
              </span>

              {/* MST Reserved Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500/15 to-amber-500/15 border border-purple-500/30 text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>0.0 MST Token Reserve</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">(Level 2 Proofs)</span>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400 font-tech">
                Live Wallet Balance
              </p>
              <div className="flex items-baseline gap-4 mt-2">
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-tech">
                  {wallet.isConnected ? (
                    <span className="text-gradient-antigravity">{wallet.xlmLiveBalance}</span>
                  ) : (
                    <span className="text-slate-400 text-3xl font-sans font-semibold">Connect Freighter Wallet</span>
                  )}
                </h1>
                
                {wallet.isConnected && (
                  <button
                    onClick={onRefreshBalance}
                    disabled={isRefreshing}
                    title="Refresh Balance via Horizon"
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 transition-all disabled:opacity-50 shadow-md"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-medium">
              SkillFlow is a zero-trust, peer-to-peer mentorship network running on Stellar Horizon nodes. Funds are locked into non-custodial smart escrow contracts, guaranteeing instant settlement upon verifiable proof of skill transfer.
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-300 font-tech flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Non-Custodial Escrow
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-300 font-tech flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Soroban Contract Settlement
              </div>

              {wallet.isConnected && (
                <button
                  onClick={onOpenFaucetModal}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold font-tech flex items-center gap-1.5 transition-all"
                >
                  <Droplet className="w-3.5 h-3.5 text-amber-400" />
                  +10,000 Test XLM Faucet
                </button>
              )}
            </div>

          </div>

          {/* Quick Stats Grid (Cols 8-12) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            
            {/* Stat 1: Active Open Sessions */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/40 transition-all shadow-lg group">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider font-tech">Live Marketplace</span>
                <Layers className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-black text-white font-tech">
                {totalActiveSessions}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Open Skill Listings</p>
            </div>

            {/* Stat 2: Escrow Locked XLM */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-purple-500/40 transition-all shadow-lg group">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider font-tech">Escrow Vault</span>
                <Lock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-3xl font-black text-purple-300 font-tech">
                {totalEscrowXlm} <span className="text-xs text-purple-400 font-bold">XLM</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Locked Settlement Vault</p>
            </div>

            {/* Stat 3: Protocol Performance Widget */}
            <div className="col-span-2 p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-slate-900/90 border border-cyan-500/30 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white font-tech">Stellar Protocol Verification</p>
                  <p className="text-[11px] text-cyan-300 font-mono mt-0.5">Horizon Node Query & Explorer Synced</p>
                </div>
              </div>

              <div className="text-right hidden sm:block font-tech">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  OPERATIONAL 100%
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
