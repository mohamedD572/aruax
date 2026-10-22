import React from 'react';
import { Sparkles, ArrowLeft, Cpu, ShieldCheck, Clock } from 'lucide-react';
import { TelegramService } from '../services/telegram';

interface ComingSoonViewProps {
  title: string;
  description?: string;
  onBack: () => void;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ title, description, onBack }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-5 animate-in fade-in duration-300 select-none">
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-slate-950 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.25)] relative z-10">
          <Cpu className="w-10 h-10 text-emerald-400 stroke-[2]" />
        </div>
        <div className="absolute -top-1 -right-1 p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-bounce">
          <Sparkles className="w-4 h-4 fill-current" />
        </div>
      </div>

      <div className="space-y-2 max-w-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>Under Active Neural Optimization</span>
        </div>

        <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight font-mono">
          {title}
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          {description || 'This feature is currently undergoing security verification and high-speed network cluster integration.'}
        </p>
      </div>

      <div className="pt-2 w-full max-w-xs">
        <button
          onClick={() => {
            TelegramService.hapticImpact('medium');
            onBack();
          }}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
