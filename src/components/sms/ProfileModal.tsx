import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Key,
  Copy,
  Check,
  RefreshCw,
  Server,
  Zap,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { smsVaultStore } from '../../services/smsVaultStore';
import { TelegramVerifiedUser } from '../../types/sms';

interface ProfileModalProps {
  user: TelegramVerifiedUser | null;
  onClose: () => void;
  onResetMock?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onClose,
  onResetMock,
}) => {
  const wallet = smsVaultStore.getWallet();
  const [copiedKey, setCopiedKey] = useState(false);
  const [mockApiKey] = useState('sv_live_9942a78b3018fce892da019234');

  const fullName = user
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : 'SMS Vault User';

  const userInitials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`.toUpperCase()
    : 'SV';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Reset all demo orders, transactions, and balances to default mock values?')) {
      smsVaultStore.resetToDefaults();
      if (onResetMock) onResetMock();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-[#0B0F17] border border-emerald-500/30 p-6 shadow-2xl relative overflow-hidden space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Telegram Account</h3>
              <p className="text-xs text-slate-400">Verified Telegram Identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real Profile Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shrink-0 overflow-hidden shadow-md shadow-emerald-500/20">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={fullName}
                className="w-full h-full rounded-[14px] object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#080C14] rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-lg font-mono">
                {userInitials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-bold text-slate-100 font-sans truncate">
                {fullName}
              </h4>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono space-y-0.5 mt-0.5">
              {user?.username && (
                <div className="text-emerald-400 font-medium">@{user.username}</div>
              )}
              <div>ID: {user?.id || '—'}</div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              ${wallet.balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* API Integration Placeholder */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              API Key (Backend Ready)
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-[10px] font-mono text-slate-400 truncate bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 flex-1 select-all">
              {mockApiKey}
            </code>
            <button
              onClick={handleCopyKey}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Easily hookable to 5SIM / SMS-Activate or custom backend services.
          </p>
        </div>

        {/* System Diagnostics */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Gateway Latency</span>
            <span className="text-emerald-400 font-bold">142ms</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Routes Active</span>
            <span className="text-emerald-400 font-bold">15 Countries</span>
          </div>
        </div>

        {/* Reset Mock Defaults */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
          <span className="text-[10px] text-slate-400">SMS Vault v2.4</span>
        </div>
      </div>
    </div>
  );
};
