import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';
import { aurexTradingStore } from '../../services/aurexTradingStore';
import { languageService } from '../../services/languageService';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const [, setLang] = useState(languageService.getLanguage());
  const notifications = aurexTradingStore.getNotifications();

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  const handleMarkAllRead = () => {
    aurexTradingStore.markNotificationsAsRead();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-[#0A0E17] border border-emerald-500/30 p-6 shadow-2xl relative overflow-hidden space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{languageService.t('notificationsTitle')}</h3>
              <p className="text-xs text-slate-400">{languageService.t('notificationsSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              title={languageService.t('markAllRead')}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.map((notif) => {
            return (
              <div
                key={notif.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  notif.isRead
                    ? 'bg-slate-900/40 border-slate-800/60 text-slate-300'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-200">{notif.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed pl-4">
                  {notif.message}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            {languageService.t('paperModeProtected')}
          </span>
          <span>Aurex Engine v3.2</span>
        </div>
      </div>
    </div>
  );
};
