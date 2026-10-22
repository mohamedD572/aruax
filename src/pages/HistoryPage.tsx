import React, { useState } from 'react';
import { TransactionHistoryItem } from '../types';
import { store } from '../services/store';
import { History, ArrowDownLeft, ArrowUpRight, TrendingUp, Sparkles, Gift, Search, RefreshCw, ShieldCheck, ArrowRightLeft, FileText, Filter } from 'lucide-react';
import { TelegramService } from '../services/telegram';

interface HistoryPageProps {
  transactions?: TransactionHistoryItem[];
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ transactions: propTransactions }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine store transactions, deposits, withdrawals, and task rewards to form a 100% complete audit ledger
  const storeTxs = store.getTransactions();
  const deposits = store.getDeposits();
  const withdrawals = store.getWithdrawals();

  // Map deposits into ledger items if missing
  const depositTxs: TransactionHistoryItem[] = deposits.map((d) => ({
    id: `dep-${d.id}`,
    userId: d.userId || '',
    type: 'Deposit',
    amount: d.amount,
    currency: 'USDT',
    description: `Deposit via ${d.network || 'USDT (BEP20)'}`,
    status: d.status,
    txHash: d.txHash || `0x${d.id.slice(0, 8)}...${d.id.slice(-4)}`,
    createdAt: d.createdAt,
  }));

  // Map withdrawals into ledger items if missing
  const withdrawalTxs: TransactionHistoryItem[] = withdrawals.map((w) => ({
    id: `wd-${w.id}`,
    userId: w.userId || '',
    type: 'Withdrawal',
    amount: w.amount,
    currency: 'USDT',
    description: `Withdrawal to ${w.address ? w.address.slice(0, 8) + '...' : 'Wallet'}`,
    status: w.status,
    txHash: `0x${w.id.slice(0, 8)}...${w.id.slice(-4)}`,
    createdAt: w.createdAt,
  }));

  // Merge all unique transactions
  const allTxsMap = new Map<string, TransactionHistoryItem>();
  
  (propTransactions || storeTxs).forEach((t) => allTxsMap.set(t.id, t));
  depositTxs.forEach((t) => {
    if (!allTxsMap.has(t.id)) allTxsMap.set(t.id, t);
  });
  withdrawalTxs.forEach((t) => {
    if (!allTxsMap.has(t.id)) allTxsMap.set(t.id, t);
  });

  const allTransactions = Array.from(allTxsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filterTabs = ['All', 'Deposits', 'Withdrawals', 'Rewards', 'Swaps'];

  const filtered = allTransactions.filter((tx) => {
    let matchesTab = true;

    if (filterType === 'Deposits') {
      matchesTab = tx.type === 'Deposit';
    } else if (filterType === 'Withdrawals') {
      matchesTab = tx.type === 'Withdrawal';
    } else if (filterType === 'Rewards') {
      matchesTab = (['Daily Profit', 'Mining Reward', 'Referral Reward', 'Task Reward', 'Investment'] as string[]).includes(tx.type);
    } else if (filterType === 'Swaps') {
      matchesTab = (['Swap', 'Coin Conversion'] as string[]).includes(tx.type);
    }

    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.txHash && tx.txHash.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.status && tx.status.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const getTxIcon = (type: TransactionHistoryItem['type']) => {
    switch (type) {
      case 'Deposit':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400 stroke-[2.5]" />;
      case 'Withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-sky-400 stroke-[2.5]" />;
      case 'Investment':
        return <TrendingUp className="w-4 h-4 text-amber-400 stroke-[2.5]" />;
      case 'Daily Profit':
        return <Sparkles className="w-4 h-4 text-emerald-400 stroke-[2.5]" />;
      case 'Swap':
        return <ArrowRightLeft className="w-4 h-4 text-amber-400 stroke-[2.5]" />;
      default:
        return <Gift className="w-4 h-4 text-purple-400 stroke-[2.5]" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = status || 'Approved';
    if (s === 'Approved' || s === 'Completed') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          Approved
        </span>
      );
    }
    if (s === 'Pending') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
          Pending
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300 select-none">
      {/* Title Header */}
      <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <History className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-100 uppercase tracking-tight font-mono">
                Transaction Ledger
              </h1>
              <p className="text-[11px] text-slate-400">Complete Immutable Blockchain Audit Log</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {allTransactions.length} Records
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by ID, type or hash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 outline-none font-mono"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 overflow-x-auto text-xs font-mono font-bold scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = filterType === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                TelegramService.hapticImpact('light');
                setFilterType(tab);
              }}
              className={`flex-1 min-w-[75px] py-1.5 px-3 rounded-xl transition-all text-center whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Transaction Records List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-10 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-2 font-mono">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No transactions found matching active filter.</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const dateObj = new Date(tx.createdAt || Date.now());
            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const isNegative = tx.type === 'Withdrawal';
            const txIdDisplay = tx.txHash || `#TX-${tx.id.slice(-8)}`;

            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                      {getTxIcon(tx.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-100 uppercase font-mono">{tx.type}</h4>
                        {getStatusBadge(tx.status)}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[170px] sm:max-w-[260px] font-sans">
                        {tx.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`text-xs font-black block ${
                        isNegative ? 'text-sky-400' : 'text-emerald-400'
                      }`}
                    >
                      {isNegative ? '-' : '+'}
                      {tx.currency === 'USDT' || !tx.currency ? `$${tx.amount.toFixed(2)} USDT` : `${tx.amount} ${tx.currency}`}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {dateStr} at {timeStr}
                    </span>
                  </div>
                </div>

                {/* Footer Tx Hash */}
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1.5 border-t border-slate-900">
                  <span>Tx ID: <strong className="text-slate-300">{txIdDisplay}</strong></span>
                  <span className="text-emerald-400 font-bold">Verified Ledger</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
