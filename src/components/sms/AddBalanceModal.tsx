import React, { useState } from 'react';
import {
  X,
  Plus,
  Zap,
  CreditCard,
  QrCode,
  Gift,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { smsVaultStore } from '../../services/smsVaultStore';

interface AddBalanceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddBalanceModal: React.FC<AddBalanceModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'crypto' | 'card' | 'voucher'>('crypto');
  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const presetAmounts = [5, 10, 25, 50, 100];
  const mockDepositAddress = 'TRX7xP9qLk2vMn8Yw4zB1cR6sE3tA5dF8g';

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleDeposit = () => {
    if (selectedMethod === 'voucher') {
      if (!voucherCode.trim()) {
        alert('Please enter a voucher code.');
        return;
      }
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        const res = smsVaultStore.addFunds(15.0, 'Voucher Code');
        setSuccessMessage('Voucher redeemed successfully! +$15.00 added.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      }, 700);
      return;
    }

    if (effectiveAmount <= 0) {
      alert('Please enter a valid amount greater than $0.');
      return;
    }

    setIsProcessing(true);
    const methodName =
      selectedMethod === 'crypto' ? 'USDT (TRC-20)' : 'Credit Card (Instant)';

    setTimeout(() => {
      setIsProcessing(false);
      smsVaultStore.addFunds(effectiveAmount, methodName);
      setSuccessMessage(`+$${effectiveAmount.toFixed(2)} USDT deposited successfully!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    }, 600);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(mockDepositAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-[#0B0F17] border border-emerald-500/30 p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Add Balance</h3>
              <p className="text-xs text-slate-400">Instant top-up for virtual numbers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Message Banner */}
        {successMessage ? (
          <div className="my-8 py-8 px-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/40">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="text-base font-black text-slate-100">Top-up Successful!</h4>
            <p className="text-xs font-mono text-emerald-400">{successMessage}</p>
          </div>
        ) : (
          <div className="space-y-5 my-4">
            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('crypto')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'crypto'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>USDT TRC-20</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'card'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Bank Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('voucher')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMethod === 'voucher'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Voucher</span>
              </button>
            </div>

            {/* Voucher Mode */}
            {selectedMethod === 'voucher' ? (
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-300 block">
                  Enter Gift or Promo Voucher Code
                </label>
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VAULT-FREE15"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-100 font-mono text-sm uppercase tracking-wider outline-none"
                />
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300">
                  Tip: Use code <strong className="text-emerald-400 font-mono">VAULT-FREE15</strong> to test instant $15 mock balance redemption.
                </div>
              </div>
            ) : (
              /* Amount Selection */
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-300 block">
                  Select Deposit Amount
                </label>

                {/* Preset Chips */}
                <div className="grid grid-cols-5 gap-1.5">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAmount(val);
                        setCustomAmount('');
                      }}
                      className={`py-2 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                        amount === val && !customAmount
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount in USD"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500 text-slate-100 font-mono text-xs outline-none"
                  />
                </div>

                {/* Crypto QR / Address Simulation preview */}
                {selectedMethod === 'crypto' && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>USDT TRC-20 Deposit Address</span>
                      <span className="text-emerald-400 font-bold">0% Fee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] font-mono text-slate-300 truncate bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 flex-1">
                        {mockDepositAddress}
                      </code>
                      <button
                        onClick={handleCopyAddress}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleDeposit}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 hover:shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Processing Top-up...
                </span>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  {selectedMethod === 'voucher'
                    ? 'Redeem Voucher'
                    : `Deposit $${effectiveAmount.toFixed(2)} USDT`}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
