import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Shield,
  Bot,
  Zap,
  RefreshCw,
  Lock,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Cpu,
  Globe,
} from 'lucide-react';
import { aurexTradingStore } from '../../services/aurexTradingStore';
import { languageService } from '../../services/languageService';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [lang, setLang] = useState(languageService.getLanguage());
  const engineStatus = aurexTradingStore.getEngineStatus();
  const trial = aurexTradingStore.getTrialDaysRemaining();

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  const handleToggleEngine = () => {
    aurexTradingStore.toggleAutoPilot();
  };

  const handleResetPaperAccount = () => {
    if (confirm(languageService.t('resetConfirmPrompt'))) {
      aurexTradingStore.resetPaperAccount();
      onClose();
    }
  };

  const handleSelectLanguage = (selectedLang: 'ar' | 'en') => {
    languageService.setLanguage(selectedLang);
  };

  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-[#0A0E17] border border-emerald-500/30 p-6 shadow-2xl relative overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{languageService.t('settingsTitle')}</h3>
              <p className="text-xs text-slate-400">{languageService.t('settingsSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Selector Box */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{languageService.t('languageSelect')}</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              {isAr ? 'العربية' : 'English'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {languageService.t('languageSelectDesc')}
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
            <button
              onClick={() => handleSelectLanguage('ar')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                lang === 'ar'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>🇸🇦 العربية (Arabic)</span>
            </button>
            <button
              onClick={() => handleSelectLanguage('en')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                lang === 'en'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 font-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>🇬🇧 English</span>
            </button>
          </div>
        </div>

        {/* Trading Mode & Parameters */}
        <div className="space-y-3">
          {/* Paper Trading Mode */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                {languageService.t('tradingMode')}
              </div>
              <p className="text-[11px] text-slate-400">{languageService.t('zeroRiskDesc')}</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
              {isAr ? 'تداول افتراضي' : 'PAPER TRADING'}
            </span>
          </div>

          {/* Trial Duration */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-200">{languageService.t('paperTrialLabel')}</div>
              <p className="text-[11px] text-slate-400">
                {languageService.t('dayOfTrial')} {trial.currentDay} / 30 ({trial.remainingDays} {languageService.t('days')} {languageService.t('trialRemaining')})
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 font-mono">
              30 {languageService.t('days')}
            </span>
          </div>

          {/* Risk per trade */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-200">{languageService.t('riskPerTrade')}</div>
              <p className="text-[11px] text-slate-400">{languageService.t('riskPerTradeDesc')}</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              1.0% ($1.00)
            </span>
          </div>

          {/* Minimum Confidence */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-200">{languageService.t('minConfidence')}</div>
              <p className="text-[11px] text-slate-400">{languageService.t('minConfidenceDesc')}</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              80 / 100
            </span>
          </div>

          {/* Spot Only */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-200">{languageService.t('spotOnly')}</div>
              <p className="text-[11px] text-slate-400">{languageService.t('spotOnlyDesc')}</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {isAr ? 'مُفعّل' : 'ON'}
            </span>
          </div>

          {/* News Filter */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-200">{languageService.t('newsFilter')}</div>
              <p className="text-[11px] text-slate-400">{languageService.t('newsFilterDesc')}</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {isAr ? 'مُفعّل' : 'ON'}
            </span>
          </div>

          {/* Trading Engine Auto-Pilot Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                {languageService.t('aiAutoPilot')}
              </div>
              <p className="text-[11px] text-slate-400">
                {engineStatus.autoPilot
                  ? languageService.t('aiAutoPilotActiveDesc')
                  : languageService.t('aiAutoPilotPausedDesc')}
              </p>
            </div>
            <button
              onClick={handleToggleEngine}
              className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                engineStatus.autoPilot
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {engineStatus.autoPilot
                ? languageService.t('activeStatus')
                : languageService.t('pausedStatus')}
            </button>
          </div>
        </div>

        {/* Reset Paper Account */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetPaperAccount}
            className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {languageService.t('resetPaperAccount')}
          </button>
          <span className="text-[10px] text-slate-500 font-mono">Aurex AI v3.2</span>
        </div>
      </div>
    </div>
  );
};
