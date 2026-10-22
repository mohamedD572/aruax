import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Country, Service, SMSOrder } from '../../types/sms';
import { ServiceIcon } from './ServiceIcon';
import { smsVaultStore } from '../../services/smsVaultStore';

interface BuyConfirmModalProps {
  country: Country;
  service: Service;
  price: number;
  onClose: () => void;
  onSuccess: (order: SMSOrder) => void;
  onOpenAddBalance: () => void;
}

export const BuyConfirmModal: React.FC<BuyConfirmModalProps> = ({
  country,
  service,
  price,
  onClose,
  onSuccess,
  onOpenAddBalance,
}) => {
  const wallet = smsVaultStore.getWallet();
  const currentBalance = wallet.balance;
  const balanceAfter = Number((currentBalance - price).toFixed(2));
  const hasSufficientBalance = currentBalance >= price;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!hasSufficientBalance) {
      setErrorMsg('Insufficient balance. Please add funds to proceed.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const res = smsVaultStore.buyNumber(country.id, service.id);
      setLoading(false);

      if (res.success && res.order) {
        onSuccess(res.order);
      } else {
        setErrorMsg(res.error || 'Failed to purchase number. Please try again.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-[#0B0F17] border border-emerald-500/30 p-6 shadow-2xl shadow-emerald-950/80 relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Confirm Order</h3>
              <p className="text-xs text-slate-400">Review your virtual number purchase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Service & Country Details Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          {/* Service Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Service</span>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: service.color }}
              >
                <ServiceIcon iconKey={service.iconKey} size={14} />
              </div>
              <span className="text-sm font-bold text-slate-100">{service.name}</span>
            </div>
          </div>

          {/* Country Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Country</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">{country.flag}</span>
              <span className="text-sm font-bold text-slate-100">{country.name}</span>
              <span className="text-xs text-slate-400 font-mono">({country.prefix})</span>
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Pricing Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Number Price</span>
            <span className="text-base font-black text-emerald-400 font-mono">
              ${price.toFixed(2)} USDT
            </span>
          </div>
        </div>

        {/* Balance Breakdown Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-900 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>Current Balance:</span>
            <span className="font-bold text-slate-200">${currentBalance.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Number Price:</span>
            <span className="font-bold text-rose-400">-${price.toFixed(2)}</span>
          </div>
          <div className="h-px bg-slate-850 my-1" />
          <div className="flex items-center justify-between text-slate-200 font-bold text-sm">
            <span>Remaining Balance:</span>
            <span className={hasSufficientBalance ? 'text-emerald-400' : 'text-rose-400'}>
              ${Math.max(0, balanceAfter).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Insufficient Balance Notice & Deposit Action */}
        {!hasSufficientBalance && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Balance too low for this purchase.</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAddBalance();
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 flex items-center gap-1 shrink-0"
            >
              Add Funds
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!hasSufficientBalance || loading}
            className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg ${
              hasSufficientBalance && !loading
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 shadow-emerald-950/60 hover:shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Assigning Number...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm Purchase
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
