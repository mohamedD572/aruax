import React from 'react';
import { X } from 'lucide-react';
import { SMSOrder } from '../../types/sms';
import { ActiveOrderCard } from './ActiveOrderCard';

interface ActiveOrderModalProps {
  order: SMSOrder;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export const ActiveOrderModal: React.FC<ActiveOrderModalProps> = ({
  order,
  onClose,
  onOrderUpdated,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <ActiveOrderCard
          order={order}
          onClose={onClose}
          onOrderUpdated={onOrderUpdated}
        />
      </div>
    </div>
  );
};
