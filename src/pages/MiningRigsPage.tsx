import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Server, PlusCircle, ArrowLeft, RefreshCw, BarChart2, Calendar, Clock, CheckCircle2, X, ShieldCheck, HardDrive, Info, Gift } from 'lucide-react';
import { Investment, UserProfile } from '../types';
import { store } from '../services/store';
import { TelegramService } from '../services/telegram';
import { soundService } from '../services/soundService';

interface MiningRigsPageProps {
  user: UserProfile;
  investments: Investment[];
  onBack?: () => void;
  onNavigateInvest?: () => void;
  onOpenDiagnostics?: (inv: Investment) => void;
}

export const MiningRigsPage: React.FC<MiningRigsPageProps> = ({
  user,
  investments = [],
  onBack,
  onNavigateInvest,
}) => {
  const [filter, setFilter] = useState<'all' | 'running' | 'completed'>('all');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selectedRigDetail, setSelectedRigDetail] = useState<Investment | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Active user investments from store
  const activeRigs = investments.filter((inv) => inv.status === 'Active');

  const filteredInvestments = investments.filter((inv) => {
    if (filter === 'running') return inv.status === 'Active';
    if (filter === 'completed') return inv.status === 'Completed';
    return true;
  });

  // User metrics in USDT & TH/s
  const totalHashrateTH = activeRigs.reduce((acc, inv) => acc + (inv.amount * 0.0283), 0);
  const totalDailyUsdt = activeRigs.reduce((acc, inv) => acc + (inv.amount * (inv.dailyPercent / 100)), 0);
  const totalEarnedOverall = investments.reduce((acc, inv) => acc + (inv.claimedProfit || 0), 0);

  const handleCollect = (e: React.MouseEvent, investmentId: string) => {
    e.stopPropagation();
    TelegramService.hapticImpact('heavy');
    soundService.playClaimReward();
    setClaimingId(investmentId);
    setTimeout(() => {
      store.calculateDailyProfits();
      setClaimingId(null);
    }, 600);
  };

  const getRigDatesAndDays = (rig: Investment) => {
    if (rig.isGift) {
      const durationHours = rig.durationHours || 24;
      const startMs = rig.investmentStartTime
        ? new Date(rig.investmentStartTime).getTime()
        : rig.startDate
        ? new Date(rig.startDate).getTime()
        : Date.now();
      const endMs = rig.endTimeIso ? new Date(rig.endTimeIso).getTime() : startMs + durationHours * 3600 * 1000;
      const remainingMs = Math.max(0, endMs - now);

      const hrs = Math.floor(remainingMs / 3600000);
      const mins = Math.floor((remainingMs % 3600000) / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);
      const timeRemainingStr = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

      const totalDurationMs = endMs - startMs || durationHours * 3600 * 1000;
      const elapsedMs = Math.min(totalDurationMs, Math.max(0, now - startMs));
      const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

      const isRunning = rig.status === 'Active' && remainingMs > 0;
      const dailyUsdtProfit = (rig.amount * (rig.dailyPercent / 100) * (durationHours / 24)).toFixed(2);
      const totalEarnedUsdt = (rig.claimedProfit || (isRunning ? 0 : Number(dailyUsdtProfit))).toFixed(2);

      return {
        isGift: true,
        durationDays: 1,
        durationHours,
        startDateStr: new Date(startMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endDateStr: new Date(endMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        daysCompleted: isRunning ? 0 : 1,
        daysRemaining: isRunning ? 1 : 0,
        timeRemainingStr,
        progressPercent,
        isRunning,
        dailyUsdtProfit,
        totalEarnedUsdt,
        hashrateStr: rig.hashRate || '100 MH/s',
      };
    }

    const durationDays = rig.durationDays || 30;
    const startMs = rig.investmentStartTime
      ? new Date(rig.investmentStartTime).getTime()
      : rig.startDate
      ? new Date(rig.startDate).getTime()
      : Date.now();

    const startDateStr = new Date(startMs).toISOString().split('T')[0];
    const endMs = startMs + durationDays * 24 * 60 * 60 * 1000;
    const endDateStr = new Date(endMs).toISOString().split('T')[0];

    const diffMs = Math.max(0, now - startMs);
    const calculatedDaysElapsed = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const daysCompleted = Math.min(durationDays, Math.max(rig.daysElapsed || 0, calculatedDaysElapsed));
    const daysRemaining = Math.max(0, durationDays - daysCompleted);
    const progressPercent = Math.min(100, Math.max(0, Math.round((daysCompleted / durationDays) * 100)));

    const isRunning = rig.status === 'Active' && daysCompleted < durationDays;
    const dailyUsdtProfit = (rig.amount * (rig.dailyPercent / 100)).toFixed(2);
    const totalEarnedUsdt = ((rig.claimedProfit || 0) + (rig.unclaimedProfit || 0)).toFixed(2);
    const hashrateStr = `${(rig.amount * 0.0283 + 2.15).toFixed(2)} TH/s`;

    return {
      isGift: false,
      durationDays,
      durationHours: durationDays * 24,
      startDateStr,
      endDateStr,
      daysCompleted,
      daysRemaining,
      timeRemainingStr: `${daysRemaining} Days`,
      progressPercent,
      isRunning,
      dailyUsdtProfit,
      totalEarnedUsdt,
      hashrateStr,
    };
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300 select-none font-mono">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-[#0C1019] border border-amber-500/30 p-3.5 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.15)]">
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          {onBack && (
            <button
              onClick={() => {
                soundService.playClick();
                TelegramService.hapticImpact('light');
                onBack();
              }}
              className="p-1.5 rounded-xl bg-[#141A29] border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Cpu className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <span>My Mining Rigs</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                AUR + USDT
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Real-Time Cloud Hardware Accrual</p>
          </div>
        </div>

        <button
          onClick={() => {
            soundService.playClick();
            TelegramService.hapticImpact('medium');
            if (onNavigateInvest) onNavigateInvest();
          }}
          className="px-3 py-1.5 rounded-xl btn-gold-primary text-xs uppercase flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Rent Rig</span>
        </button>
      </div>

      {/* Global Mining Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#0C1019] border border-amber-500/20 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Active Machines</span>
            <Server className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-lg font-black text-slate-100">
            {activeRigs.length}
          </p>
          <span className="text-[9px] text-amber-400 font-bold">
            {investments.length} Total Purchased
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#0C1019] border border-amber-500/20 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Total Hashrate</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-lg font-black text-amber-400">
            {totalHashrateTH.toFixed(2)} TH/s
          </p>
          <span className="text-[9px] text-amber-400/80 font-bold">
            Hardware Capacity
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#0C1019] border border-amber-500/20 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Daily Profit</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-lg font-black text-emerald-400">
            +${totalDailyUsdt.toFixed(2)} USDT
          </p>
          <span className="text-[9px] text-yellow-300 font-bold">
            +{activeRigs.reduce((acc, i) => acc + (i.dailyCoinsRate || 80), 0)} AUR / day
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#0C1019] border border-amber-500/20 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>AUR Coins Balance</span>
            <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-lg font-black text-amber-300">
            {user.coins.toLocaleString()} AUR
          </p>
          <span className="text-[9px] text-amber-400 font-bold">In-App Token Balance</span>
        </div>
      </div>

      {/* Filter Tabs */}
      {investments.length > 0 && (
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Machines ({investments.length})
          </button>
          <button
            onClick={() => setFilter('running')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              filter === 'running'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Running ({activeRigs.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              filter === 'completed'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({investments.filter((r) => r.status === 'Completed').length})
          </button>
        </div>
      )}

      {/* Rigs List or Empty State */}
      {filteredInvestments.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-950 border border-emerald-500/30 text-center space-y-4 my-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Server className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-slate-100 uppercase tracking-tight">
              NO ACTIVE MINING RIGS
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Start your mining package to generate daily USDT payouts directly into your wallet balance.
            </p>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              if (onNavigateInvest) onNavigateInvest();
            }}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            START MINING
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredInvestments.map((rig) => {
            const {
              isGift,
              durationDays,
              durationHours,
              startDateStr,
              endDateStr,
              timeRemainingStr,
              daysCompleted,
              daysRemaining,
              progressPercent,
              isRunning,
              dailyUsdtProfit,
              totalEarnedUsdt,
              hashrateStr,
            } = getRigDatesAndDays(rig);

            return (
              <div
                key={rig.id}
                onClick={() => setSelectedRigDetail(rig)}
                className={`relative overflow-hidden rounded-2xl bg-slate-950 border transition-all p-3.5 space-y-3 shadow-xl cursor-pointer hover:border-emerald-500/60 ${
                  isRunning
                    ? isGift
                      ? 'border-amber-500/50 shadow-[0_4px_25px_rgba(245,158,11,0.15)]'
                      : 'border-emerald-500/40 shadow-[0_4px_20px_rgba(16,185,129,0.1)]'
                    : 'border-slate-800/80 opacity-90'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl border ${isGift ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'}`}>
                      {isGift ? <Gift className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black uppercase tracking-wider ${isGift ? 'text-amber-400 font-extrabold' : 'text-emerald-400'}`}>
                          {isGift ? '🎁 AUREX GIFT MINING' : 'MY MINING RIG'}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-black text-slate-100 truncate max-w-[140px]">
                          {rig.planName || `Aurex Rig #${rig.id.slice(-4)}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                        Value: <strong className="text-amber-400">${rig.amount.toFixed(2)} USDT</strong>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isRunning
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                    {isRunning ? 'ACTIVE' : 'COMPLETED'}
                  </span>
                </div>

                {/* Dates & Duration / Time Remaining Stats */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <strong className="text-slate-100 font-bold">{isGift ? `${durationHours} Hours` : `${durationDays} Days`}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Value:</span>
                      <strong className="text-amber-400 font-extrabold">${rig.amount.toFixed(2)} USDT</strong>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Time Left:</span>
                      <strong className="text-amber-400 font-extrabold font-mono tracking-wider">{timeRemainingStr}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Reward:</span>
                      <strong className="text-emerald-400 font-extrabold">+${dailyUsdtProfit} USDT</strong>
                    </div>
                  </div>
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[8px] text-slate-400 uppercase font-sans font-bold block">Hashrate</span>
                    <span className="font-extrabold text-amber-400">{hashrateStr}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[8px] text-slate-400 uppercase font-sans font-bold block">Reward Rate</span>
                    <span className="font-extrabold text-emerald-400">{rig.dailyPercent}% / {isGift ? '24h' : 'day'}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <span className="text-[8px] text-slate-400 uppercase font-sans font-bold block">Reward Earned</span>
                    <span className="font-extrabold text-sky-400">+${totalEarnedUsdt} USDT</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>30-Day Mining Progress</span>
                    <span className="text-emerald-400 font-bold">{progressPercent}% Completed</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-500 shadow-[0_0_8px_#10B981]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Action bar */}
                <div className="flex items-center justify-between text-[9px] pt-0.5">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3 text-emerald-400" />
                    Tap card to view full details
                  </span>

                  {isRunning && (
                    <button
                      onClick={(e) => handleCollect(e, rig.id)}
                      disabled={claimingId === rig.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${claimingId === rig.id ? 'animate-spin' : ''}`} />
                      <span>Sync Profits</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED RIG MODAL (صفحة تفاصيل الجهاز) */}
      {selectedRigDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-950 rounded-3xl border border-emerald-500/40 p-5 space-y-4 font-mono shadow-[0_0_40px_rgba(16,185,129,0.2)] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">
                    Mining Rig Details
                  </h3>
                  <p className="text-[10px] text-slate-400">Aurex Cloud Hardware Specifications</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRigDetail(null)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const {
                durationDays,
                startDateStr,
                endDateStr,
                daysCompleted,
                daysRemaining,
                progressPercent,
                isRunning,
                dailyUsdtProfit,
                totalEarnedUsdt,
                hashrateStr,
              } = getRigDatesAndDays(selectedRigDetail);

              return (
                <div className="space-y-3.5 text-xs">
                  {/* Status & Package Banner */}
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Package Name</span>
                      <span className="text-sm font-black text-slate-100">{selectedRigDetail.planName}</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isRunning
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isRunning ? '● ACTIVE' : '✔ COMPLETED'}
                    </span>
                  </div>

                  {/* Financial & Yield Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">Investment Capital</span>
                      <span className="text-base font-black text-slate-100">${selectedRigDetail.amount.toFixed(2)} USDT</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">Daily Reward Rate</span>
                      <span className="text-base font-black text-emerald-400">+{selectedRigDetail.dailyPercent}% / Day</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">Daily Reward Amount</span>
                      <span className="text-base font-black text-emerald-400">+${dailyUsdtProfit} USDT</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold">Total USDT Earned</span>
                      <span className="text-base font-black text-amber-400">+${totalEarnedUsdt} USDT</span>
                    </div>
                  </div>

                  {/* Dates & Duration Details */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        Start Date:
                      </span>
                      <strong className="text-slate-100">{startDateStr}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        End Date:
                      </span>
                      <strong className="text-slate-100">{endDateStr}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        Days Completed:
                      </span>
                      <strong className="text-emerald-400 font-bold">Day {daysCompleted} / {durationDays}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Days Remaining:
                      </span>
                      <strong className="text-amber-400 font-bold">{daysRemaining} Days</strong>
                    </div>
                  </div>

                  {/* Hardware Technical Spec */}
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hashrate Power:</span>
                      <span className="text-amber-400 font-bold">{hashrateStr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hardware Model:</span>
                      <span className="text-sky-400 font-bold">Antminer S19 / RTX Matrix</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contract Duration:</span>
                      <span className="text-slate-100 font-bold">{durationDays} Days</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>30-Day Mining Progress</span>
                      <span className="text-emerald-400 font-bold">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-[0_0_10px_#10B981]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedRigDetail(null)}
                    className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-2"
                  >
                    Close Details
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
