import React from 'react';
import {
  Wallet,
  ShoppingCart,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Sparkles,
  User,
  Shield,
} from 'lucide-react';
import { TabType, SMSOrder, TelegramVerifiedUser } from '../types/sms';
import { smsVaultStore } from '../services/smsVaultStore';
import { ServiceIcon } from '../components/sms/ServiceIcon';

interface DashboardPageProps {
  user: TelegramVerifiedUser | null;
  onNavigate: (tab: TabType) => void;
  onOpenAddBalance: () => void;
  onSelectOrder: (orderId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onNavigate,
  onOpenAddBalance,
  onSelectOrder,
}) => {
  const wallet = smsVaultStore.getWallet();
  const activeOrders = smsVaultStore.getActiveOrders();
  const recentOrders = smsVaultStore.getRecentOrders(4);

  const fullName = user
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : 'SMS Vault User';

  const userInitials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`.toUpperCase()
    : 'SV';

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Real Telegram User Greeting & Verified Status Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0C121D] via-[#0A0F17] to-[#070A10] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-emerald-950/40">
        <div className="flex items-center gap-3.5">
          {/* Real Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-md shadow-emerald-500/30 shrink-0 overflow-hidden">
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={fullName}
                className="w-full h-full rounded-[14px] object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#0B0F17] rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-sm font-mono">
                {userInitials}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                {fullName}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
              {user?.username ? (
                <span className="text-emerald-400 font-medium">@{user.username}</span>
              ) : (
                <span>Telegram User</span>
              )}
              <span>•</span>
              <span>ID: {user?.id || '—'}</span>
            </div>
          </div>
        </div>

        {/* System Route Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">Routes:</span>
          <span className="text-emerald-400 font-bold">100% Operational</span>
        </div>
      </div>

      {/* 2. Main Balance Card (Black + Emerald Glow) */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0F1722] via-[#0A0E17] to-[#06080E] border border-emerald-500/40 p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 overflow-hidden">
        {/* Ambient Emerald glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Balance Numbers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <Wallet className="w-4 h-4" />
              <span>Available Balance</span>
            </div>

            <div className="text-4xl sm:text-5xl font-black text-slate-100 font-mono tracking-tight flex items-baseline gap-2">
              ${wallet.balance.toFixed(2)}{' '}
              <span className="text-sm sm:text-base font-sans font-bold text-emerald-400 tracking-normal">
                USDT
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Ready to purchase virtual numbers for any service worldwide.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddBalance}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              Add Balance
            </button>

            <button
              onClick={() => onNavigate('buy')}
              className="py-3 px-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Number
            </button>
          </div>
        </div>

        {/* Sub-metrics bar inside Card */}
        <div className="relative z-10 mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Spent
            </span>
            <div className="text-base sm:text-lg font-black text-slate-200 font-mono">
              ${wallet.totalSpent.toFixed(2)}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Orders
            </span>
            <div className="text-base sm:text-lg font-black text-emerald-400 font-mono flex items-center gap-1.5">
              {activeOrders.length}
              {activeOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
          </div>

          <div className="space-y-0.5 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Refunded
            </span>
            <div className="text-base sm:text-lg font-black text-slate-300 font-mono">
              ${wallet.totalRefunded.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('buy')}
            className="p-4 rounded-2xl bg-[#0C111A] hover:bg-[#111824] border border-slate-800 hover:border-emerald-500/40 text-left transition-all group cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
              Buy Number
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">100+ countries available</p>
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className="p-4 rounded-2xl bg-[#0C111A] hover:bg-[#111824] border border-slate-800 hover:border-emerald-500/40 text-left transition-all group cursor-pointer shadow-sm relative overflow-hidden"
          >
            {activeOrders.length > 0 && (
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                {activeOrders.length} Active
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
              Active Orders
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Live SMS countdowns</p>
          </button>

          <button
            onClick={onOpenAddBalance}
            className="p-4 rounded-2xl bg-[#0C111A] hover:bg-[#111824] border border-slate-800 hover:border-emerald-500/40 text-left transition-all group cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
              Add Balance
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Crypto & instant card</p>
          </button>

          <button
            onClick={() => onNavigate('wallet')}
            className="p-4 rounded-2xl bg-[#0C111A] hover:bg-[#111824] border border-slate-800 hover:border-emerald-500/40 text-left transition-all group cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
              Transactions
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">History & statements</p>
          </button>
        </div>
      </div>

      {/* 4. Active Order Highlight Alert (if any) */}
      {activeOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/40 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Active Virtual Number
                </span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {activeOrders[0].serviceName}
                </span>
              </div>
              <p className="text-sm sm:text-base font-black text-slate-100 font-mono mt-0.5">
                {activeOrders[0].phoneNumber}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectOrder(activeOrders[0].id)}
            className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <span>View Active SMS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5. Recent Orders (Last 4 mock orders) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Recent Orders
          </h3>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recentOrders.map((ord) => {
            const isCompleted = ord.status === 'COMPLETED' || ord.status === 'SMS_RECEIVED';
            const isWaiting = ord.status === 'WAITING_SMS';
            const isCancelled = ord.status === 'CANCELLED' || ord.status === 'REFUNDED';

            return (
              <div
                key={ord.id}
                onClick={() => onSelectOrder(ord.id)}
                className="p-4 rounded-2xl bg-[#0B0F17] hover:bg-[#101622] border border-slate-800 hover:border-emerald-500/30 transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center border border-slate-700">
                      <ServiceIcon iconKey={ord.serviceIconKey} size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                          {ord.serviceName}
                        </span>
                        <span className="text-sm">{ord.countryFlag}</span>
                        <span className="text-xs text-slate-400">({ord.countryName})</span>
                      </div>
                      <p className="text-xs font-mono text-slate-300 mt-0.5">
                        {ord.maskedNumber}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isWaiting && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        Waiting SMS
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {ord.status === 'SMS_RECEIVED' ? 'SMS In' : 'Completed'}
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        Refunded
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-850 font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">${ord.price.toFixed(2)}</span>
                  <span>{formatTimeAgo(ord.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
