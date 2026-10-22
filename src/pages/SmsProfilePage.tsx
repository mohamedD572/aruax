import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Key,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Globe,
  HelpCircle,
  ExternalLink,
  Shield,
  Server,
  FileCode,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { smsVaultStore } from '../services/smsVaultStore';
import { TelegramVerifiedUser } from '../types/sms';

interface SmsProfilePageProps {
  user: TelegramVerifiedUser | null;
  onOpenAddBalance: () => void;
}

export const SmsProfilePage: React.FC<SmsProfilePageProps> = ({
  user,
  onOpenAddBalance,
}) => {
  const wallet = smsVaultStore.getWallet();
  const [copiedKey, setCopiedKey] = useState(false);
  const [mockApiKey] = useState('sv_live_8830129fd83018ea91283');
  const [feedback, setFeedback] = useState<string | null>(null);

  const fullName = user
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : 'SMS Vault User';

  const userInitials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`.toUpperCase()
    : 'SV';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setFeedback('API key copied to clipboard');
    setTimeout(() => {
      setCopiedKey(false);
      setFeedback(null);
    }, 2000);
  };

  const handleResetData = () => {
    if (confirm('Reset all demo orders, transactions, and balances to default mock values?')) {
      smsVaultStore.resetToDefaults();
      setFeedback('Reset demo data to default mock records');
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Toast */}
      {feedback && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-emerald-400" />
          Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Account credentials, verified Telegram profile, and marketplace preferences.
        </p>
      </div>

      {/* Real Telegram Profile Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0F1722] via-[#0A0E17] to-[#06080E] border border-emerald-500/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Profile Photo */}
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

            {/* Profile Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-slate-100 font-sans">
                  {fullName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Account Status: Active
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-slate-400">
                {user?.username && (
                  <span className="text-emerald-400 font-semibold">
                    @{user.username}
                  </span>
                )}
                <span>Telegram ID: <strong className="text-slate-200">{user?.id || '—'}</strong></span>
                {user?.languageCode && (
                  <span className="uppercase text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                    {user.languageCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-800/80 pt-4 sm:pt-0">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Available Funds
              </span>
              <span className="text-base font-black text-emerald-400 font-mono">
                ${wallet.balance.toFixed(2)} USDT
              </span>
            </div>
            <button
              onClick={onOpenAddBalance}
              className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Add Balance
            </button>
          </div>
        </div>
      </div>

      {/* Backend & API Integration Info Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0B0F17] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Developer API & Backend Hooking
              </h3>
              <p className="text-xs text-slate-400">
                Direct integration with 5SIM, SMS-Activate, or custom Express endpoints
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            REST API v2
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Your Secret API Token
          </label>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-slate-300 truncate bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex-1 select-all">
              {mockApiKey}
            </code>
            <button
              onClick={() => handleCopy(mockApiKey)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All order purchases, country queries, and SMS polling can be executed via this key once attached to production backend services.
          </p>
        </div>
      </div>

      {/* Preferences & System Diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-[#0B0F17] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Infrastructure Status</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-900">
              <span className="text-slate-400">SMS Gateway Routing</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-900">
              <span className="text-slate-400">Average OTP Delivery</span>
              <span className="text-emerald-400 font-bold">~4.2 seconds</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-900">
              <span className="text-slate-400">Timeout Auto-Refund</span>
              <span className="text-emerald-400 font-bold">Enabled (100%)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#0B0F17] border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200 mb-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Data Management</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              SMS Vault uses an in-memory & local mock store. You can easily reset demo data to default test records at any time.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset All Mock Data to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
