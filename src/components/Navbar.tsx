import React, { useState } from 'react';
import { 
  Zap, 
  Wallet, 
  Copy, 
  Check, 
  LogOut, 
  PlusCircle, 
  Droplet, 
  History, 
  Award,
  ChevronDown,
  UserPlus,
  LogIn,
  Link,
  Unlink,
  Camera,
  Edit3
} from 'lucide-react';
import type { WalletState, UserProfile } from '../types';

interface NavbarProps {
  wallet: WalletState;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onOpenCreateModal: () => void;
  onOpenFaucetModal: () => void;
  onOpenHistoryDrawer: () => void;
  onOpenBadgesModal: () => void;
  historyCount: number;
  userProfile: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenEditProfileModal: () => void;
  onLogoutProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  onOpenCreateModal,
  onOpenFaucetModal,
  onOpenHistoryDrawer,
  onOpenBadgesModal,
  historyCount,
  userProfile,
  onOpenAuthModal,
  onOpenEditProfileModal,
  onLogoutProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/15 bg-[#05070f]/90 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* AntiGravity Brand Logo & Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 via-purple-600 to-amber-400 rounded-2xl blur-md opacity-80 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse-glow"></div>
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-[#080d1a] border border-cyan-400/50 rounded-2xl flex items-center justify-center text-cyan-400 font-bold shadow-2xl">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-tech">
                Skill<span className="text-gradient-antigravity">Flow</span>
              </span>
              <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 font-tech">
                Stellar
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden xl:block font-medium">
              Verifiable Peer Mentorship & Escrow Engine
            </p>
          </div>
        </div>

        {/* Action Group & User Profile / Wallet */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">

          {/* Post Session Primary Button */}
          <button
            onClick={onOpenCreateModal}
            className="btn-shimmer flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider font-tech shadow-lg shadow-cyan-500/25 transition-all duration-300"
          >
            <PlusCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span>Post Session</span>
          </button>

          {/* Quick Toolbar Action Icons */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
            {/* Faucet Quick Button */}
            <button
              onClick={onOpenFaucetModal}
              title="Request 10,000 Free Testnet XLM"
              className="p-2 rounded-xl text-amber-300 hover:bg-amber-500/15 transition-all flex items-center gap-1 text-xs font-tech font-bold px-2.5"
            >
              <Droplet className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">Faucet</span>
            </button>

            {/* Credentials Quick Button */}
            <button
              onClick={onOpenBadgesModal}
              title="View Verifiable Credentials"
              className="p-2 rounded-xl text-purple-300 hover:bg-purple-500/15 transition-all flex items-center gap-1 text-xs font-tech font-bold px-2.5"
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span className="hidden lg:inline">Badges</span>
            </button>

            {/* My History Quick Button */}
            <button
              onClick={onOpenHistoryDrawer}
              title="View Payment & Escrow History"
              className="p-2 rounded-xl text-cyan-300 hover:bg-cyan-500/15 transition-all flex items-center gap-1.5 text-xs font-tech font-bold px-2.5"
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">History</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black">
                  {historyCount}
                </span>
              )}
            </button>
          </div>

          {/* CASE 1: USER IS NOT LOGGED IN */}
          {!userProfile ? (
            <div className="flex items-center gap-2 font-tech">
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition-all"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Log In</span>
              </button>

              <button
                onClick={onOpenAuthModal}
                className="btn-shimmer flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wide transition-all shadow-md shadow-cyan-500/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>
          ) : (
            /* CASE 2: USER IS LOGGED IN (Can link/unlink any wallet & change DP) */
            <div className="flex items-center gap-2">
              
              {/* Wallet Link Button if no wallet is linked yet */}
              {!wallet.isConnected && (
                <button
                  onClick={onConnectWallet}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-tech transition-all"
                >
                  <Link className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Link Wallet</span>
                </button>
              )}

              {/* User Identity & Wallet Pill */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#090e1a] border border-cyan-500/40 hover:border-cyan-400 text-slate-200 transition-all shadow-xl group"
                >
                  {/* User Profile Custom Photo Avatar */}
                  <div className="relative">
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.fullName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400 shadow-md"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-slate-950"></span>
                    </span>
                  </div>

                  {/* Profile Info & Wallet Badge */}
                  <div className="text-left hidden sm:block">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white font-tech truncate max-w-[100px] lg:max-w-[140px]">
                        {userProfile.fullName}
                      </p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {userProfile.role}
                      </span>
                    </div>

                    <p className="text-[10px] text-cyan-300 font-mono">
                      {wallet.isConnected ? (
                        <>{formatAddress(wallet.address)} • <span className="text-slate-400">{wallet.xlmLiveBalance}</span></>
                      ) : (
                        <span className="text-slate-400 italic">No Wallet Linked</span>
                      )}
                    </p>
                  </div>

                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Account Control & Wallet Dropdown Menu */}
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-[#090e1a] border border-cyan-500/40 shadow-2xl backdrop-blur-3xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
                    
                    {/* User Profile Info Card with Edit DP button */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer" onClick={() => { setShowAccountMenu(false); onOpenEditProfileModal(); }}>
                          <img
                            src={userProfile.avatarUrl}
                            alt={userProfile.fullName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400 shadow-md group-hover:opacity-75 transition-opacity"
                          />
                          <span className="absolute inset-0 rounded-full bg-slate-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-5 h-5 text-cyan-300" />
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white font-tech leading-tight">
                            {userProfile.fullName}
                          </h4>
                          <p className="text-xs text-purple-300 font-tech font-semibold">
                            {userProfile.username}
                          </p>
                          <p className="text-[10px] text-slate-400 font-sans truncate max-w-[150px]">
                            {userProfile.email}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          onOpenEditProfileModal();
                        }}
                        title="Change DP & Edit Profile"
                        className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-tech text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit DP</span>
                      </button>
                    </div>

                    {/* Linked Wallet Control Box */}
                    <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-tech">
                        <span className="text-slate-400 uppercase font-bold">Stellar Wallet Status</span>
                        <span className={`font-bold font-mono text-[10px] px-2 py-0.5 rounded ${
                          wallet.isConnected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {wallet.isConnected ? 'LINKED' : 'UNLINKED'}
                        </span>
                      </div>

                      {wallet.isConnected ? (
                        <>
                          <p className="text-xs text-cyan-300 font-mono break-all font-bold">
                            {wallet.address}
                          </p>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-cyan-500/20 font-tech">
                            <span className="text-slate-300">Live Balance:</span>
                            <span className="font-bold text-white text-sm font-mono">{wallet.xlmLiveBalance}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={handleCopyAddress}
                              className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white font-tech flex items-center justify-center gap-1"
                            >
                              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setShowAccountMenu(false);
                                onDisconnectWallet();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-tech font-bold flex items-center gap-1"
                            >
                              <Unlink className="w-3.5 h-3.5" />
                              <span>Unlink</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2 pt-1">
                          <p className="text-xs text-slate-400 font-sans">
                            No wallet is currently linked to your account. Link any Stellar wallet at any time!
                          </p>
                          <button
                            onClick={() => {
                              setShowAccountMenu(false);
                              onConnectWallet();
                            }}
                            className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-tech flex items-center justify-center gap-1.5 shadow-md"
                          >
                            <Wallet className="w-4 h-4 text-cyan-400" />
                            <span>Link Stellar Wallet</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action Shortcuts Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-tech font-bold">
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          onOpenFaucetModal();
                        }}
                        className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Droplet className="w-4 h-4 text-amber-400" />
                        <span>Faucet XLM</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          onOpenBadgesModal();
                        }}
                        className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Award className="w-4 h-4 text-purple-400" />
                        <span>Badges</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        onOpenHistoryDrawer();
                      }}
                      className="w-full p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-between text-xs font-tech font-bold transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <History className="w-4 h-4 text-cyan-400" />
                        My Payment History
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px]">
                        {historyCount}
                      </span>
                    </button>

                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          onLogoutProfile();
                        }}
                        className="w-full p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs font-tech flex items-center justify-center gap-2 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out Account</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </header>
  );
};
