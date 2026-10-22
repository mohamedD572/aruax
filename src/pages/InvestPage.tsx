import React, { useState, useEffect } from 'react';
import { INVESTMENT_PLANS } from '../data/initialData';
import { InvestmentPlan, Investment, UserProfile } from '../types';
import { store } from '../services/store';
import { TelegramService } from '../services/telegram';
import { Cpu, Check, AlertCircle, Sparkles, ShieldCheck, ArrowRight, Activity, Zap, HardDrive, Server, Fan, Gauge, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getMinerRank } from '../utils/minerRank';

interface InvestPageProps {
  user: UserProfile;
  investments: Investment[];
  onDepositNeeded: () => void;
}

const generateHash = () => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 8; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

export const InvestPage: React.FC<InvestPageProps> = ({ user, investments = [], onDepositNeeded }) => {
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan>(INVESTMENT_PLANS[1]); // Default Bronze ASIC
  const [amountInput, setAmountInput] = useState<number>(selectedPlan.minAmount);
  const [isActivating, setIsActivating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [liveHashes, setLiveHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const updated: Record<string, string> = {};
      INVESTMENT_PLANS.forEach((plan) => {
        updated[plan.id] = generateHash();
      });
      setLiveHashes(updated);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const dailyYield = parseFloat(((amountInput * selectedPlan.dailyPercent) / 100).toFixed(2));
  const totalReturn = parseFloat((dailyYield * selectedPlan.durationDays).toFixed(2));
  const netProfit = parseFloat((totalReturn - amountInput).toFixed(2));

  const handleSelectPlan = (plan: InvestmentPlan) => {
    TelegramService.hapticSelection();
    setSelectedPlan(plan);
    setAmountInput(plan.minAmount);
  };

  const handleActivatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (amountInput < selectedPlan.minAmount || amountInput > selectedPlan.maxAmount) {
      const msg = `Amount must be between $${selectedPlan.minAmount} and $${selectedPlan.maxAmount} USDT for ${selectedPlan.name}.`;
      setFeedback({ type: 'error', message: msg });
      store.showErrorModal('Invalid Amount', msg);
      return;
    }

    if (user.balance < amountInput) {
      const msg = `You don't have enough USDT balance to activate ${selectedPlan.name}. Required: $${amountInput.toFixed(2)} USDT, Available: $${user.balance.toFixed(2)} USDT.`;
      setFeedback({ type: 'error', message: msg });
      store.showInsufficientBalanceModal(amountInput, msg);
      return;
    }

    setIsActivating(true);
    TelegramService.hapticImpact('heavy');

    const result = await store.createInvestment(selectedPlan.id, `${selectedPlan.name} (${selectedPlan.rigModel})`, amountInput, selectedPlan.dailyPercent);

    if (result.success) {
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10B981', '#F59E0B', '#38BDF8'],
        });
      } catch {
        // Ignore
      }

      const successMsg = `Successfully launched ${selectedPlan.name}! Mining rig is now active.`;
      setFeedback({ type: 'success', message: successMsg });
      TelegramService.hapticNotification('success');
      store.showSuccessModal('Mining Rig Activated! 🚀', successMsg);
    } else {
      setFeedback({ type: 'error', message: result.message });
      TelegramService.hapticNotification('error');
      if (result.message.toLowerCase().includes('balance')) {
        store.showInsufficientBalanceModal(amountInput, result.message);
      } else {
        store.showErrorModal('Activation Failed', result.message);
      }
    }

    setIsActivating(false);
  };

  const minerRank = getMinerRank(investments);

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex items-center justify-between glass-card-glow p-4.5 rounded-3xl border border-emerald-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400 animate-pulse" />
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Cloud Mining Farm</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">High-efficiency ASIC & GPU hardware rigs with 24h payout cycles</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs flex items-center gap-1.5 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Live Hardware</span>
        </div>
      </div>

      {/* Dynamic Miner Rank Banner */}
      <div className={`p-4.5 rounded-3xl glass-card transition-all shadow-xl relative overflow-hidden border ${minerRank.badgeBorder}`}>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner shrink-0"
                style={{ backgroundColor: `${minerRank.badgeColor}15`, borderColor: minerRank.badgeColor, color: minerRank.badgeColor }}
              >
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Miner Rank:</span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-black border shadow-sm"
                    style={{ backgroundColor: `${minerRank.badgeColor}20`, borderColor: minerRank.badgeColor, color: minerRank.badgeColor }}
                  >
                    Lvl {minerRank.level} • {minerRank.titleEn}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  Active Mining Capital: <strong className="text-slate-100 font-bold">${minerRank.totalActiveInvested.toLocaleString()} USDT</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Rank Progress Bar */}
          {minerRank.level < 7 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Rank Level Progress ({minerRank.progressPercent}%)</span>
                <span>${minerRank.totalActiveInvested} / ${minerRank.nextThreshold.toLocaleString()} USDT</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${minerRank.progressPercent}%`,
                    backgroundColor: minerRank.badgeColor,
                  }}
                />
              </div>
            </div>
          )}

          {/* Unlocked Features Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 pt-1 scrollbar-none text-[10px]">
            <span className="text-slate-400 shrink-0 font-bold">Perks:</span>
            {minerRank.unlockedFeaturesEn.map((feat, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-200 shrink-0 flex items-center gap-1 font-medium"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mining Rig Selection Cards - Compact Mobile Layout */}
      <div className="grid grid-cols-1 gap-2.5">
        {INVESTMENT_PLANS.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className={`rounded-2xl transition-all cursor-pointer relative overflow-hidden border p-2.5 flex items-center gap-3 bg-slate-950 ${
                isSelected
                  ? `border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950`
                  : `border-slate-800 hover:border-slate-700`
              }`}
            >
              {/* Left: Compact Device Image */}
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-900 flex items-center justify-center">
                <img
                  src={plan.rigImage}
                  alt={plan.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-1 -z-0">
                  <Cpu className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                {isSelected && (
                  <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#10B981] animate-laser-scan z-10" />
                )}
                <span className="absolute bottom-0.5 inset-x-0 bg-black/85 text-[8px] font-mono text-emerald-400 text-center font-bold">
                  30 Days
                </span>
              </div>

              {/* Middle: Rig Name + Price + Hashrate */}
              <div className="flex-1 min-w-0 font-mono">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-slate-100 truncate">
                    {plan.name}
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    {plan.hashRate}
                  </span>
                </div>

                <p className="text-[10px] text-amber-400 font-bold truncate mt-0.5">
                  Price: ${plan.minAmount} – ${plan.maxAmount.toLocaleString()} USDT
                </p>

                <div className="flex items-center gap-3 text-[9px] text-slate-400 mt-1">
                  <span>Draw: <strong className="text-slate-200">{plan.powerUsage}</strong></span>
                  <span>Eff: <strong className="text-emerald-400">{plan.efficiency}</strong></span>
                </div>
              </div>

              {/* Right: Daily Reward */}
              <div className="text-right shrink-0 font-mono pl-1">
                <div className="text-base font-black text-emerald-400 tracking-tight">+{plan.dailyPercent}%</div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Daily</div>
                {isSelected && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-emerald-400 text-slate-950 font-extrabold text-[8px] uppercase">
                    Selected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activation Form & Calculator */}
      <div className="p-5 sm:p-6 rounded-3xl glass-card border border-slate-800/90 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-slate-100">
              Activate <span className="text-emerald-400">{selectedPlan.name}</span>
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Balance: <strong className="text-emerald-400 font-bold">${user.balance.toFixed(2)} USDT</strong>
          </span>
        </div>

        <form onSubmit={handleActivatePlan} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
              <span>Deposit Capital (USDT)</span>
              <span className="font-mono">
                ${selectedPlan.minAmount} – ${selectedPlan.maxAmount.toLocaleString()} USDT
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={selectedPlan.minAmount}
                max={selectedPlan.maxAmount}
                step="any"
                value={amountInput}
                onChange={(e) => setAmountInput(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 rounded-2xl px-4 py-3.5 text-base font-black text-slate-100 font-mono outline-none transition-all shadow-inner"
                required
              />
              <button
                type="button"
                onClick={() => setAmountInput(Math.min(user.balance, selectedPlan.maxAmount))}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Profit Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-400 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Yield Projection (30 Days)</span>
              <span className="text-emerald-400 font-black font-mono">+{selectedPlan.dailyPercent}% / Day</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Daily Payout</span>
                <span className="text-xs font-black text-emerald-400">${dailyYield.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Return</span>
                <span className="text-xs font-black text-slate-100">${totalReturn.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Net Profit</span>
                <span className="text-xs font-black text-sky-400">+${netProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-400'
              }`}
            >
              {feedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {user.balance < amountInput ? (
            <button
              type="button"
              onClick={onDepositNeeded}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Deposit USDT to Launch Hardware Rig</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isActivating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-slate-950 font-black text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4.5 h-4.5 fill-current" />
              <span>Confirm & Activate Rig (${amountInput} USDT)</span>
            </button>
          )}
        </form>
      </div>

      <div className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center space-x-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <p>
          Automated ASIC Cloud Farm logic. Daily profits accrue every 24 hours directly into your withdrawable wallet balance.
        </p>
      </div>
    </div>
  );
};
