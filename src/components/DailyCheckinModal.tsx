import React, { useState, useEffect } from 'react';
import { X, Calendar, Sparkles, Check, Gift, Flame, Clock, Trophy, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import { store } from '../services/store';
import { TelegramService } from '../services/telegram';
import { soundService } from '../services/soundService';

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export interface CheckinDay30 {
  day: number;
  rewardAur: number;
  isBonus?: boolean;
  label?: string;
}

// 30-Day Rewards Schedule
export const CHECKIN_SCHEDULE_30: CheckinDay30[] = [
  { day: 1, rewardAur: 3 },
  { day: 2, rewardAur: 3 },
  { day: 3, rewardAur: 3 },
  { day: 4, rewardAur: 3 },
  { day: 5, rewardAur: 20, isBonus: true, label: '⭐ BONUS' },
  { day: 6, rewardAur: 3 },
  { day: 7, rewardAur: 3 },
  { day: 8, rewardAur: 3 },
  { day: 9, rewardAur: 3 },
  { day: 10, rewardAur: 50, isBonus: true, label: '⭐ MEGA' },
  { day: 11, rewardAur: 3 },
  { day: 12, rewardAur: 3 },
  { day: 13, rewardAur: 3 },
  { day: 14, rewardAur: 3 },
  { day: 15, rewardAur: 3 },
  { day: 16, rewardAur: 3 },
  { day: 17, rewardAur: 3 },
  { day: 18, rewardAur: 3 },
  { day: 19, rewardAur: 3 },
  { day: 20, rewardAur: 100, isBonus: true, label: '⭐ SUPER' },
  { day: 21, rewardAur: 3 },
  { day: 22, rewardAur: 3 },
  { day: 23, rewardAur: 3 },
  { day: 24, rewardAur: 3 },
  { day: 25, rewardAur: 3 },
  { day: 26, rewardAur: 3 },
  { day: 27, rewardAur: 3 },
  { day: 28, rewardAur: 3 },
  { day: 29, rewardAur: 3 },
  { day: 30, rewardAur: 250, isBonus: true, label: '🏆 GRAND' },
];

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({ isOpen, onClose, user }) => {
  const [claiming, setClaiming] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [countdownStr, setCountdownStr] = useState<string>('');

  const lastCheckinIso = user.lastDailyLogin || user.lastDailyCheckin || '';
  const nowMs = Date.now();
  const lastCheckinMs = lastCheckinIso ? new Date(lastCheckinIso).getTime() : 0;
  const isCooldown = lastCheckinMs > 0 && nowMs - lastCheckinMs < 24 * 60 * 60 * 1000;

  // Streak logic (1 to 30)
  const currentStreak = user.loginStreak || 1;
  const nextRewardObj = CHECKIN_SCHEDULE_30.find((s) => s.day === currentStreak) || CHECKIN_SCHEDULE_30[0];

  // 24-hour countdown timer
  useEffect(() => {
    setClaimedToday(isCooldown);

    if (!isCooldown || !lastCheckinMs) {
      setCountdownStr('');
      return;
    }

    const targetMs = lastCheckinMs + 24 * 60 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetMs - now;

      if (diff <= 0) {
        setClaimedToday(false);
        setCountdownStr('');
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownStr(
          `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isCooldown, lastCheckinMs]);

  if (!isOpen) return null;

  const handleCheckin = () => {
    if (claiming || claimedToday) return;

    TelegramService.hapticImpact('heavy');
    soundService.playClaimReward();
    setClaiming(true);

    const isBonusDay = nextRewardObj.isBonus;

    if (isBonusDay) {
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#10B981', '#F59E0B', '#38BDF8', '#EC4899'],
        });
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      const result = store.dailyCheckin();

      if (result.success) {
        setClaimedToday(true);
        soundService.playVictory();
        TelegramService.hapticNotification('success');
      } else {
        TelegramService.hapticNotification('warning');
      }

      setClaiming(false);
    }, 600);
  };

  const progressPercent = Math.min(100, Math.round((currentStreak / 30) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-slate-950 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-4 text-center max-h-[90vh] flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            soundService.playClick();
            onClose();
          }}
          className="absolute right-4 top-4 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white z-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1 text-center pt-1 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>30-Day Login Rewards Streak</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 uppercase font-mono tracking-tight">
            Daily Login Reward
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            Log in every 24h to unlock up to 250 AUR Token bonus rewards!
          </p>
        </div>

        {/* Progress & Current Status Row */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-2 shrink-0">
          <div className="flex items-center justify-between text-slate-300 font-bold">
            <span className="flex items-center gap-1 text-emerald-400">
              <Calendar className="w-3.5 h-3.5" />
              Current Streak: Day {currentStreak} / 30
            </span>
            <span className="text-amber-400 font-extrabold flex items-center gap-1">
              Next Reward: +{nextRewardObj.rewardAur} AUR
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 30-Day Calendar Grid (Scrollable) */}
        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar space-y-2">
          <div className="grid grid-cols-5 gap-1.5 font-mono text-center">
            {CHECKIN_SCHEDULE_30.map((item) => {
              const isPassed = item.day < currentStreak || (item.day === currentStreak && claimedToday);
              const isCurrent = item.day === currentStreak && !claimedToday;
              const isBonus = item.isBonus;

              return (
                <div
                  key={item.day}
                  className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-between relative ${
                    isBonus ? 'col-span-1 bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-slate-900 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'bg-slate-900/80 border-slate-800'
                  } ${
                    isCurrent
                      ? 'bg-emerald-500/25 border-emerald-400 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse'
                      : isPassed
                      ? 'bg-slate-950/80 border-slate-800/80 text-slate-500 opacity-75'
                      : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full text-[8px] text-slate-400 font-bold">
                    <span>D{item.day}</span>
                    {isPassed && <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />}
                  </div>

                  <div className="my-1">
                    {isBonus ? (
                      <Trophy className={`w-4 h-4 ${isCurrent ? 'text-amber-300 animate-bounce' : 'text-amber-400'}`} />
                    ) : (
                      <Gift className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-400 animate-bounce' : 'text-emerald-400'}`} />
                    )}
                  </div>

                  <span className={`text-[9px] font-black block ${isBonus ? 'text-amber-300' : 'text-slate-100'}`}>
                    +{item.rewardAur}
                  </span>

                  {isBonus && (
                    <span className="text-[7px] font-black uppercase text-amber-400/90 block -mt-0.5">
                      {item.label?.split(' ')[1] || 'BONUS'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Action / 24h Countdown */}
        <div className="pt-2 shrink-0">
          {claimedToday ? (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[11px]">Next Claim In:</span>
              </div>
              <span className="font-black text-amber-400 text-sm tracking-widest font-mono">
                {countdownStr || '24:00:00'}
              </span>
            </div>
          ) : (
            <button
              onClick={handleCheckin}
              disabled={claiming}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider font-mono shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 stroke-[2.5]" />
              <span>
                {claiming ? 'Claiming Reward...' : `CLAIM DAY ${currentStreak} (+${nextRewardObj.rewardAur} AUR)`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
