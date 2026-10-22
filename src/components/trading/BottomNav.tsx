import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  History,
  BarChart3,
  ShieldAlert,
  User,
  BookOpen,
} from 'lucide-react';
import { TabType } from '../../types/trading';
import { languageService } from '../../services/languageService';

interface BottomNavProps {
  currentTab: TabType;
  onNavigate: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const [, setLang] = useState(languageService.getLanguage());

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: languageService.t('navDashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'markets' as TabType,
      label: languageService.t('navMarkets'),
      icon: TrendingUp,
    },
    {
      id: 'trades' as TabType,
      label: languageService.t('navTrades'),
      icon: History,
    },
    {
      id: 'performance' as TabType,
      label: languageService.t('navPerformance'),
      icon: BarChart3,
    },
    {
      id: 'rules' as TabType,
      label: languageService.t('navRules'),
      icon: BookOpen,
    },
    {
      id: 'profile' as TabType,
      label: languageService.t('navProfile'),
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#06080F]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 max-w-lg mx-auto sm:max-w-none">
      <div className="max-w-2xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                }`}
              />
              <span
                className={`text-[10px] mt-1 font-medium transition-all ${
                  isActive ? 'font-bold text-emerald-400' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
