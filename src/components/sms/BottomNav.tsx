import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ListOrdered,
  Wallet,
  User,
} from 'lucide-react';
import { TabType } from '../../types/sms';
import { smsVaultStore } from '../../services/smsVaultStore';

interface BottomNavProps {
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
  const activeOrders = smsVaultStore.getActiveOrders();

  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'buy' as TabType,
      label: 'Buy Number',
      icon: ShoppingCart,
      isSpecial: true,
    },
    {
      id: 'orders' as TabType,
      label: 'Orders',
      icon: ListOrdered,
      badge: activeOrders.length > 0 ? activeOrders.length : null,
    },
    {
      id: 'wallet' as TabType,
      label: 'Wallet',
      icon: Wallet,
    },
    {
      id: 'profile' as TabType,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#07090E]/95 backdrop-blur-2xl border-t border-emerald-950/40 px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="relative -top-3 flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-emerald-400 text-slate-950 shadow-emerald-500/40 scale-105 ring-4 ring-emerald-500/20'
                      : 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 shadow-emerald-950/60'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight ${
                    isActive ? 'text-emerald-400 font-black' : 'text-slate-300'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium mt-0.5 tracking-tight ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
