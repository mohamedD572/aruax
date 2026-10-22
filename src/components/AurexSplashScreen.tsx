import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, TrendingUp, Zap, Cpu, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface AurexSplashScreenProps {
  onComplete: () => void;
  durationMs?: number; // Default 2800ms for full luxury animation sequence
}

export const AurexSplashScreen: React.FC<AurexSplashScreenProps> = ({
  onComplete,
  durationMs = 2800,
}) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Floating Particle Physics Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2, // upward drift
      alpha: Math.random() * 0.7 + 0.2,
      color: Math.random() > 0.3 ? '#7CFF4F' : '#FFD700', // Neon green or Gold
      pulseSpeed: Math.random() * 0.03 + 0.01,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle background radial glow at center
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.5
      );
      gradient.addColorStop(0, 'rgba(124, 255, 79, 0.08)');
      gradient.addColorStop(0.5, 'rgba(13, 17, 23, 0.4)');
      gradient.addColorStop(1, 'rgba(5, 8, 12, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update and draw floating particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.01;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10 || p.x > width + 10) {
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.9, p.alpha));
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Animation Sequence & Loading Progress Timer
  useEffect(() => {
    const startTime = Date.now();
    const intervalMs = 25;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(100, Math.floor((elapsed / durationMs) * 100));
      setProgress(rawProgress);

      // Sequence phase triggers
      if (elapsed >= 300 && elapsed < 700) {
        setPhase(2); // Light beam center trigger
      } else if (elapsed >= 700 && elapsed < 1100) {
        setPhase(3); // Aurex Logo Fade-in
      } else if (elapsed >= 1100 && elapsed < 1500) {
        setPhase(4); // Blockchain digital network lines
      } else if (elapsed >= 1500 && elapsed < 1900) {
        setPhase(5); // AUREX Title & Subtitle
      } else if (elapsed >= 1900) {
        setPhase(6); // Highlights & 100% preparation
      }

      if (rawProgress >= 100 || elapsed >= durationMs) {
        clearInterval(timer);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 400); // smooth 400ms fade out transition into Home
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [durationMs, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[500] bg-[#05080C] text-[#F0F6FC] font-sans flex flex-col items-center justify-between p-6 overflow-hidden transition-all duration-500 selection:bg-[#7CFF4F] selection:text-[#0D1117] ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 60 FPS Canvas Background Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* PHASE 2: GREEN LIGHT BEAM FROM CENTER */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{
          opacity: phase >= 2 ? [0.2, 0.8, 0.4] : 0,
          scaleY: phase >= 2 ? [0, 1.2, 1] : 0,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-full bg-gradient-to-b from-transparent via-[#7CFF4F] to-transparent blur-md pointer-events-none z-10"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: phase >= 2 ? 0.6 : 0,
          scale: phase >= 2 ? [0.5, 1.4, 1] : 0.5,
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-radial from-[#7CFF4F]/20 via-[#7CFF4F]/5 to-transparent blur-3xl pointer-events-none z-10"
      />

      {/* Grid Mesh Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, #7CFF4F 1px, transparent 1px), linear-gradient(to bottom, #7CFF4F 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* TOP BRANDING BAR */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-20 pt-2 opacity-80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7CFF4F] animate-ping" />
          <span className="text-[10px] font-mono tracking-widest text-[#7CFF4F] font-black uppercase">
            AUREX TELEGRAM PROTOCOL
          </span>
        </div>
        <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
          OFFICIAL VERIFIED
        </span>
      </div>

      {/* CENTER ANIMATED CONTENT CONTAINER */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center relative z-20 my-auto py-4">
        
        {/* PHASE 3 & 4: LOGO & DIGITAL BLOCKCHAIN ORBIT LINES */}
        <div className="relative flex flex-col items-center justify-center">
          
          {/* Rotating Digital Blockchain Orbit Rings */}
          {phase >= 4 && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                animate={{ opacity: 0.7, scale: 1, rotate: 360 }}
                transition={{
                  opacity: { duration: 0.6 },
                  rotate: { duration: 14, repeat: Infinity, ease: 'linear' },
                }}
                className="absolute w-64 h-64 rounded-full border border-dashed border-[#7CFF4F]/30 pointer-events-none z-0"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                animate={{ opacity: 0.5, scale: 1.05, rotate: -360 }}
                transition={{
                  opacity: { duration: 0.6 },
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                }}
                className="absolute w-72 h-72 rounded-full border border-[#FFD700]/20 pointer-events-none z-0"
              />
            </>
          )}

          {/* Glowing Aura Ring behind Logo */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-44 h-44 rounded-full bg-[#7CFF4F]/20 blur-2xl pointer-events-none"
          />

          {/* OFFICIAL AUREX LOGO SVG (Ultra-Realistic 3D Fintech Emblem) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 15 }}
            animate={{
              opacity: phase >= 3 ? 1 : 0,
              scale: phase >= 3 ? 1 : 0.75,
              y: phase >= 3 ? 0 : 15,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 p-4 rounded-3xl bg-gradient-to-b from-[#161B22]/90 to-[#0D1117]/95 border border-[#7CFF4F]/40 shadow-[0_0_50px_rgba(124,255,79,0.25)] backdrop-blur-xl group"
          >
            {/* Soft Camera Zoom Container */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center">
              
              {/* Premium Aurex Emblem SVG */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-[0_0_15px_rgba(124,255,79,0.6)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="aurexGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE066" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>

                  <linearGradient id="aurexNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A3FF75" />
                    <stop offset="50%" stopColor="#7CFF4F" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>

                  <filter id="neonGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Outer Hexagonal Golden Shield Border */}
                <polygon
                  points="50,5 88,25 88,75 50,95 12,75 12,25"
                  stroke="url(#aurexGoldGrad)"
                  strokeWidth="3.5"
                  fill="#0D1117"
                  fillOpacity="0.85"
                />

                {/* Inner Neon Green Energy Polygon */}
                <polygon
                  points="50,14 79,30 79,70 50,86 21,70 21,30"
                  stroke="url(#aurexNeonGrad)"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  fill="none"
                />

                {/* Stylized Aurex "A" Core Emblem */}
                <path
                  d="M50 22 L72 72 H58 L50 52 L42 72 H28 L50 22 Z"
                  fill="url(#aurexNeonGrad)"
                  filter="url(#neonGlowFilter)"
                />

                {/* Golden Center Crossbar Accent */}
                <path
                  d="M40 56 H60 L50 40 Z"
                  fill="url(#aurexGoldGrad)"
                />

                {/* Glowing Core Energy Node */}
                <circle cx="50" cy="36" r="4" fill="#FFFFFF" filter="url(#neonGlowFilter)" />
              </svg>
            </div>
          </motion.div>

          {/* PHASE 5: AUREX & INVEST • GROW • EARN */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{
              opacity: phase >= 5 ? 1 : 0,
              y: phase >= 5 ? 0 : 12,
            }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-center space-y-1.5"
          >
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-1 font-sans">
              AUREX
              <span className="text-[#7CFF4F] drop-shadow-[0_0_10px_rgba(124,255,79,0.8)]">.</span>
            </h1>

            <div className="flex items-center justify-center gap-2 text-xs font-extrabold tracking-[0.22em] uppercase text-[#7CFF4F]">
              <span>Invest</span>
              <span className="text-amber-400 font-bold">•</span>
              <span>Grow</span>
              <span className="text-amber-400 font-bold">•</span>
              <span>Earn</span>
            </div>
          </motion.div>

          {/* PHASE 6: 3 FEATURE BULLETS (Sequential Fade-In) */}
          <div className="mt-6 space-y-2 w-full max-w-xs">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{
                opacity: phase >= 6 ? 1 : 0,
                x: phase >= 6 ? 0 : -15,
              }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="px-3.5 py-2 rounded-xl bg-[#161B22]/80 border border-[#30363D] backdrop-blur-md flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#7CFF4F]/15 text-[#7CFF4F] flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-gray-200">Secure Cloud Mining</span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7CFF4F]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{
                opacity: phase >= 6 ? 1 : 0,
                x: phase >= 6 ? 0 : -15,
              }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="px-3.5 py-2 rounded-xl bg-[#161B22]/80 border border-[#30363D] backdrop-blur-md flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-gray-200">Copy Trading</span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7CFF4F]" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{
                opacity: phase >= 6 ? 1 : 0,
                x: phase >= 6 ? 0 : -15,
              }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="px-3.5 py-2 rounded-xl bg-[#161B22]/80 border border-[#30363D] backdrop-blur-md flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-gray-200">Instant Withdrawals</span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#7CFF4F]" />
            </motion.div>
          </div>

        </div>

      </div>

      {/* PHASE 7: BOTTOM GLOWING LOADING PROGRESS BAR */}
      <div className="w-full max-w-md mx-auto z-20 space-y-2 pb-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-gray-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#7CFF4F] animate-pulse" />
            Loading...
          </span>
          <span className="text-[#7CFF4F] text-sm font-black drop-shadow-[0_0_8px_rgba(124,255,79,0.5)]">
            {progress}%
          </span>
        </div>

        {/* Liquid Glowing Progress Bar */}
        <div className="h-2 w-full bg-[#161B22] rounded-full p-0.5 border border-[#30363D] relative overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-[#10B981] via-[#7CFF4F] to-[#FFD700] rounded-full shadow-[0_0_12px_#7CFF4F]"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>

        <div className="text-[10px] text-center text-gray-500 font-mono tracking-wider pt-1">
          POWERED BY AUREX QUANTUM ENGINE • TIER-4 SECURE
        </div>
      </div>
    </div>
  );
};
