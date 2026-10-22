import React, { useState } from 'react';
import { X, Award, Trophy, Zap, Shield, Crown, Search, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { soundService } from '../services/soundService';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  hashrateTH: number;
  totalAurMined: number;
  level: string;
  isCurrentUser?: boolean;
}

// Generated sample Top 100 Miners
const GENERATED_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, id: 'top-1', username: 'quantum_satoshi', hashrateTH: 842.5, totalAurMined: 1254000, level: 'Network Architect' },
  { rank: 2, id: 'top-2', username: 'cyber_whale_88', hashrateTH: 610.2, totalAurMined: 940200, level: 'Neural Master' },
  { rank: 3, id: 'top-3', username: 'aurex_titan', hashrateTH: 495.0, totalAurMined: 780500, level: 'Cluster Overseer' },
  { rank: 4, id: 'top-4', username: 'crypto_node_x', hashrateTH: 380.8, totalAurMined: 512000, level: 'Cluster Overseer' },
  { rank: 5, id: 'top-5', username: 'hash_master_99', hashrateTH: 290.1, totalAurMined: 420000, level: 'Cyber Node' },
  { rank: 6, id: 'top-6', username: 'zero_latency', hashrateTH: 210.5, totalAurMined: 310500, level: 'Cyber Node' },
  { rank: 7, id: 'top-7', username: 'quantum_flux', hashrateTH: 195.0, totalAurMined: 289000, level: 'Cyber Node' },
  { rank: 8, id: 'top-8', username: 'aurex_pioneer', hashrateTH: 175.4, totalAurMined: 245000, level: 'Novice Miner' },
  { rank: 9, id: 'top-9', username: 'neural_stack', hashrateTH: 160.0, totalAurMined: 210000, level: 'Novice Miner' },
  { rank: 10, id: 'top-10', username: 'block_slayer', hashrateTH: 145.2, totalAurMined: 185000, level: 'Novice Miner' },
  ...Array.from({ length: 90 }, (_, i) => ({
    rank: i + 11,
    id: `top-${i + 11}`,
    username: `miner_node_${i + 11}`,
    hashrateTH: parseFloat((140 - i * 1.2).toFixed(1)),
    totalAurMined: Math.round(175000 - i * 1600),
    level: i < 30 ? 'Cyber Node' : 'Novice Miner',
  })),
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, user }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  // Insert current user in leaderboard dynamically
  const userRankObj: LeaderboardUser = {
    rank: 14,
    id: user.id || 'current-user',
    username: user.username ? `@${user.username}` : user.firstName || 'You',
    hashrateTH: 112.5,
    totalAurMined: user.coins || 12450,
    level: 'Cyber Node',
    isCurrentUser: true,
  };

  const filtered = GENERATED_LEADERBOARD.filter(
    (item) =>
      item.username.toLowerCase().includes(search.toLowerCase()) ||
      item.rank.toString().includes(search)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 uppercase tracking-tight font-mono">
                Top 100 Miners
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                Global Hashrate Leaderboard & Rankings
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current User Rank Highlight Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-slate-900 to-amber-500/15 border border-emerald-500/40 flex items-center justify-between shrink-0 font-mono text-xs">
          <div className="flex items-center space-x-3">
            <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
              #{userRankObj.rank}
            </span>
            <div>
              <span className="font-extrabold text-slate-100 block flex items-center gap-1">
                {userRankObj.username}
                <span className="px-1.5 py-0.2 rounded text-[8px] bg-emerald-500/20 text-emerald-400 font-bold uppercase">YOU</span>
              </span>
              <span className="text-[10px] text-slate-400">Mining Power: {userRankObj.hashrateTH} TH/s</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-black text-amber-400 block">{userRankObj.totalAurMined.toLocaleString()} AUR</span>
            <span className="text-[9px] text-slate-400">{userRankObj.level}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search miner rank or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-100 outline-none font-mono"
          />
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="overflow-y-auto space-y-2 pr-1 font-mono flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filtered.map((item) => {
            const isGold = item.rank === 1;
            const isSilver = item.rank === 2;
            const isBronze = item.rank === 3;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                  isGold
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : isSilver
                    ? 'bg-slate-300/10 border-slate-400/50 text-slate-200'
                    : isBronze
                    ? 'bg-amber-700/10 border-amber-700/50 text-amber-400'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 text-center font-extrabold text-xs">
                    {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `#${item.rank}`}
                  </span>
                  <div>
                    <span className="font-extrabold text-slate-100 block">
                      @{item.username}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      {item.hashrateTH} TH/s
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-amber-400 block">
                    +{item.totalAurMined.toLocaleString()} AUR
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {item.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
