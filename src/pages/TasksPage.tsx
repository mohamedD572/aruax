import React, { useState, useEffect } from 'react';
import { TaskItem, UserProfile } from '../types';
import { store } from '../services/store';
import { TelegramService } from '../services/telegram';
import { AurexTokenLogo } from '../components/AurexTokenLogo';
import { HumanVerificationModal } from '../components/HumanVerificationModal';
import {
  Calendar,
  CheckCircle2,
  PlayCircle,
  Send,
  Coins,
  Target,
  ArrowRight,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  Copy,
  Share2,
  Gift,
  Award,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TasksPageProps {
  user: UserProfile;
  tasks?: TaskItem[];
}

// Exact 30-Day Daily Login Reward Schedule
const DAILY_REWARDS_30 = [
  3, 3, 3, 3, 20,
  3, 3, 3, 3, 50,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 100,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 250
];

const BONUS_DAYS = [5, 10, 20, 30];

export const TasksPage: React.FC<TasksPageProps> = ({ user, tasks: propTasks }) => {
  const tasks = propTasks || store.getTasks() || [];
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [visitedTaskIds, setVisitedTaskIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // Verification modal state for social tasks
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [pendingTask, setPendingTask] = useState<TaskItem | null>(null);

  // YouTube countdown timer (18 seconds)
  const [ytTimer, setYtTimer] = useState<number>(0);

  // Daily login live countdown timer
  const [dailyCountdownStr, setDailyCountdownStr] = useState<string | null>(null);
  const [isDailyCooldown, setIsDailyCooldown] = useState<boolean>(false);

  // Accordion state for 30-day streak map
  const [showStreakMap, setShowStreakMap] = useState<boolean>(false);

  // Referral deposit task status
  const [isRefTaskCompleted, setIsRefTaskCompleted] = useState<boolean>(false);
  const [refModalOpen, setRefModalOpen] = useState<boolean>(false);

  // Bonus day celebration modal
  const [celebrationModal, setCelebrationModal] = useState<{ open: boolean; day: number; reward: number } | null>(null);

  // Current daily login streak
  const currentStreakDay = Math.min(Math.max(user.loginStreak || user.currentLoginDay || 1, 1), 30);
  const currentDayReward = DAILY_REWARDS_30[currentStreakDay - 1] || 3;
  const isCurrentBonusDay = BONUS_DAYS.includes(currentStreakDay);

  // 1. Live 24-hour countdown calculated strictly from server timestamp
  useEffect(() => {
    const updateDailyTimer = () => {
      const lastStr = user.lastDailyLogin || user.lastLoginRewardTime || user.lastDailyCheckin;
      const lastMs = lastStr ? new Date(lastStr).getTime() : 0;

      if (!lastMs) {
        setDailyCountdownStr(null);
        setIsDailyCooldown(false);
        return;
      }

      const total24h = 24 * 60 * 60 * 1000;
      const targetMs = user.nextDailyLogin ? new Date(user.nextDailyLogin).getTime() : lastMs + total24h;
      const diff = targetMs - Date.now();

      if (diff <= 0) {
        setDailyCountdownStr(null);
        setIsDailyCooldown(false);
      } else {
        setIsDailyCooldown(true);
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
        setDailyCountdownStr(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
      }
    };

    updateDailyTimer();
    const interval = setInterval(updateDailyTimer, 1000);
    return () => clearInterval(interval);
  }, [user.lastDailyLogin, user.lastLoginRewardTime, user.lastDailyCheckin, user.nextDailyLogin]);

  // 2. YouTube 18-second timer
  useEffect(() => {
    if (ytTimer <= 0) return;
    const timer = setInterval(() => {
      setYtTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [ytTimer]);

  // 3. Server check for referral deposit task status on mount
  useEffect(() => {
    let isMounted = true;
    store.checkReferralDepositStatus().then((res) => {
      if (isMounted) {
        setIsRefTaskCompleted(res.completed);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user.id]);

  // Handle Daily Login Claim via Server API
  const handleClaimDailyLogin = async () => {
    if (isDailyCooldown) {
      setNotice(`Next Daily Login reward available in ${dailyCountdownStr || 'cooldown'}.`);
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    setClaimingId('task-1');
    TelegramService.hapticImpact('medium');

    try {
      const res = await store.dailyCheckinAsync();
      setClaimingId(null);

      if (res.success) {
        TelegramService.hapticNotification('success');
        try {
          confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } });
        } catch {
          // ignore
        }

        if (res.isBonusDay) {
          setCelebrationModal({
            open: true,
            day: res.streak || currentStreakDay,
            reward: res.reward,
          });
        } else {
          setNotice(res.message);
          store.showSuccessModal('Daily Login Reward Claimed! ⭐', res.message);
        }
      } else {
        TelegramService.hapticNotification('warning');
        setNotice(res.message);
        store.showErrorModal('Daily Login Cooldown', res.message);
      }
    } catch (err: any) {
      setClaimingId(null);
      setNotice(err.message || 'Error claiming reward.');
    }

    setTimeout(() => setNotice(null), 4000);
  };

  // Handle Social Tasks (Telegram & YouTube)
  const handleTaskClick = (task: TaskItem) => {
    if (task.completed || user.completedTaskIds?.includes(task.id)) return;
    TelegramService.hapticImpact('medium');

    const titleLower = task.title.toLowerCase();

    // YouTube task
    if (titleLower.includes('youtube')) {
      if (!visitedTaskIds.includes(task.id)) {
        TelegramService.openUrl(task.actionUrl || 'https://www.youtube.com/@AurexOfficia');
        setVisitedTaskIds((prev) => [...prev, task.id]);
        setYtTimer(18);
        setNotice('YouTube channel opened! Please wait 18 seconds before verifying.');
        setTimeout(() => setNotice(null), 4000);
        return;
      }

      if (ytTimer > 0) {
        setNotice(`Please wait ${ytTimer} seconds before verifying YouTube subscription.`);
        setTimeout(() => setNotice(null), 3000);
        return;
      }

      setPendingTask(task);
      setIsVerifyOpen(true);
      return;
    }

    // Telegram task
    if (titleLower.includes('telegram')) {
      if (!visitedTaskIds.includes(task.id)) {
        TelegramService.openUrl(task.actionUrl || 'https://t.me/AurexOfficia');
        setVisitedTaskIds((prev) => [...prev, task.id]);
        setNotice('Telegram channel opened! Join the channel and click "Verify" to claim.');
        setTimeout(() => setNotice(null), 4000);
        return;
      }

      setPendingTask(task);
      setIsVerifyOpen(true);
      return;
    }

    // Fallback external url check
    if (task.actionUrl && !visitedTaskIds.includes(task.id)) {
      TelegramService.openUrl(task.actionUrl);
      setVisitedTaskIds((prev) => [...prev, task.id]);
      setNotice('Link opened! Click "Verify" to claim after completing.');
      setTimeout(() => setNotice(null), 3000);
      return;
    }

    setPendingTask(task);
    setIsVerifyOpen(true);
  };

  const executeClaimSocialTask = () => {
    if (!pendingTask) return;
    const task = pendingTask;
    setClaimingId(task.id);

    setTimeout(() => {
      const res = store.completeTask(task.id);
      setClaimingId(null);
      setPendingTask(null);

      if (res.success) {
        try {
          confetti({ particleCount: 60, spread: 80, origin: { y: 0.7 } });
        } catch {
          // Ignore
        }
        setNotice(res.message);
        TelegramService.hapticNotification('success');
        store.showSuccessModal('Task Completed! 🎯', res.message);
      } else {
        setNotice(res.message);
        TelegramService.hapticNotification('warning');
        store.showErrorModal('Task Verification Notice', res.message);
      }

      setTimeout(() => setNotice(null), 4000);
    }, 400);
  };

  // Social tasks filter (Telegram & YouTube)
  const socialTasks = (tasks || []).filter(
    (t) =>
      Boolean(t) &&
      t.id !== 'task-1' &&
      !t.title?.toLowerCase().includes('daily login') &&
      !t.title?.toLowerCase().includes('deposit')
  );

  const referralLink = `https://t.me/AurexOneBot?start=${user.referralCode || user.id}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    TelegramService.hapticNotification('success');
    setNotice('Referral link copied to clipboard! ✓');
    setTimeout(() => setNotice(null), 3000);
  };

  const shareViaTelegram = () => {
    const text = `Join Aurex Cloud Mining & receive free Aurex tokens! Earn daily USDT rewards.`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    TelegramService.openUrl(shareUrl);
  };

  return (
    <div className="space-y-4 pb-28 animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-950 via-[#0B130E] to-slate-950 border border-emerald-500/30 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Target className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-slate-100 tracking-tight">Tasks & Rewards</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Complete server-verified tasks to earn AUR tokens</p>
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center gap-1.5 font-mono shadow-sm">
            <AurexTokenLogo size={18} />
            <span>{user.coins.toLocaleString()} AUR</span>
          </div>
        </div>

        {/* Anti-cheat Security Notice */}
        <div className="mt-3.5 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All task rewards are validated directly on the secure server & verified against database records.</span>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 text-slate-950 font-black text-xs text-center shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce font-mono">
          {notice}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PERMANENT DAILY LOGIN TASK CARD (24h Server Countdown) */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border border-emerald-500/40 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0 shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-100">Daily Login</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase font-mono">
                  Permanent Task
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Log in every 24h to claim daily streak rewards up to 250 AUR
              </p>
            </div>
          </div>
        </div>

        {/* Streak Stats Bar */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Current Streak</div>
              <div className="text-sm font-black text-slate-100">Day {currentStreakDay} / 30</div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-2.5">
            <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Today's Reward</div>
              <div className="text-sm font-black text-amber-400 flex items-center gap-1">
                <span>+{currentDayReward} AUR</span>
                {isCurrentBonusDay && <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Login Claim Button or Countdown */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {isDailyCooldown ? (
            <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-400">Claimed ✓</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Next in {dailyCountdownStr}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClaimDailyLogin}
              disabled={claimingId === 'task-1'}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              {claimingId === 'task-1' ? (
                <span className="animate-spin text-sm">⌛ Validating on Server...</span>
              ) : (
                <>
                  <Award className="w-4 h-4 stroke-[2.5]" />
                  <span>Claim Day {currentStreakDay} Reward (+{currentDayReward} AUR)</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Toggle 30-Day Rewards Map Accordion */}
        <button
          onClick={() => setShowStreakMap(!showStreakMap)}
          className="w-full pt-2 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer font-mono"
        >
          <span>{showStreakMap ? 'Hide 30-Day Rewards Map' : 'View 30-Day Rewards Schedule'}</span>
          {showStreakMap ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* 30-Day Schedule Grid */}
        {showStreakMap && (
          <div className="mt-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3 animate-in fade-in duration-300 font-mono">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold">30-Day Reward Schedule</span>
              <span className="text-[10px] text-amber-400 font-bold">Bonus Days: 5, 10, 20, 30</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center">
              {DAILY_REWARDS_30.map((reward, idx) => {
                const dayNum = idx + 1;
                const isBonus = BONUS_DAYS.includes(dayNum);
                const isPast = dayNum < currentStreakDay || (dayNum === currentStreakDay && isDailyCooldown);
                const isCurrent = dayNum === currentStreakDay && !isDailyCooldown;

                return (
                  <div
                    key={dayNum}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                      isPast
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 opacity-80'
                        : isCurrent
                        ? 'bg-emerald-500/20 border-emerald-400 text-slate-100 shadow-[0_0_10px_rgba(16,185,129,0.3)] scale-105 z-10'
                        : isBonus
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-slate-400">D{dayNum}</span>
                    <span className={`text-[11px] font-black ${isBonus ? 'text-amber-400' : 'text-slate-100'}`}>
                      +{reward}
                    </span>
                    {isPast && (
                      <div className="absolute top-0.5 right-0.5 text-emerald-400">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. REFERRAL DEPOSIT TASK CARD (50 AUR)                     */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/30 border border-amber-500/30 shadow-xl space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-100">Referral Deposit Task</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase font-mono">
                  50 AUR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Invite a friend and receive 50 AUR when your referred friend makes an approved deposit of 5 USDT or more.
              </p>
            </div>
          </div>
        </div>

        {/* Progress & Reward status */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>Progress:</span>
            {isRefTaskCompleted ? (
              <span className="text-emerald-400 font-black flex items-center gap-1">
                1/1 completed <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            ) : (
              <span className="text-amber-400 font-black">0/1 completed</span>
            )}
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
            <AurexTokenLogo size={14} />
            <span>+50 AUR</span>
          </div>
        </div>

        {/* Task Action Button */}
        {isRefTaskCompleted ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black text-center flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>1/1 Completed ✓ (Reward Granted)</span>
          </div>
        ) : (
          <button
            onClick={() => setRefModalOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
            <span>Invite Friend to Earn 50 AUR</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. SOCIAL TASKS LIST (Telegram & YouTube)                  */}
      {/* ========================================================= */}
      {socialTasks.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono px-1">
            Social Community Tasks
          </h3>

          {socialTasks.map((task) => {
            const isClaiming = claimingId === task.id;
            const isVisited = visitedTaskIds.includes(task.id);
            const titleLower = task.title.toLowerCase();
            const isYouTube = titleLower.includes('youtube');
            const isTelegram = titleLower.includes('telegram');

            let buttonText = 'Go';
            let isDisabled = false;
            let isTimerButton = false;

            if (task.completed || user.completedTaskIds?.includes(task.id)) {
              buttonText = 'Completed';
            } else if (isYouTube) {
              if (!isVisited) {
                buttonText = 'Subscribe';
              } else if (ytTimer > 0) {
                buttonText = `Wait ${ytTimer}s`;
                isDisabled = true;
                isTimerButton = true;
              } else {
                buttonText = 'Verify';
              }
            } else if (isTelegram) {
              if (!isVisited) {
                buttonText = 'Join';
              } else {
                buttonText = 'Verify';
              }
            } else if (isVisited) {
              buttonText = 'Verify';
            }

            const isTaskDone = task.completed || user.completedTaskIds?.includes(task.id);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-3xl transition-all relative overflow-hidden ${
                  isTaskDone
                    ? 'bg-slate-950/70 border border-emerald-500/30 opacity-90'
                    : 'bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 shadow-inner">
                      {isYouTube ? (
                        <PlayCircle className="w-5 h-5 text-rose-400" />
                      ) : isTelegram ? (
                        <Send className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Target className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-100">{task.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{task.description}</p>

                      <div className="mt-2 inline-flex items-center space-x-1.5 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-xl border border-amber-500/20 font-mono">
                        <AurexTokenLogo size={14} />
                        <span>+{task.rewardCoins} AUR</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 font-mono">
                    {isTaskDone ? (
                      <span className="px-3.5 py-2 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 text-xs font-black flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleTaskClick(task)}
                        disabled={isDisabled || isClaiming}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md uppercase tracking-wider cursor-pointer ${
                          isDisabled
                            ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        }`}
                      >
                        {isClaiming ? (
                          <span className="animate-spin font-mono">⌛</span>
                        ) : isTimerButton ? (
                          <>
                            <Clock className="w-3.5 h-3.5 stroke-[2.5] text-amber-400" />
                            <span>{buttonText}</span>
                          </>
                        ) : (
                          <>
                            <span>{buttonText}</span>
                            {buttonText === 'Verify' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            )}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Human Verification Modal for Social Tasks */}
      <HumanVerificationModal
        isOpen={isVerifyOpen}
        onClose={() => {
          setIsVerifyOpen(false);
          setPendingTask(null);
        }}
        onSuccess={executeClaimSocialTask}
        title="Human Verification"
        rewardText={pendingTask ? `Claim +${pendingTask.rewardCoins} AUR` : undefined}
      />

      {/* Referral Info & Invite Modal */}
      {refModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-100">Referral Deposit Task</h3>
              </div>
              <button
                onClick={() => setRefModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Share your referral link with a friend. Once your referred friend signs up and completes an approved deposit of at least <strong className="text-amber-400">5 USDT</strong>, the server will automatically verify and credit <strong className="text-amber-400">50 AUR</strong> to your balance!
            </p>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">Your Referral Code</div>
              <div className="text-sm font-black text-amber-400 font-mono tracking-wider">{user.referralCode || user.id}</div>
            </div>

            <div className="space-y-2">
              <button
                onClick={copyReferralLink}
                className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer font-mono"
              >
                <Copy className="w-4 h-4 text-emerald-400" />
                <span>Copy Referral Link</span>
              </button>

              <button
                onClick={shareViaTelegram}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer font-mono shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Share via Telegram</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Celebration Modal */}
      {celebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-amber-400">
                <Sparkles className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black uppercase font-mono tracking-widest">
                Bonus Milestone Unlocked!
              </span>
              <h3 className="text-xl font-black text-slate-100 mt-2">Day {celebrationModal.day} Streak Bonus!</h3>
              <p className="text-xs text-slate-300 mt-1">
                You claimed <span className="text-amber-400 font-black">+{celebrationModal.reward} AUR</span> milestone bonus credited directly to your balance!
              </p>
            </div>

            <button
              onClick={() => setCelebrationModal(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer font-mono"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
