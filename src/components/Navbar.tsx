import React, { useState } from 'react';
import { Bell, Shield, Sparkles, Award, Headset, Play, ChevronDown, Check } from 'lucide-react';
import { LanguageCode, UserProfile, Investment } from '../types';
import { TelegramService } from '../services/telegram';
import { LANGUAGES } from '../services/i18n';
import { getMinerRank } from '../utils/minerRank';

interface NavbarProps {
  user: UserProfile;
  investments?: Investment[];
  unreadCount: number;
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  onOpenIntegrationGuide: () => void;
  onOpenSupport?: () => void;
  onReplaySplash?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  investments = [],
  unreadCount,
  currentLang,
  onSelectLang,
  onOpenNotifications,
  onOpenAdmin,
  onOpenIntegrationGuide,
  onOpenSupport,
  onReplaySplash,
}) => {
  const isTgAvailable = TelegramService.isTelegramAvailable;
  const [showLangMenu, setShowLangMenu] = useState(false);

  const selectedLangObj = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
  const minerRank = getMinerRank(investments);

  return (
    <header className="sticky top-0 z-40 bg-[#07090E]/85 backdrop-blur-xl border-b border-slate-800/80 px-3.5 py-2.5 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Profile & VIP Badge */}
        <div className="flex items-center space-x-2.5 space-x-reverse">
          <div className="relative group cursor-pointer" onClick={onOpenSupport}>
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.firstName}
                className="w-10 h-10 rounded-full object-cover border-2 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                style={{ borderColor: minerRank.badgeColor }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-slate-900 border-2 flex items-center justify-center font-black text-base shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                style={{ borderColor: minerRank.badgeColor, color: minerRank.badgeColor }}
              >
                {user.firstName.charAt(0)}
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[#07090E] rounded-full animate-pulse shadow-sm"
              style={{ backgroundColor: minerRank.badgeColor }}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5 space-x-reverse">
              <span className="font-extrabold text-xs sm:text-sm text-slate-100 truncate max-w-[95px] sm:max-w-[150px] tracking-tight">
                {user.firstName} {user.lastName || ''}
              </span>
              {user.status === 'VIP' && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  VIP
                </span>
              )}
            </div>

            {/* Miner Rank Badge */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${minerRank.badgeBorder} ${minerRank.badgeBg} shadow-sm`}
                style={{ color: minerRank.badgeColor }}
              >
                <Award className="w-2.5 h-2.5" />
                <span>{minerRank.titleAr}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Glowing Aurex Brand Logo */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span className="text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 font-mono">
            AUREX
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                TelegramService.hapticImpact('light');
                setShowLangMenu(!showLangMenu);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 text-[11px] font-bold text-slate-200 transition-all shadow-sm"
              title="Change Language"
            >
              <span>{selectedLangObj.flag}</span>
              <span className="uppercase text-[10px] font-mono">{selectedLangObj.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 top-9 z-50 w-40 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      TelegramService.hapticImpact('medium');
                      onSelectLang(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      currentLang === lang.code
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    {currentLang === lang.code && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TG Badge indicator */}
          <button
            onClick={onOpenIntegrationGuide}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-[11px] text-slate-400 hover:text-white transition-colors"
            title="Telegram Integration Status"
          >
            <span className={`w-2 h-2 rounded-full ${isTgAvailable ? 'bg-emerald-400 shadow-[0_0_6px_#10B981]' : 'bg-amber-400'}`} />
            <span className="font-mono text-[10px]">{isTgAvailable ? 'TG SDK' : 'Mock'}</span>
          </button>

          {/* Admin Panel Button */}
          {user.isAdmin && (
            <button
              onClick={() => {
                TelegramService.hapticImpact('medium');
                onOpenAdmin();
              }}
              className="p-2 rounded-full bg-slate-900 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/40 transition-all relative shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              title="Admin Panel"
            >
              <Shield className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </button>
          )}

          {/* Splash Intro Replay Button */}
          {onReplaySplash && (
            <button
              onClick={() => {
                TelegramService.hapticImpact('medium');
                onReplaySplash();
              }}
              className="px-2.5 py-1 rounded-full bg-slate-900 text-emerald-400 hover:bg-emerald-400 hover:text-slate-950 border border-emerald-500/30 text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm"
              title="Replay Intro"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden xs:inline font-mono">Intro</span>
            </button>
          )}

          {/* Support Button */}
          {onOpenSupport && (
            <button
              onClick={() => {
                TelegramService.hapticImpact('light');
                onOpenSupport();
              }}
              className="p-2 rounded-full bg-slate-900 text-slate-300 hover:text-emerald-400 border border-slate-700/80 hover:border-emerald-500/50 transition-all"
              title="Customer Support"
            >
              <Headset className="w-4 h-4" />
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={() => {
              TelegramService.hapticImpact('light');
              onOpenNotifications();
            }}
            className="p-2 rounded-full bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 hover:border-emerald-500/50 transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black leading-tight shadow-[0_0_8px_#10B981]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
