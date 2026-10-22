import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Shield,
  Zap,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  Newspaper,
  Compass,
} from 'lucide-react';
import { MarketAsset } from '../../types/trading';
import { languageService } from '../../services/languageService';

interface AssetDetailModalProps {
  asset: MarketAsset | null;
  onClose: () => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, onClose }) => {
  const [lang, setLang] = useState(languageService.getLanguage());
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '1D' | '1W'>('4H');

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  if (!asset) return null;

  const isPositive = asset.change24h >= 0;
  const isAr = lang === 'ar';

  // Simple SVG chart rendering
  const minVal = Math.min(...asset.sparkline);
  const maxVal = Math.max(...asset.sparkline);
  const range = maxVal - minVal || 1;
  const points = asset.sparkline
    .map((val, i) => {
      const x = (i / (asset.sparkline.length - 1)) * 320;
      const y = 100 - ((val - minVal) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-[#0A0E17] border border-emerald-500/30 p-6 shadow-2xl relative overflow-hidden space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600/30 to-slate-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black font-mono">
              {asset.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-100 font-mono">
                  {asset.symbol}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SPOT
                </span>
              </div>
              <p className="text-xs text-slate-400">{asset.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Price & 24h Stats */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              {languageService.t('liveSpotPrice')}
            </span>
            <div className="text-2xl font-black text-slate-100 font-mono tracking-tight mt-0.5">
              ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 text-sm font-black font-mono px-2.5 py-1 rounded-xl ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {isPositive ? '+' : ''}
              {asset.change24h}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
              {languageService.t('volume24h')}: {asset.volume24h}
            </span>
          </div>
        </div>

        {/* Chart View with Timeframe selector */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {isAr ? 'خط اتجاه السوق' : 'Market Trendline'}
            </span>
            <div className="flex items-center gap-1">
              {(['1H', '4H', '1D', '1W'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg font-mono font-bold transition-colors cursor-pointer ${
                    timeframe === tf
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Price curve */}
          <div className="w-full h-28 flex items-center justify-center">
            <svg viewBox="0 0 320 100" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-900">
            <span>24h Low: ${asset.low24h.toLocaleString()}</span>
            <span>24h High: ${asset.high24h.toLocaleString()}</span>
          </div>
        </div>

        {/* AI Deep Analysis Breakdown */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-300 font-mono tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {languageService.t('assetDeepAnalysis')}
            </h4>
            <span className="text-xs font-black text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {languageService.t('confidenceScore')}: {asset.confidence}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {/* Trend */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-400" />
                {languageService.t('trendScore')}
              </span>
              <span className="text-slate-100 font-bold flex items-center gap-1">
                {asset.trend} ({isAr ? 'توافق EMA' : 'EMA Confluence'})
              </span>
            </div>

            {/* Momentum RSI */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                {languageService.t('momentum')} (RSI 14)
              </span>
              <span className="text-slate-100 font-bold">{asset.momentumRsi} ({isAr ? 'منطقة صحية' : 'Healthy Zone'})</span>
            </div>

            {/* Volume Profile */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <BarChart2 className="w-3 h-3 text-emerald-400" />
                {languageService.t('volumeProfile')}
              </span>
              <span className="text-slate-100 font-bold">{asset.volume24h} ({isAr ? 'سيولة عالية' : 'High Liquidity'})</span>
            </div>

            {/* Market Structure */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-400" />
                {languageService.t('structure')}
              </span>
              <span className="text-slate-100 font-bold">{isAr ? 'قناة صاعدة' : 'Ascending Channel'}</span>
            </div>
          </div>

          {/* News & Risk sentiment */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Newspaper className="w-3.5 h-3.5 text-emerald-400" />
              {languageService.t('sentimentCatalyst')}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "{asset.newsHeadline}"
            </p>
          </div>
        </div>

        {/* Bottom action */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs font-mono transition-colors cursor-pointer border border-slate-800"
          >
            {languageService.t('closeAnalysis')}
          </button>
        </div>
      </div>
    </div>
  );
};
