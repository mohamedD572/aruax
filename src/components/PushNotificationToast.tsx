import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wrench, X, Zap, CheckCircle2, RefreshCw, BellRing } from 'lucide-react';
import { AppNotification, Investment } from '../types';
import { store } from '../services/store';
import { TelegramService } from '../services/telegram';
import { getMaintenanceCost } from '../utils/maintenance';
import confetti from 'canvas-confetti';

interface PushNotificationToastProps {
  notifications: AppNotification[];
  investments: Investment[];
  onOpenNotifications: () => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notifications,
  investments,
  onOpenNotifications,
}) => {
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Find latest unread notification that requires action
  useEffect(() => {
    const pendingAlert = notifications.find(
      (n) => !n.read && n.actionRequired && n.type !== 'efficiency' && n.type !== 'maintenance'
    );

    if (pendingAlert) {
      setActiveToast(pendingAlert);
      setErrorMsg(null);
      TelegramService.hapticNotification('warning');
    }
  }, [notifications]);

  if (!activeToast) return null;

  const targetInvestment = activeToast.investmentId
    ? investments.find((i) => i.id === activeToast.investmentId)
    : investments.find((i) => i.status === 'Active' && (i.powerEfficiencyPercent || 100) < 85);

  const efficiencyVal = targetInvestment?.powerEfficiencyPercent ?? 76;
  const maintenanceCost = targetInvestment ? getMaintenanceCost(targetInvestment.amount) : 0.50;

  const handlePerformMaintenance = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!targetInvestment) return;

    setIsFixing(true);
    setErrorMsg(null);
    TelegramService.hapticImpact('heavy');

    setTimeout(() => {
      const res = store.performEquipmentMaintenance(targetInvestment.id);
      setIsFixing(false);
      if (res.success) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.1 },
          colors: ['#7CFF4F', '#38BDF8', '#F59E0B'],
        });
        setActiveToast(null);
      } else {
        setErrorMsg(res.message);
      }
    }, 800);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveToast(null);
  };

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-in slide-in-from-top duration-300">
      <div className="relative p-3.5 rounded-2xl bg-[#0D1117]/95 border-2 border-amber-500/70 shadow-[0_10px_30px_rgba(245,158,11,0.35)] backdrop-blur-xl overflow-hidden">
        {/* Animated ambient warning backdrop glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 animate-pulse pointer-events-none" />

        <div className="relative z-10 flex items-start gap-3">
          {/* Animated Warning Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0 text-amber-400 shadow-inner">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-black tracking-wide text-amber-400 uppercase">
                <BellRing className="w-3 h-3 animate-ping" />
                Power Efficiency Alert
              </span>
              <button
                onClick={handleDismiss}
                className="p-1 text-[#8B949E] hover:text-[#F0F6FC] rounded-lg transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="text-xs font-bold text-[#F0F6FC] mt-0.5 truncate">
              {activeToast.title}
            </h4>
            <p className="text-[11px] text-[#8B949E] mt-0.5 line-clamp-2 leading-relaxed">
              {activeToast.message}
            </p>

            {/* Efficiency Meter Indicator */}
            <div className="mt-2 p-2 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#8B949E] font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Current Rig Efficiency:
                </span>
                <span className="font-extrabold font-mono text-amber-400">
                  {efficiencyVal}% (Low Performance)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#0D1117] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-[#7CFF4F] transition-all duration-500"
                  style={{ width: `${efficiencyVal}%` }}
                />
              </div>
            </div>

            {errorMsg && (
              <p className="mt-1.5 text-[10px] text-red-400 bg-red-500/10 p-1.5 rounded-lg border border-red-500/20 font-bold">
                {errorMsg}
              </p>
            )}

            {/* Quick Action Button */}
            {targetInvestment && (
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={handlePerformMaintenance}
                  disabled={isFixing}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#0D1117] font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-60"
                >
                  {isFixing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Cleaning filters & cooling hardware...</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Perform Maintenance (${maintenanceCost.toFixed(2)} USDT)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
