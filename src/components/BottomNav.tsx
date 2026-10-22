import React from 'react';
import {
  Cpu,
  Server,
  TrendingUp,
  Target,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  History,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { getTranslation } from '../services/i18n';
import { TelegramService } from '../services/telegram';
import { soundService } from '../services/soundService';

export type AurexTab =
  | 'invest'
  | 'mining_rigs'
  | 'copy'
  | 'tasks'
  | 'referral'
  | 'deposit'
  | 'withdraw'
  | 'history';

interface BottomNavProps {
  activeTab: AurexTab;
  onChangeTab: (tab: AurexTab) => void;
  langCode: LanguageCode;
  activeRigsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  langCode,
  activeRigsCount = 0,
}) => {
  const t = getTranslation(langCode);

  const primaryTabs: {
    id: AurexTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    {
      id: 'invest',
      label: t.invest || 'Mining',
      icon: Cpu,
    },
    {
      id: 'mining_rigs',
      label: 'My Rigs',
      icon: Server,
      badge: activeRigsCount > 0 ? activeRigsCount : undefined,
    },
    {
      id: 'copy',
      label: t.copyTrading || 'Copy',
      icon: TrendingUp,
    },
    {
      id: 'tasks',
      label: t.tasks || 'Tasks',
      icon: Target,
    },
    {
      id: 'referral',
      label: t.referral || 'Affiliate',
      icon: Users,
    },
  ];

  const handleTabClick = (tabId: AurexTab) => {
    soundService.playClick();
    TelegramService.hapticImpact('light');
    onChangeTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#07090E]/95 backdrop-blur-2xl border-t border-emerald-950/40 px-2 py-1.5 pb-safe transition-all select-none">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 cursor-pointer group"
            >
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-tr from-emerald-500/25 to-teal-400/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-105'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />

                {/* Badge if present */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-black leading-tight shadow-[0_0_8px_#10B981]">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-bold tracking-tight transition-colors truncate max-w-[64px] ${
                  isActive ? 'text-emerald-400 font-black' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Active glow dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
