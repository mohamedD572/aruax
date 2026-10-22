import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Filter,
  Sparkles,
  ArrowUpRight,
  Shield,
  Layers,
} from 'lucide-react';
import { marketDataService } from '../services/marketDataService';
import { languageService } from '../services/languageService';
import { MarketAsset } from '../types/trading';

interface MarketsPageProps {
  onInspectAsset: (asset: MarketAsset) => void;
}

export const MarketsPage: React.FC<MarketsPageProps> = ({ onInspectAsset }) => {
  const [, setLang] = useState(languageService.getLanguage());
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'crypto' | 'stocks' | 'metals'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  const allAssets = marketDataService.getAllAssets();

  const filteredAssets = allAssets.filter((asset) => {
    const matchesCategory =
      selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesSearch =
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight">
              {languageService.t('marketsTitle')}
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              {languageService.t('spotOnly')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {languageService.t('marketsSubtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={languageService.t('searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-emerald-500/50 text-slate-200 text-xs font-mono placeholder:text-slate-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono">
        {[
          { id: 'all', label: `${languageService.t('allAssets')} (14)` },
          { id: 'crypto', label: `${languageService.t('crypto')} (7)` },
          { id: 'stocks', label: `${languageService.t('stocks')} (5)` },
          { id: 'metals', label: `${languageService.t('metals')} (2)` },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/60'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Asset List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredAssets.map((asset) => {
          const isPositive = asset.change24h >= 0;
          return (
            <div
              key={asset.symbol}
              onClick={() => onInspectAsset(asset)}
              className="p-4 rounded-2xl bg-[#090D15] hover:bg-[#0C121E] border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black font-mono text-sm transition-colors">
                    {asset.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black text-slate-100 font-mono group-hover:text-emerald-300 transition-colors">
                        {asset.symbol}
                      </h3>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                        {asset.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[140px]">
                      {asset.name}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-black text-slate-100">
                    ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {asset.change24h}%
                  </div>
                </div>
              </div>

              {/* Bottom stats row */}
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {languageService.t('score')}: <strong className="text-emerald-400">{asset.confidence}/100</strong>
                </span>

                <span className="text-slate-400">
                  {languageService.t('volume24h')}: <strong className="text-slate-200">${asset.volume24h}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
