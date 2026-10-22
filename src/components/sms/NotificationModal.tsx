import React from 'react';
import { X, Bell, CheckCheck, Trash2, MessageSquare, Wallet, ShoppingCart, Info } from 'lucide-react';
import { smsVaultStore } from '../../services/smsVaultStore';

interface NotificationModalProps {
  onClose: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  onClose,
  onSelectOrder,
}) => {
  const notifs = smsVaultStore.getNotifications();

  const handleMarkAllRead = () => {
    smsVaultStore.markAllNotificationsAsRead();
  };

  const handleClearAll = () => {
    smsVaultStore.clearAllNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SMS':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'WALLET':
        return <Wallet className="w-4 h-4 text-amber-400" />;
      case 'ORDER':
        return <ShoppingCart className="w-4 h-4 text-sky-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-[#0B0F17] border border-emerald-500/30 p-5 sm:p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Notifications</h3>
              <p className="text-[11px] text-slate-400">Order updates and SMS alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        {notifs.length > 0 && (
          <div className="flex items-center justify-between py-2 text-[11px] text-slate-400 border-b border-slate-900">
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="max-h-[380px] overflow-y-auto space-y-2 py-3 pr-1">
          {notifs.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Bell className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-500">No notifications yet</p>
            </div>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  smsVaultStore.markNotificationAsRead(n.id);
                  if (n.orderId && onSelectOrder) {
                    onSelectOrder(n.orderId);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? 'bg-slate-950/40 border-slate-900 text-slate-400'
                    : 'bg-slate-900/80 border-emerald-500/30 text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 mt-0.5 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate text-slate-200">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
