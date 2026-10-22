import React, { useState } from 'react';
import { WithdrawalRequest, UserProfile } from '../types';
import { TelegramService } from '../services/telegram';
import { Copy, Check, CheckCircle2, XCircle } from 'lucide-react';

interface AdminWithdrawalCardProps {
  wd: WithdrawalRequest;
  userProfile?: UserProfile;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const AdminWithdrawalCard: React.FC<AdminWithdrawalCardProps> = ({
  wd,
  userProfile,
  onApprove,
  onReject,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  // Retrieve full raw wallet address from withdrawal request record
  const fullAddress = (wd.address || (wd as any).walletAddress || '').trim();

  // Format Network e.g. "USDT (BEP20)" -> "USDT • BEP20"
  const formatNetwork = (netStr: string) => {
    if (!netStr) return 'USDT • BEP20';
    if (netStr.includes('•')) return netStr;
    return netStr.replace(/\s*\(([^)]+)\)/, ' • $1');
  };

  const formattedNetwork = formatNetwork(wd.network);

  // Copy full wallet address to clipboard
  const handleCopyAddress = async () => {
    if (!fullAddress) {
      onToast('Failed to copy address', true);
      TelegramService.hapticNotification('warning');
      return;
    }

    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(fullAddress);
        success = true;
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fullAddress;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        textArea.remove();
      }
    } catch (err) {
      console.error('Copy wallet address error:', err);
      success = false;
    }

    if (success) {
      setCopied(true);
      TelegramService.hapticImpact('light');
      onToast('Address copied ✓', false);
      setTimeout(() => setCopied(false), 2500);
    } else {
      TelegramService.hapticNotification('warning');
      onToast('Failed to copy address', true);
    }
  };

  const amountUSD = typeof wd.amount === 'number' ? wd.amount : parseFloat(wd.amount || '0');
  const feeUSD = typeof wd.fee === 'number' ? wd.fee : parseFloat(wd.fee || '0');
  const netUSD = typeof wd.netAmount === 'number' ? wd.netAmount : (amountUSD - feeUSD);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#161B22] border border-[#21262D] hover:border-emerald-500/30 transition-all space-y-4 font-sans text-slate-100 shadow-lg">
      {/* 1. Username / Telegram ID */}
      <div className="flex items-center justify-between pb-3 border-b border-[#21262D]">
        <div className="flex items-center space-x-3">
          <img
            src={
              userProfile?.photoUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${wd.username || wd.userId}`
            }
            alt={wd.username || 'User'}
            className="w-10 h-10 rounded-xl object-cover border border-[#21262D]"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#F0F6FC]">
                @{wd.username || userProfile?.username || wd.userId}
              </span>
            </div>
            <span className="text-[11px] text-[#8B949E] font-mono block">
              Telegram ID: {userProfile?.telegramId || wd.userId}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-[#8B949E] font-mono shrink-0">
          {new Date(wd.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Financial Breakdown: 2. Amount, 3. Fee, 4. Net Amount */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#0D1117] border border-[#21262D]">
        {/* 2. Amount */}
        <div>
          <span className="text-[10px] text-[#8B949E] block uppercase font-bold tracking-wider">
            Amount
          </span>
          <span className="text-xs sm:text-sm font-bold text-[#F0F6FC] font-mono">
            ${amountUSD.toFixed(2)} USDT
          </span>
        </div>

        {/* 3. Fee */}
        <div>
          <span className="text-[10px] text-[#8B949E] block uppercase font-bold tracking-wider">
            Fee
          </span>
          <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono">
            ${feeUSD.toFixed(2)} USDT
          </span>
        </div>

        {/* 4. Net Amount */}
        <div>
          <span className="text-[10px] text-[#8B949E] block uppercase font-bold tracking-wider">
            Net Amount
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
            ${netUSD.toFixed(2)} USDT
          </span>
        </div>
      </div>

      {/* 5. Network */}
      <div className="space-y-1">
        <span className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider block">
          Network
        </span>
        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs font-mono">
          {formattedNetwork}
        </div>
      </div>

      {/* Wallet Address Container: 6. Full Wallet Address & 7. Copy Address */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider block">
          Send to
        </span>
        <div className="p-3 rounded-xl bg-[#0D1117] border border-[#21262D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* 6. Full Wallet Address */}
          <div className="font-mono text-xs text-[#F0F6FC] break-all leading-relaxed max-w-full overflow-x-auto select-all">
            {fullAddress || 'No address stored'}
          </div>

          {/* 7. Copy Address Button */}
          <button
            type="button"
            onClick={handleCopyAddress}
            className={`px-3.5 py-2 rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
            }`}
          >
            {copied ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '✓ Copied' : '📋 Copy Address'}</span>
          </button>
        </div>
      </div>

      {/* Status & Action Controls: 8. Withdrawal Status & 9. Approve / Reject / Process controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-[#21262D]">
        {/* 8. Withdrawal Status */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">
            Withdrawal Status:
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black border ${
              wd.status === 'Approved'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : wd.status === 'Rejected'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
            }`}
          >
            {wd.status}
          </span>
        </div>

        {/* 9. Approve / Reject / Process controls */}
        {wd.status === 'Pending' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onApprove(wd.id)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Approve Payout</span>
            </button>
            <button
              type="button"
              onClick={() => onReject(wd.id)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs transition-all border border-rose-500/30 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <XCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Reject & Refund</span>
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-[#8B949E] italic font-mono">
            {wd.processedAt ? `Processed ${new Date(wd.processedAt).toLocaleString()}` : 'Completed'}
          </span>
        )}
      </div>
    </div>
  );
};
