import React, { useState } from 'react';
import { CopyTrader, CopyTradePosition, UserProfile } from '../types';
import { Users, TrendingUp, Shield, Zap, Sparkles, Clock, XCircle, Calendar, DollarSign, Award, CheckCircle2 } from 'lucide-react';
import { CopyTradeModal } from '../components/CopyTradeModal';
import { getTranslation } from '../services/i18n';
import { TelegramService } from '../services/telegram';

interface CopyTradingPageProps {
  traders: CopyTrader[];
  activePositions: CopyTradePosition[];
  user: UserProfile;
  onStartCopy: (traderId: string, planId: string, amount: number) => { success: boolean; message: string };
  onClosePosition: (positionId: string) => { success: boolean; message: string };
  onClaimProfits: () => number;
  langCode: any;
}

// Sparkline SVG generator helper for Trader Profit charts
const renderSparkline = (id: string) => {
  const pointsMap: Record<string, string> = {
    '1': 'M 0 30 Q 25 25, 50 15 T 100 8 T 150 18 T 200 4',
    '2': 'M 0 35 Q 30 20, 60 25 T 120 12 T 160 16 T 200 6',
    '3': 'M 0 28 Q 20 28, 50 18 T 110 10 T 170 14 T 200 5',
    '4': 'M 0 32 Q 35 15, 70 20 T 130 8 T 170 12 T 200 3',
    '5': 'M 0 30 Q 30 22, 60 14 T 120 10 T 160 6 T 200 2',
  };
  const path = pointsMap[id] || pointsMap['1'];

  return (
    <div className="w-full h-9 my-1 overflow-hidden relative">
      <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={`${path} L 200 40 L 0 40 Z`} fill={`url(#grad-${id})`} />
        <path d={path} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const CopyTradingPage: React.FC<CopyTradingPageProps> = ({
  traders = [],
  activePositions = [],
  user,
  onStartCopy,
  onClosePosition,
  onClaimProfits,
  langCode
}) => {
  const t = getTranslation(langCode);
  const [selectedTrader, setSelectedTrader] = useState<CopyTrader | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const activeCopied = activePositions.filter(p => p.status === 'Active');
  const totalUnclaimedCopyProfit = activeCopied.reduce((acc, curr) => acc + curr.unclaimedProfit, 0);
  const totalStakedAmount = activeCopied.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpectedProfit = activeCopied.reduce((acc, curr) => acc + (curr.totalExpectedProfit || (curr.amount * (curr.profitPercent || 10) / 100)), 0);

  const activeMaturityDetails = activeCopied.map(pos => {
    const startMs = new Date(pos.startDate || Date.now()).getTime();
    const durationDays = pos.durationDays || 3;
    const maturityMs = startMs + (durationDays * 86400000);
    const maturityDate = new Date(maturityMs);
    const daysRemaining = Math.max(0, Math.ceil((maturityMs - Date.now()) / (1000 * 60 * 60 * 24)));
    const progressPercent = Math.min(100, Math.max(0, Math.round(((durationDays - daysRemaining) / durationDays) * 100)));
    return {
      pos,
      maturityDate,
      daysRemaining,
      progressPercent
    };
  }).sort((a, b) => a.maturityDate.getTime() - b.maturityDate.getTime());

  const earliestMaturity = activeMaturityDetails.length > 0 ? activeMaturityDetails[0] : null;

  const handleOpenCopyModal = (trader: CopyTrader) => {
    TelegramService.hapticImpact('medium');
    setSelectedTrader(trader);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card-glow border border-emerald-500/30 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-2 text-emerald-400 font-extrabold text-xs tracking-wider uppercase mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Social Copy Trading</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 leading-tight">
          Elite Master Traders <br />
          <span className="text-emerald-400 font-mono">1 Day (6% ROI) to 90 Days (8%/Day)</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md">
          Mirror trades from top verified algorithmic traders with automated 24h profit distributions.
        </p>

        {/* Lockup pills */}
        <div className="flex flex-wrap gap-2 mt-4 font-mono">
          <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs flex items-center gap-1 shadow-sm">
            <Clock className="w-3.5 h-3.5" /> 1 Day (6% ROI)
          </span>
          <span className="px-3 py-1 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-black text-xs flex items-center gap-1 shadow-sm">
            <Clock className="w-3.5 h-3.5" /> 7, 15 & 30 Days
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center gap-1 shadow-sm">
            <Clock className="w-3.5 h-3.5" /> 90 Days (8%/Day - 720% ROI)
          </span>
        </div>
      </div>

      {/* Summary Stats Card */}
      <div className="glass-card border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100">Staking & Copy Overview</h3>
              <p className="text-[11px] text-slate-400">Real-time performance of active copy contracts</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${
            activeCopied.length > 0 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
              : 'bg-slate-900 text-slate-500 border border-slate-800'
          }`}>
            {activeCopied.length} Active {activeCopied.length === 1 ? 'Copy' : 'Copies'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              Total Copied
            </p>
            <p className="text-base font-black text-slate-100 mt-1">${totalStakedAmount.toFixed(2)}</p>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-sky-400" />
              Projected ROI
            </p>
            <p className="text-base font-black text-emerald-400 mt-1">+${totalExpectedProfit.toFixed(2)}</p>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              Next Payout
            </p>
            <p className="text-xs font-extrabold text-slate-200 mt-1">
              {earliestMaturity 
                ? earliestMaturity.maturityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'No Active Copy'}
            </p>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Award className="w-3 h-3 text-purple-400" />
              Cycle Remaining
            </p>
            <p className="text-xs font-extrabold text-sky-400 mt-1">
              {earliestMaturity 
                ? `${earliestMaturity.daysRemaining} Days` 
                : '1 - 90 Days'}
            </p>
          </div>
        </div>

        {/* Earliest Maturity Bar */}
        {earliestMaturity && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
                <span className="font-bold text-slate-100">Next Payout: {earliestMaturity.pos.traderName}</span>
                <span className="text-[10px] text-slate-400">({earliestMaturity.pos.planTitle})</span>
              </div>
              <span className="font-black text-emerald-400 font-mono">
                {earliestMaturity.daysRemaining === 0 ? 'Matures Today!' : `${earliestMaturity.daysRemaining} days left`}
              </span>
            </div>
            
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#10B981]"
                style={{ width: `${Math.max(8, earliestMaturity.progressPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Active Copy Positions */}
      {activeCopied.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>{t.activePositions} ({activeCopied.length})</span>
            </h2>

            {totalUnclaimedCopyProfit > 0 && (
              <button
                onClick={() => {
                  TelegramService.hapticNotification('success');
                  onClaimProfits();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Claim +${totalUnclaimedCopyProfit.toFixed(2)} USDT
              </button>
            )}
          </div>

          <div className="space-y-3">
            {activeMaturityDetails.map(({ pos, maturityDate, daysRemaining, progressPercent }) => (
              <div
                key={pos.id}
                className="glass-card border border-slate-800 hover:border-emerald-500/40 p-4.5 rounded-3xl flex flex-col space-y-3 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={pos.traderAvatar}
                      alt={pos.traderName}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pos.traderName)}&background=0F172A&color=10B981&bold=true`;
                      }}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-100">{pos.traderName}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {pos.planTitle || `${pos.durationDays || 3} Days (+${pos.profitPercent || 10}%)`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        Invested: <span className="text-slate-100 font-bold">${pos.amount} USDT</span> • Expected: <span className="text-emerald-400 font-bold">+${(pos.totalExpectedProfit || (pos.amount * (pos.profitPercent || 10) / 100)).toFixed(2)} USDT</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                    <div className="text-right font-mono">
                      <p className="text-[10px] text-slate-400 uppercase">{t.unclaimedProfit}</p>
                      <p className="text-sm font-black text-emerald-400">
                        +${pos.unclaimedProfit.toFixed(2)} USDT
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        TelegramService.hapticImpact('medium');
                        onClosePosition(pos.id);
                      }}
                      className="px-3.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t.stopCopying}</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5 font-mono">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      Maturity: <strong className="text-slate-100 ml-0.5">{maturityDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                    </span>
                    <span className="font-extrabold text-emerald-400">
                      {daysRemaining === 0 ? 'Matures Today' : `${daysRemaining} days left`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(5, progressPercent)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List of Master Traders */}
      <div className="space-y-3.5">
        <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-400" />
          <span>Master Copy Traders ({traders.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {traders.map(trader => (
            <div
              key={trader.id}
              className="glass-card border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={trader.avatar}
                      alt={trader.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(trader.name)}&background=0F172A&color=10B981&bold=true`;
                      }}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    />
                    <span className="absolute -bottom-1 -right-1 p-0.5 bg-slate-950 rounded-full border border-emerald-500 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 fill-emerald-500 text-slate-950" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-100 flex items-center gap-1.5">
                      {trader.name}
                      <Shield className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-medium">{trader.bio}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 font-mono shadow-sm">
                  {trader.badge}
                </span>
              </div>

              {/* Live Sparkline Graph */}
              <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>30D Profit Curve</span>
                  <span className="text-emerald-400 font-bold">+342.5% High Win Rate</span>
                </div>
                {renderSparkline(trader.id)}
              </div>

              {/* Lockup Tiers Option */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 text-center font-mono">
                {(trader.plans || []).map((plan) => (
                  <div key={plan.id} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <p className="text-[9px] text-slate-400 font-bold">
                      {plan.durationDays === 1 ? '1 Day' : plan.durationDays === 30 ? '30 Days' : `${plan.durationDays} Days`}
                    </p>
                    <p className="text-xs font-black text-emerald-400">+{plan.profitPercent}% ROI</p>
                    <p className="text-[9px] text-slate-400">Min ${plan.minAmount}</p>
                  </div>
                ))}
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-400 font-mono">
                  Win Rate: <strong className="text-sky-400 font-bold">{trader.winRate}%</strong> • Copiers: <strong className="text-slate-100 font-bold">{trader.totalCopiers.toLocaleString()}</strong>
                </div>

                <button
                  onClick={() => handleOpenCopyModal(trader)}
                  className="px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Copy Strategy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CopyTradeModal
        trader={selectedTrader}
        user={user}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onStartCopy}
        langCode={langCode}
      />
    </div>
  );
};
