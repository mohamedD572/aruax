import React from 'react';
import { Coins, Flame, Users, Activity, BarChart2, Zap, Cpu, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { soundService } from '../services/soundService';

interface TokenomicsHubProps {
  onOpenSwap?: () => void;
}

export const TokenomicsHub: React.FC<TokenomicsHubProps> = ({ onOpenSwap }) => {
  return (
    <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 font-mono select-none">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Coins className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">
              AUR Tokenomics & Network Stats
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Real-Time On-Chain & Hardware Ledger</p>
          </div>
        </div>

        {onOpenSwap && (
          <button
            onClick={() => {
              soundService.playClick();
              onOpenSwap();
            }}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-sm active:scale-95 transition-all"
          >
            Swap AUR
          </button>
        )}
      </div>

      {/* Grid of Key Token Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-1">
          <span className="text-[9px] text-slate-400 uppercase font-sans font-bold block">Market Cap</span>
          <span className="text-sm font-black text-emerald-400 block">$12,450,000 USDT</span>
          <span className="text-[9px] text-slate-400 font-medium">+8.4% (24h)</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-1">
          <span className="text-[9px] text-slate-400 uppercase font-sans font-bold block">Total Supply</span>
          <span className="text-sm font-black text-slate-100 block">100,000,000 AUR</span>
          <span className="text-[9px] text-emerald-400 font-bold">Hard Capped</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-1">
          <span className="text-[9px] text-slate-400 uppercase font-sans font-bold block">Circulating Supply</span>
          <span className="text-sm font-black text-amber-400 block">34,250,000 AUR</span>
          <span className="text-[9px] text-amber-400/80 font-bold">34.25% Released</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-1">
          <span className="text-[9px] text-slate-400 uppercase font-sans font-bold flex items-center justify-between">
            <span>Burn Counter</span>
            <Flame className="w-3 h-3 text-red-500 animate-pulse" />
          </span>
          <span className="text-sm font-black text-red-400 block">5,820,000 AUR</span>
          <span className="text-[9px] text-red-400/80 font-bold">Deflationary Mechanism</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-1">
          <span className="text-[9px] text-slate-400 uppercase font-sans font-bold flex items-center justify-between">
            <span>Token Holders</span>
            <Users className="w-3 h-3 text-sky-400" />
          </span>
          <span className="text-sm font-black text-sky-400 block">28,490 Verified</span>
          <span className="text-[9px] text-sky-400/80 font-bold">Active Wallets</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-1">
          <span className="text-[9px] text-slate-400 uppercase font-sans font-bold flex items-center justify-between">
            <span>Network Hashrate</span>
            <Zap className="w-3 h-3 text-amber-400" />
          </span>
          <span className="text-sm font-black text-amber-400 block">184.20 TH/s</span>
          <span className="text-[9px] text-emerald-400 font-bold">1,420 Active Rigs</span>
        </div>
      </div>
    </div>
  );
};
