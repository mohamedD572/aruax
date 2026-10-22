import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RefreshCw,
  XCircle,
  Clock,
  Radio,
  MessageSquareCode,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SMSOrder } from '../../types/sms';
import { ServiceIcon } from './ServiceIcon';
import { smsVaultStore } from '../../services/smsVaultStore';

interface ActiveOrderCardProps {
  order: SMSOrder;
  onClose?: () => void;
  onOrderUpdated?: () => void;
}

export const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({
  order,
  onClose,
  onOrderUpdated,
}) => {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Countdown timer logic
  useEffect(() => {
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((order.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0 && order.status === 'WAITING_SMS') {
        // Auto cancel & refund on timeout
        smsVaultStore.cancelOrder(order.id);
        if (onOrderUpdated) onOrderUpdated();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [order.id, order.expiresAt, order.status, onOrderUpdated]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(order.phoneNumber.replace(/\s+/g, ''));
    setCopiedPhone(true);
    showToast('Phone number copied to clipboard!');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyCode = () => {
    if (order.sms?.code) {
      navigator.clipboard.writeText(order.sms.code);
      setCopiedCode(true);
      showToast('Verification code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const handleRefreshSms = () => {
    setIsRefreshing(true);
    showToast('Checking incoming SMS gateway...');
    setTimeout(() => {
      smsVaultStore.refreshSms(order.id);
      setIsRefreshing(false);
      if (onOrderUpdated) onOrderUpdated();
    }, 600);
  };

  const handleSimulateArrival = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      smsVaultStore.simulateIncomingSms(order.id);
      setIsRefreshing(false);
      showToast('📩 Incoming SMS arrived!');
      if (onOrderUpdated) onOrderUpdated();
    }, 400);
  };

  const handleCancelOrder = () => {
    if (confirm(`Are you sure you want to cancel order #${order.id}? $${order.price.toFixed(2)} will be immediately refunded to your balance.`)) {
      setIsCancelling(true);
      setTimeout(() => {
        const res = smsVaultStore.cancelOrder(order.id);
        setIsCancelling(false);
        if (res.success) {
          showToast(res.message);
          if (onOrderUpdated) onOrderUpdated();
          if (onClose) setTimeout(onClose, 800);
        }
      }, 400);
    }
  };

  const handleCompleteOrder = () => {
    smsVaultStore.completeOrder(order.id);
    showToast('Order marked as Completed.');
    if (onOrderUpdated) onOrderUpdated();
  };

  // Determine timeline steps
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const hasSms = Boolean(order.sms) || order.status === 'SMS_RECEIVED' || order.status === 'COMPLETED';
  const isDone = order.status === 'COMPLETED';

  return (
    <div className="w-full rounded-3xl bg-[#090D14] border border-emerald-500/30 p-4 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
      {/* Toast alert */}
      {feedbackToast && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Banner & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ServiceIcon iconKey={order.serviceIconKey} size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-100">{order.serviceName}</span>
              <span className="text-sm">{order.countryFlag}</span>
              <span className="text-xs text-slate-400">({order.countryName})</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
              <span>Order ID: <strong className="text-slate-300">#{order.id}</strong></span>
              <span>•</span>
              <span>Price: <strong className="text-emerald-400">${order.price.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {order.status === 'WAITING_SMS' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>WAITING FOR SMS</span>
            </div>
          )}
          {order.status === 'SMS_RECEIVED' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>SMS RECEIVED</span>
            </div>
          )}
          {order.status === 'COMPLETED' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>COMPLETED</span>
            </div>
          )}
          {isCancelled && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-bold">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>CANCELLED & REFUNDED</span>
            </div>
          )}
        </div>
      </div>

      {/* HERO PHONE NUMBER CARD */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#111722] to-[#0A0F18] border border-emerald-500/40 text-center relative overflow-hidden shadow-inner group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/90 mb-1 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Assigned Virtual Phone Number
        </p>

        {/* Big Phone Number */}
        <div className="text-2xl sm:text-4xl font-black text-slate-100 font-mono tracking-wider my-2 select-all">
          {order.phoneNumber}
        </div>

        {/* Copy Phone Button */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            onClick={handleCopyPhone}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-md ${
              copiedPhone
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 scale-105'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400'
            }`}
          >
            {copiedPhone ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Number
              </>
            )}
          </button>
        </div>

        {/* Countdown timer footer */}
        {order.status === 'WAITING_SMS' && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs font-mono text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Time Remaining:</span>
            <span className="font-bold text-amber-400 text-sm bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30">
              {formatCountdown(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* 5. SMS SECTION */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <MessageSquareCode className="w-4 h-4 text-emerald-400" />
            <span>Incoming SMS</span>
          </div>

          {/* Simulate Arrival helper button for convenience / testing */}
          {order.status === 'WAITING_SMS' && (
            <button
              onClick={handleSimulateArrival}
              title="Click to simulate instant SMS delivery"
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Zap className="w-3 h-3 fill-current" />
              Simulate Instant SMS
            </button>
          )}
        </div>

        {/* State A: Waiting for SMS */}
        {order.status === 'WAITING_SMS' && !order.sms && (
          <div className="py-8 px-4 rounded-xl bg-slate-950/60 border border-slate-850 text-center space-y-3">
            <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">
                Waiting for incoming SMS...
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Enter the number above into <strong className="text-slate-300">{order.serviceName}</strong>. The activation code will appear here automatically.
              </p>
            </div>
          </div>
        )}

        {/* State B: SMS Received */}
        {order.sms && (
          <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/40 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                SMS Received from {order.sms.sender}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(order.sms.receivedAt).toLocaleTimeString()}
              </span>
            </div>

            {/* Message Body */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 font-mono leading-relaxed select-all">
              {order.sms.text}
            </div>

            {/* Highlighted Verification Code */}
            {order.sms.code && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Verification Code
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-widest select-all">
                    {order.sms.code}
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                    copiedCode
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                  }`}
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      Code Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      COPY CODE
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* State C: Cancelled / Refunded message */}
        {isCancelled && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">This order was cancelled.</p>
              <p className="text-[11px] text-rose-300/80">
                ${order.price.toFixed(2)} was refunded back to your available balance.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 6. STATUS TIMELINE */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-900 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Order Status Timeline
        </span>

        <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs">
          {/* Step 1: Created */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center mb-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-medium text-emerald-400">Order Created</span>
          </div>

          {/* Step 2: Assigned */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center mb-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-medium text-emerald-400">Number Assigned</span>
          </div>

          {/* Step 3: Waiting */}
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full font-bold flex items-center justify-center mb-1 ${
                hasSms || isDone
                  ? 'bg-emerald-500 text-slate-950'
                  : isCancelled
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-slate-950 animate-pulse'
              }`}
            >
              {hasSms || isDone ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : isCancelled ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5 animate-spin" />
              )}
            </div>
            <span
              className={`font-medium ${
                hasSms || isDone ? 'text-emerald-400' : isCancelled ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              Waiting SMS
            </span>
          </div>

          {/* Step 4: Received */}
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full font-bold flex items-center justify-center mb-1 ${
                hasSms
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {hasSms ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '4'}
            </div>
            <span className={`font-medium ${hasSms ? 'text-emerald-400' : 'text-slate-500'}`}>
              SMS Received
            </span>
          </div>

          {/* Step 5: Completed */}
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full font-bold flex items-center justify-center mb-1 ${
                isDone
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '5'}
            </div>
            <span className={`font-medium ${isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {order.status === 'WAITING_SMS' && (
            <>
              <button
                type="button"
                onClick={handleRefreshSms}
                disabled={isRefreshing}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                Refresh SMS
              </button>

              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="py-2.5 px-4 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                Cancel Order
              </button>
            </>
          )}

          {order.status === 'SMS_RECEIVED' && (
            <button
              type="button"
              onClick={handleCompleteOrder}
              className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finish & Mark Completed
            </button>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs transition-colors cursor-pointer ml-auto"
          >
            Close Window
          </button>
        )}
      </div>
    </div>
  );
};
