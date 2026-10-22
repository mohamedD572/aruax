import React from 'react';
import { ShieldCheck, Bell, User, Plus, Activity } from 'lucide-react';
import { smsVaultStore } from '../../services/smsVaultStore';
import { TelegramVerifiedUser } from '../../types/sms';

interface NavbarProps {
  user: TelegramVerifiedUser | null;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenAddBalance: () => void;
  onNavigate: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenNotifications,
  onOpenProfile,
  onOpenAddBalance,
  onNavigate,
}) => {
  const wallet = smsVaultStore.getWallet();
  const unreadCount = smsVaultStore.getUnreadNotificationCount();

  const userInitials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`.toUpperCase()
    : 'TG';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090E]/90 backdrop-blur-xl border-b border-emerald-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:border-emerald-400/80 transition-all duration-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-wider text-slate-100 font-mono">
                SMS <span className="text-emerald-400">VAULT</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
                MARKETPLACE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              Virtual SMS & OTP Verification
            </p>
          </div>
        </div>

        {/* Center: System Status Pill (Desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>All Systems Operational</span>
        </div>

        {/* Right: Balance Chip, Notification, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Balance Chip */}
          <div
            onClick={onOpenAddBalance}
            className="flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/60 transition-colors cursor-pointer group shadow-sm"
          >
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Balance
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                ${wallet.balance.toFixed(2)}
              </span>
            </div>
            <button
              title="Add Balance"
              className="w-6 h-6 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500 text-emerald-400 group-hover:text-slate-950 flex items-center justify-center transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse shadow-md shadow-emerald-500/50">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={onOpenProfile}
            aria-label="Profile and Settings"
            className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors shadow-sm cursor-pointer overflow-hidden p-0.5"
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

