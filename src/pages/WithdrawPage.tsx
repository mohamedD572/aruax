import React, { useState } from 'react';
import { NetworkType, WithdrawalRequest, UserProfile, AppSettings } from '../types';
import { store } from '../services/store';
import { TelegramService } from '../services/telegram';
import { ArrowUpRight, AlertCircle, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';

interface WithdrawPageProps {
  user: UserProfile;
  withdrawals: WithdrawalRequest[];
  settings: AppSettings;
}

export const WithdrawPage: React.FC<WithdrawPageProps> = ({ user, withdrawals, settings }) => {
  const [network, setNetwork] = useState<NetworkType>('USDT (BEP20)');
  const [amountInput, setAmountInput] = useState<number>(settings.minWithdrawal || 0.1);
  const [addressInput, setAddressInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fee calculation helper based on network
  const getNetworkFee = (amt: number, net: NetworkType): number => {
    if (amt <= 2.0) return parseFloat(((amt * (settings.withdrawalFeePercent || 5.0)) / 100).toFixed(3));
    if (net === 'USDT (BEP20)') return 1.0;
    if (net === 'TRX (TRON)') return 1.5;
    return parseFloat(((amt * (settings.withdrawalFeePercent || 5.0)) / 100).toFixed(2));
  };

  const fee = getNetworkFee(amountInput, network);
  const netAmount = Math.max(0, parseFloat((amountInput - fee).toFixed(2)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (amountInput < settings.minWithdrawal) {
      const msg = `Minimum withdrawal amount is $${settings.minWithdrawal} USDT.`;
      setFeedback({ type: 'error', message: msg });
      store.showErrorModal('Withdrawal Limit Error', msg);
      return;
    }

    if (!addressInput.trim()) {
      const msg = 'Please enter a valid recipient wallet address for your chosen network.';
      setFeedback({ type: 'error', message: msg });
      store.showErrorModal('Invalid Wallet Address', msg);
      return;
    }

    if (user.balance < amountInput) {
      const msg = `Insufficient USDT balance. Available: $${user.balance.toFixed(2)} USDT, Requested: $${amountInput.toFixed(2)} USDT.`;
      setFeedback({ type: 'error', message: msg });
      store.showInsufficientBalanceModal(amountInput, msg);
      return;
    }

    setIsSubmitting(true);
    TelegramService.hapticImpact('heavy');

    const result = await store.createWithdrawal(amountInput, network, addressInput.trim());

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setAddressInput('');
      TelegramService.hapticNotification('success');
      store.showSuccessModal('Withdrawal Request Submitted! 💸', result.message);
    } else {
      setFeedback({ type: 'error', message: result.message });
      TelegramService.hapticNotification('error');
      if (result.message.toLowerCase().includes('balance')) {
        store.showInsufficientBalanceModal(amountInput, result.message);
      } else {
        store.showErrorModal('Withdrawal Error', result.message);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in">
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-black text-[#F0F6FC]">Withdraw USDT</h1>
        <p className="text-xs text-[#8B949E]">
          TRC20 Fee: <span className="text-amber-400 font-bold">$2 USDT</span> | TON Fee: <span className="text-amber-400 font-bold">0.5 TON ($0.50)</span> | Other Networks: <span className="text-amber-400 font-bold">5%</span>
        </p>
      </div>

      {/* Available Balance Header */}
      <div className="p-4 rounded-2xl bg-[#161B22] border border-[#21262D] flex items-center justify-between">
        <div>
          <span className="text-xs text-[#8B949E] block">Available Wallet Balance</span>
          <span className="text-2xl font-black text-[#7CFF4F]">${user.balance.toFixed(2)} USDT</span>
        </div>
        <div className="px-3 py-1 rounded-full bg-[#7CFF4F]/10 border border-[#7CFF4F]/30 text-[#7CFF4F] font-bold text-xs">
          Min ${settings.minWithdrawal.toFixed(2)} USDT
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4">
        <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-1.5 border-b border-[#21262D] pb-3">
          <ArrowUpRight className="w-4 h-4 text-sky-400" />
          Withdrawal Request Form
        </h3>

        {/* Network Selector */}
        <div>
          <label className="text-xs font-medium text-[#8B949E] block mb-1.5">Select Payout Network</label>
          <div className="grid grid-cols-3 gap-2">
            {(['USDT (BEP20)', 'TRX (TRON)', 'BNB (BEP20)'] as NetworkType[]).map((net) => {
              const isSelected = network === net;
              const netFeeLabel = net === 'USDT (BEP20)' ? 'Fee: $1' : net === 'TRX (TRON)' ? 'Fee: $1.5' : 'Fee: 5%';
              return (
                <button
                  key={net}
                  type="button"
                  onClick={() => {
                    TelegramService.hapticSelection();
                    setNetwork(net);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs flex flex-col items-center justify-center transition-all border ${
                    isSelected
                      ? 'bg-sky-400 text-[#0D1117] border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                      : 'bg-[#0D1117] text-[#8B949E] border-[#21262D] hover:border-[#30363D]'
                  }`}
                >
                  <span className="font-extrabold">{net}</span>
                  <span className={`text-[10px] font-medium opacity-80 ${isSelected ? 'text-[#0D1117]' : 'text-amber-400'}`}>
                    {netFeeLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="flex justify-between text-xs text-[#8B949E] mb-1 font-medium">
            <span>Amount to Withdraw (USDT)</span>
            <span className="text-amber-400 font-bold">
              {network === 'TRC20' ? 'Fee: $2.00 USDT' : network === 'TON' ? 'Fee: 0.5 TON ($0.50)' : 'Fee: 5%'}
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              min={settings.minWithdrawal}
              step="any"
              value={amountInput}
              onChange={(e) => setAmountInput(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#0D1117] border border-[#30363D] focus:border-sky-400 rounded-xl px-4 py-2.5 text-sm font-bold text-[#F0F6FC] outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setAmountInput(user.balance)}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[11px] font-bold text-sky-400"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="text-xs font-medium text-[#8B949E] block mb-1">
            Recipient {network} Wallet Address
          </label>
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder={`Enter your ${network} address...`}
            className="w-full bg-[#0D1117] border border-[#30363D] focus:border-sky-400 rounded-xl px-4 py-2.5 text-xs font-mono text-[#F0F6FC] outline-none"
            required
          />
        </div>

        {/* Fee breakdown card */}
        <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#21262D] text-xs space-y-1">
          <div className="flex justify-between text-[#8B949E]">
            <span>Requested Amount:</span>
            <span className="text-[#F0F6FC] font-semibold">${amountInput.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between text-[#8B949E]">
            <span>
              Network Handling Fee ({network === 'TRC20' ? '$2 Fixed' : network === 'TON' ? '0.5 TON / $0.50' : '5%'}):
            </span>
            <span className="text-red-400 font-semibold">-${fee.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between text-[#7CFF4F] font-bold pt-1 border-t border-[#21262D]">
            <span>Net Payout to Wallet:</span>
            <span>${netAmount.toFixed(2)} USDT</span>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-[#7CFF4F]/10 border-[#7CFF4F]/40 text-[#7CFF4F]'
                : 'bg-red-950/30 border-red-500/40 text-red-400'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || user.balance < amountInput}
          className="w-full py-3.5 rounded-xl bg-sky-400 hover:bg-sky-500 active:scale-98 text-[#0D1117] font-black text-xs transition-all shadow-[0_0_15px_rgba(56,189,248,0.25)]"
        >
          Confirm Withdrawal (${netAmount.toFixed(2)} USDT Net)
        </button>
      </form>

      {/* History */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider px-1">
          Withdrawal Requests History ({withdrawals.length})
        </h3>

        {withdrawals.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#161B22] text-center text-xs text-[#8B949E]">
            No withdrawal requests submitted yet.
          </div>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((wd) => (
              <div key={wd.id} className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-[#F0F6FC]">${wd.amount} USDT</span>
                    <span className="text-[10px] text-[#8B949E]">(Net: ${wd.netAmount})</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-[#0D1117] text-[#8B949E] border border-[#30363D]">
                      {wd.network}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      wd.status === 'Approved'
                        ? 'bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/30'
                        : wd.status === 'Rejected'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {wd.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
                  <span className="font-mono truncate max-w-[200px]">Addr: {wd.address}</span>
                  <span>{new Date(wd.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
