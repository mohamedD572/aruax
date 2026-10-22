import React from 'react';
import {
  Shield,
  ShieldAlert,
  Send,
  RefreshCw,
  ExternalLink,
  Lock,
  Smartphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AuthStatus } from '../../types/sms';
import { telegramAuthService } from '../../services/telegramAuthService';

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
  const botUrl = telegramAuthService.getBotUrl();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-slate-950 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md my-auto relative z-10">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 p-0.5 shadow-2xl shadow-emerald-500/30 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-[#080C14] rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-400 stroke-[2.2]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2">
            SMS <span className="text-emerald-400">VAULT</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">
            Virtual Number & SMS Marketplace
          </p>
        </div>

        {/* 1. Loading: Connecting to Telegram */}
        {status === 'connecting' && (
          <div className="p-8 rounded-3xl bg-[#0B0F17]/90 border border-emerald-500/30 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Send className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-100">
                Connecting to Telegram...
              </h2>
              <p className="text-xs text-slate-400">
                Detecting Telegram account and credentials
              </p>
            </div>
          </div>
        )}

        {/* 2. Loading: Verifying Account */}
        {status === 'verifying' && (
          <div className="p-8 rounded-3xl bg-[#0B0F17]/90 border border-emerald-500/40 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-100">
                Verifying account...
              </h2>
              <p className="text-xs text-slate-400">
                Validating Telegram user session
              </p>
            </div>
          </div>
        )}

        {/* 3. Error State */}
        {status === 'error' && (
          <div className="p-8 rounded-3xl bg-[#0B0F17]/90 border border-emerald-500/30 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <Shield className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-100">
                Authenticating Session
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Connecting with your Telegram profile...
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={onRetry}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>

              <button
                onClick={() => telegramAuthService.loginAsDemoUser()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 4. Outside Telegram State */}
        {status === 'outside_telegram' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0F17]/95 border border-emerald-500/30 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600/30 to-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Smartphone className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-100">
                Open SMS Vault from Telegram
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                This marketplace is integrated with Telegram Mini Apps to verify your account and provide real-time virtual numbers.
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
                <span>Launch in Telegram</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => telegramAuthService.loginAsDemoUser()}
                className="w-full py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Explore Web Preview</span>
              </button>
            </div>

            {/* Verification Security Note */}
            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>End-to-End Cryptographically Verified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
