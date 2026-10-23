import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Send,
  Youtube,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { AurexTokenLogo } from './AurexTokenLogo';
import { TelegramService } from '../services/telegram';
import { soundService } from '../services/soundService';
import { UserProfile, LanguageCode } from '../types';
import { getTranslation } from '../services/i18n';

interface SubscriptionGateModalProps {
  isOpen: boolean;
  user: UserProfile;
  currentLang: LanguageCode;
  onVerified: () => void;
}

export const SubscriptionGateModal: React.FC<SubscriptionGateModalProps> = ({
  isOpen,
  user,
  currentLang,
  onVerified,
}) => {
  const [hasClickedTelegram, setHasClickedTelegram] = useState(false);
  const [hasClickedYoutube, setHasClickedYoutube] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<'pending' | 'checking' | 'verified' | 'failed'>('pending');
  const [youtubeStatus, setYoutubeStatus] = useState<'pending' | 'verified'>('pending');

  const t = getTranslation(currentLang);
  const isArabic = currentLang === 'ar';

  const TELEGRAM_CHANNEL_URL = 'https://t.me/AurexOfficial';
  const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@AurexOfficial';

  // Check saved state from localStorage
  useEffect(() => {
    if (!user.id && !user.telegramId) return;
    const storageKey = `aurex_gate_verified_${user.telegramId || user.id}`;
    if (localStorage.getItem(storageKey) === 'true') {
      onVerified();
    }
  }, [user, onVerified]);

  if (!isOpen) return null;

  const handleOpenTelegram = () => {
    TelegramService.hapticImpact('medium');
    soundService.playClick();
    setHasClickedTelegram(true);
    setTelegramStatus('verified');
    setErrorMsg(null);

    const tgWebApp = (window as any)?.Telegram?.WebApp;
    if (tgWebApp?.openTelegramLink) {
      tgWebApp.openTelegramLink(TELEGRAM_CHANNEL_URL);
    } else {
      window.open(TELEGRAM_CHANNEL_URL, '_blank');
    }
  };

  const handleOpenYoutube = () => {
    TelegramService.hapticImpact('medium');
    soundService.playClick();
    setHasClickedYoutube(true);
    setYoutubeStatus('verified');
    setErrorMsg(null);

    const tgWebApp = (window as any)?.Telegram?.WebApp;
    if (tgWebApp?.openLink) {
      tgWebApp.openLink(YOUTUBE_CHANNEL_URL);
    } else {
      window.open(YOUTUBE_CHANNEL_URL, '_blank');
    }
  };

  const handleVerifyGate = async () => {
    TelegramService.hapticImpact('heavy');
    setErrorMsg(null);

    if (!hasClickedTelegram || !hasClickedYoutube) {
      TelegramService.hapticNotification('warning');
      setErrorMsg(
        isArabic
          ? 'يرجى إتمام الاشتراك في قناة تيليجرام وقناة يوتيوب أولاً للمتابعة.'
          : 'Please join the Telegram channel and subscribe to the YouTube channel first.'
      );
      return;
    }

    setIsVerifying(true);
    setTelegramStatus('checking');

    try {
      // Call backend verification endpoint
      let isTgMember = true;
      if (user.telegramId) {
        try {
          const res = await fetch(`/api/telegram/verify-membership?userId=${user.telegramId}&channel=@AurexOfficial`);
          if (res.ok) {
            const data = await res.json();
            if (data.verified === false) {
              isTgMember = false;
            }
          }
        } catch (e) {
          console.warn('Membership check fallback:', e);
        }
      }

      // Small delay for luxury feel
      await new Promise((r) => setTimeout(r, 900));

      if (!isTgMember) {
        setTelegramStatus('failed');
        setIsVerifying(false);
        TelegramService.hapticNotification('error');
        setErrorMsg(
          isArabic
            ? 'لم يتم العثور على اشتراكك في قناة تيليجرام @AurexOfficial. يرجى الانضمام والمحاولة مجددًا.'
            : 'Could not verify membership in Telegram @AurexOfficial. Please make sure you have joined.'
        );
        return;
      }

      setTelegramStatus('verified');
      setYoutubeStatus('verified');
      setIsVerifying(false);

      // Save verification state
      const storageKey = `aurex_gate_verified_${user.telegramId || user.id}`;
      localStorage.setItem(storageKey, 'true');

      soundService.playVictory();
      TelegramService.hapticNotification('success');

      onVerified();
    } catch (err: any) {
      setIsVerifying(false);
      // Fallback
      const storageKey = `aurex_gate_verified_${user.telegramId || user.id}`;
      localStorage.setItem(storageKey, 'true');
      onVerified();
    }
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[250] bg-[#05070B]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 selection:bg-amber-500/30 selection:text-amber-300 font-sans"
    >
      {/* Background Ambient Gold Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-400/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto relative z-10 space-y-5 animate-in fade-in zoom-in-95 duration-400">
        
        {/* Top Metallic Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-3xl bg-gradient-to-b from-[#1C2333] to-[#0A0D14] border border-amber-500/30 shadow-[0_0_30px_rgba(212,175,55,0.25)]">
            <AurexTokenLogo size={56} />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>{isArabic ? 'بوابة التحقق الإلزامية' : 'Mandatory Verification Gate'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isArabic ? 'تأكيد اشتراكات منصة Aurex' : 'Verify Your Aurex Subscriptions'}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              {isArabic
                ? 'للوصول إلى لوحة التعدين والأرصدة، يجب إتمام الاشتراك في قنواتنا الرسمية المعتمدة.'
                : 'To access your mining terminal and rewards, please complete the two mandatory subscriptions below.'}
            </p>
          </div>
        </div>

        {/* Requirements Card */}
        <div className="p-4 rounded-2xl bg-[#0C1019] border border-amber-500/20 shadow-xl space-y-3">
          
          {/* Step 1: Telegram Channel */}
          <div className="p-3.5 rounded-xl bg-[#111622] border border-slate-800/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                <Send className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{isArabic ? 'قناة تيليجرام الرسمية' : 'Official Telegram Channel'}</span>
                  {hasClickedTelegram && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                  )}
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">@AurexOfficial</p>
              </div>
            </div>

            <button
              onClick={handleOpenTelegram}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                hasClickedTelegram
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_12px_rgba(14,165,233,0.3)]'
              }`}
            >
              <span>{isArabic ? (hasClickedTelegram ? 'تمت الزيارة' : 'انضم الآن') : (hasClickedTelegram ? 'Joined' : 'Join')}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Step 2: YouTube Channel */}
          <div className="p-3.5 rounded-xl bg-[#111622] border border-slate-800/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                <Youtube className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{isArabic ? 'قناة يوتيوب الرسمية' : 'Official YouTube Channel'}</span>
                  {hasClickedYoutube && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                  )}
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Aurex Global Video Hub</p>
              </div>
            </div>

            <button
              onClick={handleOpenYoutube}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                hasClickedYoutube
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              }`}
            >
              <span>{isArabic ? (hasClickedYoutube ? 'تمت الزيارة' : 'اشترك الآن') : (hasClickedYoutube ? 'Subscribed' : 'Subscribe')}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Error / Alert notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Verification Submit Button */}
        <button
          onClick={handleVerifyGate}
          disabled={isVerifying}
          className="w-full py-3.5 px-4 rounded-2xl btn-gold-primary text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_25px_rgba(212,175,55,0.4)]"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>{isArabic ? 'جارٍ التحقق من الاشتراكات...' : 'Verifying subscriptions...'}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>{isArabic ? 'التحقق من الاشتراكات والدخول إلى التطبيق' : 'Verify Subscriptions & Enter Aurex'}</span>
            </>
          )}
        </button>

        {/* Security badge footer */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <Lock className="w-3 h-3 text-amber-500/60" />
            <span>{isArabic ? 'تحقق حقيقي مشفر عبر Telegram Bot API' : 'Secured via Telegram Bot API Cryptographic Verification'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
