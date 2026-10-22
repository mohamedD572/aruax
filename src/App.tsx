import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Award,
  Shield,
  Gift,
  RefreshCw,
  Activity,
  Zap,
  Server,
  TrendingUp,
  Cpu,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coins,
  ChevronRight,
  Flame,
} from 'lucide-react';

// Components & Navigation
import { Navbar } from './components/Navbar';
import { BottomNav, AurexTab } from './components/BottomNav';
import { AurexSplashScreen } from './components/AurexSplashScreen';
import { AurexTokenLogo } from './components/AurexTokenLogo';

// Pages
import { InvestPage } from './pages/InvestPage';
import { MiningRigsPage } from './pages/MiningRigsPage';
import { CopyTradingPage } from './pages/CopyTradingPage';
import { DepositPage } from './pages/DepositPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { TasksPage } from './pages/TasksPage';
import { ReferralPage } from './pages/ReferralPage';
import { HistoryPage } from './pages/HistoryPage';

// Modals
import { AdminDashboard } from './components/AdminDashboard';
import { AdminModal } from './components/AdminModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { CustomerSupportModal } from './components/CustomerSupportModal';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { TelegramIntegrationModal } from './components/TelegramIntegrationModal';
import { SwapModal } from './components/SwapModal';
import { EquipmentDiagnosticsModal } from './components/EquipmentDiagnosticsModal';
import { PushNotificationToast } from './components/PushNotificationToast';

// Store, Auth, Translations & Utils
import { store } from './services/store';
import { authService } from './services/authService';
import { TelegramService } from './services/telegram';
import { soundService } from './services/soundService';
import { REFERRAL_MILESTONES } from './data/initialData';
import { getMinerRank } from './utils/minerRank';
import { getTranslation } from './services/i18n';
import { UserProfile, Investment, LanguageCode } from './types';

export default function App() {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<AurexTab>('invest');
  const [showSplash, setShowSplash] = useState(true);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');

  // Modals state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminDashboardMode, setIsAdminDashboardMode] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [isTgModalOpen, setIsTgModalOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [selectedDiagnosticRig, setSelectedDiagnosticRig] = useState<Investment | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    const unsub = store.subscribe(() => {
      setTick((t) => t + 1);
    });

    // Check language from store or localStorage
    const savedLang = (localStorage.getItem('aurex_lang') as LanguageCode) || 'en';
    setCurrentLang(savedLang);

    // Initialize Telegram WebApp SDK and Silent Auth
    authService.initAuth((profile) => {
      store.initFirestoreSync(profile);
    });

    return () => unsub();
  }, []);

  const user = store.getUser();
  const investments = store.getInvestments();
  const deposits = store.getDeposits();
  const withdrawals = store.getWithdrawals();
  const settings = store.getSettings();
  const notifications = store.getNotifications();
  const referrals = store.getReferrals();
  const tasks = store.getTasks();
  const copyTraders = store.getCopyTraders();
  const copyPositions = store.getCopyPositions();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const minerRank = getMinerRank(investments);
  const t = getTranslation(currentLang);

  const activeRigs = investments.filter((i) => i.status === 'Active');
  const totalDailyReturnUsdt = activeRigs.reduce(
    (acc, inv) => acc + (inv.amount * (inv.dailyPercent / 100)),
    0
  );

  const handleSelectLang = (lang: LanguageCode) => {
    setCurrentLang(lang);
    localStorage.setItem('aurex_lang', lang);
  };

  const handleTabChange = (tab: AurexTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is viewing full Admin Dashboard
  if (isAdminDashboardMode) {
    return (
      <div className="min-h-screen bg-[#07090E] text-[#F0F6FC]">
        <AdminDashboard
          user={user}
          onToggleUserPreview={() => setIsAdminDashboardMode(false)}
          isPreviewingUserMode={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-[#F0F6FC] font-sans flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* 1. Aurex Luxury Startup Splash Screen */}
      {showSplash && (
        <AurexSplashScreen
          onComplete={() => setShowSplash(false)}
          durationMs={2200}
        />
      )}

      {/* 2. Top Header / Navbar */}
      <Navbar
        user={user}
        investments={investments}
        unreadCount={unreadCount}
        currentLang={currentLang}
        onSelectLang={handleSelectLang}
        onOpenNotifications={() => {
          soundService.playClick();
          setIsNotificationsOpen(true);
        }}
        onOpenAdmin={() => {
          soundService.playClick();
          setIsAdminOpen(true);
        }}
        onOpenIntegrationGuide={() => {
          soundService.playClick();
          setIsTgModalOpen(true);
        }}
        onOpenSupport={() => {
          soundService.playClick();
          setIsSupportOpen(true);
        }}
        onReplaySplash={() => setShowSplash(true)}
      />

      {/* 3. Global Financial Command Ribbon & Balance Bar */}
      <section className="bg-gradient-to-b from-[#090D16] to-[#06080F] border-b border-emerald-950/30 px-3.5 pt-3 pb-3">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Main Balance Display */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-2xl bg-[#0B0F1A]/90 border border-slate-800/90 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {t.balance || 'Available Balance'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    USDT
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                    ${user.balance.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <AurexTokenLogo size={14} />
                    <span>{user.coins.toLocaleString()} AUR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Ribbon */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                onClick={() => {
                  soundService.playClick();
                  TelegramService.hapticImpact('medium');
                  handleTabChange('deposit');
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'deposit'
                    ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-102'
                    : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.deposit || 'Deposit'}</span>
              </button>

              <button
                onClick={() => {
                  soundService.playClick();
                  TelegramService.hapticImpact('medium');
                  handleTabChange('withdraw');
                }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'withdraw'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-102'
                    : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.withdraw || 'Withdraw'}</span>
              </button>

              <button
                onClick={() => {
                  soundService.playClick();
                  setIsSwapOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-200 hover:text-white border border-slate-700/80 hover:border-emerald-500/40 transition-all cursor-pointer"
                title="Swap USDT & AUR Coins"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Swap</span>
              </button>

              <button
                onClick={() => {
                  soundService.playClick();
                  setIsCheckinOpen(true);
                }}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer shadow-sm"
                title="Daily Login Rewards"
              >
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Daily</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics & Secondary Tab Selector */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs">
            {/* Metric Pills */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-300">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rigs:</span>
                <span className="font-mono text-emerald-400 font-black">{activeRigs.length}</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-300">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Daily Yield:</span>
                <span className="font-mono text-amber-300 font-black">+${totalDailyReturnUsdt.toFixed(2)}</span>
              </div>
            </div>

            {/* Direct Switchers */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleTabChange('history')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.history || 'Ledger'}
              </button>

              {user.isAdmin && (
                <button
                  onClick={() => setIsAdminDashboardMode(true)}
                  className="px-2.5 py-1 rounded-lg font-black text-[11px] bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer"
                >
                  Admin HQ
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main Page View Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 py-4 pb-28">
        {/* TAB 1: CLOUD MINING INVESTMENT PLANS */}
        {activeTab === 'invest' && (
          <InvestPage
            user={user}
            investments={investments}
            onDepositNeeded={() => handleTabChange('deposit')}
          />
        )}

        {/* TAB 2: ACTIVE MINING RIGS MONITORING */}
        {activeTab === 'mining_rigs' && (
          <MiningRigsPage
            user={user}
            investments={investments}
            onBack={() => handleTabChange('invest')}
            onNavigateInvest={() => handleTabChange('invest')}
            onOpenDiagnostics={(inv) => setSelectedDiagnosticRig(inv)}
          />
        )}

        {/* TAB 3: COPY TRADING alpha strategies */}
        {activeTab === 'copy' && (
          <CopyTradingPage
            traders={copyTraders}
            activePositions={copyPositions}
            user={user}
            onStartCopy={(traderId, planId, amount) =>
              store.createCopyTradePosition(traderId, amount, planId)
            }
            onClosePosition={(posId) => {
              store.closeCopyTradePosition(posId);
              return { success: true, message: 'Position closed successfully' };
            }}
            onClaimProfits={() => {
              const positions = store
                .getCopyPositions()
                .filter((p) => p.status === 'Active' && p.unclaimedProfit > 0);
              let claimed = 0;
              positions.forEach((p) => {
                claimed += p.unclaimedProfit;
                p.claimedProfit += p.unclaimedProfit;
                p.unclaimedProfit = 0;
              });
              if (claimed > 0) {
                user.balance = parseFloat((user.balance + claimed).toFixed(2));
                store.syncUserToFirestore();
              }
              return claimed;
            }}
            langCode={currentLang}
          />
        )}

        {/* TAB 4: TASKS & SOCIAL REWARDS */}
        {activeTab === 'tasks' && <TasksPage user={user} tasks={tasks} />}

        {/* TAB 5: 3-TIER PARTNER NETWORK & REFERRALS */}
        {activeTab === 'referral' && (
          <ReferralPage
            user={user}
            referrals={referrals}
            settings={settings}
            milestones={REFERRAL_MILESTONES}
            langCode={currentLang}
          />
        )}

        {/* TAB 6: CRYPTO DEPOSIT */}
        {activeTab === 'deposit' && (
          <DepositPage deposits={deposits} settings={settings} />
        )}

        {/* TAB 7: CRYPTO WITHDRAW */}
        {activeTab === 'withdraw' && (
          <WithdrawPage user={user} withdrawals={withdrawals} settings={settings} />
        )}

        {/* TAB 8: AUDIT & TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <HistoryPage transactions={store.getTransactions()} />
        )}
      </main>

      {/* 5. Aurex Luxury Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        langCode={currentLang}
        activeRigsCount={activeRigs.length}
      />

      {/* 6. Push Notification Toasts */}
      <PushNotificationToast
        notifications={notifications}
        investments={investments}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* 7. Modals Suite */}
      {/* Notifications Drawer */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => store.markNotificationsRead()}
      />

      {/* Admin Fast Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        user={user}
        deposits={deposits}
        withdrawals={withdrawals}
      />

      {/* 24/7 VIP Customer Support Chat */}
      <CustomerSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        user={user}
      />

      {/* 30-Day Check-in & Login Streak Rewards */}
      <DailyCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        user={user}
      />

      {/* Telegram Webhook & Mini App Bot Guide */}
      <TelegramIntegrationModal
        isOpen={isTgModalOpen}
        onClose={() => setIsTgModalOpen(false)}
        settings={settings}
        user={user}
        onReplaySplash={() => {
          setIsTgModalOpen(false);
          setShowSplash(true);
        }}
      />

      {/* Coins & USDT Currency Converter */}
      <SwapModal
        isOpen={isSwapOpen}
        onClose={() => setIsSwapOpen(false)}
        user={user}
      />

      {/* Mining Rig Thermal & Diagnostics Inspection */}
      <EquipmentDiagnosticsModal
        isOpen={!!selectedDiagnosticRig}
        onClose={() => setSelectedDiagnosticRig(null)}
        investment={selectedDiagnosticRig}
        settings={settings}
        userBalance={user.balance}
      />
    </div>
  );
}
