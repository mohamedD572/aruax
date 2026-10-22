import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Check,
  ShieldCheck,
  Zap,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Country, Service, SMSOrder } from '../types/sms';
import {
  MOCK_COUNTRIES,
  MOCK_SERVICES,
  calculatePrice,
} from '../data/mockSmsData';
import { ServiceIcon } from '../components/sms/ServiceIcon';
import { BuyConfirmModal } from '../components/sms/BuyConfirmModal';
import { smsVaultStore } from '../services/smsVaultStore';

interface BuyNumberPageProps {
  onOrderCreated: (order: SMSOrder) => void;
  onOpenAddBalance: () => void;
}

export const BuyNumberPage: React.FC<BuyNumberPageProps> = ({
  onOrderCreated,
  onOpenAddBalance,
}) => {
  const wallet = smsVaultStore.getWallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<string>('us');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('telegram');
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'availability'>('popular');

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const selectedCountry = useMemo(() => {
    return (
      MOCK_COUNTRIES.find((c) => c.id === selectedCountryId) || MOCK_COUNTRIES[0]
    );
  }, [selectedCountryId]);

  const selectedService = useMemo(() => {
    return (
      MOCK_SERVICES.find((s) => s.id === selectedServiceId) || MOCK_SERVICES[0]
    );
  }, [selectedServiceId]);

  const livePrice = useMemo(() => {
    return calculatePrice(selectedService.id, selectedCountry.id);
  }, [selectedService, selectedCountry]);

  // Filtered Countries
  const filteredCountries = useMemo(() => {
    return MOCK_COUNTRIES.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.prefix.includes(searchQuery) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = regionFilter === 'All' || c.region === regionFilter;
      return matchesSearch && matchesRegion;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.startingPrice - b.startingPrice;
      if (sortBy === 'availability') return b.count - a.count;
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [searchQuery, regionFilter, sortBy]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return MOCK_SERVICES.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        serviceCategoryFilter === 'All' || s.category === serviceCategoryFilter;
      return matchesSearch && matchesCat;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.startingPrice - b.startingPrice;
      if (sortBy === 'availability') return b.availableCount - a.availableCount;
      return 0;
    });
  }, [searchQuery, serviceCategoryFilter, sortBy]);

  const availableNumberPool = useMemo(() => {
    return Math.min(selectedCountry.count, selectedService.availableCount);
  }, [selectedCountry, selectedService]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Title & Global Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-emerald-400" />
            Buy a Number
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose a country and target service for instant one-time SMS verification.
          </p>
        </div>

        {/* Live Balance Summary */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-[#0F1722] border border-emerald-500/30 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Wallet Balance
            </span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              ${wallet.balance.toFixed(2)} USDT
            </span>
          </div>
          <button
            onClick={onOpenAddBalance}
            className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-xs font-bold transition-all cursor-pointer"
          >
            + Add Funds
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country (e.g. Egypt, US) or service (e.g. Telegram, WhatsApp)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-xs sm:text-sm outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 outline-none focus:border-emerald-500"
            >
              <option value="popular">Popular First</option>
              <option value="price-asc">Lowest Price</option>
              <option value="availability">Highest Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. STEP 1: Country Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              Select Country
            </h2>
          </div>

          {/* Region Tabs */}
          <div className="hidden sm:flex items-center gap-1 text-[11px]">
            {['All', 'Americas', 'Europe', 'Middle East', 'Asia'].map((reg) => (
              <button
                key={reg}
                onClick={() => setRegionFilter(reg)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  regionFilter === reg
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {filteredCountries.map((c) => {
            const isSelected = selectedCountryId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCountryId(c.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900/90 border-emerald-500 shadow-lg shadow-emerald-950/60 scale-[1.02]'
                    : 'bg-[#0B0F17] hover:bg-[#111724] border-slate-800 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{c.flag}</span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-100 truncate group-hover:text-emerald-300 transition-colors">
                      {c.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {c.prefix}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[10px]">
                    {c.count} available
                  </span>
                  <span className="text-emerald-400 font-bold">
                    from ${c.startingPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. STEP 2: Service Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              2
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              Select Service
            </h2>
          </div>

          {/* Service Category Tabs */}
          <div className="hidden sm:flex items-center gap-1 text-[11px]">
            {['All', 'Messenger', 'Social', 'Tools', 'Other'].map((cat) => (
              <button
                key={cat}
                onClick={() => setServiceCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  serviceCategoryFilter === cat
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {filteredServices.map((s) => {
            const isSelected = selectedServiceId === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedServiceId(s.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900/90 border-emerald-500 shadow-lg shadow-emerald-950/60 scale-[1.02]'
                    : 'bg-[#0B0F17] hover:bg-[#111724] border-slate-800 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: s.color }}
                  >
                    <ServiceIcon iconKey={s.iconKey} size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-100 truncate group-hover:text-emerald-300 transition-colors">
                      {s.name}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {s.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[10px]">
                    {s.availableCount} stock
                  </span>
                  <span className="text-emerald-400 font-bold">
                    ${s.startingPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Sticky / Prominent BUY NUMBER Summary Bar */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0C121C] via-[#09101A] to-[#060A10] border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/80 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Selected Pair Preview */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{selectedCountry.flag}</span>
            <div>
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Selected Route
              </div>
              <div className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                <span>{selectedCountry.name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400">{selectedService.name}</span>
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          {/* Pricing & Stock pill */}
          <div className="flex items-center gap-3 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Price:
              </span>
              <span className="text-lg font-black text-emerald-400">
                ${livePrice.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Available:
              </span>
              <span className="text-xs font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {availableNumberPool} numbers
              </span>
            </div>
          </div>
        </div>

        {/* Big BUY NUMBER Button */}
        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          className="w-full md:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>BUY NUMBER (${livePrice.toFixed(2)})</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>

      {/* Buy Confirmation Modal */}
      {showConfirmModal && (
        <BuyConfirmModal
          country={selectedCountry}
          service={selectedService}
          price={livePrice}
          onClose={() => setShowConfirmModal(false)}
          onOpenAddBalance={onOpenAddBalance}
          onSuccess={(order) => {
            setShowConfirmModal(false);
            onOrderCreated(order);
          }}
        />
      )}
    </div>
  );
};
