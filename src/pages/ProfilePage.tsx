import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Clock,
  RefreshCw,
  Zap,
  Lock,
  Sparkles,
  Bot,
  Sliders,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { TelegramVerifiedUser } from '../types/trading';
import { aurexTradingStore } from '../services/aurexTradingStore';
import { languageService } from '../services/languageService';

interface ProfilePageProps {
  user: TelegramVerifiedUser | null;
  onOpenSettings: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onOpenSettings }) => {
  const [lang, setLang] = useState(languageService.getLanguage());
  const account = aurexTradingStore.getPaperAccount();
  const trial = aurexTradingStore.getTrialDaysRemaining();

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  const isAr = lang === 'ar';

  const fullName = user
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : isAr
    ? 'مستخدم أوريكس'
    : 'Aurex Trader';

  const userInitials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`.toUpperCase()
    : 'AI';

  const handleReset = () => {
    if (confirm(languageService.t('resetConfirmPrompt'))) {
      aurexTradingStore.resetPaperAccount();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2.5">
            <User className="w-7 h-7 text-emerald-400" />
            {languageService.t('profileTitle')}
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            {languageService.t('verifiedSession')}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {languageService.t('profileSubtitle')}
        </p>
      </div>

      {/* Real Telegram Identity Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0F1722] via-[#0A0E17] to-[#06080E] border border-emerald-500/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/30 shrink-0 overflow-hidden">
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={fullName}
                  className="w-full h-full rounded-[14px] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-[#080C14] rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-xl font-mono">
                  {userInitials}
                </div>
              )}
            </div>

            {/* User Meta */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-slate-100 font-sans">
                  {fullName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {languageService.t('verifiedSession')}
                </span>
                {user?.isPremium && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                    {languageService.t('telegramPremium')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-400">
                {user?.username && (
                  <span className="text-emerald-400 font-semibold">
                    @{user.username}
                  </span>
                )}
                <span>
                  {languageService.t('telegramId')}:{' '}
                  <strong className="text-slate-200">{user?.id || '—'}</strong>
                </span>
                {user?.languageCode && (
                  <span className="uppercase text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                    {user.languageCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800/80 pt-4 sm:pt-0">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                {languageService.t('totalEquity')}
              </span>
              <span className="text-base font-black text-emerald-400 font-mono">
                ${account.equity.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Status Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">{languageService.t('trialTitle')}</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {languageService.t('dayOfTrial')} {trial.currentDay} / 30 ({trial.remainingDays} {languageService.t('days')} {languageService.t('trialRemaining')})
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="text-xs font-mono text-slate-300 hover:text-amber-400 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{languageService.t('resetPaperAccount')}</span>
        </button>
      </div>

      {/* Security & System Specs */}
      <div className="p-5 rounded-2xl bg-[#090D15] border border-slate-800/80 space-y-3">
        <h4 className="text-xs font-black uppercase text-slate-300 font-mono tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {languageService.t('platformSecurity')}
        </h4>

        <ul className="space-y-2 text-xs text-slate-400 leading-relaxed font-mono">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
            <span>{languageService.t('securityP1')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
            <span>{languageService.t('securityP2')}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
            <span>{languageService.t('securityP3')}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
