import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Zap } from 'lucide-react';

export const LiveTicker: React.FC = () => {
  const [blockHeight, setBlockHeight] = useState(549210);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#040711] border-b border-cyan-500/15 py-1.5 px-4 overflow-hidden relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-tech text-slate-400">
        
        {/* Left Live Status Indicator */}
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold whitespace-nowrap">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span>STELLAR HORIZON TESTNET LIVE</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-300 whitespace-nowrap">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Block #{blockHeight.toLocaleString()}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-purple-300 whitespace-nowrap">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span>Escrow Vault: <strong className="text-white">Active</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-amber-300 whitespace-nowrap">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Avg Settlement: <strong className="text-amber-200">&lt; 2.4s</strong></span>
          </div>
        </div>

        {/* Right Status badge */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider">
            Soroban Ready v1.0
          </span>
        </div>

      </div>
    </div>
  );
};
