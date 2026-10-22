import React, { useState, useMemo } from 'react';
import {
  ListOrdered,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Radio,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { SMSOrder } from '../types/sms';
import { smsVaultStore } from '../services/smsVaultStore';
import { ServiceIcon } from '../components/sms/ServiceIcon';

interface OrdersPageProps {
  onSelectOrder: (orderId: string) => void;
  onNavigateBuy: () => void;
}

type OrderTab = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export const OrdersPage: React.FC<OrdersPageProps> = ({
  onSelectOrder,
  onNavigateBuy,
}) => {
  const orders = smsVaultStore.getOrders();
  const [selectedTab, setSelectedTab] = useState<OrderTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tabs: { id: OrderTab; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All', count: orders.length },
    {
      id: 'ACTIVE',
      label: 'Active',
      count: orders.filter((o) => o.status === 'WAITING_SMS' || o.status === 'SMS_RECEIVED').length,
    },
    {
      id: 'COMPLETED',
      label: 'Completed',
      count: orders.filter((o) => o.status === 'COMPLETED').length,
    },
    {
      id: 'CANCELLED',
      label: 'Cancelled',
      count: orders.filter((o) => o.status === 'CANCELLED').length,
    },
    {
      id: 'REFUNDED',
      label: 'Refunded',
      count: orders.filter((o) => o.status === 'REFUNDED' || o.status === 'CANCELLED').length,
    },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Tab matching
      let matchesTab = true;
      if (selectedTab === 'ACTIVE') {
        matchesTab = ord.status === 'WAITING_SMS' || ord.status === 'SMS_RECEIVED';
      } else if (selectedTab === 'COMPLETED') {
        matchesTab = ord.status === 'COMPLETED';
      } else if (selectedTab === 'CANCELLED') {
        matchesTab = ord.status === 'CANCELLED';
      } else if (selectedTab === 'REFUNDED') {
        matchesTab = ord.status === 'REFUNDED' || ord.status === 'CANCELLED';
      }

      // Search matching
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        ord.id.toLowerCase().includes(q) ||
        ord.serviceName.toLowerCase().includes(q) ||
        ord.countryName.toLowerCase().includes(q) ||
        ord.phoneNumber.includes(q) ||
        (ord.sms?.code && ord.sms.code.includes(q));

      return matchesTab && matchesSearch;
    });
  }, [orders, selectedTab, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2.5">
            <ListOrdered className="w-7 h-7 text-emerald-400" />
            Your Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete record of purchased virtual numbers, incoming SMS codes, and refunds.
          </p>
        </div>

        <button
          onClick={onNavigateBuy}
          className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          + Buy New Number
        </button>
      </div>

      {/* 2. Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (#SV-...), Service, Country, or Phone Number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-xs sm:text-sm outline-none"
          />
        </div>
      </div>

      {/* 3. Orders List Grid */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <ListOrdered className="w-10 h-10 text-slate-700 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no orders matching your current filter. You can buy a new virtual number in seconds.
            </p>
            <button
              onClick={onNavigateBuy}
              className="py-2 px-4 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
            >
              Explore Numbers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredOrders.map((ord) => {
              const isWaiting = ord.status === 'WAITING_SMS';
              const hasSms = ord.status === 'SMS_RECEIVED';
              const isCompleted = ord.status === 'COMPLETED';
              const isCancelled = ord.status === 'CANCELLED' || ord.status === 'REFUNDED';

              return (
                <div
                  key={ord.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group ${
                    isWaiting
                      ? 'bg-gradient-to-b from-[#161208] to-[#0D1017] border-amber-500/40 shadow-lg shadow-amber-950/40'
                      : hasSms
                      ? 'bg-gradient-to-b from-[#091510] to-[#0D1017] border-emerald-500/50 shadow-lg shadow-emerald-950/40'
                      : 'bg-[#0B0F17] hover:bg-[#101522] border-slate-800'
                  }`}
                >
                  {/* Top Bar: Service, Country, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800/90 text-emerald-400 flex items-center justify-center border border-slate-700 shrink-0">
                        <ServiceIcon iconKey={ord.serviceIconKey} size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-100">
                            {ord.serviceName}
                          </span>
                          <span className="text-base">{ord.countryFlag}</span>
                          <span className="text-xs text-slate-400">
                            ({ord.countryName})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5">
                          <span>#{ord.id}</span>
                          <span>•</span>
                          <span>{formatDate(ord.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isWaiting && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                          <Radio className="w-3 h-3 text-amber-400" />
                          Waiting SMS
                        </span>
                      )}
                      {hasSms && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          SMS Received
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          Completed
                        </span>
                      )}
                      {isCancelled && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/40 text-rose-300 border border-rose-500/40">
                          Refunded (${ord.price.toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone Number Display */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                        Virtual Number
                      </span>
                      <span className="text-sm font-black text-slate-100 font-mono tracking-wide">
                        {ord.phoneNumber}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(ord.phoneNumber.replace(/\s+/g, ''), `phone-${ord.id}`)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy Number"
                    >
                      {copiedId === `phone-${ord.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* SMS Snippet (if arrived) */}
                  {ord.sms && (
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-wider">
                          Verification Code
                        </span>
                        <span className="text-base font-black text-slate-100 font-mono tracking-widest">
                          {ord.sms.code}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(ord.sms!.code, `code-${ord.id}`)}
                        className="py-1 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      >
                        {copiedId === `code-${ord.id}` ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Card Footer: Price & View Details Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <div className="font-mono">
                      <span className="text-slate-400">Price: </span>
                      <strong className="text-emerald-400 font-black">
                        ${ord.price.toFixed(2)}
                      </strong>
                    </div>

                    <button
                      onClick={() => onSelectOrder(ord.id)}
                      className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
