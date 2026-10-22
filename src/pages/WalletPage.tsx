import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Zap,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  QrCode,
  CreditCard,
  Gift,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/sms';
import { smsVaultStore } from '../services/smsVaultStore';

interface WalletPageProps {
  onOpenAddBalance: () => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ onOpenAddBalance }) => {
  const wallet = smsVaultStore.getWallet();
  const transactions = smsVaultStore.getTransactions();

  const [txFilter, setTxFilter] = useState<'ALL' | TransactionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesFilter = txFilter === 'ALL' || tx.type === txFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        tx.title.toLowerCase().includes(q) ||
        tx.description.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [transactions, txFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-emerald-400" />
            Wallet & Finances
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your balance, add funds, and view all transactions and refunds.
          </p>
        </div>

        <button
          onClick={onOpenAddBalance}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>ADD BALANCE</span>
        </button>
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Available Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#101824] to-[#0A0E17] border border-emerald-500/40 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            Available Balance
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
            ${wallet.balance.toFixed(2)}{' '}
            <span className="text-xs font-sans text-emerald-400 font-bold">USDT</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Ready to spend</p>
        </div>

        {/* Card 2: Total Added */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Added
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
            ${wallet.totalAdded.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Deposits & vouchers</p>
        </div>

        {/* Card 3: Total Spent */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Spent
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-200 font-mono">
            ${wallet.totalSpent.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Purchased numbers</p>
        </div>

        {/* Card 4: Total Refunded */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Total Refunded
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
            ${wallet.totalRefunded.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Cancelled & expired</p>
        </div>
      </div>

      {/* 3. Transaction History Section */}
      <div className="p-5 rounded-3xl bg-[#0A0D15] border border-slate-800/90 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Transaction History
            </h3>
            <p className="text-xs text-slate-400">
              Detailed ledger of deposits, number purchases, and automatic refunds
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
            {(['ALL', 'DEPOSIT', 'PURCHASE', 'REFUND'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTxFilter(type)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  txFilter === type
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'ALL'
                  ? 'All'
                  : type === 'DEPOSIT'
                  ? 'Deposits'
                  : type === 'PURCHASE'
                  ? 'Purchases'
                  : 'Refunds'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions by title or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-850 focus:border-emerald-500 text-slate-100 placeholder-slate-500 text-xs outline-none"
          />
        </div>

        {/* List of Transactions */}
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No transactions matching the filter.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isDeposit = tx.type === 'DEPOSIT';
              const isPurchase = tx.type === 'PURCHASE';
              const isRefund = tx.type === 'REFUND';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-900/60 border border-slate-850 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDeposit
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isPurchase
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isDeposit && <ArrowDownLeft className="w-4 h-4" />}
                      {isPurchase && <ArrowUpRight className="w-4 h-4" />}
                      {isRefund && <RotateCcw className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-100">
                          {tx.title}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-850 text-slate-400">
                          {tx.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tx.description} • <span className="font-mono">{tx.date}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div
                      className={`text-xs sm:text-sm font-black ${
                        isDeposit
                          ? 'text-emerald-400'
                          : isRefund
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
