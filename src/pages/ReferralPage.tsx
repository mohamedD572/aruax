import React, { useState } from 'react';
import { UserProfile, ReferralUser, AppSettings, ReferralMilestone } from '../types';
import { TelegramService } from '../services/telegram';
import { store } from '../services/store';
import { AurexTokenLogo } from '../components/AurexTokenLogo';
import { HumanVerificationModal } from '../components/HumanVerificationModal';
import {
  Users,
  Copy,
  Check,
  Share2,
  Star,
  CheckCircle2,
  Lock,
  Gift,
  ShieldCheck,
  Clock,
  Zap,
  Percent,
  TrendingUp,
  DollarSign,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReferralPageProps {
  user: UserProfile;
  referrals: ReferralUser[];
  settings: AppSettings;
  milestones: ReferralMilestone[];
  langCode: any;
}

export const ReferralPage: React.FC<ReferralPageProps> = ({
  user,
  referrals = [],
  settings,
  milestones = [],
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Verification Modal State
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [pendingMilestone, setPendingMilestone] = useState<number | null>(null);

  const cleanBot = settings.botUsername ? settings.botUsername.replace('@', '') : 'AurexOneBot';
  const refCode = user.referralCode || `25D-${(user.id || '100000').slice(-6)}`;
  const referralLink = `https://t.me/${cleanBot}/app?startapp=${refCode}`;

  // Count active referrals (invited users with approved deposits)
  const activeReferralsCount = Math.max(
    user.depositingReferralsCount || 0,
    referrals.filter((r) => r.totalInvested > 0 || r.status === 'Approved').length
  );
  const totalReferralsCount = Math.max(referrals.length, user.referralCount || 0);

  const totalReferralEarningsUsdt = user.referralEarnings || 0;

  const claimedMilestones = user.referralMilestonesClaimed || [];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    TelegramService.hapticImpact('light');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    TelegramService.hapticImpact('light');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareTelegram = () => {
    TelegramService.hapticImpact('medium');
    TelegramService.shareReferral(settings.botUsername || '@AurexOneBot', refCode);
  };

  const handleClaimMilestoneClick = (requiredDepositors: number) => {
    TelegramService.hapticImpact('heavy');
    setPendingMilestone(requiredDepositors);
    setIsVerifyOpen(true);
  };

  const executeClaimMilestone = () => {
    if (!pendingMilestone) return;
    const requiredDepositors = pendingMilestone;
    const res = store.claimReferralMilestone(requiredDepositors);
    setPendingMilestone(null);

    if (res.success) {
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {
        // Ignore
      }
      setNotice(res.message);
      TelegramService.hapticNotification('success');
      store.showSuccessModal('Milestone Reward Claimed! 🎁', res.message);
    } else {
      setNotice(res.message);
      TelegramService.hapticNotification('warning');
      store.showErrorModal('Milestone Claim Notice', res.message);
    }

    setTimeout(() => setNotice(null), 3500);
  };

  // Helper to get star icons count for milestone
  const getStarCount = (requiredDepositors: number) => {
    switch (requiredDepositors) {
      case 1:
        return 1;
      case 5:
        return 2;
      case 10:
        return 3;
      case 20:
        return 4;
      case 50:
        return 5;
      default:
        return 1;
    }
  };

  // Determine current milestone index (first milestone not claimed)
  const currentMilestoneIndex = milestones.findIndex(
    (ms) => !claimedMilestones.includes(ms.requiredDepositors)
  );

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Header Banner - Black + Emerald + Gold */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-slate-950 via-[#0B130E] to-slate-950 border border-emerald-500/30 shadow-2xl space-y-4">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2 font-mono">
                <span>Referral Program</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  3-TIER SUSTAINABLE
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Earn 7% (Tier 1) + 3% (Tier 2) + 1% (Tier 3) commissions + 50 AUR first deposit bonus
              </p>
            </div>
          </div>
        </div>

        {/* 3-Tier Multi-Level Commission Structure */}
        <div className="grid grid-cols-3 gap-2 font-mono">
          <div className="p-2.5 rounded-xl bg-[#141A29] border border-amber-500/40 text-center space-y-0.5">
            <span className="text-[9px] text-amber-300 block uppercase font-bold">Tier 1 Direct</span>
            <span className="text-sm font-black text-amber-400">7% Commission</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141A29] border border-amber-500/30 text-center space-y-0.5">
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Tier 2 Network</span>
            <span className="text-sm font-black text-yellow-300">3% Commission</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141A29] border border-amber-500/20 text-center space-y-0.5">
            <span className="text-[9px] text-slate-400 block uppercase font-bold">Tier 3 Network</span>
            <span className="text-sm font-black text-slate-200">1% Commission</span>
          </div>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-3 gap-2.5 font-mono">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-0.5">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              Total Referrals
            </span>
            <span className="text-lg font-black text-slate-100">
              {totalReferralsCount} <span className="text-[10px] font-normal text-slate-500">Users</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 bg-emerald-500/5 space-y-0.5">
            <span className="text-[10px] text-emerald-400 block uppercase font-bold tracking-wider">
              Active Referrals
            </span>
            <span className="text-lg font-black text-emerald-400 flex items-center justify-between">
              <span>{activeReferralsCount}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 bg-amber-500/5 space-y-0.5">
            <span className="text-[10px] text-amber-400 block uppercase font-bold tracking-wider">
              Referral Earnings
            </span>
            <span className="text-lg font-black text-amber-400 flex items-center gap-1">
              <span>${totalReferralEarningsUsdt.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {/* Referral Code & Referral Link Boxes with Copy Buttons */}
        <div className="space-y-2.5 pt-1 font-mono">
          {/* Referral Code Box */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-400 block uppercase font-sans font-bold">Your Referral Code</span>
              <span className="text-sm font-black text-slate-100 tracking-wider">{refCode}</span>
            </div>
            <button
              onClick={handleCopyCode}
              className={`px-3.5 py-2 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                copiedCode
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
              }`}
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Referral Link Box */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[9px] text-slate-400 block uppercase font-sans font-bold">Your Referral Link</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full bg-slate-900 text-emerald-400 font-bold px-3 py-2 rounded-xl text-[11px] border border-slate-800 focus:outline-none select-all truncate font-mono"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3.5 py-2 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Share via Telegram Button */}
            <button
              onClick={handleShareTelegram}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer uppercase font-mono tracking-wider"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Share via Telegram</span>
            </button>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 text-slate-950 font-black text-xs text-center shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-bounce font-mono">
          {notice}
        </div>
      )}

      {/* Rules Information Box */}
      <div className="p-4 rounded-3xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-black text-slate-200 uppercase tracking-wider font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Referral System Rules & Anti-Cheat Guard</span>
        </div>
        <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside leading-relaxed font-mono">
          <li>Get 15% instant commission credited to your balance on every deposit made by your referrals.</li>
          <li>Active Referrals require at least one approved USDT deposit.</li>
          <li>Milestone bonuses are unlocked as your active depositors reach milestone targets.</li>
          <li>Fake accounts & duplicate registrations are strictly monitored and prohibited.</li>
        </ul>
      </div>

      {/* Milestone Progress Cards */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between font-mono">
          <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
            <Gift className="w-4.5 h-4.5 text-amber-400" />
            <span>Referral Milestones</span>
          </h3>
          <span className="text-xs text-slate-400">
            Active Referrals: <strong className="text-emerald-400 font-bold">{activeReferralsCount}</strong>
          </span>
        </div>

        <div className="space-y-3 font-mono">
          {milestones.map((ms, index) => {
            const isClaimed = claimedMilestones.includes(ms.requiredDepositors);
            const isCompletedAndUnclaimed =
              activeReferralsCount >= ms.requiredDepositors && !isClaimed;
            const isCurrent =
              index === currentMilestoneIndex && !isCompletedAndUnclaimed && !isClaimed;

            const stars = getStarCount(ms.requiredDepositors);

            // Progress percentage
            const progressPercent = Math.min(
              100,
              Math.floor((activeReferralsCount / ms.requiredDepositors) * 100)
            );

            return (
              <div
                key={ms.requiredDepositors}
                className={`p-4 rounded-3xl transition-all relative overflow-hidden ${
                  isClaimed
                    ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-lg'
                    : isCompletedAndUnclaimed
                    ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-emerald-950/50 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-pulse'
                    : isCurrent
                    ? 'bg-slate-900/90 border border-emerald-500/30 shadow-md'
                    : 'bg-slate-950/90 border border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5">
                    {/* Stars Badge */}
                    <div
                      className={`p-3 rounded-2xl border shrink-0 flex flex-col items-center justify-center min-w-[54px] ${
                        isClaimed
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : isCompletedAndUnclaimed
                          ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: stars }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 fill-current ${
                              isClaimed || isCompletedAndUnclaimed
                                ? 'text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-black mt-1 text-slate-300">
                        {ms.requiredDepositors} Ref
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                          <span>{ms.title}</span>
                          {isClaimed && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              COMPLETED
                            </span>
                          )}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-400 mt-0.5">{ms.description}</p>

                      <div className="mt-2.5 inline-flex items-center space-x-1.5 text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        <AurexTokenLogo size={16} />
                        <span>+{ms.rewardCoins.toLocaleString()} AUREX</span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Button or Status */}
                  <div className="shrink-0 pt-1">
                    {isClaimed ? (
                      <span className="px-3.5 py-2 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> Claimed
                      </span>
                    ) : isCompletedAndUnclaimed ? (
                      <button
                        onClick={() => handleClaimMilestoneClick(ms.requiredDepositors)}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                      >
                        Claim +{ms.rewardCoins} AUREX
                      </button>
                    ) : (
                      <span className="px-3.5 py-2 rounded-2xl bg-slate-900 text-slate-500 border border-slate-800 text-xs font-bold flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar for Current & Locked Milestones */}
                {!isClaimed && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-bold">Milestone Progress</span>
                      <span className="text-emerald-400 font-bold">
                        {activeReferralsCount} / {ms.requiredDepositors} Active Referrals ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPercent >= 100
                            ? 'bg-gradient-to-r from-emerald-400 to-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invited Team List */}
      <div className="space-y-3 font-mono">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
          Invited Team Members ({referrals.length})
        </h3>

        {referrals.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            No referrals yet. Share your referral code or referral link above to start inviting friends and unlock milestone rewards!
          </div>
        ) : (
          <div className="space-y-2.5">
            {referrals.map((ref) => {
              const isDeposited = ref.totalInvested > 0 || ref.status === 'Approved';

              return (
                <div
                  key={ref.id}
                  className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3.5">
                    {ref.photoUrl ? (
                      <img
                        src={ref.photoUrl}
                        alt={ref.firstName}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-xs text-emerald-400">
                        {ref.firstName ? ref.firstName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-slate-100">
                          {ref.firstName} {ref.username ? `(@${ref.username})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isDeposited ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Depositor
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" /> Deposit Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-300">
                      ${ref.totalInvested || 0} USDT
                    </span>
                    <span className="text-[9px] text-slate-500 block">Invested</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Human Verification Modal */}
      <HumanVerificationModal
        isOpen={isVerifyOpen}
        onClose={() => {
          setIsVerifyOpen(false);
          setPendingMilestone(null);
        }}
        onSuccess={executeClaimMilestone}
        title="Human Verification"
        rewardText={pendingMilestone ? `Claim Milestone (${pendingMilestone} Referrals)` : undefined}
      />
    </div>
  );
};
