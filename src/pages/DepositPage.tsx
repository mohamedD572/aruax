import React, { useState, useEffect } from 'react';
import { NetworkType, DepositRequest, AppSettings, DepositWallet } from '../types';
import { store } from '../services/store';
import { TelegramService } from '../services/telegram';
import { ArrowDownLeft, Copy, Check, QrCode, ShieldAlert, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface DepositPageProps {
  deposits: DepositRequest[];
  settings: AppSettings;
}

const SUPPORTED_NETWORKS: NetworkType[] = [
  'USDT (BEP20)',
  'TRX (TRON)',
  'BNB (BEP20)',
];

export const DepositPage: React.FC<DepositPageProps> = ({ deposits, settings }) => {
  const [network, setNetwork] = useState<NetworkType>('USDT (BEP20)');
  const [currentWallet, setCurrentWallet] = useState<DepositWallet | null>(null);
  const [amount, setAmount] = useState<number>(10);
  const [txHash, setTxHash] = useState<string>('');
  const [imageProof, setImageProof] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pick a random wallet for the chosen network on mount or network change
  useEffect(() => {
    const randomWallet = store.getRandomWalletForNetwork(network);
    setCurrentWallet(randomWallet);
  }, [network]);

  // Re-subscribe to store updates if wallets change in admin panel
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const active = store.getWalletsByNetwork(network);
      if (active.length > 0) {
        // If current wallet is no longer active, pick a new random active one
        if (!currentWallet || !active.some((w) => w.id === currentWallet.id)) {
          setCurrentWallet(store.getRandomWalletForNetwork(network));
        } else {
          // Update current wallet data (e.g. if address or QR changed)
          const updated = active.find((w) => w.id === currentWallet.id);
          if (updated) setCurrentWallet(updated);
        }
      } else {
        setCurrentWallet(null);
      }
    });
    return () => unsubscribe();
  }, [network, currentWallet]);

  const handleCopy = () => {
    if (!currentWallet || !currentWallet.walletAddress) return;
    navigator.clipboard.writeText(currentWallet.walletAddress);
    setCopied(true);
    TelegramService.hapticImpact('light');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميجابايت.');
      return;
    }

    setImageFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageProof(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (amount < 1) {
      setErrorMsg('الحد الأدنى للإيداع هو 1 دولار، وأي مبلغ أقل من ذلك لن يتم اعتماده.');
      return;
    }

    setIsSubmitting(true);
    TelegramService.hapticImpact('heavy');

    try {
      const dep = await store.createDeposit(
        amount,
        network,
        currentWallet?.walletAddress || '',
        imageProof,
        txHash
      );

      setSuccessMsg(`تم إرسال طلب الإيداع بمبلغ $${dep.amount} (${network}) بنجاح! جاري مراجعته والاعتماد قريباً.`);
      setTxHash('');
      setImageProof('');
      setImageFileName('');
      setIsSubmitting(false);

      setTimeout(() => {
        setSuccessMsg(null);
      }, 6000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء إرسال طلب الإيداع.');
      setIsSubmitting(false);
    }
  };

  const walletAddressDisplay = currentWallet?.walletAddress
    ? currentWallet.walletAddress
    : 'سيتم إضافة العنوان لاحقاً من لوحة الإدارة';

  return (
    <div className="space-y-5 pb-20 animate-in fade-in" dir="rtl">
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-black text-[#F0F6FC]">إيداع الرصيد</h1>
        <p className="text-xs text-[#8B949E]">إيداع مشفر آمن وسريع عبر الشبكات المدعومة</p>
      </div>

      {/* Network Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider px-1 block">
          1. اختر شبكة التحويل
        </label>
        <div className="grid grid-cols-3 gap-2" dir="ltr">
          {SUPPORTED_NETWORKS.map((net) => {
            const isSelected = network === net;
            return (
              <button
                key={net}
                type="button"
                onClick={() => {
                  TelegramService.hapticSelection();
                  setNetwork(net);
                }}
                className={`py-3 px-2 rounded-xl text-xs font-black transition-all border ${
                  isSelected
                    ? 'bg-[#7CFF4F] text-[#0D1117] border-[#7CFF4F] shadow-[0_0_12px_rgba(124,255,79,0.25)]'
                    : 'bg-[#161B22] text-[#8B949E] border-[#21262D] hover:border-[#30363D]'
                }`}
              >
                {net}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wallet Deposit Details Card */}
      <div className="p-4 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#F0F6FC] flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#7CFF4F]" />
            عنوان المحفظة ({network})
          </span>
          <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
            الحد الأدنى: 1 $
          </span>
        </div>

        {/* QR Code Display */}
        {currentWallet?.qrImage && (
          <div className="flex flex-col items-center justify-center bg-[#0D1117] p-4 rounded-xl border border-[#21262D]">
            <img
              src={currentWallet.qrImage}
              alt={`QR Code for ${network}`}
              className="w-48 h-48 object-contain rounded-lg border border-[#30363D] bg-white p-2 shadow-lg"
              onError={(e) => {
                // Fallback QR if image fails to load
                if (currentWallet.walletAddress) {
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentWallet.walletAddress)}`;
                }
              }}
            />
            <span className="text-[11px] text-[#8B949E] mt-2 font-medium">
              امسح رمز QR لإجراء التحويل المباشر
            </span>
          </div>
        )}

        {/* Address Display Box */}
        <div className="space-y-1">
          <label className="text-[11px] text-[#8B949E] font-medium block">عنوان الإيداع المخصص:</label>
          <div className="flex items-center justify-between bg-[#0D1117] p-3 rounded-xl border border-[#21262D]" dir="ltr">
            <span className={`font-mono text-xs truncate pr-2 font-bold ${currentWallet?.walletAddress ? 'text-[#7CFF4F]' : 'text-amber-400/80 italic'}`}>
              {walletAddressDisplay}
            </span>
            {currentWallet?.walletAddress && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#F0F6FC] shrink-0 transition-colors"
                title="نسخ العنوان"
              >
                {copied ? <Check className="w-4 h-4 text-[#7CFF4F]" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Copy Notice */}
        {copied && (
          <p className="text-[11px] text-[#7CFF4F] font-semibold text-center animate-in fade-in">
            ✓ تم نسخ عنوان المحفظة بنجاح!
          </p>
        )}
      </div>

      {/* Mandatory Minimum Notice Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2.5">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
        <span>الحد الأدنى للإيداع هو 1 دولار، وأي مبلغ أقل من ذلك لن يتم اعتماده.</span>
      </div>

      {/* Deposit Submission Form */}
      <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#161B22] border border-[#30363D] space-y-4">
        <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-1.5 border-b border-[#21262D] pb-3">
          <ArrowDownLeft className="w-4 h-4 text-[#7CFF4F]" />
          2. تأكيد تفاصيل الإيداع
        </h3>

        {/* Amount */}
        <div>
          <label className="text-xs text-[#8B949E] block mb-1 font-medium">مبلغ الإيداع ($)</label>
          <input
            type="number"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] rounded-xl px-4 py-2.5 text-sm font-bold text-[#F0F6FC] outline-none"
            placeholder="أدخل مبلغ الإيداع بالدولار"
            required
            dir="ltr"
          />
        </div>

        {/* Proof of Transfer Image Upload */}
        <div>
          <label className="text-xs text-[#8B949E] block mb-1 font-medium">
            رفع صورة إثبات التحويل (إجباري / اختياري)
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="deposit-proof-input"
            />
            <label
              htmlFor="deposit-proof-input"
              className="flex items-center justify-center gap-2 w-full bg-[#0D1117] hover:bg-[#21262D] border border-dashed border-[#30363D] hover:border-[#7CFF4F] rounded-xl p-3 cursor-pointer text-xs font-semibold text-[#8B949E] transition-all"
            >
              <Upload className="w-4 h-4 text-[#7CFF4F]" />
              <span>{imageFileName ? `الصورة المحددة: ${imageFileName}` : 'اضغط لرفع صورة إشعار التحويل'}</span>
            </label>
          </div>

          {imageProof && (
            <div className="mt-2.5 p-2 bg-[#0D1117] rounded-xl border border-[#21262D] flex items-center gap-3">
              <img src={imageProof} alt="إثبات التحويل" className="w-14 h-14 object-cover rounded-lg border border-[#30363D]" />
              <div className="text-xs text-[#7CFF4F] font-bold">
                ✓ تم إرفاق صورة إثبات التحويل
              </div>
            </div>
          )}
        </div>

        {/* TXID / Hash (Optional) */}
        <div>
          <label className="text-xs text-[#8B949E] block mb-1 font-medium">معرف المعاملة / Hash (اختياري)</label>
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="مثال: 0x8f2a11b93848c27e3849f2910..."
            className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] rounded-xl px-4 py-2.5 text-xs font-mono text-[#F0F6FC] outline-none"
            dir="ltr"
          />
        </div>

        {/* Success Feedback */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-[#7CFF4F]/10 border border-[#7CFF4F]/30 text-[#7CFF4F] text-xs font-bold text-center animate-in fade-in">
            {successMsg}
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center animate-in fade-in flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || amount < 1}
          className="w-full py-3.5 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] active:scale-98 text-[#0D1117] font-black text-xs transition-all shadow-[0_0_15px_rgba(124,255,79,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'جاري إرسال طلب الإيداع...' : `إرسال طلب الإيداع ($${amount} دولار)`}
        </button>
      </form>

      {/* Deposit Requests History List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider px-1">
          سجل طلبات الإيداع الأخيرة ({deposits.length})
        </h3>

        {deposits.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#161B22] text-center text-xs text-[#8B949E]">
            لا توجد طلبات إيداع سابقة.
          </div>
        ) : (
          <div className="space-y-2">
            {deposits.map((dep) => (
              <div key={dep.id} className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2" dir="ltr">
                    <span className="font-bold text-sm text-[#F0F6FC]">+${dep.amount} USDT</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0D1117] text-[#7CFF4F] border border-[#30363D]">
                      {dep.network}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      dep.status === 'Approved'
                        ? 'bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/30'
                        : dep.status === 'Rejected'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {dep.status === 'Approved' ? 'تم الاعتماد' : dep.status === 'Rejected' ? 'مرفوض' : 'قيد المراجعة'}
                  </span>
                </div>

                {dep.imageProof && (
                  <div className="flex items-center gap-2 pt-1 border-t border-[#21262D]">
                    <ImageIcon className="w-3.5 h-3.5 text-[#7CFF4F]" />
                    <span className="text-[11px] text-[#8B949E]">تم إرفاق صورة إثبات التحويل</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-[#8B949E]" dir="ltr">
                  <span className="font-mono truncate max-w-[180px]">
                    {dep.txHash ? `TX: ${dep.txHash}` : 'بدون Hash'}
                  </span>
                  <span>{new Date(dep.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
