import React, { useState } from 'react';
import { X, ArrowDownUp, RefreshCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { store } from '../services/store';
import { TelegramService } from '../services/telegram';
import { soundService } from '../services/soundService';
import { AurexTokenLogo } from './AurexTokenLogo';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const SwapModal: React.FC<SwapModalProps> = ({ isOpen, onClose, user }) => {
  const [fromType, setFromType] = useState<'USDT' | 'AUR'>('USDT');
  const [fromAmount, setFromAmount] = useState<string>('10');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const numericFrom = parseFloat(fromAmount) || 0;
  const toAmount = fromType === 'USDT' ? numericFrom * 100 : (numericFrom / 100).toFixed(2);

  const handleToggleDirection = () => {
    soundService.playClick();
    TelegramService.hapticImpact('medium');
    setFromType((prev) => (prev === 'USDT' ? 'AUR' : 'USDT'));
    setFromAmount('');
    setNotice(null);
  };

  const handleSwap = () => {
    if (!numericFrom || numericFrom <= 0) {
      setNotice({ type: 'error', text: 'Enter a valid amount to swap' });
      return;
    }

    soundService.playClaimReward();
    TelegramService.hapticImpact('heavy');
    setLoading(true);
    setNotice(null);

    setTimeout(() => {
      const res = store.swapUsdtAndAurex(fromType === 'USDT' ? 'USDT' : 'AUX', numericFrom);
      setLoading(false);
      if (res.success) {
        soundService.playVictory();
        TelegramService.hapticNotification('success');
        setNotice({ type: 'success', text: res.message.replace(/AUX|Aurex Token/g, 'AUR') });
        setFromAmount('');
        setTimeout(() => {
          onClose();
          setNotice(null);
        }, 1800);
      } else {
        TelegramService.hapticNotification('error');
        setNotice({ type: 'error', text: res.message.replace(/AUX|Aurex Token/g, 'AUR') });
      }
    }, 600);
  };

  const handleSetMax = () => {
    soundService.playClick();
    TelegramService.hapticImpact('light');
    if (fromType === 'USDT') {
      setFromAmount(user.balance.toString());
    } else {
      setFromAmount(user.coins.toString());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/30 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-4 relative overflow-hidden font-mono">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ArrowDownUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">
                AUR Instant Exchange
              </h3>
              <p className="text-[10px] text-emerald-400 font-bold">100 AUR = 1.00 USDT</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice alert */}
        {notice && (
          <div
            className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              notice.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                : 'bg-red-500/15 border border-red-500/40 text-red-400'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        {/* Swap Container */}
        <div className="space-y-2 relative">
          {/* FROM Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 focus-within:border-emerald-500/50 transition-all space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>You Pay</span>
              <span>
                Balance:{' '}
                <strong className="text-slate-200">
                  {fromType === 'USDT'
                    ? `$${user.balance.toFixed(2)} USDT`
                    : `${user.coins.toLocaleString()} AUR`}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-xl font-black text-slate-100 focus:outline-none placeholder:text-slate-600"
              />
              <button
                onClick={handleSetMax}
                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase transition-all"
              >
                MAX
              </button>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-xl shrink-0">
                {fromType === 'USDT' ? (
                  <>
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                      ₮
                    </span>
                    <span className="text-xs font-black text-slate-100">USDT</span>
                  </>
                ) : (
                  <>
                    <AurexTokenLogo size={20} />
                    <span className="text-xs font-black text-amber-400">AUR</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleToggleDirection}
              className="p-2 rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-90 transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] border-2 border-slate-900"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>

          {/* TO Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>You Receive</span>
              <span>
                Rate: <strong className="text-emerald-400">100 AUR = $1.00 USDT</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-full text-xl font-black text-emerald-400 truncate">
                {toAmount || '0.00'}
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1.5 rounded-xl shrink-0">
                {fromType === 'USDT' ? (
                  <>
                    <AurexTokenLogo size={20} />
                    <span className="text-xs font-black text-amber-400">AUR</span>
                  </>
                ) : (
                  <>
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                      ₮
                    </span>
                    <span className="text-xs font-black text-slate-100">USDT</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSwap}
          disabled={loading || !numericFrom}
          className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
            loading || !numericFrom
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-98'
          }`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing Swap...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>
                Confirm Swap {fromType} ➔ {fromType === 'USDT' ? 'AUR' : 'USDT'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
