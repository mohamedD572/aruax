import React, { useState, useEffect } from 'react';
import { Send, ShieldCheck, Lock, ArrowRight, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';
import { store } from '../services/store';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  initialError?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, initialError }) => {
  const [telegramIdInput, setTelegramIdInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [showManualLogin, setShowManualLogin] = useState(false);

  useEffect(() => {
    // Check if running inside Telegram Mini App WebApp SDK
    const tgUser = authService.getTelegramUserFromEnvironment();
    if (tgUser && tgUser.id) {
      handleAutoTelegramLogin();
    }
  }, []);

  const handleAutoTelegramLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await authService.initAuth(
        (u) => {
          store.initFirestoreSync(u);
          onLoginSuccess(u);
        },
        (status) => {
          if (status.error) {
            setError(status.error);
          }
        }
      );

      if (!user) {
        if (authService.getIsOutsideTelegram()) {
          setError('You are browsing outside Telegram. You can open the official bot or sign in using your Telegram ID below.');
          setShowManualLogin(true);
        } else {
          setError('Unable to extract Telegram data. Please open the app inside Telegram or use your Telegram ID.');
        }
      }
    } catch (err: any) {
      setError('An error occurred connecting to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualTelegramIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramIdInput.trim()) {
      setError('Please enter your Telegram ID.');
      return;
    }

    const cleanId = telegramIdInput.trim().replace(/[^0-9]/g, '');
    if (!cleanId || cleanId.length < 5) {
      setError('Please enter a valid numeric Telegram ID (e.g. 78492011).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await authService.loginWithTelegramId(
        parseInt(cleanId, 10),
        firstNameInput.trim() || undefined
      );

      if (user) {
        store.initFirestoreSync(user);
        onLoginSuccess(user);
      } else {
        setError('Login failed using Telegram ID.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC] font-sans flex flex-col items-center justify-center p-4 antialiased">
      {/* Container Card */}
      <div className="w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#7CFF4F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#24A1DE]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Telegram Icon Badge */}
        <div className="relative mb-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#24A1DE]/20 to-[#7CFF4F]/20 border border-[#24A1DE]/40 flex items-center justify-center text-[#24A1DE] shadow-xl shadow-[#24A1DE]/10">
            <Send className="w-10 h-10 text-[#24A1DE] transform -rotate-12" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#7CFF4F] text-[#0D1117] p-1.5 rounded-full shadow-md">
            <ShieldCheck className="w-4 h-4 stroke-[3]" />
          </div>
        </div>

        {/* Header Titles */}
        <div className="text-center space-y-2 mb-6">
          <span className="inline-block px-3 py-1 bg-[#7CFF4F]/10 border border-[#7CFF4F]/30 text-[#7CFF4F] text-[11px] font-bold rounded-full tracking-wide">
            Aurex Investment Platform
          </span>
          <h1 className="text-2xl font-black text-white">Login</h1>
          <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
            Sign in securely using your Telegram account to access your wallet & mining rigs
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-full mb-5 bg-red-500/10 border border-red-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-red-400 text-xs text-left animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Main Actions */}
        <div className="w-full space-y-3.5">
          {/* Primary Action Button: Telegram WebApp Sign In */}
          <button
            onClick={handleAutoTelegramLogin}
            disabled={loading}
            className="w-full py-3.5 px-5 bg-[#24A1DE] hover:bg-[#1f8ec5] active:bg-[#1a7cae] text-white font-bold text-sm rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-[#24A1DE]/25 disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Connecting to Telegram...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-white" />
                <span>Log in with Telegram</span>
              </>
            )}
          </button>

          {/* Open Bot Link */}
          <a
            href={store.getSettings().miniAppUrl || "https://t.me/aurex_bot/app"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-5 bg-[#1F2937] hover:bg-[#374151] text-gray-200 font-semibold text-xs rounded-2xl border border-[#30363D] transition-all duration-200 flex items-center justify-center gap-2 text-center"
          >
            <span>Open via Official Telegram Bot</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </a>

          {/* Toggle Manual Telegram ID Login */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowManualLogin(!showManualLogin)}
              className="text-xs text-gray-400 hover:text-[#7CFF4F] transition-colors underline underline-offset-4"
            >
              {showManualLogin ? 'Hide Telegram ID option' : 'Or enter via Telegram ID'}
            </button>
          </div>

          {/* Manual Telegram ID Form */}
          {showManualLogin && (
            <form onSubmit={handleManualTelegramIdLogin} className="pt-3 border-t border-[#30363D] space-y-3 animate-fadeIn">
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-medium text-gray-300 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#7CFF4F]" />
                  <span>Telegram ID</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 78492011"
                  value={telegramIdInput}
                  onChange={(e) => setTelegramIdInput(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors text-left"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-medium text-gray-300">First Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Telegram Username"
                  value={firstNameInput}
                  onChange={(e) => setFirstNameInput(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] text-white text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#7CFF4F] hover:bg-[#6be640] text-[#0D1117] font-bold text-xs rounded-xl transition-all shadow-md shadow-[#7CFF4F]/10 disabled:opacity-50 active:scale-95"
              >
                {loading ? 'Verifying...' : 'Login with Telegram ID'}
              </button>
            </form>
          )}
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 pt-4 border-t border-[#30363D]/60 w-full flex items-center justify-center gap-2 text-gray-400 text-[11px]">
          <Lock className="w-3.5 h-3.5 text-[#7CFF4F]" />
          <span>100% Encrypted & Synced with Firestore telegram.id</span>
        </div>
      </div>
    </div>
  );
};
