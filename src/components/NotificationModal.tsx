import React from 'react';
import { X, Bell, CheckCircle2, ArrowDownLeft, ArrowUpRight, TrendingUp, Gift, Info, AlertTriangle, Wrench, Zap, RefreshCw } from 'lucide-react';
import { AppNotification, Investment } from '../types';
import { store } from '../services/store';
import { TelegramService } from '../services/telegram';
import { getMaintenanceCost } from '../utils/maintenance';
import confetti from 'canvas-confetti';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  investments?: Investment[];
  onMarkAllRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  investments = [],
  onMarkAllRead,
}) => {
  const [loadingInvId, setLoadingInvId] = React.useState<string | null>(null);
  const [modalFeedback, setModalFeedback] = React.useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const handlePerformMaintenance = (invId: string) => {
    setLoadingInvId(invId);
    setModalFeedback(null);
    TelegramService.hapticImpact('heavy');

    setTimeout(() => {
      const res = store.performEquipmentMaintenance(invId);
      setLoadingInvId(null);
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.3 },
          colors: ['#7CFF4F', '#38BDF8', '#F59E0B'],
        });
        setModalFeedback({ text: res.message });
      } else {
        setModalFeedback({ text: res.message, error: true });
      }
    }, 600);
  };

  const handleTriggerSimulatedAlert = () => {
    TelegramService.hapticImpact('medium');
    const res = store.triggerSimulatedPowerDrop();
    if (!res.success) {
      store.showErrorModal('Equipment Alert', res.message);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-[#7CFF4F]" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-sky-400" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
      case 'profit':
        return <CheckCircle2 className="w-4 h-4 text-[#7CFF4F]" />;
      case 'task':
        return <Gift className="w-4 h-4 text-purple-400" />;
      case 'efficiency':
        return <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-[#7CFF4F]" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div className="w-full max-w-md bg-[#0D1117] h-full flex flex-col border-l border-[#21262D] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#21262D]">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#7CFF4F]" />
            <h2 className="text-lg font-bold text-[#F0F6FC]">Notifications & Alerts</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#7CFF4F] hover:underline font-medium px-2 py-1"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {modalFeedback && (
            <div className={`p-3 rounded-xl border text-xs font-bold ${
              modalFeedback.error
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-[#7CFF4F]/10 border-[#7CFF4F]/30 text-[#7CFF4F]'
            }`}>
              {modalFeedback.text}
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#8B949E]">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const inv = n.investmentId
                ? investments.find((i) => i.id === n.investmentId)
                : null;

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                    n.type === 'efficiency'
                      ? 'bg-amber-500/10 border-amber-500/50 text-[#F0F6FC] shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : n.read
                      ? 'bg-[#161B22]/60 border-[#21262D] text-[#8B949E]'
                      : 'bg-[#161B22] border-[#7CFF4F]/30 text-[#F0F6FC] shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-[#0D1117] border border-[#30363D] shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold truncate text-[#F0F6FC]">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-[#8B949E]">
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
