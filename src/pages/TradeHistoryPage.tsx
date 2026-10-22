import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Filter,
  Shield,
} from 'lucide-react';
import { aurexTradingStore } from '../services/aurexTradingStore';
import { languageService } from '../services/languageService';
import { TradeRecord } from '../types/trading';

export const TradeHistoryPage: React.FC = () => {
  const [, setLang] = useState(languageService.getLanguage());
  const [filterTab, setFilterTab] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const history = aurexTradingStore.getTradeHistory();

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  const filteredHistory = history.filter((trade) => {
    if (filterTab === 'ALL') return true;
    return trade.status === filterTab;
  });

  const totalTrades = history.length;
  const winCount = history.filter((t) => t.status === 'WIN').length;
  const winRate = totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : '0';
  const totalRealizedPnl = history.reduce((a, b) => a + b.pnl, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2.5">
            <History className="w-7 h-7 text-emerald-400" />
            {languageService.t('historyTitle')}
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            {languageService.t('paperExecution')}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {languageService.t('historySubtitle')}
        </p>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {languageService.t('realizedPnl')}
          </span>
          <span className="text-emerald-400 font-black text-base sm:text-lg">
            +${totalRealizedPnl.toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {languageService.t('winRate')}
          </span>
          <span className="text-slate-100 font-black text-base sm:text-lg">
            {winRate}% ({winCount}/{totalTrades})
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">
            {languageService.t('avgDuration')}
          </span>
          <span className="text-slate-200 font-black text-base sm:text-lg">
            2h 32m
          </span>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 font-mono">
        {(['ALL', 'WIN', 'LOSS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === tab
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/60'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab === 'ALL'
              ? `${languageService.t('all')} (${history.length})`
              : tab === 'WIN'
              ? `${languageService.t('winning')} (${winCount})`
              : `${languageService.t('losing')} (${history.length - winCount})`}
          </button>
        ))}
      </div>

      {/* Trade List */}
      <div className="space-y-3">
        {filteredHistory.map((trade) => {
          const isWin = trade.status === 'WIN';
          return (
            <div
              key={trade.id}
              className="p-4 rounded-2xl bg-[#090D15] border border-slate-800/80 hover:border-emerald-500/30 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 font-black font-mono text-xs">
                    {trade.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-100 font-mono">
                        {trade.symbol}
                      </h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {trade.type}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {languageService.t('confidenceScore')}: <strong className="text-emerald-400">{trade.confidence}/100</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div
                    className={`text-sm sm:text-base font-black ${
                      isWin ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isWin ? '+' : ''}${trade.pnl.toFixed(2)} ({isWin ? '+' : ''}{trade.pnlPercent}%)
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {trade.duration}
                  </span>
                </div>
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono pt-2 border-t border-slate-900">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">{languageService.t('entry')}</span>
                  <span className="text-slate-200">${trade.entryPrice.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">{languageService.t('exit')}</span>
                  <span className="text-slate-200">${trade.exitPrice.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">{languageService.t('returnAmount')}</span>
                  <span className={isWin ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {trade.pnlPercent}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
