import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Zap, AlertCircle, Clock, Lock } from 'lucide-react';
import { CopyTrader, UserProfile, DEFAULT_COPY_LOCKUP_PLANS, CopyLockupPlan } from '../types';
import { TelegramService } from '../services/telegram';
import { getTranslation } from '../services/i18n';
import { store } from '../services/store';
import confetti from 'canvas-confetti';

interface CopyTradeModalProps {
  trader: CopyTrader | null;
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (traderId: string, planId: string, amount: number) => { success: boolean; message: string };
  langCode: any;
}

export const CopyTradeModal: React.FC<CopyTradeModalProps> = ({
  trader,
  user,
  isOpen,
  onClose,
  onConfirm,
  langCode
}) => {
  if (!isOpen || !trader) return null;

  const t = getTranslation(langCode);
  const plans = trader.plans && trader.plans.length > 0 ? trader.plans : DEFAULT_COPY_LOCKUP_PLANS;
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '1day');

  // If selected plan ID doesn't exist in current trader's plans, default to first plan
  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const [amount, setAmount] = useState<number>(selectedPlan.minAmount);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (plans.length > 0 && !plans.some(p => p.id === selectedPlanId)) {
      setSelectedPlanId(plans[0].id);
    }
  }, [trader]);

  useEffect(() => {
    if (selectedPlan && amount < selectedPlan.minAmount) {
      setAmount(selectedPlan.minAmount);
    }
  }, [selectedPlanId, selectedPlan]);

  const totalExpectedProfit = parseFloat(((amount * selectedPlan.profitPercent) / 100).toFixed(2));
  const totalReturn = parseFloat((amount + totalExpectedProfit).toFixed(2));
  const dailyProfit = parseFloat((totalExpectedProfit / selectedPlan.durationDays).toFixed(2));

  const handleCopySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount < selectedPlan.minAmount) {
      const msg = `Minimum copy amount for ${selectedPlan.title} is $${selectedPlan.minAmount} USDT.`;
      setError(msg);
      TelegramService.hapticNotification('error');
      store.showErrorModal('Minimum Amount Error', msg);
      return;
    }

    if (user.balance < amount) {
      const msg = `Insufficient USDT balance ($${user.balance.toFixed(2)} USDT available). Required: $${amount.toFixed(2)} USDT.`;
      setError(msg);
      TelegramService.hapticNotification('error');
      store.showInsufficientBalanceModal(amount, msg);
      return;
    }

    const res = onConfirm(trader.id, selectedPlan.id, amount);
    if (res.success) {
      TelegramService.hapticNotification('success');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      store.showSuccessModal(
        'Copy Position Started! 📈',
        `Successfully allocated $${amount.toFixed(2)} USDT to copy ${trader.name} on ${selectedPlan.title}!`
      );
      onClose();
    } else {
      setError(res.message);
      TelegramService.hapticNotification('error');
      if (res.message.toLowerCase().includes('balance')) {
        store.showInsufficientBalanceModal(amount, res.message);
      } else {
        store.showErrorModal('Copy Trade Error', res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div className="bg-[#0D1117] border border-[#21262D] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-[#F0F6FC]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#161B22] text-[#8B949E] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Trader Info */}
        <div className="flex items-center space-x-3.5 mb-5 pb-4 border-b border-[#21262D]">
          <img
            src={trader.avatar}
            alt={trader.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(trader.name)}&background=0D1117&color=7CFF4F&bold=true`;
            }}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#7CFF4F]"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white">{trader.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/30">
                {trader.badge}
              </span>
            </div>
            <p className="text-xs text-[#8B949E] mt-0.5">{trader.bio}</p>
          </div>
        </div>

        {/* Lockup Plan Selection Tiers */}
        <div className="space-y-2 mb-5">
          <label className="text-xs font-extrabold text-[#8B949E] uppercase tracking-wider block">
            Select Lockup Period & ROI
          </label>

          <div className="grid grid-cols-3 gap-2">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => {
                    TelegramService.hapticImpact('medium');
                    setSelectedPlanId(plan.id);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#7CFF4F]/15 to-[#161B22] border-[#7CFF4F] shadow-[0_0_15px_rgba(124,255,79,0.2)] scale-[1.02]'
                      : 'bg-[#161B22] border-[#21262D] hover:border-[#30363D] text-[#8B949E]'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold text-white mb-1">
                    <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-[#7CFF4F]' : 'text-[#8B949E]'}`} />
                    <span>{plan.durationDays === 1 ? '1 Day' : plan.durationDays === 30 ? '30 Days (1 Mo)' : `${plan.durationDays} Days`}</span>
                  </div>

                  <span className={`text-base font-black ${isSelected ? 'text-[#7CFF4F]' : 'text-white'}`}>
                    +{plan.profitPercent}%
                  </span>

                  <span className="text-[10px] font-semibold text-[#8B949E] mt-1">
                    Min ${plan.minAmount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleCopySubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs text-[#8B949E] mb-1.5">
              <span>Enter Copy Amount (USDT)</span>
              <span>Available: <strong className="text-white">${user.balance.toFixed(2)}</strong></span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={selectedPlan.minAmount}
                step="1"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-[#161B22] border border-[#30363D] focus:border-[#7CFF4F] rounded-2xl py-3.5 px-4 text-lg font-bold text-white outline-none transition-all pr-16"
                placeholder={`Min ${selectedPlan.minAmount}`}
              />
              <button
                type="button"
                onClick={() => setAmount(user.balance)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-bold bg-[#7CFF4F]/10 text-[#7CFF4F] rounded-lg border border-[#7CFF4F]/30 hover:bg-[#7CFF4F] hover:text-[#0D1117] transition-all"
              >
                MAX
              </button>
            </div>
            <p className="text-[11px] text-[#8B949E] mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7CFF4F]" />
              Min required for {selectedPlan.title}: <strong className="text-white">${selectedPlan.minAmount} USDT</strong>
            </p>
          </div>

          {/* Return Projection Box */}
          <div className="bg-gradient-to-r from-[#161B22] to-[#1C2128] p-4 rounded-2xl border border-[#30363D] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#8B949E]">Selected Duration</span>
              <span className="font-bold text-white">{selectedPlan.durationDays} Days Lockup</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#8B949E]">Expected Total Profit (+{selectedPlan.profitPercent}%)</span>
              <span className="font-bold text-[#7CFF4F]">+${totalExpectedProfit.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#8B949E]">Total Payout at Maturity</span>
              <span className="font-bold text-[#38BDF8]">${totalReturn.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-xs pt-1 border-t border-[#21262D]">
              <span className="text-[#8B949E]">Daily Yield Rate</span>
              <span className="font-bold text-emerald-400">+${dailyProfit.toFixed(2)} USDT / day</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-black bg-[#7CFF4F] hover:bg-[#68e03e] text-[#0D1117] shadow-[0_0_20px_rgba(124,255,79,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>Confirm & Start {selectedPlan.title}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
