import React from 'react';
import { X, Bell, CheckCheck, Sparkles, ArrowDownLeft, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { AppNotification } from '../types';
import { soundService } from '../services/soundService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const getNotifIcon = (type?: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400 stroke-[2.5]" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-sky-400 stroke-[2.5]" />;
      case 'profit':
        return <Sparkles className="w-4 h-4 text-amber-400 stroke-[2.5]" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-400 stroke-[2.5]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Bell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 uppercase tracking-tight font-mono">
                Notification Center
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Real-Time System & Reward Updates</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar */}
        {notifications.length > 0 && onMarkAllRead && (
          <div className="flex justify-end shrink-0">
            <button
              onClick={() => {
                soundService.playClick();
                onMarkAllRead();
              }}
              className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1 hover:underline"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="overflow-y-auto space-y-2 pr-1 font-mono flex-1 scrollbar-thin scrollbar-thumb-slate-800">
          {notifications.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No notifications at this moment.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const dateObj = new Date(notif.createdAt || Date.now());
              const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={notif.id}
                  className={`p-3 rounded-2xl border transition-all space-y-1 ${
                    notif.read
                      ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                      : 'bg-slate-900 border-emerald-500/30 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                        {getNotifIcon(notif.type)}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-100 uppercase">{notif.title}</h4>
                    </div>
                    <span className="text-[9px] text-slate-500">{timeStr}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed pl-8">
                    {notif.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
