import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  TrendingUp,
  Zap,
  CheckCircle2,
  Lock,
  Activity,
  Server,
} from 'lucide-react';
import miningNodeImage from '../assets/images/aurex_mining_node_1785409346290.jpg';

interface TelegramVerificationScreenProps {
  onComplete: () => void;
  durationMs?: number; // default 1800ms (1.8s) for snappy startup
  isAuthDone?: boolean;
}

export const TelegramVerificationScreen: React.FC<TelegramVerificationScreenProps> = ({
  onComplete,
  durationMs = 1800,
  isAuthDone = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const verificationSteps = [
    { text: 'Connecting to Telegram WebApp SDK...', icon: Lock },
    { text: 'Verifying Telegram Account Security...', icon: ShieldCheck },
    { text: 'Authenticating Aurex Cloud Nodes...', icon: Server },
    { text: 'Syncing High-Yield Mining Rigs...', icon: Cpu },
    { text: 'Account Verified! Entering Aurex...', icon: CheckCircle2 },
  ];

  useEffect(() => {
    const startTime = Date.now();
    const intervalMs = 30;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const targetDuration = isAuthDone ? Math.min(durationMs, 800) : durationMs;
      const rawProgress = Math.min(100, Math.floor((elapsed / targetDuration) * 100));

      setProgress(rawProgress);

      if (rawProgress < 20) {
        setCurrentStepIndex(0);
      } else if (rawProgress < 45) {
        setCurrentStepIndex(1);
      } else if (rawProgress < 70) {
        setCurrentStepIndex(2);
      } else if (rawProgress < 90) {
        setCurrentStepIndex(3);
      } else {
        setCurrentStepIndex(4);
      }

      if (rawProgress >= 100 || elapsed >= targetDuration) {
        clearInterval(timer);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [durationMs, isAuthDone, onComplete]);

  const CurrentStepIcon = verificationSteps[currentStepIndex].icon;

  return (
    <div
      className={`fixed inset-0 z-[300] bg-[#0D1117] text-[#F0F6FC] font-sans flex flex-col items-center justify-between p-4 overflow-hidden transition-opacity duration-500 selection:bg-[#7CFF4F] selection:text-[#0D1117] ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#7CFF4F]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: `radial-gradient(#7CFF4F 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between py-6 relative z-10 space-y-6">
        
        {/* TOP BRANDING HEADER */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161B22] border border-[#7CFF4F]/30 shadow-[0_0_20px_rgba(124,255,79,0.15)]">
            <div className="w-2 h-2 rounded-full bg-[#7CFF4F] animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#7CFF4F]">
              AUREX MINING NETWORK
            </span>
            <span className="text-[10px] text-gray-500">|</span>
            <span className="text-[10px] font-mono text-gray-400">SSL 256-BIT</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7CFF4F] to-emerald-600 flex items-center justify-center text-[#0D1117] font-black shadow-[0_0_20px_rgba(124,255,79,0.3)]">
              <Cpu className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              AUREX<span className="text-[#7CFF4F]">.</span>
            </h1>
          </div>
        </div>

        {/* CENTER PROFESSIONAL MINING IMAGE & ANIMATED HOVER FRAME */}
        <div className="relative my-auto flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl p-1 bg-gradient-to-b from-[#7CFF4F]/50 via-[#38BDF8]/30 to-[#0D1117] shadow-[0_0_40px_rgba(124,255,79,0.2)] group">
            
            {/* Mining Node Image */}
            <div className="relative w-full h-full rounded-[22px] overflow-hidden bg-[#161B22]">
              <img
                src={miningNodeImage}
                alt="Aurex Cloud Mining Node"
                className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Scanline Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7CFF4F]/10 to-transparent animate-pulse pointer-events-none" />

              {/* Status Badge Over Image */}
              <div className="absolute top-3 left-3 bg-[#0D1117]/85 backdrop-blur-md border border-[#30363D] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                <Activity className="w-3.5 h-3.5 text-[#7CFF4F] animate-spin" />
                <span className="text-[10px] font-mono font-bold text-gray-200">RIG-01 ACTIVE</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-[#0D1117]/85 backdrop-blur-md border border-[#7CFF4F]/40 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                <span className="text-[10px] font-mono text-[#7CFF4F] font-bold">148.5 MH/s</span>
              </div>
            </div>
          </div>

          {/* MAIN VERIFYING TEXT */}
          <div className="mt-6 text-center space-y-1.5">
            <h2 className="text-lg font-extrabold text-white tracking-wide flex items-center justify-center gap-2">
              <span>... Verifying Telegram Account</span>
            </h2>
            
            <p className="text-xs font-medium text-emerald-400 flex items-center justify-center gap-1.5 h-5">
              <CurrentStepIcon className="w-3.5 h-3.5 animate-pulse" />
              <span>{verificationSteps[currentStepIndex].text}</span>
            </p>
          </div>
        </div>

        {/* PROGRESS BAR & PERCENTAGE */}
        <div className="space-y-2 px-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between text-xs font-bold font-mono">
            <span className="text-gray-400">Verifying Identity</span>
            <span className="text-[#7CFF4F] text-sm font-black">{progress}%</span>
          </div>

          <div className="w-full h-3 bg-[#161B22] border border-[#30363D] rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-[#7CFF4F] to-lime-300 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_#7CFF4F]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 4 FEATURE BADGES GRID */}
        <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="bg-[#161B22]/80 backdrop-blur-md border border-[#30363D] p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-[#7CFF4F]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-gray-200">Secure & Safe</p>
              <p className="text-[9px] text-gray-500">Encrypted Cloud</p>
            </div>
          </div>

          <div className="bg-[#161B22]/80 backdrop-blur-md border border-[#30363D] p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-gray-200">Cloud Mining</p>
              <p className="text-[9px] text-gray-500">High Hashrate</p>
            </div>
          </div>

          <div className="bg-[#161B22]/80 backdrop-blur-md border border-[#30363D] p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-gray-200">High Earnings</p>
              <p className="text-[9px] text-gray-500">Daily Yields</p>
            </div>
          </div>

          <div className="bg-[#161B22]/80 backdrop-blur-md border border-[#30363D] p-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-gray-200">Instant Payouts</p>
              <p className="text-[9px] text-gray-500">USDT Wallet</p>
            </div>
          </div>
        </div>

        {/* BOTTOM MARKETING SLOGAN */}
        <div className="pt-2 text-center border-t border-[#21262D]/60 animate-in fade-in duration-1000">
          <p className="text-xs font-black tracking-widest uppercase bg-gradient-to-r from-gray-300 via-[#7CFF4F] to-emerald-400 bg-clip-text text-transparent">
            "Mine Today, Earn Tomorrow"
          </p>
        </div>

      </div>
    </div>
  );
};
