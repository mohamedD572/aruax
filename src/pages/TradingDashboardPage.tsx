import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Activity,
  Bot,
  Zap,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  ArrowUpRight,
  Sliders,
  Eye,
  Check,
  ChevronRight,
  Radio,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { aurexTradingStore } from '../services/aurexTradingStore';
import { analysisService } from '../services/analysisService';
import { marketDataService } from '../services/marketDataService';
import { languageService } from '../services/languageService';
import { MarketAsset } from '../types/trading';

interface TradingDashboardPageProps {
  onInspectAsset: (asset: MarketAsset) => void;
  onNavigate: (tab: any) => void;
}

export const TradingDashboardPage: React.FC<TradingDashboardPageProps> = ({
  onInspectAsset,
  onNavigate,
}) => {
  const [lang, setLang] = useState(languageService.getLanguage());
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubLang = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    const unsubStore = aurexTradingStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => {
      unsubLang();
      unsubStore();
    };
  }, []);

  const account = aurexTradingStore.getPaperAccount();
  const trial = aurexTradingStore.getTrialDaysRemaining();
  const engine = aurexTradingStore.getEngineStatus();
  const position = aurexTradingStore.getActivePosition();
  const scanStats = analysisService.getMarketScanStats();
  const bestOpportunity = analysisService.getBestOpportunity();
  const decisionLog = aurexTradingStore.getDecisionLog();

  const [isScanning, setIsScanning] = useState(false);

  const isAr = lang === 'ar';

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const handleTogglePosition = () => {
    aurexTradingStore.togglePositionState();
  };

  const handleViewAnalysis = () => {
    const asset = marketDataService.getAssetBySymbol(bestOpportunity.symbol);
    if (asset) {
      onInspectAsset(asset);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in duration-200">
      {/* 1. Main Balance Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0C121E] via-[#080C14] to-[#05070B] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400 font-mono">
                {languageService.t('paperPortfolio')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                {languageService.t('spotOnly')}
              </span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-100 font-mono tracking-tight">
                ${account.equity.toFixed(2)}
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+${account.todayPnl.toFixed(2)}</span>
                <span>(+{account.todayPnlPercent.toFixed(2)}%) {languageService.t('today')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualScan}
              disabled={isScanning}
              className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-emerald-400 ${
                  isScanning ? 'animate-spin' : ''
                }`}
              />
              <span>{isScanning ? languageService.t('scanning') : languageService.t('scanNow')}</span>
            </button>

            <button
              onClick={() => onNavigate('performance')}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-950/60"
            >
              <span>{languageService.t('navPerformance')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Balance Grid Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {languageService.t('paperBalance')}
            </span>
            <span className="text-slate-200 font-bold text-sm">
              ${account.paperBalance.toFixed(2)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {languageService.t('totalReturn')}
            </span>
            <span className="text-emerald-400 font-bold text-sm">
              +{account.totalReturnPercent.toFixed(2)}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {languageService.t('availableBalance')}
            </span>
            <span className="text-slate-200 font-bold text-sm">
              ${account.availableBalance.toFixed(2)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {languageService.t('totalEquity')}
            </span>
            <span className="text-emerald-400 font-bold text-sm">
              ${account.equity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. 30-Day Paper Trial Counter Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-lg relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-200 font-mono tracking-wider">
                {languageService.t('trialTitle')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {languageService.t('trialSubtitle')}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-amber-400 font-mono block">
              {languageService.t('dayOfTrial')} {trial.currentDay} / {trial.totalDays}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {languageService.t('trialRemaining')}: <strong className="text-slate-200">{trial.remainingDays} {languageService.t('days')}</strong>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${Math.max(4, trial.progressPercent)}%` }}
          />
        </div>
      </div>

      {/* 3. AI Trading Status Card */}
      <div className="p-5 rounded-3xl bg-[#090D15] border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100 font-mono uppercase tracking-wider">
                  {languageService.t('engineTitle')}
                </h3>
                {engine.isOnline ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ENGINE ONLINE</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>ENGINE OFFLINE</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {languageService.t('engineSubtitle')}
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-400 hidden sm:block">
            <div>
              {languageService.t('lastScan')}:{' '}
              <strong className={engine.isOnline ? 'text-emerald-400' : 'text-slate-300'}>
                {engine.lastScanTime || 'Recent'}
              </strong>
            </div>
            {engine.lastRun ? (
              <div className="text-[10px] text-slate-400">
                Heartbeat:{' '}
                <span className="text-emerald-400/90 font-mono">
                  {new Date(engine.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ) : (
              <div className="text-[10px]">{languageService.t('nextScanIn')} {engine.nextScanInSeconds}s</div>
            )}
          </div>
        </div>

        {/* Engine Grid Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{languageService.t('marketScanner')}</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {languageService.t('connected')}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{languageService.t('newsAnalyzer')}</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {languageService.t('connected')}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{languageService.t('riskEngine')}</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {languageService.t('active')}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">{languageService.t('paperExecution')}</span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {languageService.t('active')}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Current Position Card */}
      <div className="p-5 rounded-3xl bg-[#090D15] border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 font-mono uppercase tracking-wider">
                {languageService.t('currentPositionTitle')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {languageService.t('currentPositionSubtitle')}
              </p>
            </div>
          </div>

          {/* Test State Switcher Button */}
          <button
            onClick={handleTogglePosition}
            className="text-[10px] font-mono text-slate-400 hover:text-emerald-400 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer"
          >
            {position ? languageService.t('simulateNoTrade') : languageService.t('simulateOpenPosition')}
          </button>
        </div>

        {position ? (
          /* Active Position Display */
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600/30 to-slate-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black font-mono text-base shadow-md">
                  {position.symbol.split('/')[0] || 'BTC'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-100 font-mono">
                      {position.symbol}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      {languageService.t('longSpot')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {languageService.t('confidenceScore')}: <strong className="text-emerald-400">{position.confidenceScore}/100</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    {languageService.t('unrealizedPnl')}
                  </span>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    +${position.pnl.toFixed(2)} (+{position.pnlPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>

            {/* Position Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase block">{languageService.t('entryPrice')}</span>
                <span className="text-slate-200 font-bold">
                  ${position.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase block">{languageService.t('currentPrice')}</span>
                <span className="text-emerald-400 font-bold">
                  ${position.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase block">{languageService.t('takeProfit')}</span>
                <span className="text-emerald-300 font-bold">
                  ${position.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase block">{languageService.t('stopLoss')}</span>
                <span className="text-rose-400 font-bold">
                  ${position.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                {languageService.t('trailingStopActive')} $64,500.00
              </span>
              <button
                onClick={handleTogglePosition}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer transition-colors"
              >
                {languageService.t('closePosition')}
              </button>
            </div>
          </div>
        ) : (
          /* NO TRADE STATE */
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center space-y-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
              <Activity className="w-7 h-7" />
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h4 className="text-sm font-black text-slate-200 font-mono tracking-wide">
                {languageService.t('noActiveTradeTitle')}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {languageService.t('noActiveTradeDesc')}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{languageService.t('scanningGlobalAssets')}</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. AI Market Scanner & Best Opportunity */}
      <div className="p-5 rounded-3xl bg-[#090D15] border border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 font-mono uppercase tracking-wider">
                {languageService.t('scannerTitle')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {languageService.t('scannerSubtitle')}
              </p>
            </div>
          </div>

          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            {languageService.t('spotOnly')}
          </span>
        </div>

        {/* Scan Stats Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-400 block">{languageService.t('scannedAssets')}</span>
            <span className="text-slate-100 font-black text-base">{scanStats.scannedAssets}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-400 block">{languageService.t('qualified')}</span>
            <span className="text-emerald-400 font-black text-base">{scanStats.qualifiedAssets}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-400 block">{languageService.t('selected')}</span>
            <span className="text-emerald-300 font-black text-base">{scanStats.selectedAssets}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center">
            <span className="text-[10px] text-slate-400 block">{languageService.t('rejected')}</span>
            <span className="text-slate-400 font-black text-base">{scanStats.rejectedAssets}</span>
          </div>
        </div>

        {/* Best Opportunity Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/40 space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-emerald-400 font-mono tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {languageService.t('bestOpportunity')}
              </span>
              <span className="text-xs font-black text-slate-100 font-mono">
                {bestOpportunity.symbol}
              </span>
            </div>

            <span className="text-xs font-black text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {languageService.t('confidenceScore')}: {bestOpportunity.confidence}/100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[9px] text-slate-400 uppercase block">{languageService.t('marketRegime')}</span>
              <span className="text-emerald-400 font-bold">{bestOpportunity.marketRegime}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[9px] text-slate-400 uppercase block">{languageService.t('momentum')}</span>
              <span className="text-slate-200 font-bold">{bestOpportunity.momentum}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[9px] text-slate-400 uppercase block">{languageService.t('volumeStatus')}</span>
              <span className="text-slate-200 font-bold">{bestOpportunity.volumeStatus}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[9px] text-slate-400 uppercase block">{languageService.t('newsImpact')}</span>
              <span className="text-emerald-400 font-bold">{bestOpportunity.newsImpact}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[9px] text-slate-400 uppercase block">{languageService.t('riskReward')}</span>
              <span className="text-emerald-400 font-bold">{bestOpportunity.riskReward}</span>
            </div>
          </div>

          <button
            onClick={handleViewAnalysis}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-black font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{languageService.t('viewAnalysis')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. AI Decision Log */}
      <div className="p-5 rounded-3xl bg-[#090D15] border border-slate-800 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-100 font-mono uppercase tracking-wider">
                {languageService.t('decisionLogTitle')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {languageService.t('decisionLogSubtitle')}
              </p>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 font-mono">{languageService.t('liveStream')}</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {decisionLog.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs font-mono"
            >
              <span className="text-emerald-400 font-bold text-[11px] shrink-0 mt-0.5">
                {log.timestamp}
              </span>
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="text-slate-200 font-medium truncate">{log.title}</div>
                {log.details && (
                  <div className="text-[11px] text-slate-400">{log.details}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
