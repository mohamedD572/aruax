import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Cpu,
  Package,
  Wallet,
  Send,
  TrendingUp,
  Settings,
  History,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Ban,
  UserCheck,
  Trash2,
  Edit3,
  Plus,
  Play,
  Pause,
  Square,
  Zap,
  RefreshCw,
  AlertTriangle,
  Search,
  Filter,
  ExternalLink,
  ImageIcon,
  DollarSign,
  Activity,
  Check,
  X,
  Eye,
  Lock,
  Unlock,
  Bot,
  Database,
  Sliders,
  BellRing,
  Award,
  Clock,
  ChevronRight,
  Gift
} from 'lucide-react';
import { store } from '../services/store';
import { AdminWithdrawalCard } from './AdminWithdrawalCard';
import {
  DepositRequest,
  WithdrawalRequest,
  UserProfile,
  DepositWallet,
  NetworkType,
  Investment,
  InvestmentPlan,
  ActivityLogItem,
  AppSettings,
  GiftMiningRecord,
} from '../types';

interface AdminDashboardProps {
  user: UserProfile;
  onToggleUserPreview: () => void;
  isPreviewingUserMode?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onToggleUserPreview,
  isPreviewingUserMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'users'
    | 'deposits'
    | 'withdrawals'
    | 'mining'
    | 'gift_mining'
    | 'packages'
    | 'wallets'
    | 'notifications'
    | 'statistics'
    | 'settings'
    | 'logs'
  >('dashboard');

  // Gift Mining State
  const [giftSearchQuery, setGiftSearchQuery] = useState('');
  const [giftSearchLoading, setGiftSearchLoading] = useState(false);
  const [giftSearchError, setGiftSearchError] = useState<string | null>(null);
  const [giftSearchResult, setGiftSearchResult] = useState<{
    user: UserProfile;
    activeRigsCount: number;
    giftHistory: GiftMiningRecord[];
    previousGiftStatus: string;
  } | null>(null);
  const [giftSearchDebug, setGiftSearchDebug] = useState<{
    searchId: string;
    normalizedId: string;
    database: string;
    collection: string;
    matchedDocId: string;
    storedGiftId: string;
  } | null>(null);
  const [hasSearchedGift, setHasSearchedGift] = useState(false);

  const [giftPackageName, setGiftPackageName] = useState('🎁 AUREX GIFT MINING');
  const [giftValue, setGiftValue] = useState<number>(5);
  const [giftDurationHours, setGiftDurationHours] = useState<number>(24);
  const [giftRewardRate, setGiftRewardRate] = useState<number>(5.0);
  const [giftHashrate, setGiftHashrate] = useState<string>('100 MH/s');
  const [isGrantingGift, setIsGrantingGift] = useState(false);

  const [allGiftHistory, setAllGiftHistory] = useState<GiftMiningRecord[]>([]);
  const [isLoadingGiftHistory, setIsLoadingGiftHistory] = useState(false);

  // Store data
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [allInvestments, setAllInvestments] = useState<Investment[]>([]);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [wallets, setWallets] = useState<DepositWallet[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(store.getSettings());

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'All' | 'Active' | 'Frozen'>('All');
  const [depositStatusFilter, setDepositStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Modals & Action State
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editUsdtAmount, setEditUsdtAmount] = useState<number>(0);
  const [editCoinsAmount, setEditCoinsAmount] = useState<number>(0);
  const [balanceAdjustType, setBalanceAdjustType] = useState<'set' | 'add' | 'remove'>('set');
  const [balanceAdjustValue, setBalanceAdjustValue] = useState<number>(0);

  // Edit Mining Rig Modal
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [editRigSpeed, setEditRigSpeed] = useState<number>(100);
  const [editRigDailyPercent, setEditRigDailyPercent] = useState<number>(5.0);
  const [editRigRemainingDays, setEditRigRemainingDays] = useState<number>(25);

  // Package Modal (Create / Edit)
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planRigModel, setPlanRigModel] = useState('');
  const [planHashRate, setPlanHashRate] = useState('');
  const [planDailyPercent, setPlanDailyPercent] = useState<number>(5.0);
  const [planMinAmount, setPlanMinAmount] = useState<number>(50);
  const [planMaxAmount, setPlanMaxAmount] = useState<number>(5000);
  const [planDuration, setPlanDuration] = useState<number>(25);
  const [planBadge, setPlanBadge] = useState('Standard');
  const [planDescription, setPlanDescription] = useState('');

  // Wallet Modal
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<DepositWallet | null>(null);
  const [walletNetwork, setWalletNetwork] = useState<NetworkType>('USDT (BEP20)');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletQrImage, setWalletQrImage] = useState('');

  // Broadcast Notification State
  const [notifRecipientType, setNotifRecipientType] = useState<'all' | 'single'>('all');
  const [notifTargetUserId, setNotifTargetUserId] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'system' | 'deposit' | 'withdrawal' | 'investment' | 'task'>('system');

  // Settings State
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [minWithdrawalInput, setMinWithdrawalInput] = useState<number>(settings.minWithdrawal || 0.1);
  const [withdrawalFeeInput, setWithdrawalFeeInput] = useState<number>(settings.withdrawalFeePercent || 5.0);
  const [botTokenInput, setBotTokenInput] = useState<string>(settings.botToken || '');

  // Subscribe to store updates
  useEffect(() => {
    const syncData = () => {
      setAllUsers(store.getAllUsers());
      setDeposits(store.getDeposits());
      setWithdrawals(store.getWithdrawals());
      setAllInvestments(store.getAllInvestments());
      setPlans(store.getPlans());
      setWallets(store.getWallets());
      setActivityLogs(store.getActivityLogs());
      setSettings(store.getSettings());
    };

    syncData();
    const unsubscribe = store.subscribe(syncData);
    return () => unsubscribe();
  }, []);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Calculations for Dashboard Stats
  const totalUsersCount = allUsers.length;
  const onlineUsersCount = Math.max(1, Math.floor(totalUsersCount * 0.75));
  
  const approvedDepositsList = deposits.filter((d) => d.status === 'Approved');
  const pendingDepositsList = deposits.filter((d) => d.status === 'Pending');
  const totalDepositsAmount = approvedDepositsList.reduce((acc, d) => acc + d.amount, 0);
  const pendingDepositsAmount = pendingDepositsList.reduce((acc, d) => acc + d.amount, 0);

  const approvedWithdrawalsList = withdrawals.filter((w) => w.status === 'Approved');
  const pendingWithdrawalsList = withdrawals.filter((w) => w.status === 'Pending');
  const totalWithdrawalsAmount = approvedWithdrawalsList.reduce((acc, w) => acc + w.amount, 0);
  const pendingWithdrawalsAmount = pendingWithdrawalsList.reduce((acc, w) => acc + w.amount, 0);

  const totalInvestmentsAmount = allInvestments.reduce((acc, i) => acc + i.amount, 0);
  const activeInvestmentsList = allInvestments.filter((i) => i.status === 'Active');
  const activeInvestmentsCount = activeInvestmentsList.length;

  const totalProfitPaid = allInvestments.reduce((acc, i) => acc + (i.claimedProfit || 0), 0) +
    allUsers.reduce((acc, u) => acc + (u.referralEarnings || 0), 0);

  // User Admin Actions
  const handleSearchGiftId = async () => {
    const cleanQuery = giftSearchQuery.trim();
    if (!cleanQuery) {
      setGiftSearchError('Please enter a Gift ID (e.g. AUR-560408)');
      setGiftSearchResult(null);
      setGiftSearchDebug(null);
      setHasSearchedGift(true);
      showFeedback('Please enter a Gift ID (e.g. AUR-560408)', 'error');
      return;
    }

    setGiftSearchLoading(true);
    setGiftSearchError(null);
    setGiftSearchResult(null);
    setGiftSearchDebug(null);
    setHasSearchedGift(true);

    try {
      console.log(`[GIFT SEARCH FRONTEND] Querying Gift ID: "${cleanQuery}"...`);
      const res = await store.searchUserByGiftId(cleanQuery);
      console.log(`[GIFT SEARCH FRONTEND] Response received:`, res);

      if (res && res.debug) {
        setGiftSearchDebug(res.debug);
      }

      const targetUser = res?.user || res?.data?.user || (res?.success && (res?.id || res?.giftId) ? res : null);

      if (res && res.success !== false && targetUser) {
        const giftHist = Array.isArray(res.giftHistory) ? res.giftHistory : (Array.isArray(targetUser.giftHistory) ? targetUser.giftHistory : []);
        setGiftSearchResult({
          user: targetUser,
          activeRigsCount: res.activeRigsCount ?? res.activeMiningRigs ?? 0,
          giftHistory: giftHist,
          previousGiftStatus: res.previousGiftStatus || 'No Previous Gifts',
        });
        setGiftSearchError(null);
        showFeedback(`USER FOUND ✅ @${targetUser.username || targetUser.firstName || targetUser.id}`, 'success');
      } else {
        setGiftSearchResult(null);
        const errMsg = res?.message || `User not found matching Gift ID "${cleanQuery}".`;
        setGiftSearchError(errMsg);
        showFeedback(errMsg, 'error');
      }
    } catch (err: any) {
      console.error('[GIFT SEARCH FRONTEND ERROR]:', err);
      setGiftSearchResult(null);
      const errMsg = err?.message || 'SEARCH ERROR';
      setGiftSearchError(errMsg);
      showFeedback(errMsg, 'error');
    } finally {
      setGiftSearchLoading(false);
    }
  };

  const handleGrantGift = async () => {
    if (!giftSearchResult || !giftSearchResult.user) {
      showFeedback('Please search and select a user first.', 'error');
      return;
    }
    if (!giftValue || giftValue <= 0) {
      showFeedback('Please enter a valid gift value.', 'error');
      return;
    }

    setIsGrantingGift(true);
    try {
      const res = await store.grantGiftMining({
        userId: giftSearchResult.user.id,
        giftId: giftSearchResult.user.giftId || giftSearchQuery.trim(),
        giftValue: giftValue,
        durationHours: giftDurationHours,
        rewardRate: giftRewardRate,
        hashRate: giftHashrate,
        giftPackage: giftPackageName,
        adminUsername: user.username || user.firstName || 'Admin',
      });

      if (res.success) {
        showFeedback(`🎁 ${res.message || 'Gift Mining successfully granted!'}`, 'success');
        handleSearchGiftId();
        fetchGlobalGiftHistory();
      } else {
        showFeedback(res.message || 'Failed to grant gift', 'error');
      }
    } catch (err: any) {
      showFeedback('Error granting gift mining machine', 'error');
    } finally {
      setIsGrantingGift(false);
    }
  };

  const fetchGlobalGiftHistory = async () => {
    setIsLoadingGiftHistory(true);
    try {
      const history = await store.getGiftHistory();
      setAllGiftHistory(history);
    } catch (e) {
      console.error('Error fetching gift history:', e);
    } finally {
      setIsLoadingGiftHistory(false);
    }
  };

  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setEditUsdtAmount(u.balance);
    setEditCoinsAmount(u.coins);
    setBalanceAdjustType('set');
    setBalanceAdjustValue(0);
  };

  const handleSaveUserBalance = async () => {
    if (!editingUser) return;
    let finalUsdt = editUsdtAmount;
    if (balanceAdjustType === 'add') {
      finalUsdt = parseFloat((editingUser.balance + balanceAdjustValue).toFixed(2));
    } else if (balanceAdjustType === 'remove') {
      finalUsdt = Math.max(0, parseFloat((editingUser.balance - balanceAdjustValue).toFixed(2)));
    }

    await store.updateUserBalance(finalUsdt, editCoinsAmount, editingUser.id);
    await store.logActivity('EDIT_USER_BALANCE', `Updated balance for @${editingUser.username || editingUser.telegramId} to $${finalUsdt} USDT`);
    showFeedback(`Balance for user @${editingUser.username || editingUser.telegramId} updated to $${finalUsdt} USDT`);
    setEditingUser(null);
  };

  const handleToggleFreezeUser = async (u: UserProfile) => {
    await store.toggleUserFreeze(u.id);
    const newStatus = u.status === 'Frozen' ? 'Active' : 'Frozen';
    await store.logActivity('BAN_UNBAN_USER', `${newStatus === 'Frozen' ? 'Banned' : 'Unbanned'} user @${u.username || u.telegramId}`);
    showFeedback(`User @${u.username || u.telegramId} is now ${newStatus}`);
  };

  const handleDeleteUser = async (u: UserProfile) => {
    if (window.confirm(`Are you sure you want to permanently delete user @${u.username || u.telegramId}?`)) {
      await store.deleteUser(u.id);
      showFeedback(`User @${u.username || u.telegramId} deleted successfully.`);
    }
  };

  // Deposit Actions
  const handleApproveDeposit = async (id: string) => {
    await store.approveDeposit(id);
    showFeedback('Deposit request approved and credited to user balance!');
  };

  const handleRejectDeposit = async (id: string) => {
    await store.rejectDeposit(id);
    showFeedback('Deposit request rejected.');
  };

  // Withdrawal Actions
  const handleApproveWithdrawal = async (id: string) => {
    await store.approveWithdrawal(id);
    showFeedback('Withdrawal request approved and processed!');
  };

  const handleRejectWithdrawal = async (id: string) => {
    await store.rejectWithdrawal(id);
    showFeedback('Withdrawal request rejected and refunded to user balance.');
  };

  // Mining Rig Actions
  const handleUpdateMiningStatus = async (invId: string, status: 'Active' | 'Completed') => {
    await store.updateInvestment(invId, { status });
    showFeedback(`Mining rig ${invId} status set to ${status}`);
  };

  const handleSaveMiningRigEdit = async () => {
    if (!editingInvestment) return;
    await store.updateInvestment(editingInvestment.id, {
      powerEfficiencyPercent: editRigSpeed,
      dailyPercent: editRigDailyPercent,
      daysElapsed: editingInvestment.durationDays - editRigRemainingDays,
    });
    showFeedback(`Mining rig ${editingInvestment.planName} updated successfully.`);
    setEditingInvestment(null);
  };

  // Package Management Actions
  const handleOpenCreatePackage = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanRigModel('Aurex Pro-Mining Rig');
    setPlanHashRate('120 TH/s');
    setPlanDailyPercent(5.0);
    setPlanMinAmount(50);
    setPlanMaxAmount(5000);
    setPlanDuration(25);
    setPlanBadge('Popular');
    setPlanDescription('High-yield daily cloud mining plan with 25 days duration.');
    setPackageModalOpen(true);
  };

  const handleOpenEditPackage = (p: InvestmentPlan) => {
    setEditingPlan(p);
    setPlanName(p.name);
    setPlanRigModel(p.rigModel || '');
    setPlanHashRate(p.hashRate || '');
    setPlanDailyPercent(p.dailyPercent);
    setPlanMinAmount(p.minAmount);
    setPlanMaxAmount(p.maxAmount);
    setPlanDuration(p.durationDays);
    setPlanBadge(p.badge || '');
    setPlanDescription(p.description || '');
    setPackageModalOpen(true);
  };

  const handleSavePackage = async () => {
    if (!planName) {
      showFeedback('Plan name is required!', 'error');
      return;
    }

    const packageData: Omit<InvestmentPlan, 'id'> = {
      name: planName,
      rigModel: planRigModel || 'Aurex Miner',
      hashRate: planHashRate || '100 TH/s',
      powerUsage: '1200W',
      efficiency: '99.2%',
      minAmount: planMinAmount,
      maxAmount: planMaxAmount,
      dailyPercent: planDailyPercent,
      durationDays: planDuration,
      badge: planBadge,
      color: 'from-emerald-500 to-green-600',
      metalTheme: 'gold',
      metalGradient: 'bg-gradient-to-r from-amber-500 to-yellow-600',
      rigImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80',
      description: planDescription,
    };

    if (editingPlan) {
      await store.updatePlan(editingPlan.id, packageData);
      showFeedback(`Investment package "${planName}" updated successfully.`);
    } else {
      await store.createPlan(packageData);
      showFeedback(`New investment package "${planName}" created successfully.`);
    }

    setPackageModalOpen(false);
  };

  const handleDeletePackage = async (planId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete package "${name}"?`)) {
      await store.deletePlan(planId);
      showFeedback(`Package "${name}" deleted.`);
    }
  };

  // Wallet Management Actions
  const handleOpenCreateWallet = () => {
    setEditingWallet(null);
    setWalletNetwork('USDT (BEP20)');
    setWalletAddress('');
    setWalletQrImage('');
    setWalletModalOpen(true);
  };

  const handleOpenEditWallet = (w: DepositWallet) => {
    setEditingWallet(w);
    setWalletNetwork(w.network);
    setWalletAddress(w.walletAddress);
    setWalletQrImage(w.qrImage);
    setWalletModalOpen(true);
  };

  const handleSaveWallet = async () => {
    if (!walletAddress) {
      showFeedback('Wallet address is required!', 'error');
      return;
    }

    const qr = walletQrImage || `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(walletAddress)}`;

    if (editingWallet) {
      await store.updateWallet(editingWallet.id, {
        network: walletNetwork,
        walletAddress,
        qrImage: qr,
      });
      showFeedback(`Wallet for ${walletNetwork} updated successfully.`);
    } else {
      await store.createWallet({
        network: walletNetwork,
        walletAddress,
        qrImage: qr,
        enabled: true,
      });
      showFeedback(`New ${walletNetwork} deposit wallet created successfully.`);
    }

    setWalletModalOpen(false);
  };

  const handleToggleWalletStatus = async (w: DepositWallet) => {
    await store.updateWallet(w.id, { enabled: !w.enabled });
    showFeedback(`Wallet ${w.network} is now ${!w.enabled ? 'Enabled' : 'Disabled'}`);
  };

  const handleDeleteWallet = async (w: DepositWallet) => {
    if (window.confirm(`Delete wallet ${w.network} (${w.walletAddress.slice(0, 8)}...)?`)) {
      await store.deleteWallet(w.id);
      showFeedback(`Wallet deleted successfully.`);
    }
  };

  // Broadcast Notification Action
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) {
      showFeedback('Title and message are required!', 'error');
      return;
    }

    if (notifRecipientType === 'all') {
      store.addNotification({
        title: notifTitle,
        message: notifMessage,
        type: notifType,
      });
      await store.logActivity('BROADCAST_ALL', `Sent broadcast "${notifTitle}" to all registered users.`);
      showFeedback(`Broadcast sent to ALL registered users!`);
    } else {
      if (!notifTargetUserId) {
        showFeedback('Please select a recipient user!', 'error');
        return;
      }
      await store.sendNotificationToUser(notifTargetUserId, notifTitle, notifMessage, notifType);
      showFeedback(`Notification sent to selected user.`);
    }

    setNotifTitle('');
    setNotifMessage('');
  };

  // Settings Save
  const handleSaveSettings = () => {
    store.updateSettings({
      minWithdrawal: minWithdrawalInput,
      withdrawalFeePercent: withdrawalFeeInput,
      botToken: botTokenInput,
    });
    showFeedback('Platform settings saved successfully.');
  };

  // Filtered Users
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      userSearch === '' ||
      (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.firstName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      String(u.telegramId).includes(userSearch) ||
      u.id.includes(userSearch) ||
      (u.giftId || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesStatus =
      userStatusFilter === 'All' ||
      (userStatusFilter === 'Active' && u.status === 'Active') ||
      (userStatusFilter === 'Frozen' && u.status === 'Frozen');
    return matchesSearch && matchesStatus;
  });

  // Filtered Deposits
  const filteredDeposits = deposits.filter(
    (d) => depositStatusFilter === 'All' || d.status === depositStatusFilter
  );

  // Filtered Withdrawals
  const filteredWithdrawals = withdrawals.filter(
    (w) => withdrawalStatusFilter === 'All' || w.status === withdrawalStatusFilter
  );

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC] font-sans flex flex-col antialiased selection:bg-[#7CFF4F] selection:text-[#0D1117]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#161B22]/95 backdrop-blur-md border-b border-[#21262D] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7CFF4F] to-[#45B220] p-0.5 shadow-lg shadow-[#7CFF4F]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0D1117] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#7CFF4F]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-black tracking-wide text-[#F0F6FC] uppercase">
                Aurex Control Center
              </h1>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7CFF4F] animate-pulse"></span>
                ONLINE
              </span>
            </div>
            <p className="text-xs text-[#8B949E]">
              Admin Telegram: <span className="text-[#F0F6FC] font-bold">@{user.username || user.firstName}</span> (ID: {user.telegramId || user.id})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* User Mode Toggle Button */}
          <button
            onClick={onToggleUserPreview}
            className="px-3 py-1.5 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#7CFF4F] border border-[#7CFF4F]/40 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            title="Switch between Admin Dashboard and Normal User interface"
          >
            <Eye className="w-4 h-4 text-[#7CFF4F]" />
            <span className="hidden sm:inline">Preview User App</span>
          </button>
        </div>
      </header>

      {/* Action Toast Feedback Banner */}
      {actionMessage && (
        <div
          className={`px-4 py-2.5 text-xs font-bold text-center border-b animate-in fade-in transition-all ${
            actionMessage.type === 'success'
              ? 'bg-[#7CFF4F]/15 border-[#7CFF4F]/40 text-[#7CFF4F]'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-3 sm:p-5 gap-4">
        {/* Navigation Sidebar / Horizontal Scroll Bar for Mobile */}
        <aside className="w-full md:w-64 shrink-0 bg-[#161B22] border border-[#21262D] rounded-2xl p-2 md:p-3 shadow-xl">
          <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto gap-1 no-scrollbar pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'users'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Users</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'users' ? 'bg-[#0D1117]/20 text-[#0D1117]' : 'bg-[#21262D] text-[#8B949E]'}`}>
                {totalUsersCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('deposits')}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'deposits'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ArrowDownLeft className="w-4 h-4" />
                <span>Deposits</span>
              </div>
              {pendingDepositsList.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-500 text-[#0D1117] animate-pulse">
                  {pendingDepositsList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'withdrawals'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdrawals</span>
              </div>
              {pendingWithdrawalsList.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-500 text-[#F0F6FC] animate-pulse">
                  {pendingWithdrawalsList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('mining')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'mining'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Cloud Mining</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('gift_mining');
                fetchGlobalGiftHistory();
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'gift_mining'
                  ? 'bg-amber-400 text-[#0D1117] shadow-lg shadow-amber-400/20 font-black'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-[#21262D]/60'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>🎁 Gift Mining</span>
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'packages'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Packages</span>
            </button>

            <button
              onClick={() => setActiveTab('wallets')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'wallets'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Wallets</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'notifications'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('statistics')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'statistics'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Statistics</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'settings'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'logs'
                  ? 'bg-[#7CFF4F] text-[#0D1117] shadow-lg shadow-[#7CFF4F]/20'
                  : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Activity Logs</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 min-w-0 bg-[#161B22] border border-[#21262D] rounded-2xl p-4 sm:p-6 shadow-xl">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#F0F6FC]">Platform Overview</h2>
                  <p className="text-xs text-[#8B949E]">Real-time live telemetry metrics and core indicators</p>
                </div>
                <div className="text-xs text-[#8B949E] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#7CFF4F] animate-pulse" />
                  <span>Auto-updated</span>
                </div>
              </div>

              {/* 10 Key Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-1">
                  <div className="flex items-center justify-between text-[#8B949E]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
                    <Users className="w-4 h-4 text-[#7CFF4F]" />
                  </div>
                  <div className="text-2xl font-black text-[#F0F6FC]">{totalUsersCount}</div>
                  <div className="text-[10px] text-[#7CFF4F] font-bold">Registered Platform Users</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-1">
                  <div className="flex items-center justify-between text-[#8B949E]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Online Users</span>
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-[#F0F6FC]">{onlineUsersCount}</div>
                  <div className="text-[10px] text-emerald-400 font-bold">Active in Last Session</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-1">
                  <div className="flex items-center justify-between text-[#8B949E]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Deposits</span>
                    <ArrowDownLeft className="w-4 h-4 text-[#7CFF4F]" />
                  </div>
                  <div className="text-2xl font-black text-[#7CFF4F]">${totalDepositsAmount.toFixed(2)}</div>
                  <div className="text-[10px] text-[#8B949E]">{approvedDepositsList.length} Approved Deposits</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1117] border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between text-amber-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Pending Deposits</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-amber-400">${pendingDepositsAmount.toFixed(2)}</div>
                  <div className="text-[10px] text-amber-400 font-bold">{pendingDepositsList.length} Pending Approval</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-1">
                  <div className="flex items-center justify-between text-[#8B949E]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Approved Deposits</span>
                    <CheckCircle2 className="w-4 h-4 text-[#7CFF4F]" />
                  </div>
                  <div className="text-2xl font-black text-[#F0F6FC]">{approvedDepositsList.length}</div>
                  <div className="text-[10px] text-[#7CFF4F] font-bold">Verified Requests</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-1">
                  <div className="flex items-center justify-between text-[#8B949E]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Withdrawals</span>
                    <ArrowUpRight className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-[#F0F6FC]">${totalWithdrawalsAmount.toFixed(2)}</div>
                  <div className="text-[10px] text-[#8B949E]">{approvedWithdrawalsList.length} Approved</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1117] border border-rose-500/30 space-y-1">
                  <div className="flex items-center justify-between text-rose-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Pending Withdrawals</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-rose-400">${pendingWithdrawalsAmount.toFixed(2)}</div>
                  <div className="text-[10px] text-rose-400 font-bold">{pendingWithdrawalsList.length} Pending Approval</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-1">
                  <div className="flex items-center justify-between text-[#8B949E]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Investments</span>
                    <Cpu className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-cyan-400">${totalInvestmentsAmount.toFixed(2)}</div>
                  <div className="text-[10px] text-[#8B949E]">{allInvestments.length} Mining Rigs</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-1">
                  <div className="flex items-center justify-between text-[#8B949E]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active Mining</span>
                    <Zap className="w-4 h-4 text-[#7CFF4F]" />
                  </div>
                  <div className="text-2xl font-black text-[#7CFF4F]">{activeInvestmentsCount}</div>
                  <div className="text-[10px] text-[#7CFF4F] font-bold">Rigs Running</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-1">
                  <div className="flex items-center justify-between text-[#8B949E]">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Profit Paid</span>
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-purple-400">${totalProfitPaid.toFixed(2)}</div>
                  <div className="text-[10px] text-[#8B949E]">Total Accrued Profit</div>
                </div>
              </div>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-3">
                  <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
                    <ArrowDownLeft className="w-4 h-4 text-[#7CFF4F]" />
                    <span>Pending Deposit Actions</span>
                  </h3>
                  {pendingDepositsList.length === 0 ? (
                    <p className="text-xs text-[#8B949E]">No pending deposit requests to approve.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingDepositsList.slice(0, 3).map((dep) => (
                        <div key={dep.id} className="p-3 rounded-xl bg-[#161B22] border border-[#21262D] flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-[#F0F6FC] block">@{dep.username || dep.userId}</span>
                            <span className="text-xs text-[#7CFF4F] font-black">${dep.amount} USDT ({dep.network})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveDeposit(dep.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] text-xs font-black transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectDeposit(dep.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-3">
                  <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-blue-400" />
                    <span>Pending Withdrawal Actions</span>
                  </h3>
                  {pendingWithdrawalsList.length === 0 ? (
                    <p className="text-xs text-[#8B949E]">No pending withdrawal requests to process.</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingWithdrawalsList.slice(0, 3).map((wd) => (
                        <div key={wd.id} className="p-3 rounded-xl bg-[#161B22] border border-[#21262D] flex items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-[#F0F6FC] block">@{wd.username || wd.userId}</span>
                            <span className="text-xs text-blue-400 font-black">${wd.netAmount} USDT ({wd.network})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveWithdrawal(wd.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-[#F0F6FC] text-xs font-black transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(wd.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5.5: GIFT MINING */}
          {activeTab === 'gift_mining' && (
            <div className="space-y-6 animate-in fade-in font-mono">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0D1117] p-4 rounded-2xl border border-amber-500/30">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <Gift className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#F0F6FC] uppercase tracking-tight flex items-center gap-2">
                      🎁 Gift Mining Management
                    </h2>
                    <p className="text-xs text-[#8B949E] font-sans">
                      Search user by permanent Gift ID (e.g. AUR-8F4K2M) and grant promotional 24h Gift Mining machines.
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchGlobalGiftHistory}
                  disabled={isLoadingGiftHistory}
                  className="px-4 py-2 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-amber-400 font-bold text-xs flex items-center gap-2 border border-amber-500/30 self-start md:self-auto cursor-pointer transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingGiftHistory ? 'animate-spin' : ''}`} />
                  <span>Refresh History</span>
                </button>
              </div>

              {/* Search Field */}
              <div className="p-5 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-3 shadow-xl">
                <label className="text-xs font-black uppercase text-amber-400 tracking-wider block font-sans">
                  🔍 Search User by Gift ID
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={giftSearchQuery}
                      onChange={(e) => setGiftSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchGiftId()}
                      placeholder="Enter Gift ID (e.g. AUR-8F4K2M or Username)"
                      className="w-full px-4 py-3 rounded-xl bg-[#161B22] border border-[#30363D] text-[#F0F6FC] text-sm font-mono placeholder-[#8B949E] focus:outline-none focus:border-amber-400 transition-all uppercase"
                    />
                  </div>
                  <button
                    onClick={handleSearchGiftId}
                    disabled={giftSearchLoading}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-[#0D1117] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {giftSearchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Find User</span>
                  </button>
                </div>
              </div>

              {/* Temporary Admin Debug Box */}
              {giftSearchDebug && (
                <div className="p-4 rounded-2xl bg-[#0D1117] border border-sky-500/40 space-y-2 text-xs font-mono shadow-xl animate-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center justify-between bg-sky-500/10 border border-sky-500/30 px-3 py-1.5 rounded-lg text-sky-400 text-[11px] font-bold uppercase tracking-wider">
                    <span>🔧 Backend Search Debug Result</span>
                    <span>Collection: {giftSearchDebug.collection}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                    <div className="bg-[#161B22] p-2 rounded-lg border border-[#21262D]">
                      <span className="text-[#8B949E] block text-[9px] uppercase font-bold">Search ID:</span>
                      <span className="text-amber-300 font-bold">{giftSearchDebug.searchId}</span>
                    </div>
                    <div className="bg-[#161B22] p-2 rounded-lg border border-[#21262D]">
                      <span className="text-[#8B949E] block text-[9px] uppercase font-bold">Normalized ID:</span>
                      <span className="text-amber-300 font-bold">{giftSearchDebug.normalizedId}</span>
                    </div>
                    <div className="bg-[#161B22] p-2 rounded-lg border border-[#21262D]">
                      <span className="text-[#8B949E] block text-[9px] uppercase font-bold">Database:</span>
                      <span className="text-emerald-400 font-bold truncate block" title={giftSearchDebug.database}>{giftSearchDebug.database}</span>
                    </div>
                    <div className="bg-[#161B22] p-2 rounded-lg border border-[#21262D]">
                      <span className="text-[#8B949E] block text-[9px] uppercase font-bold">Collection:</span>
                      <span className="text-[#F0F6FC]">{giftSearchDebug.collection}</span>
                    </div>
                    <div className="bg-[#161B22] p-2 rounded-lg border border-[#21262D]">
                      <span className="text-[#8B949E] block text-[9px] uppercase font-bold">Matched Doc ID:</span>
                      <span className="text-purple-300 font-bold">{giftSearchDebug.matchedDocId || 'NONE'}</span>
                    </div>
                    <div className="bg-[#161B22] p-2 rounded-lg border border-[#21262D]">
                      <span className="text-[#8B949E] block text-[9px] uppercase font-bold">Stored Gift ID:</span>
                      <span className="text-emerald-300 font-bold">{giftSearchDebug.storedGiftId || 'NONE'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Result & Add Mining Gift Form directly below search box */}
              {giftSearchLoading && (
                <div className="p-4 rounded-xl bg-[#161B22] border border-amber-500/40 text-amber-400 font-mono text-sm font-bold flex items-center gap-3 animate-pulse shadow-lg">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Searching database for Gift ID: "{giftSearchQuery.trim()}"...</span>
                </div>
              )}

              {!giftSearchLoading && giftSearchError && (
                <div className="p-5 rounded-2xl bg-[#0D1117] border border-rose-500/50 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 px-4 py-2.5 rounded-xl">
                    <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-black uppercase tracking-wider">
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>USER NOT FOUND ❌</span>
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                      Query: <span className="text-amber-400 font-bold">{giftSearchQuery}</span>
                    </div>
                  </div>
                  <p className="text-xs text-rose-300 font-mono pl-1">
                    {giftSearchError}
                  </p>
                </div>
              )}

              {!giftSearchLoading && giftSearchResult && (
                <div className="space-y-6 animate-in slide-in-from-top-3 duration-300">
                  {/* User Overview */}
                  <div className="p-5 rounded-2xl bg-[#0D1117] border border-emerald-500/50 space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>USER FOUND ✅</span>
                      </div>
                      <div className="text-xs font-mono text-slate-300">
                        Query: <span className="text-amber-400 font-bold">{giftSearchQuery}</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#21262D]">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black text-lg">
                          {giftSearchResult.user.firstName ? giftSearchResult.user.firstName.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="text-xs text-[#8B949E] uppercase font-bold font-mono">Username:</div>
                          <div className="text-base font-black text-[#F0F6FC] flex items-center gap-2 font-mono">
                            <span>@{giftSearchResult.user.username ? giftSearchResult.user.username.replace(/^@/, '') : (giftSearchResult.user.firstName || 'user')}</span>
                            <span className="text-xs text-slate-400 font-sans">({giftSearchResult.user.firstName} {giftSearchResult.user.lastName || ''})</span>
                          </div>
                          <div className="text-xs text-[#8B949E] flex items-center gap-2 mt-1 font-mono">
                            <span>Gift ID: <strong className="text-amber-300 font-extrabold">{giftSearchResult.user.giftId}</strong></span>
                            <span>•</span>
                            <span>TG ID: {giftSearchResult.user.telegramId || giftSearchResult.user.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        <div className="px-3 py-1.5 rounded-xl bg-[#161B22] border border-[#30363D]">
                          <span className="text-[#8B949E] block text-[10px] uppercase font-bold">Status:</span>
                          <span className={`font-black ${giftSearchResult.user.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {giftSearchResult.user.status || 'Active'}
                          </span>
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-[#161B22] border border-[#30363D]">
                          <span className="text-[#8B949E] block text-[10px] uppercase font-bold">Wallet Balance:</span>
                          <span className="font-bold text-emerald-400">${(giftSearchResult.user.balance || 0).toFixed(2)} USDT</span>
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-[#161B22] border border-[#30363D]">
                          <span className="text-[#8B949E] block text-[10px] uppercase font-bold">Active Rigs:</span>
                          <span className="font-bold text-amber-400">{giftSearchResult.activeRigsCount} Rigs</span>
                        </div>

                        <div className="px-3 py-1.5 rounded-xl bg-[#161B22] border border-amber-500/30">
                          <span className="text-amber-400/80 block text-[10px] uppercase font-bold">Previous Gift:</span>
                          <span className="font-extrabold text-amber-300">{giftSearchResult.previousGiftStatus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Grant Gift Section */}
                    <div className="p-4 rounded-xl bg-[#161B22] border border-amber-500/30 space-y-4">
                      <h3 className="text-sm font-black uppercase text-amber-400 tracking-wider flex items-center gap-2 font-sans">
                        <Gift className="w-4 h-4" />
                        <span>🎁 ADD MINING GIFT</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Gift Package Name</label>
                          <input
                            type="text"
                            value={giftPackageName}
                            onChange={(e) => setGiftPackageName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Gift Value (USDT)</label>
                          <input
                            type="number"
                            value={giftValue}
                            onChange={(e) => setGiftValue(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Duration (Hours)</label>
                          <input
                            type="number"
                            value={giftDurationHours}
                            onChange={(e) => setGiftDurationHours(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-[#8B949E] uppercase font-bold block mb-1">Reward Rate (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={giftRewardRate}
                            onChange={(e) => setGiftRewardRate(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#F0F6FC] text-xs font-mono focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="text-xs text-[#8B949E]">
                          Expected Reward: <strong className="text-emerald-400">${((giftValue * giftRewardRate) / 100).toFixed(2)} USDT</strong> for {giftDurationHours} hours
                        </div>

                        <button
                          onClick={handleGrantGift}
                          disabled={isGrantingGift}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-[#0D1117] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isGrantingGift ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                          <span>Grant Gift Machine</span>
                        </button>
                      </div>
                    </div>

                    {/* User's Gift History */}
                    {giftSearchResult.giftHistory.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider">Gift History for this User</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-[#161B22] text-[#8B949E] uppercase text-[9px]">
                              <tr>
                                <th className="p-2">Gift Mining ID</th>
                                <th className="p-2">Package</th>
                                <th className="p-2">Value</th>
                                <th className="p-2">Start Time</th>
                                <th className="p-2">End Time</th>
                                <th className="p-2">Reward</th>
                                <th className="p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#21262D]">
                              {giftSearchResult.giftHistory.map((gh) => (
                                <tr key={gh.id} className="hover:bg-[#161B22]/50">
                                  <td className="p-2 text-amber-300 font-bold">{gh.giftMiningId || gh.id}</td>
                                  <td className="p-2 text-[#F0F6FC]">{gh.giftPackage}</td>
                                  <td className="p-2 text-emerald-400 font-bold">${gh.giftValue} USDT</td>
                                  <td className="p-2 text-[#8B949E]">{gh.startTime ? new Date(gh.startTime).toLocaleString() : 'N/A'}</td>
                                  <td className="p-2 text-[#8B949E]">{gh.endTime ? new Date(gh.endTime).toLocaleString() : 'N/A'}</td>
                                  <td className="p-2 text-sky-400 font-bold">${(gh.rewardEarned || 0).toFixed(2)} USDT</td>
                                  <td className="p-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${gh.status === 'ACTIVE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}`}>
                                      {gh.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Global Gift History Table */}
              <div className="p-5 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#F0F6FC] uppercase tracking-tight flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-400" />
                      <span>All Granted Mining Gifts</span>
                    </h3>
                    <p className="text-xs text-[#8B949E] font-sans">Full record of all promotional gifts granted to Aurex users</p>
                  </div>
                  <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                    {allGiftHistory.length} Gifts Granted
                  </span>
                </div>

                {allGiftHistory.length === 0 ? (
                  <div className="p-8 text-center text-[#8B949E] text-xs font-mono border border-dashed border-[#21262D] rounded-xl">
                    No gifts granted yet. Search for a user above by Gift ID to grant their first promotional mining machine!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#161B22] text-[#8B949E] uppercase text-[9px] tracking-wider border-b border-[#21262D]">
                        <tr>
                          <th className="p-3">Gift ID</th>
                          <th className="p-3">User</th>
                          <th className="p-3">Gift Mining ID</th>
                          <th className="p-3">Package</th>
                          <th className="p-3">Value</th>
                          <th className="p-3">Start Time</th>
                          <th className="p-3">End Time</th>
                          <th className="p-3">Reward Earned</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Granted By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#21262D]">
                        {allGiftHistory.map((g) => (
                          <tr key={g.id} className="hover:bg-[#161B22]/50 transition-colors">
                            <td className="p-3 text-amber-300 font-bold">{g.giftId}</td>
                            <td className="p-3 text-[#F0F6FC]">@{g.username || 'user'}</td>
                            <td className="p-3 text-amber-400/80">{g.giftMiningId || g.id}</td>
                            <td className="p-3 text-[#F0F6FC]">{g.giftPackage}</td>
                            <td className="p-3 text-emerald-400 font-bold">${g.giftValue} USDT</td>
                            <td className="p-3 text-[#8B949E]">{new Date(g.startTime).toLocaleString()}</td>
                            <td className="p-3 text-[#8B949E]">{new Date(g.endTime).toLocaleString()}</td>
                            <td className="p-3 text-sky-400 font-bold">${(g.rewardEarned || 0).toFixed(2)} USDT</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  g.status === 'ACTIVE'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                }`}
                              >
                                {g.status}
                              </span>
                            </td>
                            <td className="p-3 text-[#8B949E]">@{g.adminUsername || 'Admin'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: USERS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-[#F0F6FC]">Users Directory</h2>
                  <p className="text-xs text-[#8B949E]">View & manage all registered Aurex platform accounts</p>
                </div>
                {/* Search & Status Filter */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#8B949E] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search name, ID, username..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-xl bg-[#0D1117] border border-[#21262D] text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7CFF4F] w-48 sm:w-60"
                    />
                  </div>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#0D1117] border border-[#21262D] text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7CFF4F]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active Only</option>
                    <option value="Frozen">Banned Only</option>
                  </select>
                </div>
              </div>

              {/* Users Table / List */}
              <div className="overflow-x-auto rounded-2xl border border-[#21262D] bg-[#0D1117]">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-[#161B22] border-b border-[#21262D] text-[11px] font-bold text-[#8B949E] uppercase tracking-wider">
                      <th className="p-3.5">User Profile</th>
                      <th className="p-3.5">Telegram ID / UID</th>
                      <th className="p-3.5">Wallet Balance</th>
                      <th className="p-3.5">Referral Earnings</th>
                      <th className="p-3.5">Reg Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262D] text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#8B949E]">
                          No users found matching query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#161B22]/50 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center space-x-3">
                              <img
                                src={u.photoUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username || u.telegramId}`}
                                alt={u.firstName}
                                className="w-9 h-9 rounded-full object-cover border border-[#21262D]"
                              />
                              <div>
                                <span className="font-bold text-[#F0F6FC] block">{u.firstName} {u.lastName || ''}</span>
                                <span className="text-[11px] text-[#7CFF4F]">@{u.username || 'no_username'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-[#8B949E]">
                            <div>ID: {u.telegramId || 'N/A'}</div>
                            <div className="text-[10px] text-[#8B949E]/70">{u.id}</div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-black text-[#7CFF4F] block">${(u.balance || 0).toFixed(2)} USDT</span>
                            <span className="text-[10px] text-[#8B949E]">{u.coins || 0} Coins</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-[#F0F6FC]">${(u.referralEarnings || 0).toFixed(2)} USDT</span>
                            <span className="text-[10px] text-[#8B949E] block">{u.referralCount || 0} Referrals</span>
                          </td>
                          <td className="p-3.5 text-[#8B949E] text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'Frozen'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-[#7CFF4F]/20 text-[#7CFF4F] border border-[#7CFF4F]/30'
                              }`}
                            >
                              {u.status === 'Frozen' ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#7CFF4F] transition-all"
                              title="Edit User Balance"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleFreezeUser(u)}
                              className={`p-1.5 rounded-lg transition-all ${
                                u.status === 'Frozen'
                                  ? 'bg-[#7CFF4F]/20 text-[#7CFF4F] hover:bg-[#7CFF4F]/30'
                                  : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                              }`}
                              title={u.status === 'Frozen' ? 'Unban User' : 'Ban User'}
                            >
                              {u.status === 'Frozen' ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DEPOSITS MANAGEMENT */}
          {activeTab === 'deposits' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-[#F0F6FC]">Deposits Management</h2>
                  <p className="text-xs text-[#8B949E]">Real-time incoming deposit verification & approval</p>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#8B949E]" />
                  <select
                    value={depositStatusFilter}
                    onChange={(e) => setDepositStatusFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#0D1117] border border-[#21262D] text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7CFF4F]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending Only</option>
                    <option value="Approved">Approved Only</option>
                    <option value="Rejected">Rejected Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredDeposits.length === 0 ? (
                  <div className="p-12 text-center text-[#8B949E] bg-[#0D1117] rounded-2xl border border-[#21262D]">
                    <ArrowDownLeft className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No deposit requests found.</p>
                  </div>
                ) : (
                  filteredDeposits.map((dep) => {
                    const depUser = allUsers.find((u) => u.id === dep.userId);
                    return (
                      <div key={dep.id} className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#7CFF4F]/40 transition-all">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={depUser?.photoUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${dep.username || dep.userId}`}
                            alt={dep.username}
                            className="w-11 h-11 rounded-2xl object-cover border border-[#21262D]"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-[#F0F6FC]">@{dep.username || dep.userId}</span>
                              <span className="text-[10px] text-[#8B949E]">ID: {dep.userId}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="text-base font-black text-[#7CFF4F]">${dep.amount} USDT</span>
                              <span className="text-xs px-2 py-0.5 rounded-md bg-[#21262D] text-[#8B949E] font-bold">{dep.network}</span>
                            </div>
                            <div className="text-[11px] text-[#8B949E] mt-1 flex items-center gap-2">
                              <span>Wallet: {dep.walletAddress ? `${dep.walletAddress.slice(0, 10)}...` : 'Default'}</span>
                              <span>• {new Date(dep.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Screenshot Proof Preview Button */}
                        <div className="flex items-center space-x-3">
                          {dep.imageProof && (
                            <button
                              onClick={() => setSelectedProofImage(dep.imageProof!)}
                              className="px-3 py-1.5 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-xs text-[#F0F6FC] font-bold flex items-center gap-1.5 border border-[#30363D]"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-[#7CFF4F]" />
                              <span>View Proof</span>
                            </button>
                          )}

                          {/* Status / Approve & Reject Actions */}
                          {dep.status === 'Pending' ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleApproveDeposit(dep.id)}
                                className="px-4 py-2 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleRejectDeposit(dep.id)}
                                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs transition-all border border-rose-500/30 active:scale-95 flex items-center gap-1.5"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                                dep.status === 'Approved'
                                  ? 'bg-[#7CFF4F]/20 text-[#7CFF4F] border-[#7CFF4F]/30'
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {dep.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: WITHDRAWALS MANAGEMENT */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-[#F0F6FC]">Withdrawals Management</h2>
                  <p className="text-xs text-[#8B949E]">Process and approve user payout withdrawal requests</p>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#8B949E]" />
                  <select
                    value={withdrawalStatusFilter}
                    onChange={(e) => setWithdrawalStatusFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#0D1117] border border-[#21262D] text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7CFF4F]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending Only</option>
                    <option value="Approved">Approved Only</option>
                    <option value="Rejected">Rejected Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredWithdrawals.length === 0 ? (
                  <div className="p-12 text-center text-[#8B949E] bg-[#0D1117] rounded-2xl border border-[#21262D]">
                    <ArrowUpRight className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No withdrawal requests found.</p>
                  </div>
                ) : (
                  filteredWithdrawals.map((wd) => {
                    const wdUser = allUsers.find((u) => u.id === wd.userId);
                    return (
                      <AdminWithdrawalCard
                        key={wd.id}
                        wd={wd}
                        userProfile={wdUser}
                        onApprove={handleApproveWithdrawal}
                        onReject={handleRejectWithdrawal}
                        onToast={(msg, isErr) => showFeedback(msg, isErr ? 'error' : 'success')}
                      />
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CLOUD MINING CONTROL */}
          {activeTab === 'mining' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-[#F0F6FC]">Cloud Mining Control</h2>
                  <p className="text-xs text-[#8B949E]">Manage every user's active cloud mining equipment & speed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allInvestments.length === 0 ? (
                  <div className="col-span-2 p-12 text-center text-[#8B949E] bg-[#0D1117] rounded-2xl border border-[#21262D]">
                    <Cpu className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#7CFF4F]" />
                    <p>No cloud mining rigs active on platform.</p>
                  </div>
                ) : (
                  allInvestments.map((inv) => {
                    const invUser = allUsers.find((u) => u.id === inv.userId);
                    return (
                      <div key={inv.id} className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            <Cpu className="w-5 h-5 text-[#7CFF4F]" />
                            <div>
                              <span className="font-bold text-[#F0F6FC] block text-sm">{inv.planName}</span>
                              <span className="text-[11px] text-[#8B949E]">Owner: @{invUser?.username || inv.userId}</span>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'Active'
                                ? 'bg-[#7CFF4F]/20 text-[#7CFF4F] border border-[#7CFF4F]/30'
                                : 'bg-[#21262D] text-[#8B949E]'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#161B22] text-xs">
                          <div>
                            <span className="text-[10px] text-[#8B949E] block uppercase font-bold">Invested</span>
                            <span className="font-black text-[#7CFF4F]">${inv.amount}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8B949E] block uppercase font-bold">Daily %</span>
                            <span className="font-bold text-[#F0F6FC]">{inv.dailyPercent}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8B949E] block uppercase font-bold">Efficiency</span>
                            <span className="font-bold text-emerald-400">{inv.powerEfficiencyPercent || 100}%</span>
                          </div>
                        </div>

                        {/* Mining Control Actions */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#21262D]">
                          <div className="flex items-center space-x-1.5">
                            {inv.status !== 'Active' ? (
                              <button
                                onClick={() => handleUpdateMiningStatus(inv.id, 'Active')}
                                className="px-3 py-1.5 rounded-lg bg-[#7CFF4F] text-[#0D1117] font-black text-xs flex items-center gap-1 transition-all"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Start</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateMiningStatus(inv.id, 'Completed')}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                <Pause className="w-3.5 h-3.5" />
                                <span>Pause</span>
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setEditingInvestment(inv);
                              setEditRigSpeed(inv.powerEfficiencyPercent || 100);
                              setEditRigDailyPercent(inv.dailyPercent);
                              setEditRigRemainingDays(inv.durationDays - inv.daysElapsed);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#7CFF4F] text-xs font-bold flex items-center gap-1"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Edit Parameters</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 6: INVESTMENT PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#F0F6FC]">Investment Packages</h2>
                  <p className="text-xs text-[#8B949E]">Create, edit, and configure available cloud mining plans</p>
                </div>
                <button
                  onClick={handleOpenCreatePackage}
                  className="px-3.5 py-2 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Package</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#7CFF4F]/20 text-[#7CFF4F] border border-[#7CFF4F]/30">
                          {p.badge || 'Standard'}
                        </span>
                        <span className="text-xs text-[#8B949E]">{p.durationDays} Days</span>
                      </div>
                      <h3 className="text-base font-black text-[#F0F6FC]">{p.name}</h3>
                      <p className="text-xs text-[#8B949E] line-clamp-2 mt-1">{p.description}</p>

                      <div className="mt-4 p-3 rounded-xl bg-[#161B22] space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#8B949E]">Daily Yield:</span>
                          <span className="font-black text-[#7CFF4F]">{p.dailyPercent}% / Day</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8B949E]">Min Investment:</span>
                          <span className="font-bold text-[#F0F6FC]">${p.minAmount} USDT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8B949E]">Max Investment:</span>
                          <span className="font-bold text-[#F0F6FC]">${p.maxAmount} USDT</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#21262D]">
                      <button
                        onClick={() => handleOpenEditPackage(p)}
                        className="p-2 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#7CFF4F] text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeletePackage(p.id, p.name)}
                        className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: WALLET MANAGEMENT */}
          {activeTab === 'wallets' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#F0F6FC]">Wallet Management</h2>
                  <p className="text-xs text-[#8B949E]">Manage USDT (BEP20), TRX (TRON), and BNB deposit wallets</p>
                </div>
                <button
                  onClick={handleOpenCreateWallet}
                  className="px-3.5 py-2 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Wallet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wallets.map((w) => (
                  <div key={w.id} className="p-4 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-5 h-5 text-[#7CFF4F]" />
                        <span className="font-bold text-[#F0F6FC] text-sm">{w.network}</span>
                      </div>
                      <button
                        onClick={() => handleToggleWalletStatus(w)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          w.enabled !== false
                            ? 'bg-[#7CFF4F]/20 text-[#7CFF4F] border-[#7CFF4F]/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {w.enabled !== false ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    <div className="p-3 rounded-xl bg-[#161B22] font-mono text-xs break-all text-[#8B949E]">
                      {w.walletAddress || 'No Address Set'}
                    </div>

                    {w.qrImage && (
                      <div className="flex items-center gap-3">
                        <img src={w.qrImage} alt="QR Code" className="w-16 h-16 rounded-xl bg-white p-1" />
                        <span className="text-xs text-[#8B949E]">Deposit QR Code configured</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#21262D]">
                      <button
                        onClick={() => handleOpenEditWallet(w)}
                        className="px-3 py-1.5 rounded-xl bg-[#21262D] hover:bg-[#30363D] text-[#7CFF4F] text-xs font-bold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Address / QR</span>
                      </button>
                      <button
                        onClick={() => handleDeleteWallet(w)}
                        className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: NOTIFICATIONS BROADCAST */}
          {activeTab === 'notifications' && (
            <div className="space-y-5 animate-in fade-in max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-[#F0F6FC]">Broadcast Notifications</h2>
                <p className="text-xs text-[#8B949E]">Send push announcements to all registered users or a specific user</p>
              </div>

              <form onSubmit={handleSendBroadcast} className="p-5 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#8B949E] block mb-1.5">Recipient Scope</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setNotifRecipientType('all')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        notifRecipientType === 'all'
                          ? 'bg-[#7CFF4F] text-[#0D1117] border-[#7CFF4F]'
                          : 'bg-[#161B22] text-[#8B949E] border-[#21262D]'
                      }`}
                    >
                      📢 All Users ({totalUsersCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifRecipientType('single')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        notifRecipientType === 'single'
                          ? 'bg-[#7CFF4F] text-[#0D1117] border-[#7CFF4F]'
                          : 'bg-[#161B22] text-[#8B949E] border-[#21262D]'
                      }`}
                    >
                      🎯 Selected User
                    </button>
                  </div>
                </div>

                {notifRecipientType === 'single' && (
                  <div>
                    <label className="text-xs font-bold text-[#8B949E] block mb-1.5">Select User</label>
                    <select
                      value={notifTargetUserId}
                      onChange={(e) => setNotifTargetUserId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7CFF4F]"
                    >
                      <option value="">-- Choose User --</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          @{u.username || u.telegramId} ({u.firstName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-[#8B949E] block mb-1.5">Notification Title</label>
                  <input
                    type="text"
                    placeholder="e.g. System Maintenance Completed 🚀"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7CFF4F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#8B949E] block mb-1.5">Message Body</label>
                  <textarea
                    rows={4}
                    placeholder="Write broadcast message content..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7CFF4F]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast Now</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 9: STATISTICS */}
          {activeTab === 'statistics' && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-[#F0F6FC]">Platform Analytics & Trends</h2>
                <p className="text-xs text-[#8B949E]">Visual statistics for user growth, deposits, withdrawals & active rigs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Users Growth Chart Card */}
                <div className="p-5 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-3">
                  <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#7CFF4F]" />
                    <span>User Registration Growth</span>
                  </h3>
                  <div className="h-40 flex items-end justify-between gap-2 px-2 pt-6 border-b border-[#21262D]">
                    {[20, 35, 45, 60, 78, 95, totalUsersCount].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] text-[#7CFF4F] opacity-0 group-hover:opacity-100 transition-opacity font-bold">{val}</span>
                        <div
                          style={{ height: `${Math.max(15, (val / Math.max(10, totalUsersCount)) * 120)}px` }}
                          className="w-full bg-gradient-to-t from-[#7CFF4F]/20 to-[#7CFF4F] rounded-t-md transition-all hover:brightness-125"
                        ></div>
                        <span className="text-[9px] text-[#8B949E]">D-{7 - idx}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deposits vs Withdrawals Visual Card */}
                <div className="p-5 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-3">
                  <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Deposits vs Withdrawals ($ USDT)</span>
                  </h3>
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#8B949E]">Total Approved Deposits</span>
                        <span className="font-bold text-[#7CFF4F]">${totalDepositsAmount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-[#161B22] h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#7CFF4F] h-full rounded-full"
                          style={{ width: `${Math.min(100, (totalDepositsAmount / Math.max(1, totalDepositsAmount + totalWithdrawalsAmount)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#8B949E]">Total Approved Withdrawals</span>
                        <span className="font-bold text-blue-400">${totalWithdrawalsAmount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-[#161B22] h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, (totalWithdrawalsAmount / Math.max(1, totalDepositsAmount + totalWithdrawalsAmount)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-[#F0F6FC]">Platform & Bot Settings</h2>
                <p className="text-xs text-[#8B949E]">Configure Telegram Bot credentials, withdrawal limits, and maintenance status</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#0D1117] border border-[#21262D] space-y-4">
                {/* Telegram Bot Config */}
                <div>
                  <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2 mb-3">
                    <Bot className="w-4 h-4 text-[#7CFF4F]" />
                    <span>Telegram Bot Configuration</span>
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#8B949E] block mb-1">Bot Username</label>
                      <input
                        type="text"
                        disabled
                        value="@AurexCrypto_bot"
                        className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#8B949E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8B949E] block mb-1">Bot API Token</label>
                      <input
                        type="password"
                        value={botTokenInput}
                        onChange={(e) => setBotTokenInput(e.target.value)}
                        placeholder="7149088577:AAH..."
                        className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7CFF4F]"
                      />
                    </div>
                  </div>
                </div>

                {/* Firebase Connection Status */}
                <div className="pt-3 border-t border-[#21262D]">
                  <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-[#7CFF4F]" />
                    <span>Firebase Status</span>
                  </h3>
                  <div className="p-3 rounded-xl bg-[#161B22] border border-[#21262D] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#F0F6FC] font-bold block">Firestore Database Connected</span>
                      <span className="text-[10px] text-[#8B949E]">ID: ai-studio-25daysinvestment</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#7CFF4F]/20 text-[#7CFF4F] font-bold text-[10px]">
                      Active
                    </span>
                  </div>
                </div>

                {/* Platform Parameters */}
                <div className="pt-3 border-t border-[#21262D]">
                  <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-2 mb-3">
                    <Sliders className="w-4 h-4 text-[#7CFF4F]" />
                    <span>Platform Parameters</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#8B949E] block mb-1">Min Withdrawal ($ USDT)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={minWithdrawalInput}
                        onChange={(e) => setMinWithdrawalInput(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7CFF4F]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8B949E] block mb-1">Withdrawal Fee (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={withdrawalFeeInput}
                        onChange={(e) => setWithdrawalFeeInput(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC] focus:outline-none focus:border-[#7CFF4F]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full py-2.5 rounded-xl bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-black text-xs transition-all shadow-md active:scale-95"
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* TAB 11: ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h2 className="text-xl font-black text-[#F0F6FC]">Platform Audit Logs</h2>
                <p className="text-xs text-[#8B949E]">Real-time history of all admin actions and system events</p>
              </div>

              <div className="space-y-2">
                {activityLogs.length === 0 ? (
                  <div className="p-12 text-center text-[#8B949E] bg-[#0D1117] rounded-2xl border border-[#21262D]">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No activity logs recorded yet.</p>
                  </div>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-[#0D1117] border border-[#21262D] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#7CFF4F] block">{log.action}</span>
                        <span className="text-[#8B949E]">{log.details}</span>
                      </div>
                      <div className="text-right text-[10px] text-[#8B949E]">
                        <div>Admin: {log.adminId || 'System'}</div>
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* LIGHTBOX PROOF IMAGE MODAL */}
      {selectedProofImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-lg w-full bg-[#0D1117] p-3 rounded-2xl border border-[#7CFF4F]/40">
            <button
              onClick={() => setSelectedProofImage(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-[#21262D] text-[#F0F6FC] hover:bg-[#30363D]"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xs font-bold text-[#8B949E] mb-2 px-1">Deposit Payment Proof Image</h3>
            <img src={selectedProofImage} alt="Proof" className="w-full max-h-[75vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* EDIT USER BALANCE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0D1117] rounded-2xl border border-[#7CFF4F]/40 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#F0F6FC]">Edit User Balance: @{editingUser.username || editingUser.telegramId}</h3>
              <button onClick={() => setEditingUser(null)} className="text-[#8B949E] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8B949E] block mb-1">Adjustment Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBalanceAdjustType('set')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border ${balanceAdjustType === 'set' ? 'bg-[#7CFF4F] text-[#0D1117] border-[#7CFF4F]' : 'bg-[#161B22] text-[#8B949E]'}`}
                  >
                    Set Exact
                  </button>
                  <button
                    onClick={() => setBalanceAdjustType('add')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border ${balanceAdjustType === 'add' ? 'bg-[#7CFF4F] text-[#0D1117] border-[#7CFF4F]' : 'bg-[#161B22] text-[#8B949E]'}`}
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => setBalanceAdjustType('remove')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border ${balanceAdjustType === 'remove' ? 'bg-[#7CFF4F] text-[#0D1117] border-[#7CFF4F]' : 'bg-[#161B22] text-[#8B949E]'}`}
                  >
                    - Remove
                  </button>
                </div>
              </div>

              {balanceAdjustType === 'set' ? (
                <div>
                  <label className="text-xs text-[#8B949E] block mb-1">New USDT Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editUsdtAmount}
                    onChange={(e) => setEditUsdtAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC]"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs text-[#8B949E] block mb-1">USDT Amount to {balanceAdjustType === 'add' ? 'Add' : 'Remove'} ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={balanceAdjustValue}
                    onChange={(e) => setBalanceAdjustValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-[#8B949E] block mb-1">Coins Balance</label>
                <input
                  type="number"
                  value={editCoinsAmount}
                  onChange={(e) => setEditCoinsAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveUserBalance}
                className="flex-1 py-2 rounded-xl bg-[#7CFF4F] text-[#0D1117] font-black text-xs"
              >
                Save Balance
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl bg-[#21262D] text-[#8B949E] text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MINING RIG PARAMETERS MODAL */}
      {editingInvestment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0D1117] rounded-2xl border border-[#7CFF4F]/40 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#F0F6FC]">Edit Mining Parameters: {editingInvestment.planName}</h3>
              <button onClick={() => setEditingInvestment(null)} className="text-[#8B949E] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8B949E] block mb-1">Mining Speed / Efficiency (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editRigSpeed}
                  onChange={(e) => setEditRigSpeed(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC]"
                />
              </div>

              <div>
                <label className="text-xs text-[#8B949E] block mb-1">Daily Profit (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editRigDailyPercent}
                  onChange={(e) => setEditRigDailyPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC]"
                />
              </div>

              <div>
                <label className="text-xs text-[#8B949E] block mb-1">Remaining Mining Days</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editRigRemainingDays}
                  onChange={(e) => setEditRigRemainingDays(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-xs text-[#F0F6FC]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveMiningRigEdit}
                className="flex-1 py-2 rounded-xl bg-[#7CFF4F] text-[#0D1117] font-black text-xs"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingInvestment(null)}
                className="px-4 py-2 rounded-xl bg-[#21262D] text-[#8B949E] text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PACKAGE MODAL */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0D1117] rounded-2xl border border-[#7CFF4F]/40 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#F0F6FC]">
                {editingPlan ? 'Edit Investment Package' : 'Create Investment Package'}
              </h3>
              <button onClick={() => setPackageModalOpen(false)} className="text-[#8B949E] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#8B949E] block mb-1">Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aurex Quantum Rig V2"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#8B949E] block mb-1">Daily Profit (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={planDailyPercent}
                    onChange={(e) => setPlanDailyPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                  />
                </div>
                <div>
                  <label className="text-[#8B949E] block mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={planDuration}
                    onChange={(e) => setPlanDuration(parseInt(e.target.value) || 25)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#8B949E] block mb-1">Min Invest ($ USDT)</label>
                  <input
                    type="number"
                    value={planMinAmount}
                    onChange={(e) => setPlanMinAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                  />
                </div>
                <div>
                  <label className="text-[#8B949E] block mb-1">Max Invest ($ USDT)</label>
                  <input
                    type="number"
                    value={planMaxAmount}
                    onChange={(e) => setPlanMaxAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#8B949E] block mb-1">Hashrate (e.g. 350 TH/s)</label>
                  <input
                    type="text"
                    placeholder="e.g. 350 TH/s"
                    value={planHashRate}
                    onChange={(e) => setPlanHashRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                  />
                </div>
                <div>
                  <label className="text-[#8B949E] block mb-1">Rig Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Antminer S19"
                    value={planRigModel}
                    onChange={(e) => setPlanRigModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8B949E] block mb-1">Badge Tag</label>
                <input
                  type="text"
                  placeholder="Popular, Premium, High Yield"
                  value={planBadge}
                  onChange={(e) => setPlanBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                />
              </div>

              <div>
                <label className="text-[#8B949E] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSavePackage}
                className="flex-1 py-2 rounded-xl bg-[#7CFF4F] text-[#0D1117] font-black text-xs"
              >
                Save Package
              </button>
              <button
                onClick={() => setPackageModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#21262D] text-[#8B949E] text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT WALLET MODAL */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0D1117] rounded-2xl border border-[#7CFF4F]/40 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#F0F6FC]">
                {editingWallet ? 'Edit Deposit Wallet' : 'Add Deposit Wallet'}
              </h3>
              <button onClick={() => setWalletModalOpen(false)} className="text-[#8B949E] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#8B949E] block mb-1">Select Network</label>
                <select
                  value={walletNetwork}
                  onChange={(e) => setWalletNetwork(e.target.value as NetworkType)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                >
                  <option value="USDT (BEP20)">USDT (BEP20)</option>
                  <option value="TRX (TRON)">TRX (TRON)</option>
                  <option value="BNB (BEP20)">BNB (BEP20)</option>
                </select>
              </div>

              <div>
                <label className="text-[#8B949E] block mb-1">Wallet Address</label>
                <input
                  type="text"
                  placeholder="Paste crypto address..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC] font-mono"
                />
              </div>

              <div>
                <label className="text-[#8B949E] block mb-1">QR Code Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://... or leave blank to auto-generate"
                  value={walletQrImage}
                  onChange={(e) => setWalletQrImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#161B22] border border-[#21262D] text-[#F0F6FC]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSaveWallet}
                className="flex-1 py-2 rounded-xl bg-[#7CFF4F] text-[#0D1117] font-black text-xs"
              >
                Save Wallet
              </button>
              <button
                onClick={() => setWalletModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#21262D] text-[#8B949E] text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
