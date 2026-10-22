import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Bell,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Bot,
  UserCheck,
  Globe,
} from 'lucide-react';
import { TelegramVerifiedUser } from '../../types/trading';
import { aurexTradingStore } from '../../services/aurexTradingStore';
import { languageService } from '../../services/languageService';

interface NavbarProps {
  user: TelegramVerifiedUser | null;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onNavigate: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenNotifications,
  onOpenSettings,
  onOpenProfile,
  onNavigate,
}) => {
  const [lang, setLang] = useState(languageService.getLanguage());
  const account = aurexTradingStore.getPaperAccount();
  const unreadCount = aurexTradingStore.getUnreadNotificationCount();

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  const userInitials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`.toUpperCase()
    : 'AI';

  const handleToggleLanguage = () => {
    languageService.toggleLanguage();
  };

  const isAr = lang === 'ar';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#06080F]/90 backdrop-blur-xl border-b border-emerald-950/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-900/30 to-[#0A0E17] border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:border-emerald-400/80 transition-all duration-300">
            <Bot className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-base sm:text-lg tracking-wider text-slate-100 font-mono">
                AUREX <span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {isAr ? 'تداول آلي' : 'TRADER'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              {languageService.t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Center: System Status Pill (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 font-medium font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>{languageService.t('engineOnline')}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{languageService.t('spotOnly')}</span>
        </div>

        {/* Right: Language Toggle, Balance Chip, Notification, Settings, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Language Toggle Button */}
          <button
            onClick={handleToggleLanguage}
            title={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 text-slate-200 text-xs font-bold font-mono transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-emerald-300">
              {isAr ? 'English' : 'عربي'}
            </span>
          </button>

          {/* Paper Balance Chip */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/60 transition-colors cursor-pointer group shadow-sm"
          >
            <div className="flex flex-col text-right">
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {languageService.t('paperBalance')}
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                ${account.equity.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Trading Alerts"
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] sm:text-[10px] flex items-center justify-center animate-pulse shadow-md shadow-emerald-500/50">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            aria-label="Bot Settings"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={onOpenProfile}
            aria-label="Telegram User Profile"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors shadow-sm cursor-pointer overflow-hidden p-0.5"
          >
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.firstName}
                className="w-full h-full rounded-[10px] object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full rounded-[10px] bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xs font-mono">
                {userInitials}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
