import { Investment } from '../types';

export interface MinerRankInfo {
  level: number;
  titleAr: string;
  titleEn: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  cardAestheticClass: string;
  cardGlowClass: string;
  totalActiveInvested: number;
  nextThreshold: number;
  progressPercent: number;
  unlockedFeaturesAr: string[];
  unlockedFeaturesEn: string[];
}

export const getMinerRank = (activeInvestments: Investment[] = []): MinerRankInfo => {
  const totalActiveInvested = activeInvestments
    .filter(inv => inv.status === 'Active')
    .reduce((sum, inv) => sum + inv.amount, 0);

  if (totalActiveInvested >= 15000) {
    return {
      level: 7,
      titleAr: 'Diamond Quantum Overlord',
      titleEn: 'Diamond Quantum Overlord',
      badgeColor: '#EC4899',
      badgeBg: 'bg-gradient-to-r from-pink-500/20 via-cyan-400/20 to-purple-800/30',
      badgeBorder: 'border-pink-500/50',
      cardAestheticClass: 'border-pink-500/60 shadow-[0_0_25px_rgba(236,72,153,0.3)]',
      cardGlowClass: 'from-pink-500/30 via-cyan-400/25 to-purple-800/30',
      totalActiveInvested,
      nextThreshold: 15000,
      progressPercent: 100,
      unlockedFeaturesAr: ['Diamond Quantum Prism Frame', 'Ultra High Hash Speed', 'Neon Holographic Laser'],
      unlockedFeaturesEn: ['Diamond Quantum Prism Frame', 'Ultra High Hash Speed', 'Neon Holographic Laser'],
    };
  }

  if (totalActiveInvested >= 5000) {
    return {
      level: 6,
      titleAr: 'Platinum Datacenter Chief',
      titleEn: 'Platinum Datacenter Chief',
      badgeColor: '#A855F7',
      badgeBg: 'bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-slate-800/30',
      badgeBorder: 'border-purple-500/50',
      cardAestheticClass: 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
      cardGlowClass: 'from-purple-400/30 via-indigo-500/20 to-slate-800/30',
      totalActiveInvested,
      nextThreshold: 15000,
      progressPercent: Math.min(100, Math.round(((totalActiveInvested - 5000) / (15000 - 5000)) * 100)),
      unlockedFeaturesAr: ['Platinum Datacenter Frame', 'Indigo Aura Effect', 'Dual Turbo Cooling'],
      unlockedFeaturesEn: ['Platinum Datacenter Frame', 'Indigo Aura Effect', 'Dual Turbo Cooling'],
    };
  }

  if (totalActiveInvested >= 2000) {
    return {
      level: 5,
      titleAr: 'Gold Hash Commander',
      titleEn: 'Gold Hash Commander',
      badgeColor: '#F59E0B',
      badgeBg: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-800/30',
      badgeBorder: 'border-amber-500/50',
      cardAestheticClass: 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      cardGlowClass: 'from-amber-400/30 via-yellow-500/20 to-amber-700/25',
      totalActiveInvested,
      nextThreshold: 5000,
      progressPercent: Math.min(100, Math.round(((totalActiveInvested - 2000) / (5000 - 2000)) * 100)),
      unlockedFeaturesAr: ['Royal Gold Metallic Frame', 'Golden Shimmering Aura', 'Commander Dashboard'],
      unlockedFeaturesEn: ['Royal Gold Metallic Frame', 'Golden Shimmering Aura', 'Commander Dashboard'],
    };
  }

  if (totalActiveInvested >= 500) {
    return {
      level: 4,
      titleAr: 'Silver Cyber Hasher',
      titleEn: 'Silver Cyber Hasher',
      badgeColor: '#38BDF8',
      badgeBg: 'bg-gradient-to-r from-sky-500/20 via-slate-500/20 to-sky-800/30',
      badgeBorder: 'border-sky-500/50',
      cardAestheticClass: 'border-sky-500/50 shadow-[0_0_18px_rgba(56,189,248,0.2)]',
      cardGlowClass: 'from-slate-300/25 via-sky-400/15 to-slate-600/25',
      totalActiveInvested,
      nextThreshold: 2000,
      progressPercent: Math.min(100, Math.round(((totalActiveInvested - 500) / (2000 - 500)) * 100)),
      unlockedFeaturesAr: ['Silver Metallic Frame', 'Cyan Cyber Beam', 'Precise Sensor Feed'],
      unlockedFeaturesEn: ['Silver Metallic Frame', 'Cyan Cyber Beam', 'Precise Sensor Feed'],
    };
  }

  if (totalActiveInvested >= 200) {
    return {
      level: 3,
      titleAr: 'Steel Rig Master',
      titleEn: 'Steel Rig Master',
      badgeColor: '#94A3B8',
      badgeBg: 'bg-gradient-to-r from-slate-500/20 via-zinc-500/20 to-slate-800/30',
      badgeBorder: 'border-slate-400/50',
      cardAestheticClass: 'border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.2)]',
      cardGlowClass: 'from-slate-400/25 via-zinc-400/15 to-slate-700/25',
      totalActiveInvested,
      nextThreshold: 500,
      progressPercent: Math.min(100, Math.round(((totalActiveInvested - 200) / (500 - 200)) * 100)),
      unlockedFeaturesAr: ['Brushed Steel Frame', 'Enhanced Cooling Tech'],
      unlockedFeaturesEn: ['Brushed Steel Frame', 'Enhanced Cooling Tech'],
    };
  }

  if (totalActiveInvested >= 50) {
    return {
      level: 2,
      titleAr: 'Copper Hasher',
      titleEn: 'Copper Hasher',
      badgeColor: '#CD7F32',
      badgeBg: 'bg-gradient-to-r from-amber-700/20 via-orange-600/20 to-amber-900/30',
      badgeBorder: 'border-[#CD7F32]/50',
      cardAestheticClass: 'border-[#CD7F32]/50 shadow-[0_0_12px_rgba(205,127,50,0.2)]',
      cardGlowClass: 'from-[#B87333]/25 via-[#CD7F32]/15 to-[#8B4513]/25',
      totalActiveInvested,
      nextThreshold: 200,
      progressPercent: Math.min(100, Math.round(((totalActiveInvested - 50) / (200 - 50)) * 100)),
      unlockedFeaturesAr: ['Metallic Copper Frame'],
      unlockedFeaturesEn: ['Metallic Copper Frame'],
    };
  }

  return {
    level: 1,
    titleAr: 'Novice Miner',
    titleEn: 'Novice Miner',
    badgeColor: '#7CFF4F',
    badgeBg: 'bg-[#7CFF4F]/10',
    badgeBorder: 'border-[#7CFF4F]/30',
    cardAestheticClass: 'border-[#30363D]',
    cardGlowClass: 'from-[#7CFF4F]/10 to-transparent',
    totalActiveInvested,
    nextThreshold: 50,
    progressPercent: Math.min(100, Math.round((totalActiveInvested / 50) * 100)),
    unlockedFeaturesAr: ['Standard Appearance'],
    unlockedFeaturesEn: ['Standard Appearance'],
  };
};
