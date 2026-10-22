import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  ArrowUpRight,
  PieChart,
} from 'lucide-react';
import { aurexTradingStore } from '../services/aurexTradingStore';
import { languageService } from '../services/languageService';

export const PerformancePage: React.FC = () => {
  const [, setLang] = useState(languageService.getLanguage());
  const metrics = aurexTradingStore.getPerformanceMetrics();
  const account = aurexTradingStore.getPaperAccount();

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  // Draw smooth SVG Equity curve from $100 baseline
  const curvePoints = metrics.equityCurve;
  const equities = curvePoints.map((p) => p.equity);
  const minEquity = Math.min(...equities, 98);
  const maxEquity = Math.max(...equities, 105);
  const range = maxEquity - minEquity || 1;

  const points = curvePoints
    .map((p, i) => {
      const x = (i / (curvePoints.length - 1)) * 340;
      const y = 120 - ((p.equity - minEquity) / range) * 90 - 15;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            {languageService.t('performanceTitle')}
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            {languageService.t('trialTitle')}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {languageService.t('performanceSubtitle')}
        </p>
      </div>

      {/* Equity Curve Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0C121E] via-[#080C14] to-[#05070B] border border-emerald-500/30 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider font-mono block">
              {languageService.t('equityProgression')}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5">
              ${account.equity.toFixed(2)}
              <span className="text-xs font-bold text-slate-400 ml-2 font-sans">
                (+{metrics.totalReturnPercent.toFixed(2)}% {languageService.t('netReturn')})
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">{languageService.t('sharpeRatio')}</span>
            <span className="text-emerald-400 font-black text-sm sm:text-base font-mono">
              {metrics.sharpeRatio}
            </span>
          </div>
        </div>

        {/* SVG Equity Chart */}
        <div className="w-full h-36 flex items-center justify-center p-2 rounded-2xl bg-slate-950/60 border border-slate-900">
          <svg viewBox="0 0 340 120" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Initial: $100.00</span>
          <span>Current: ${account.equity.toFixed(2)}</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {languageService.t('winRate')}
          </span>
          <span className="text-emerald-400 font-black text-lg">
            {metrics.winRate}%
          </span>
          <span className="text-[10px] text-slate-400 block">
            {metrics.winningTrades} W / {metrics.losingTrades} L
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {languageService.t('totalTrades')}
          </span>
          <span className="text-slate-100 font-black text-lg">
            {metrics.totalTrades}
          </span>
          <span className="text-[10px] text-slate-400 block">{languageService.t('spotOnly')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {languageService.t('profitFactor')}
          </span>
          <span className="text-emerald-400 font-black text-lg">
            {metrics.profitFactor}
          </span>
          <span className="text-[10px] text-slate-400 block">Gross Win / Loss</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {languageService.t('maxDrawdown')}
          </span>
          <span className="text-slate-200 font-black text-lg">
            {metrics.maxDrawdown}%
          </span>
          <span className="text-[10px] text-slate-400 block">Peak to Trough</span>
        </div>
      </div>

      {/* Win / Loss Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {languageService.t('avgWinningTrade')}
            </span>
            <div className="text-base font-black text-emerald-400 mt-1">
              +${metrics.averageWin.toFixed(2)} (+{((metrics.averageWin / 100) * 100).toFixed(2)}%)
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
            {metrics.winningTrades} {languageService.t('navTrades')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {languageService.t('avgLosingTrade')}
            </span>
            <div className="text-base font-black text-rose-400 mt-1">
              -${metrics.averageLoss.toFixed(2)} (-{((metrics.averageLoss / 100) * 100).toFixed(2)}%)
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-500/20 text-rose-400">
            {metrics.losingTrades} {languageService.t('navTrades')}
          </span>
        </div>
      </div>
    </div>
  );
};
