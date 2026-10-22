import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ListOrdered,
  Wallet,
  User,
  Activity,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TabType } from '../../types/sms';
import { smsVaultStore } from '../../services/smsVaultStore';

interface SidebarProps {
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
  onOpenAddBalance: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  onOpenAddBalance,
}) => {
  const wallet = smsVaultStore.getWallet();
  const activeOrders = smsVaultStore.getActiveOrders();

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'buy' as TabType,
      label: 'Buy Number',
      icon: ShoppingCart,
      badge: 'Hot',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'orders' as TabType,
      label: 'Orders',
      icon: ListOrdered,
      badge: activeOrders.length > 0 ? `${activeOrders.length} Active` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
    },
    {
      id: 'wallet' as TabType,
      label: 'Wallet',
      icon: Wallet,
      badge: null,
    },
    {
      id: 'profile' as TabType,
      label: 'Profile & Settings',
      icon: User,
      badge: null,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#07090E]/60 border-r border-slate-900/80 p-4 space-y-6 min-h-[calc(100vh-4rem)]">
      {/* Wallet Card Summary */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-emerald-500/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Your Balance</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE
          </span>
        </div>

        <div className="text-2xl font-black text-slate-100 font-mono tracking-tight mb-3">
          ${wallet.balance.toFixed(2)}{' '}
          <span className="text-xs text-emerald-400 font-sans font-bold">USDT</span>
        </div>

        <button
          onClick={onOpenAddBalance}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/50 hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          Add Balance
        </button>
      </div>

      {/* Navigation List */}
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Order Mini-Tracker */}
      {activeOrders.length > 0 && (
        <div
          onClick={() => onNavigate('orders')}
          className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
              Active Order
            </span>
            <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">
              {activeOrders[0].serviceName}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-200 truncate">
            {activeOrders[0].phoneNumber}
          </p>
          <p className="text-[10px] text-amber-300/80 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Waiting for SMS...
          </p>
        </div>
      )}

      {/* Footer Info / Server Status */}
      <div className="mt-auto pt-4 border-t border-slate-900/80 space-y-3">
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Server API
          </span>
          <span className="text-emerald-400 font-mono font-semibold">99.9% Up</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            Fast SMS Gateway
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Instant OTP arrival & automatic refund on timeout.
          </p>
        </div>
      </div>
    </aside>
  );
};
