import React from 'react';
import { ArrowLeft, ShoppingCart, ListOrdered } from 'lucide-react';
import { SMSOrder } from '../types/sms';
import { ActiveOrderCard } from '../components/sms/ActiveOrderCard';
import { smsVaultStore } from '../services/smsVaultStore';

interface ActiveOrderViewProps {
  orderId: string;
  onBack: () => void;
  onNavigateBuy: () => void;
}

export const ActiveOrderView: React.FC<ActiveOrderViewProps> = ({
  orderId,
  onBack,
  onNavigateBuy,
}) => {
  const order = smsVaultStore.getOrder(orderId);

  if (!order) {
    return (
      <div className="py-16 px-4 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-200">Order Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested order does not exist or has expired.
        </p>
        <button
          onClick={onBack}
          className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="py-2 px-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onNavigateBuy}
          className="py-2 px-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Buy Another Number</span>
        </button>
      </div>

      {/* Main Active Order Card */}
      <ActiveOrderCard
        order={order}
        onClose={onBack}
      />
    </div>
  );
};
