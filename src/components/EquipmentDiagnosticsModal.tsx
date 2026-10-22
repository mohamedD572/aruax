import React, { useState } from 'react';
import { X, Wrench, Zap, Thermometer, Wind, AlertTriangle, ShieldCheck, Settings, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';
import { Investment, AppSettings } from '../types';
import { store } from '../services/store';
import { getMaintenanceCost } from '../utils/maintenance';
import { TelegramService } from '../services/telegram';
import confetti from 'canvas-confetti';

interface EquipmentDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
  settings: AppSettings;
  userBalance: number;
}

export const EquipmentDiagnosticsModal: React.FC<EquipmentDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  investment,
  settings,
  userBalance,
}) => {
  const [isFixing, setIsFixing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isOpen || !investment) return null;

  const cost = getMaintenanceCost(investment.amount);
  const efficiency = investment.powerEfficiencyPercent ?? 78;
  const isNeedsRepair = efficiency <= (settings.efficiencyAlertThreshold || 80);
  const isAutoEnabled = investment.autoMaintenanceEnabled || settings.autoMaintenanceGlobal;

  const handlePerformRepair = () => {
    setIsFixing(true);
    setFeedbackMsg(null);
    TelegramService.hapticImpact('heavy');

    setTimeout(() => {
      const res = store.performEquipmentMaintenance(investment.id);
      setIsFixing(false);
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.3 },
          colors: ['#7CFF4F', '#38BDF8', '#F59E0B'],
        });
        setFeedbackMsg({ text: res.message });
        store.showSuccessModal('Equipment Repaired! 🛠️', res.message);
      } else {
        setFeedbackMsg({ text: res.message, isError: true });
        if (res.message.toLowerCase().includes('balance') || res.message.toLowerCase().includes('usdt')) {
          store.showInsufficientBalanceModal(cost, res.message);
        } else {
          store.showErrorModal('Repair Failed', res.message);
        }
      }
    }, 700);
  };

  const handleToggleAuto = () => {
    TelegramService.hapticImpact('light');
    store.toggleAutoMaintenance(investment.id);
  };

  const handleToggleGlobalAuto = (e: React.ChangeEvent<HTMLInputElement>) => {
    TelegramService.hapticImpact('light');
    store.toggleGlobalAutoMaintenance(e.target.checked);
  };

  const handleThresholdChange = (val: number) => {
    store.updateEfficiencyThreshold(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0D1117] border border-[#21262D] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#21262D] bg-[#161B22]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F0F6FC]">Equipment Diagnostics Hub</h3>
              <p className="text-[11px] text-[#8B949E]">{investment.planName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8B949E] hover:text-[#F0F6FC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status Feedback Banner */}
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold ${
                feedbackMsg.isError
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-[#7CFF4F]/10 border-[#7CFF4F]/30 text-[#7CFF4F]'
              }`}
            >
              {feedbackMsg.text}
            </div>
          )}

          {/* Efficiency & Power Status Card */}
          <div className="p-4 rounded-xl bg-[#161B22] border border-[#21262D] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8B949E]">Power Efficiency:</span>
              <span className="text-sm font-extrabold font-mono text-[#7CFF4F]">
                100% (Always Online)
              </span>
            </div>

            {/* Efficiency Meter Bar */}
            <div className="w-full h-2.5 rounded-full bg-[#0D1117] overflow-hidden p-0.5 border border-[#21262D]">
              <div
                className="h-full rounded-full bg-[#7CFF4F] transition-all duration-500"
                style={{ width: '100%' }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8B949E] pt-1">
              <span>Rig Value: ${investment.amount} USDT</span>
              <span className="text-[#7CFF4F] font-bold">Status: Active & Mining ⚡</span>
            </div>
          </div>

          {/* Telemetry Diagnostics Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Temp */}
            <div className="p-3 rounded-xl bg-[#161B22] border border-[#21262D] text-center space-y-1">
              <Thermometer className="w-5 h-5 mx-auto text-sky-400" />
              <span className="text-[10px] text-[#8B949E] block">Temp</span>
              <span className="text-xs font-bold text-[#F0F6FC] font-mono">
                {investment.temperatureCelsius || 60}°C
              </span>
            </div>

            {/* Fan RPM */}
            <div className="p-3 rounded-xl bg-[#161B22] border border-[#21262D] text-center space-y-1">
              <Wind className="w-5 h-5 mx-auto text-emerald-400" />
              <span className="text-[10px] text-[#8B949E] block">Fan Speed</span>
              <span className="text-xs font-bold text-[#F0F6FC] font-mono">
                {investment.fanRpm || 3200} RPM
              </span>
            </div>

            {/* Dust Level */}
            <div className="p-3 rounded-xl bg-[#161B22] border border-[#21262D] text-center space-y-1">
              <Zap className="w-5 h-5 mx-auto text-[#7CFF4F]" />
              <span className="text-[10px] text-[#8B949E] block">Dust Build-up</span>
              <span className="text-xs font-bold text-[#F0F6FC] font-mono">
                0% (Clean)
              </span>
            </div>
          </div>

          {/* System Safeguard Status */}
          <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#21262D] space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#7CFF4F]" />
              <div>
                <span className="text-xs font-bold text-[#F0F6FC] block">Continuous Online Protection</span>
                <span className="text-[10px] text-[#8B949E]">Cloud Mining operates 24/7 without interruption or maintenance fees</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-[#7CFF4F] hover:bg-[#6be342] text-[#0D1117] font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Rig Operational (100% Online)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
