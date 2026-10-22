import React, { useState, useEffect } from 'react';
import {
  Shield,
  Send,
  RefreshCw,
  ExternalLink,
  Lock,
  Smartphone,
  Sparkles,
  ArrowRight,
  Bot,
  TrendingUp,
  Globe,
} from 'lucide-react';
import { AuthStatus } from '../../types/trading';
import { telegramAuthService } from '../../services/telegramAuthService';
import { languageService } from '../../services/languageService';

interface AuthScreenProps {
  status: AuthStatus;
  error?: string | null;
  onRetry: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  status,
  error,
  onRetry,
}) => {
  const [lang, setLang] = useState(languageService.getLanguage());
  const botUrl = telegramAuthService.getBotUrl();

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  const handleToggleLang = () => {
    languageService.toggleLanguage();
  };

  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-[#06080F] text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-slate-950 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher in Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleToggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500 text-slate-200 text-xs font-bold font-mono transition-all shadow-sm cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-300">{isAr ? 'English' : 'عربي'}</span>
        </button>
      </div>

      <div className="w-full max-w-md my-auto relative z-10">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 p-0.5 shadow-2xl shadow-emerald-500/30 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-[#080C14] rounded-[14px] flex items-center justify-center">
              <Bot className="w-8 h-8 text-emerald-400 stroke-[2.2]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2">
            AUREX <span className="text-emerald-400">AI</span> TRADER
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">
            {languageService.t('appSubtitle')}
          </p>
        </div>

        {/* 1. Loading: Connecting to Telegram */}
        {status === 'connecting' && (
          <div className="p-8 rounded-3xl bg-[#090D15]/90 border border-emerald-500/30 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Send className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-100">
                {languageService.t('connectingTelegram')}
              </h2>
              <p className="text-xs text-slate-400">
                {languageService.t('connectingTelegramDesc')}
              </p>
            </div>
          </div>
        )}

        {/* 2. Loading: Verifying Account */}
        {status === 'verifying' && (
          <div className="p-8 rounded-3xl bg-[#090D15]/90 border border-emerald-500/40 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-100">
                {languageService.t('verifyingAccount')}
              </h2>
              <p className="text-xs text-slate-400">
                {languageService.t('verifyingAccountDesc')}
              </p>
            </div>
          </div>
        )}

        {/* 3. Outside Telegram / Error fallback */}
        {(status === 'outside_telegram' || status === 'error') && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090D15]/95 border border-emerald-500/30 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600/30 to-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Smartphone className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-100">
                {languageService.t('launchTitle')}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                {languageService.t('launchDesc')}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <a
                href={botUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-emerald-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Send className="w-4 h-4 fill-current" />
                <span>{languageService.t('launchInTelegram')}</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => telegramAuthService.loginAsDemoUser()}
                className="w-full py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{languageService.t('exploreWebPreview')}</span>
              </button>
            </div>

            {/* Verification Security Note */}
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{languageService.t('authFooter')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
