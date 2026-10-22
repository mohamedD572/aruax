import React from 'react';
import { AlertTriangle, XCircle, CheckCircle2, Info, HelpCircle, X, ArrowRight } from 'lucide-react';
import { AppDialogConfig } from '../types';

interface CustomDialogModalProps {
  dialog: AppDialogConfig | null;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const CustomDialogModal: React.FC<CustomDialogModalProps> = ({
  dialog,
  onClose,
  onNavigateTab,
}) => {
  if (!dialog) return null;

  const {
    type,
    title,
    message,
    primaryButtonText,
    primaryAction,
    secondaryButtonText,
    secondaryAction,
    navigateToTab,
  } = dialog;

  const handlePrimary = () => {
    if (primaryAction) {
      primaryAction();
    }
    if (navigateToTab && onNavigateTab) {
      onNavigateTab(navigateToTab);
    }
    onClose();
  };

  const handleSecondary = () => {
    if (secondaryAction) {
      secondaryAction();
    }
    onClose();
  };

  const renderIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <AlertTriangle className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
        );
      case 'error':
        return (
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <XCircle className="w-7 h-7 text-red-400" />
          </div>
        );
      case 'success':
        return (
          <div className="w-14 h-14 rounded-full bg-[#7CFF4F]/10 border border-[#7CFF4F]/30 flex items-center justify-center shadow-[0_0_15px_rgba(124,255,79,0.2)]">
            <CheckCircle2 className="w-7 h-7 text-[#7CFF4F]" />
          </div>
        );
      case 'confirm':
        return (
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <HelpCircle className="w-7 h-7 text-amber-400" />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <Info className="w-7 h-7 text-sky-400" />
          </div>
        );
    }
  };

  const getCardBorder = () => {
    switch (type) {
      case 'warning':
      case 'confirm':
        return 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]';
      case 'error':
        return 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]';
      case 'success':
        return 'border-[#7CFF4F]/40 shadow-[0_0_30px_rgba(124,255,79,0.15)]';
      case 'info':
      default:
        return 'border-sky-500/40 shadow-[0_0_30px_rgba(14,165,233,0.15)]';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm bg-[#0D1117] border rounded-2xl p-6 shadow-2xl space-y-4 text-center transform transition-all animate-in zoom-in-95 duration-200 relative ${getCardBorder()}`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#21262D] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Badge */}
        <div className="flex justify-center pt-2">{renderIcon()}</div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
          <p className="text-xs text-gray-300 leading-relaxed px-2">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {secondaryButtonText && (
            <button
              onClick={handleSecondary}
              className="flex-1 bg-[#161B22] border border-[#30363D] hover:bg-[#21262D] text-gray-300 font-semibold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95"
            >
              {secondaryButtonText}
            </button>
          )}

          <button
            onClick={handlePrimary}
            className={`flex-1 font-bold py-2.5 px-4 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg ${
              type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:brightness-110'
                : 'bg-gradient-to-r from-[#7CFF4F] via-emerald-400 to-lime-300 text-[#0D1117] font-black hover:brightness-110'
            }`}
          >
            <span>{primaryButtonText || 'OK'}</span>
            {navigateToTab && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
