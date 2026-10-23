import React, { useState } from 'react';
import { Bell, Shield, Sparkles, Award, Headset, Play, ChevronDown, Check, Coins } from 'lucide-react';
import { LanguageCode, UserProfile, Investment } from '../types';
import { TelegramService } from '../services/telegram';
import { LANGUAGES } from '../services/i18n';
import { getMinerRank } from '../utils/minerRank';
import { AurexTokenLogo } from './AurexTokenLogo';

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

  // Check if admin: user has isAdmin, or username matches admin, or has admin privileges
  const canAccessAdmin = Boolean(
    user.isAdmin ||
    user.username?.toLowerCase() === 'r5_s7' ||
    user.telegramId === 560408542
  );

  return (
    <header className="sticky top-0 z-40 bg-[#05070B]/90 backdrop-blur-xl border-b border-amber-500/20 px-3.5 py-2.5 transition-all select-none">
      <div className="flex items-center justify-between">
        
        {/* Left: Profile & VIP/Rank Badge */}
        <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
          <div className="relative group cursor-pointer" onClick={onOpenSupport}>
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.firstName}
                className="w-10 h-10 rounded-full object-cover border-2 shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                style={{ borderColor: '#D4AF37' }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-[#0C1019] border-2 border-amber-500/40 flex items-center justify-center font-black text-base text-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.25)]"
              >
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[#05070B] rounded-full animate-pulse shadow-sm bg-amber-400"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
              <span className="font-extrabold text-xs sm:text-sm text-slate-100 truncate max-w-[95px] sm:max-w-[150px] tracking-tight">
                {user.firstName} {user.lastName || ''}
              </span>
              {user.status === 'VIP' && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  VIP
                </span>
              )}
            </div>

            {/* Miner Rank Badge */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-sm"
              >
                <Award className="w-2.5 h-2.5" />
                <span>{minerRank.titleAr || minerRank.titleEn}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Glowing Aurex Brand Monogram & Coin */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C1019] border border-amber-500/30 shadow-[0_0_15px_rgba(212,175,55,0.2)] backdrop-blur-md">
          <AurexTokenLogo size={20} />
          <span className="text-xs font-black tracking-widest text-gold-gradient font-mono">
            AUREX
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                TelegramService.hapticImpact('light');
                setShowLangMenu(!showLangMenu);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0C1019] border border-amber-500/30 hover:border-amber-500/60 text-[11px] font-bold text-slate-200 transition-all shadow-sm cursor-pointer"
              title="Change Language"
            >
              <span>{selectedLangObj.flag}</span>
              <span className="uppercase text-[10px] font-mono text-amber-400">{selectedLangObj.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 rtl:left-0 rtl:right-auto top-9 z-50 w-44 bg-[#0C1019]/98 border border-amber-500/30 rounded-2xl shadow-2xl p-1.5 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      TelegramService.hapticImpact('medium');
                      onSelectLang(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentLang === lang.code
                        ? 'btn-gold-primary font-black shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                        : 'text-slate-300 hover:bg-[#161D2B] hover:text-white'
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

          {/* Admin Panel Button */}
          {canAccessAdmin && (
            <button
              onClick={() => {
                TelegramService.hapticImpact('medium');
                onOpenAdmin();
              }}
              className="p-2 rounded-full bg-[#0C1019] text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/40 transition-all relative shadow-[0_0_10px_rgba(212,175,55,0.2)] cursor-pointer"
              title="Admin HQ"
            >
              <Shield className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
            </button>
          )}

          {/* Intro Replay Button */}
          {onReplaySplash && (
            <button
              onClick={() => {
                TelegramService.hapticImpact('medium');
                onReplaySplash();
              }}
              className="px-2.5 py-1 rounded-full bg-[#0C1019] text-amber-400 hover:bg-amber-400 hover:text-slate-950 border border-amber-500/30 text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
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
              className="p-2 rounded-full bg-[#0C1019] text-slate-300 hover:text-amber-400 border border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer"
              title="VIP Customer Support"
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
            className="p-2 rounded-full bg-[#0C1019] text-slate-300 hover:text-white border border-amber-500/20 hover:border-amber-500/50 transition-all relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black leading-tight shadow-[0_0_8px_#F59E0B]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
