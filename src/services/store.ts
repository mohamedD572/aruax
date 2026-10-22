import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  AppNotification,
  AppSettings,
  DepositRequest,
  Investment,
  TaskItem,
  TransactionHistoryItem,
  UserProfile,
  WithdrawalRequest,
  ReferralUser,
  CopyTradePosition,
  CopyTrader,
  LanguageCode,
  DEFAULT_COPY_LOCKUP_PLANS,
  InvestmentPlan,
  AppDialogConfig,
  DepositWallet,
  NetworkType,
  ActivityLogItem,
} from '../types';
import {
  INITIAL_DEPOSITS,
  INITIAL_INVESTMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REFERRALS,
  INITIAL_SETTINGS,
  INITIAL_TASKS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
  INITIAL_WITHDRAWALS,
  COPY_TRADERS,
  INITIAL_COPY_POSITIONS,
  REFERRAL_MILESTONES,
  INVESTMENT_PLANS,
  INITIAL_WALLETS,
} from '../data/initialData';
import { getMaintenanceCost } from '../utils/maintenance';

const getApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string) || '';
  return envUrl.trim().replace(/\/$/, '');
};

type Listener = () => void;

class AppStore {
  private listeners: Set<Listener> = new Set();

  private settings: AppSettings = {
    ...INITIAL_SETTINGS,
    minWithdrawal: 0.1,
    withdrawalFeePercent: 5.0,
  };
  private user: UserProfile = { ...INITIAL_USER };
  private investments: Investment[] = [...INITIAL_INVESTMENTS];
  private copyPositions: CopyTradePosition[] = [...INITIAL_COPY_POSITIONS];
  private deposits: DepositRequest[] = [...INITIAL_DEPOSITS];
  private withdrawals: WithdrawalRequest[] = [...INITIAL_WITHDRAWALS];
  private tasks: TaskItem[] = [...INITIAL_TASKS];
  private notifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];
  private transactions: TransactionHistoryItem[] = [...INITIAL_TRANSACTIONS];
  private referrals: ReferralUser[] = [...INITIAL_REFERRALS];
  private plans: InvestmentPlan[] = [...INVESTMENT_PLANS];
  private wallets: DepositWallet[] = [...INITIAL_WALLETS];
  private language: LanguageCode = 'en';
  private initializedUid: string | null = null;
  private allUsers: UserProfile[] = [];
  private allInvestments: Investment[] = [];
  private activityLogs: ActivityLogItem[] = [];
  private currentDialog: AppDialogConfig | null = null;

  getDialog(): AppDialogConfig | null {
    return this.currentDialog;
  }

  showDialog(config: AppDialogConfig) {
    this.currentDialog = config;
    this.notify();
  }

  closeDialog() {
    this.currentDialog = null;
    this.notify();
  }

  showInsufficientBalanceModal(requiredAmount?: number, customMessage?: string) {
    this.showDialog({
      type: 'warning',
      title: 'Insufficient Balance',
      message:
        customMessage ||
        (requiredAmount
          ? `You don't have enough USDT balance ($${requiredAmount.toFixed(2)} USDT required) to complete this transaction.`
          : "You don't have enough USDT to complete this action."),
      primaryButtonText: 'Deposit Now',
      navigateToTab: 'deposit',
      secondaryButtonText: 'Cancel',
    });
  }

  showSuccessModal(title: string, message: string, primaryText = 'OK', onPrimary?: () => void) {
    this.showDialog({
      type: 'success',
      title,
      message,
      primaryButtonText: primaryText,
      primaryAction: onPrimary,
      secondaryButtonText: 'Close',
    });
  }

  showErrorModal(title: string, message: string, primaryText = 'Close') {
    this.showDialog({
      type: 'error',
      title,
      message,
      primaryButtonText: primaryText,
    });
  }

  showConfirmModal(title: string, message: string, onConfirm: () => void, confirmText = 'Confirm') {
    this.showDialog({
      type: 'confirm',
      title,
      message,
      primaryButtonText: confirmText,
      primaryAction: onConfirm,
      secondaryButtonText: 'Cancel',
    });
  }

  constructor() {
    this.calculateDailyProfits();
    this.checkEquipmentPowerEfficiency();
    setInterval(() => {
      this.calculateDailyProfits();
    }, 30000);
  }

  getAllUsers(): UserProfile[] {
    return this.allUsers;
  }

  // Initialize Firestore Listeners for current logged-in user
  initFirestoreSync(userOrUid: string | UserProfile) {
    const uid = typeof userOrUid === 'string' ? userOrUid : userOrUid.id;
    if (typeof userOrUid !== 'string') {
      this.user = { ...userOrUid };
      this.notify();
    } else if (!this.user.id) {
      this.user.id = uid;
      this.notify();
    }

    if (this.initializedUid === uid) return;
    this.initializedUid = uid;

    // 1. Sync User Document
    const userRef = doc(db, 'users', uid);
    onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const completedTaskIds: string[] = data.completedTaskIds || [];
          const firstDepositRewardClaimed = data.firstDepositRewardClaimed === true;
          const lastDailyLogin = data.lastDailyLogin || data.lastDailyCheckin || '';
          const nextDailyLogin = data.nextDailyLogin || '';
          const referralMilestonesClaimed: number[] = data.referralMilestonesClaimed || [];

          let userGiftId = data.giftId;
          if (!userGiftId && uid) {
            const cleanId = (data.telegramId || data.uid || uid).toString().replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            const code = cleanId.length >= 6 ? cleanId.slice(-6) : cleanId.padStart(6, '0');
            userGiftId = `AUR-${code}`;
            updateDoc(doc(db, 'users', uid), { giftId: userGiftId }).catch(() => {});
          }

          this.user = {
            id: uid,
            telegramId: data.telegramId || 0,
            username: data.username || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            photoUrl: data.photo || data.photoUrl || '',
            balance: data.balance ?? 0,
            coins: data.coins ?? 0,
            totalInvested: data.totalInvested ?? 0,
            totalEarned: data.totalEarned ?? 0,
            referralCode: data.referralCode || `25D-${uid.slice(-6)}`,
            referredBy: data.referredBy || '',
            referralCount: data.referralCount ?? 0,
            depositingReferralsCount: data.depositingReferralsCount ?? 0,
            referralMilestonesClaimed,
            referralEarnings: data.referralEarnings ?? 0,
            status: data.status || 'Active',
            isAdmin: data.isAdmin ?? false,
            createdAt: data.createdAt || new Date().toISOString(),
            lastDailyCheckin: lastDailyLogin,
            lastDailyLogin,
            nextDailyLogin,
            completedTaskIds,
            firstDepositRewardClaimed,
            giftId: userGiftId,
          };

          // Update task item completion states in local store
          const nowMs = Date.now();
          const lastLoginMs = lastDailyLogin ? new Date(lastDailyLogin).getTime() : 0;
          const isDailyLoginCooldown = lastLoginMs > 0 && (nowMs - lastLoginMs) < 24 * 60 * 60 * 1000;

          this.tasks = INITIAL_TASKS.map((t) => {
            if (t.id === 'task-1') {
              return { ...t, completed: isDailyLoginCooldown };
            }
            if (t.id === 'task-4') {
              return { ...t, completed: firstDepositRewardClaimed || completedTaskIds.includes(t.id) };
            }
            return { ...t, completed: completedTaskIds.includes(t.id) };
          });

          this.notify();
        }
      },
      (err) => console.warn('Firestore user snapshot notice:', err)
    );

    // 1b. Sync All Users Collection (for Admin panel)
    const allUsersRef = collection(db, 'users');
    onSnapshot(
      allUsersRef,
      (snap) => {
        const list: UserProfile[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const cleanUsername = (data.username || '').replace(/^@/, '').trim().toLowerCase();
          const cleanFirstName = (data.firstName || '').replace(/^@/, '').trim().toLowerCase();
          const isAdmin = data.isAdmin === true || cleanUsername === 'r5_s7' || cleanFirstName === 'r5_s7';

          let uGiftId = data.giftId;
          if (!uGiftId) {
            const cleanId = (data.telegramId || data.uid || d.id).toString().replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            const code = cleanId.length >= 6 ? cleanId.slice(-6) : cleanId.padStart(6, '0');
            uGiftId = `AUR-${code}`;
            updateDoc(doc(db, 'users', d.id), { giftId: uGiftId }).catch(() => {});
          }

          list.push({
            id: d.id,
            telegramId: data.telegramId || 0,
            username: data.username || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            photoUrl: data.photo || data.photoUrl || '',
            balance: data.balance ?? 0,
            coins: data.coins ?? 0,
            totalInvested: data.totalInvested ?? 0,
            totalEarned: data.totalEarned ?? 0,
            referralCode: data.referralCode || `25D-${d.id.slice(-6)}`,
            referredBy: data.referredBy || '',
            referralCount: data.referralCount ?? 0,
            depositingReferralsCount: data.depositingReferralsCount ?? 0,
            referralMilestonesClaimed: data.referralMilestonesClaimed || [],
            referralEarnings: data.referralEarnings ?? 0,
            status: data.status || 'Active',
            isAdmin: isAdmin,
            createdAt: data.createdAt || new Date().toISOString(),
            lastDailyCheckin: data.lastDailyCheckin,
            giftId: uGiftId,
          });
        });
        this.allUsers = list;
        this.notify();
      },
      (err) => console.warn('Firestore all users snapshot notice:', err)
    );

    // 2. Sync All Investments Collection (for Admin & global calculations)
    const allInvRef = collection(db, 'investments');
    onSnapshot(
      allInvRef,
      (snap) => {
        const list: Investment[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Investment, 'id'>) });
        });
        this.allInvestments = list;
        this.notify();
      },
      (err) => console.warn('Firestore allInvestments notice:', err)
    );

    // 2b. Sync Activity Logs Collection
    const logsRef = collection(db, 'activity_logs');
    onSnapshot(
      logsRef,
      (snap) => {
        const list: ActivityLogItem[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<ActivityLogItem, 'id'>) });
        });
        this.activityLogs = list.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.notify();
      },
      (err) => console.warn('Firestore activity_logs notice:', err)
    );

    // 2c. Sync Investments for Current User
    const invQ = query(collection(db, 'investments'), where('userId', '==', uid));
    onSnapshot(
      invQ,
      (snap) => {
        const list: Investment[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Investment, 'id'>) });
        });
        this.investments = list;
        this.calculateDailyProfits();
        this.notify();
      },
      (err) => console.warn('Firestore investments snapshot notice:', err)
    );

    // 3. Sync Deposits Collection (All for admin, user-specific for regular user)
    const depQ = collection(db, 'deposits');
    onSnapshot(
      depQ,
      (snap) => {
        const list: DepositRequest[] = [];
        snap.forEach((d) => {
          const data = d.data() as Omit<DepositRequest, 'id'>;
          if (this.user.isAdmin || data.userId === uid) {
            list.push({ id: d.id, ...data });
          }
        });
        this.deposits = list;
        this.notify();
      },
      (err) => console.warn('Firestore deposits snapshot notice:', err)
    );

    // 4. Sync Withdrawals Collection (All for admin, user-specific for regular user)
    const wdQ = collection(db, 'withdrawals');
    onSnapshot(
      wdQ,
      (snap) => {
        const list: WithdrawalRequest[] = [];
        snap.forEach((d) => {
          const data = d.data() as Omit<WithdrawalRequest, 'id'>;
          if (this.user.isAdmin || data.userId === uid) {
            list.push({ id: d.id, ...data });
          }
        });
        this.withdrawals = list;
        this.notify();
      },
      (err) => console.warn('Firestore withdrawals snapshot notice:', err)
    );

    // 5. Sync Notifications Collection
    const notifQ = query(collection(db, 'notifications'), where('userId', '==', uid));
    onSnapshot(
      notifQ,
      (snap) => {
        const list: AppNotification[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<AppNotification, 'id'>) });
        });
        if (list.length > 0) {
          this.notifications = list.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.notify();
        }
      },
      (err) => console.warn('Firestore notifications snapshot notice:', err)
    );

    // 5b. Sync Transactions Collection
    const txQ = query(collection(db, 'transactions'), where('userId', '==', uid));
    onSnapshot(
      txQ,
      (snap) => {
        const list: TransactionHistoryItem[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<TransactionHistoryItem, 'id'>) });
        });
        this.transactions = list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.notify();
      },
      (err) => console.warn('Firestore transactions snapshot notice:', err)
    );

    // 6. Sync Plans Collection
    const plansRef = collection(db, 'plans');
    onSnapshot(
      plansRef,
      (snap) => {
        if (!snap.empty) {
          const list: InvestmentPlan[] = [];
          snap.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as Omit<InvestmentPlan, 'id'>) });
          });
          this.plans = list;
          this.notify();
        } else {
          // Seed initial plans to Firestore
          INVESTMENT_PLANS.forEach((p) => {
            setDoc(doc(db, 'plans', p.id), p).catch((e) =>
              console.warn('Firestore seed plan notice:', e)
            );
          });
        }
      },
      (err) => console.warn('Firestore plans snapshot notice:', err)
    );

    // 7. Sync Wallets Collection
    const walletsRef = collection(db, 'wallets');
    onSnapshot(
      walletsRef,
      (snap) => {
        if (!snap.empty) {
          const list: DepositWallet[] = [];
          snap.forEach((d) => {
            const data = d.data() as Omit<DepositWallet, 'id'>;
            const initial = INITIAL_WALLETS.find((iw) => iw.id === d.id);
            if ((!data.walletAddress || data.walletAddress === '') && initial) {
              data.walletAddress = initial.walletAddress;
              data.qrImage = initial.qrImage;
              setDoc(doc(db, 'wallets', d.id), { ...data, walletAddress: initial.walletAddress, qrImage: initial.qrImage }, { merge: true });
            }
            list.push({ id: d.id, ...data });
          });
          this.wallets = list;
          this.notify();
        } else {
          // Seed initial wallets to Firestore
          INITIAL_WALLETS.forEach((w) => {
            setDoc(doc(db, 'wallets', w.id), w).catch((e) =>
              console.warn('Firestore seed wallet notice:', e)
            );
          });
          this.wallets = INITIAL_WALLETS;
          this.notify();
        }
      },
      (err) => console.warn('Firestore wallets snapshot notice:', err)
    );
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Getters
  getSettings() {
    return this.settings;
  }
  getUser() {
    return this.user;
  }
  getInvestments() {
    return this.investments;
  }
  getAllInvestments() {
    return this.allInvestments.length > 0 ? this.allInvestments : this.investments;
  }
  getActivityLogs() {
    return this.activityLogs;
  }
  getCopyTraders() {
    return COPY_TRADERS;
  }
  getCopyPositions() {
    return this.copyPositions;
  }
  getReferralMilestones() {
    return REFERRAL_MILESTONES;
  }
  getDeposits() {
    return this.deposits;
  }
  getWithdrawals() {
    return this.withdrawals;
  }
  getTasks() {
    return this.tasks;
  }
  getNotifications() {
    return this.notifications;
  }
  getTransactions() {
    return this.transactions;
  }
  getReferrals() {
    return this.referrals;
  }
  getLanguage() {
    return this.language;
  }
  getPlans() {
    return this.plans;
  }

  getWallets() {
    return this.wallets;
  }

  getWalletsByNetwork(network: NetworkType) {
    const active = this.wallets.filter((w) => w.network === network && w.enabled !== false && w.walletAddress && w.walletAddress.trim() !== '');
    if (active.length > 0) return active;
    return INITIAL_WALLETS.filter((w) => w.network === network && w.enabled !== false);
  }

  getRandomWalletForNetwork(network: NetworkType): DepositWallet | null {
    const active = this.getWalletsByNetwork(network);
    if (active.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * active.length);
    return active[randomIndex];
  }

  async updateWallet(id: string, data: Partial<DepositWallet>): Promise<void> {
    const walletRef = doc(db, 'wallets', id);
    await updateDoc(walletRef, data);
  }

  async createWallet(walletData: Omit<DepositWallet, 'id'>): Promise<DepositWallet> {
    const docRef = await addDoc(collection(db, 'wallets'), {
      ...walletData,
      createdAt: new Date().toISOString(),
    });
    const newWallet: DepositWallet = { id: docRef.id, ...walletData };
    return newWallet;
  }

  async deleteWallet(id: string): Promise<void> {
    await deleteDoc(doc(db, 'wallets', id));
  }

  setLanguage(lang: LanguageCode) {
    this.language = lang;
    this.notify();
  }

  async addTransaction(tx: Omit<TransactionHistoryItem, 'id'>): Promise<TransactionHistoryItem | undefined> {
    const txData = {
      ...tx,
      createdAt: tx.createdAt || new Date().toISOString(),
    };
    try {
      const docRef = await addDoc(collection(db, 'transactions'), txData);
      const newTx = { id: docRef.id, ...txData };
      if (tx.userId === this.user.id || this.user.isAdmin) {
        this.transactions = [newTx, ...this.transactions.filter((t) => t.id !== newTx.id)].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.notify();
      }
      return newTx;
    } catch (e) {
      console.error('Error adding transaction to Firestore:', e);
    }
  }

  // Calculation helpers
  async calculateDailyProfits() {
    const nowMs = Date.now();

    for (const inv of this.investments) {
      if (inv.status !== 'Active') continue;

      // Handle Gift Mining Rigs separately (24h promotional machine)
      if (inv.isGift) {
        const invStartMs = inv.investmentStartTime ? new Date(inv.investmentStartTime).getTime() : new Date(inv.startDate).getTime();
        const durationHours = inv.durationHours || 24;
        const endMs = inv.endTimeIso ? new Date(inv.endTimeIso).getTime() : invStartMs + durationHours * 3600 * 1000;

        if (nowMs >= endMs) {
          const giftPayout = parseFloat((inv.amount * (inv.dailyPercent / 100) * (durationHours / 24)).toFixed(2));
          inv.status = 'Completed';
          inv.daysElapsed = 1;
          inv.claimedProfit = giftPayout;
          inv.unclaimedProfit = 0;

          await updateDoc(doc(db, 'investments', inv.id), {
            status: 'Completed',
            claimedProfit: giftPayout,
            unclaimedProfit: 0,
            daysElapsed: 1,
          }).catch(() => {});

          if (inv.giftMiningId) {
            updateDoc(doc(db, 'gift_history', inv.giftMiningId), {
              status: 'COMPLETED',
              rewardEarned: giftPayout,
            }).catch(() => {});
          }

          this.user.balance = parseFloat((this.user.balance + giftPayout).toFixed(2));
          this.user.totalEarned = parseFloat(((this.user.totalEarned || 0) + giftPayout).toFixed(2));
          await this.syncUserToFirestore();

          // Check if transaction already exists for this gift reward
          const existingTx = this.transactions.find(
            (t) => t.type === 'Gift Mining Reward' && (t.description.includes(inv.giftMiningId || '') || t.description.includes(inv.id))
          );

          if (!existingTx) {
            await this.addTransaction({
              userId: inv.userId,
              type: 'Gift Mining Reward',
              amount: giftPayout,
              currency: 'USDT',
              status: 'Completed',
              description: `🎁 Gift Mining Reward from ${inv.planName} (${inv.giftMiningId || inv.id})`,
              createdAt: new Date().toISOString(),
            });

            await this.addNotification({
              title: '🎁 Gift Mining Completed!',
              message: `Your ${inv.amount} USDT Gift Mining machine has completed! +${giftPayout.toFixed(2)} USDT credited to your balance.`,
              type: 'investment',
            });
          }
        }
        continue;
      }

      const duration = inv.durationDays || 30;
      if (inv.daysElapsed >= duration) {
        if (inv.status === 'Active') {
          inv.status = 'Completed';
          updateDoc(doc(db, 'investments', inv.id), { status: 'Completed' }).catch(() => {});
        }
        continue;
      }

      const invStartMs = inv.investmentStartTime ? new Date(inv.investmentStartTime).getTime() : new Date(inv.startDate).getTime();
      const lastProfitMs = inv.lastProfitTime ? new Date(inv.lastProfitTime).getTime() : invStartMs;
      const nextProfitMs = inv.nextProfitTime ? new Date(inv.nextProfitTime).getTime() : (lastProfitMs + 24 * 60 * 60 * 1000);

      // Profit is ONLY generated when now >= nextProfitMs (strictly 24 hours after lastProfitTime)
      if (nowMs < nextProfitMs) {
        continue;
      }

      const timeDiffMs = nowMs - lastProfitMs;
      const full24hCycles = Math.floor(timeDiffMs / (24 * 60 * 60 * 1000));
      const remainingCyclesAllowed = duration - inv.daysElapsed;
      const cyclesToProcess = Math.min(full24hCycles, remainingCyclesAllowed);

      if (cyclesToProcess <= 0) continue;

      // Daily mining reward in USDT: amount * (dailyPercent / 100)
      const dailyUsdtProfit = parseFloat((inv.amount * (inv.dailyPercent / 100)).toFixed(2));
      const totalUsdtPayout = parseFloat((dailyUsdtProfit * cyclesToProcess).toFixed(2));

      const newDaysElapsed = inv.daysElapsed + cyclesToProcess;
      const newLastProfitMs = lastProfitMs + (cyclesToProcess * 24 * 60 * 60 * 1000);
      const newLastProfitIso = new Date(newLastProfitMs).toISOString();
      const newNextProfitIso = new Date(newLastProfitMs + 24 * 60 * 60 * 1000).toISOString();
      const isCompleted = newDaysElapsed >= duration;
      const newClaimedProfit = parseFloat(((inv.claimedProfit || 0) + totalUsdtPayout).toFixed(2));

      // Update in-memory investment object
      inv.daysElapsed = newDaysElapsed;
      inv.claimedProfit = newClaimedProfit;
      inv.unclaimedProfit = 0;
      inv.lastProfitTime = newLastProfitIso;
      inv.nextProfitTime = newNextProfitIso;
      inv.lastAccrualDate = newLastProfitIso;
      if (isCompleted) {
        inv.status = 'Completed';
      }

      const invUpdates: Partial<Investment> = {
        daysElapsed: newDaysElapsed,
        claimedProfit: newClaimedProfit,
        unclaimedProfit: 0,
        lastProfitTime: newLastProfitIso,
        nextProfitTime: newNextProfitIso,
        lastAccrualDate: newLastProfitIso,
        status: isCompleted ? 'Completed' : 'Active',
      };

      try {
        await updateDoc(doc(db, 'investments', inv.id), invUpdates);

        // Credit USDT rewards directly to user's USDT Wallet balance
        this.user.balance = parseFloat((this.user.balance + totalUsdtPayout).toFixed(2));
        this.user.totalEarned = parseFloat(((this.user.totalEarned || 0) + totalUsdtPayout).toFixed(2));

        // Capital returned in USDT if completed
        if (isCompleted) {
          this.user.balance = parseFloat((this.user.balance + inv.amount).toFixed(2));
        }

        await this.syncUserToFirestore();

        for (let c = 1; c <= cyclesToProcess; c++) {
          const cycleDayNumber = inv.daysElapsed - cyclesToProcess + c;
          await this.addTransaction({
            userId: inv.userId,
            type: 'Mining Reward',
            amount: dailyUsdtProfit,
            currency: 'USDT',
            status: 'Completed',
            description: `+$${dailyUsdtProfit.toFixed(2)} USDT Mining Reward from ${inv.planName} (Day ${cycleDayNumber}/${duration})`,
            createdAt: new Date(lastProfitMs + c * 24 * 60 * 60 * 1000).toISOString(),
          });
        }

        await this.addNotification({
          title: 'Mining Reward Credited! ⛏️',
          message: `+$${totalUsdtPayout.toFixed(2)} USDT daily mining profit credited to your USDT Wallet from ${inv.planName}.`,
          type: 'profit',
        });

        if (isCompleted) {
          await this.addTransaction({
            userId: inv.userId,
            type: 'Capital Returned',
            amount: inv.amount,
            currency: 'USDT',
            status: 'Completed',
            description: `Capital returned from completed plan ${inv.planName} ($${inv.amount} USDT)`,
            createdAt: newNextProfitIso,
          });

          await this.addTransaction({
            userId: inv.userId,
            type: 'Plan Expired',
            amount: 0,
            currency: 'USDT',
            status: 'Completed',
            description: `Plan ${inv.planName} completed after ${duration} days`,
            createdAt: newNextProfitIso,
          });

          await this.addNotification({
            title: 'Plan Completed & Capital Returned! 🎓',
            message: `Your plan ${inv.planName} finished ${duration} days. Capital of $${inv.amount} USDT returned to your wallet balance.`,
            type: 'investment',
          });
        }
      } catch (e) {
        console.error('Error updating daily profit in Firestore:', e);
      }
    }

    this.notify();
  }

  // Cloud Mining Always Online Engine
  checkEquipmentPowerEfficiency() {
    this.investments.forEach((inv) => {
      if (inv.status === 'Active') {
        inv.powerEfficiencyPercent = 100;
        inv.maintenanceStatus = 'Optimal';
        inv.temperatureCelsius = 60;
        inv.fanRpm = 3200;
        inv.dustLevelPercent = 0;
      }
    });
  }

  async syncUserToFirestore() {
    if (!this.user.id) return;
    try {
      const userRef = doc(db, 'users', this.user.id);
      await setDoc(
        userRef,
        {
          telegramId: this.user.telegramId,
          username: this.user.username,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          photoUrl: this.user.photoUrl || '',
          photo: this.user.photoUrl || '',
          balance: this.user.balance,
          coins: this.user.coins,
          totalInvested: this.user.totalInvested,
          totalEarned: this.user.totalEarned,
          status: this.user.status,
          isAdmin: this.user.isAdmin ?? false,
          lastDailyCheckin: this.user.lastDailyLogin || this.user.lastDailyCheckin || '',
          lastDailyLogin: this.user.lastDailyLogin || '',
          nextDailyLogin: this.user.nextDailyLogin || '',
          completedTaskIds: Array.from(new Set(this.user.completedTaskIds || [])),
          firstDepositRewardClaimed: this.user.firstDepositRewardClaimed || false,
          referralMilestonesClaimed: this.user.referralMilestonesClaimed || [],
          giftId: this.user.giftId || (this.user.id ? `AUR-${this.user.id.slice(-6).toUpperCase()}` : 'AUR-8F4K2M'),
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error('Error syncing user to Firestore:', e);
    }
  }

  performEquipmentMaintenance(investmentId: string): {
    success: boolean;
    message: string;
    restoredPlanName: string;
    cost: number;
  } {
    const inv = this.investments.find((i) => i.id === investmentId);
    if (!inv) {
      return {
        success: false,
        message: 'Mining rig not found!',
        restoredPlanName: '',
        cost: 0,
      };
    }

    inv.powerEfficiencyPercent = 100;
    inv.maintenanceStatus = 'Optimal';
    inv.temperatureCelsius = 60;
    inv.fanRpm = 3200;
    inv.dustLevelPercent = 0;
    inv.lastMaintenanceDate = new Date().toISOString();

    this.notify();

    return {
      success: true,
      message: `Mining rig ${inv.planName} is operating at 100% peak efficiency and is fully online!`,
      restoredPlanName: inv.planName,
      cost: 0,
    };
  }

  // User Actions
  claimAllProfits(): number {
    let totalClaimed = 0;

    this.investments = this.investments.map((inv) => {
      if (inv.status === 'Active' && inv.unclaimedProfit > 0) {
        totalClaimed += inv.unclaimedProfit;
        const newClaimed = inv.claimedProfit + inv.unclaimedProfit;
        const isCompleted = newClaimed >= inv.totalExpectedReturn;

        return {
          ...inv,
          claimedProfit: newClaimed,
          unclaimedProfit: 0,
          status: isCompleted ? 'Completed' : 'Active',
        };
      }
      return inv;
    });

    if (totalClaimed > 0) {
      this.user.balance = parseFloat((this.user.balance + totalClaimed).toFixed(2));
      this.user.totalEarned = parseFloat((this.user.totalEarned + totalClaimed).toFixed(2));

      this.syncUserToFirestore();

      this.addNotification({
        title: 'Profit Claimed! 💰',
        message: `Successfully claimed +${totalClaimed.toFixed(2)} USDT to your main balance.`,
        type: 'profit',
      });
    }

    return totalClaimed;
  }

  swapUsdtAndAurex(fromType: 'USDT' | 'AUX', amount: number): { success: boolean; message: string } {
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, message: 'Please enter a valid positive swap amount.' };
    }

    if (fromType === 'USDT') {
      if (this.user.balance < amount) {
        return { success: false, message: `Insufficient USDT balance ($${this.user.balance.toFixed(2)} USDT available).` };
      }
      const aurexGained = Math.floor(amount * 100);
      this.user.balance = parseFloat((this.user.balance - amount).toFixed(2));
      this.user.coins += aurexGained;

      this.syncUserToFirestore();

      this.addTransaction({
        userId: this.user.id,
        type: 'Transfer',
        amount,
        currency: 'USDT',
        status: 'Completed',
        description: `Swapped $${amount.toFixed(2)} USDT for ${aurexGained.toLocaleString()} AUX (Aurex Token)`,
        createdAt: new Date().toISOString(),
      });

      this.addNotification({
        title: 'Swap Successful! ⚡',
        message: `Swapped $${amount.toFixed(2)} USDT ➔ ${aurexGained.toLocaleString()} AUX.`,
        type: 'system',
      });

      this.notify();
      return { success: true, message: `Successfully swapped $${amount.toFixed(2)} USDT to ${aurexGained.toLocaleString()} AUX!` };
    } else {
      if (this.user.coins < amount) {
        return { success: false, message: `Insufficient AUX balance (${this.user.coins.toLocaleString()} AUX available).` };
      }
      const usdtGained = parseFloat((amount / 100).toFixed(2));
      this.user.coins -= amount;
      this.user.balance = parseFloat((this.user.balance + usdtGained).toFixed(2));

      this.syncUserToFirestore();

      this.addTransaction({
        userId: this.user.id,
        type: 'Transfer',
        amount: usdtGained,
        currency: 'USDT',
        status: 'Completed',
        description: `Swapped ${amount.toLocaleString()} AUX for $${usdtGained.toFixed(2)} USDT`,
        createdAt: new Date().toISOString(),
      });

      this.addNotification({
        title: 'Swap Successful! ⚡',
        message: `Swapped ${amount.toLocaleString()} AUX ➔ $${usdtGained.toFixed(2)} USDT.`,
        type: 'system',
      });

      this.notify();
      return { success: true, message: `Successfully swapped ${amount.toLocaleString()} AUX to $${usdtGained.toFixed(2)} USDT!` };
    }
  }

  async createInvestment(
    planId: string,
    planName: string,
    amount: number,
    dailyPercent: number
  ): Promise<{ success: boolean; message: string }> {
    if (this.user.balance < amount) {
      return { success: false, message: 'Insufficient USDT balance! Please deposit funds.' };
    }

    const chosenPlan = this.plans.find((p) => p.id === planId);
    const durationDays = chosenPlan?.durationDays || 30;
    const dailyYield = parseFloat(((amount * dailyPercent) / 100).toFixed(2));
    const totalExpected = parseFloat((dailyYield * durationDays).toFixed(2));
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    const nextProfitIso = new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();

    const newInv: Omit<Investment, 'id'> = {
      userId: this.user.id,
      planId,
      planName,
      amount,
      dailyPercent,
      dailyYieldUsdt: dailyYield,
      totalExpectedReturn: totalExpected,
      daysElapsed: 0,
      durationDays,
      startDate: nowIso,
      lastAccrualDate: nowIso,
      investmentStartTime: nowIso,
      lastProfitTime: nowIso,
      nextProfitTime: nextProfitIso,
      claimedProfit: 0,
      unclaimedProfit: 0,
      status: 'Active',
      powerEfficiencyPercent: 100,
      maintenanceStatus: 'Optimal',
      temperatureCelsius: 60,
      fanRpm: 3200,
      dustLevelPercent: 0,
    };

    try {
      const docRef = await addDoc(collection(db, 'investments'), newInv);
      this.user.balance = parseFloat((this.user.balance - amount).toFixed(2));
      this.user.totalInvested = parseFloat((this.user.totalInvested + amount).toFixed(2));

      await this.syncUserToFirestore();

      await this.addTransaction({
        userId: this.user.id,
        type: 'Investment',
        amount: amount,
        currency: 'USDT',
        status: 'Completed',
        description: `Activated plan ${planName} ($${amount} USDT)`,
        createdAt: nowIso,
      });

      this.addNotification({
        title: 'New Plan Activated! 🎉',
        message: `You successfully invested ${amount} USDT in ${planName}.`,
        type: 'investment',
      });

      return { success: true, message: `Investment of ${amount} USDT activated!` };
    } catch (e: any) {
      console.error('Error creating investment:', e);
      return { success: false, message: e.message };
    }
  }

  async createDeposit(
    amount: number,
    network: NetworkType,
    walletAddress?: string,
    imageProof?: string,
    txHash?: string
  ): Promise<DepositRequest> {
    const depData = {
      userId: this.user.id,
      username: this.user.username,
      amount,
      network,
      walletAddress: walletAddress || '',
      imageProof: imageProof || '',
      txHash:
        txHash ||
        `0x${Math.random().toString(16).slice(2, 18)}${Math.random().toString(16).slice(2, 18)}`,
      status: 'Pending' as const,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'deposits'), depData);

    this.addNotification({
      title: 'Deposit Submitted 📥',
      message: `Your deposit request of $${amount} via ${network} is pending admin verification.`,
      type: 'deposit',
    });

    return { id: docRef.id, ...depData };
  }

  async createWithdrawal(
    amount: number,
    network: 'TRC20' | 'BEP20' | 'TON',
    address: string
  ): Promise<{ success: boolean; message: string }> {
    if (amount < this.settings.minWithdrawal) {
      return {
        success: false,
        message: `Minimum withdrawal amount is ${this.settings.minWithdrawal} USDT.`,
      };
    }

    if (this.user.balance < amount) {
      return { success: false, message: 'Insufficient wallet balance for withdrawal!' };
    }

    let fee = 0;
    if (network === 'TRC20') {
      fee = 2.0;
    } else if (network === 'TON') {
      fee = 0.5;
    } else {
      fee = parseFloat(((amount * (this.settings.withdrawalFeePercent || 5.0)) / 100).toFixed(2));
    }

    if (amount <= fee) {
      return { success: false, message: `Amount must be greater than network fee ($${fee} USDT).` };
    }

    const netAmount = parseFloat((amount - fee).toFixed(2));

    const wdData = {
      userId: this.user.id,
      username: this.user.username,
      amount,
      fee,
      netAmount,
      network,
      address,
      status: 'Pending' as const,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'withdrawals'), wdData);

      this.user.balance = parseFloat((this.user.balance - amount).toFixed(2));
      await this.syncUserToFirestore();

      await this.addTransaction({
        userId: this.user.id,
        type: 'Withdrawal',
        amount: amount,
        currency: 'USDT',
        status: 'Pending',
        description: `Withdrawal request of $${amount} USDT (${netAmount} USDT net via ${network})`,
        createdAt: wdData.createdAt,
      });

      this.addNotification({
        title: 'Withdrawal Requested 📤',
        message: `Your withdrawal request of ${amount} USDT (${netAmount} USDT net) is pending processing.`,
        type: 'withdrawal',
      });

      return {
        success: true,
        message: `Withdrawal request for ${amount} USDT submitted successfully!`,
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  completeTask(taskId: string): { success: boolean; reward: number; message: string } {
    if (taskId === 'task-1') {
      return this.dailyCheckin();
    }

    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return { success: false, reward: 0, message: 'Task not found' };

    const completedIds = this.user.completedTaskIds || [];
    if (task.completed || completedIds.includes(taskId)) {
      return { success: false, reward: 0, message: 'Task already completed' };
    }

    // Task 4: Complete First Deposit verification
    if (taskId === 'task-4' || task.title.toLowerCase().includes('first deposit')) {
      if (this.user.firstDepositRewardClaimed) {
        return { success: false, reward: 0, message: 'First deposit reward already claimed!' };
      }

      const hasApprovedDeposit = this.deposits.some(
        (d) =>
          (d.userId === this.user.id || d.username === this.user.username) &&
          d.status === 'Approved' &&
          d.amount > 0
      );

      if (!hasApprovedDeposit) {
        return {
          success: false,
          reward: 0,
          message: 'First deposit required! Please complete your deposit and wait for admin approval to claim 50 AUREX.',
        };
      }

      this.user.firstDepositRewardClaimed = true;
    }

    task.completed = true;
    if (!this.user.completedTaskIds) this.user.completedTaskIds = [];
    if (!this.user.completedTaskIds.includes(taskId)) {
      this.user.completedTaskIds.push(taskId);
    }

    this.user.coins += task.rewardCoins;
    this.syncUserToFirestore();

    this.addNotification({
      title: 'Task Completed! 🏆',
      message: `You earned +${task.rewardCoins} AUX for "${task.title}".`,
      type: 'task',
    });

    this.notify();
    return { success: true, reward: task.rewardCoins, message: `Earned +${task.rewardCoins} AUX!` };
  }

  async dailyCheckinAsync(): Promise<{ success: boolean; reward: number; message: string; isBonusDay?: boolean; streak?: number }> {
    try {
      const res = await fetch('/api/tasks/claim-daily-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ userId: this.user.id }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, reward: 0, message: `Server returned non-JSON format (HTTP ${res.status})` };
      }
      const data = await res.json();
      if (data.success) {
        if (data.newCoins !== undefined) {
          this.user.coins = data.newCoins;
        }
        this.user.loginStreak = data.streak;
        this.user.currentLoginDay = data.currentLoginDay;
        this.user.lastDailyLogin = data.lastLoginRewardTime;
        this.user.nextDailyLogin = data.nextLoginRewardTime;
        if (!this.user.completedTaskIds) this.user.completedTaskIds = [];
        if (!this.user.completedTaskIds.includes('task-1')) {
          this.user.completedTaskIds.push('task-1');
        }
        const dailyTask = this.tasks.find((t) => t.id === 'task-1');
        if (dailyTask) dailyTask.completed = true;
        this.notify();
        return {
          success: true,
          reward: data.rewardAmount,
          message: data.message,
          isBonusDay: data.isBonusDay,
          streak: data.streak,
        };
      } else {
        return {
          success: false,
          reward: 0,
          message: data.message || 'Daily Login claim failed.',
        };
      }
    } catch (err: any) {
      console.error('Error in dailyCheckinAsync:', err);
      // Fallback to client check if offline or server error
      return this.dailyCheckin();
    }
  }

  async checkReferralDepositStatus(): Promise<{ success: boolean; completed: boolean; totalQualifying?: number }> {
    if (!this.user.id) return { success: false, completed: false };
    try {
      const res = await fetch('/api/tasks/referral-deposit-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ userId: this.user.id }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, completed: false };
      }
      const data = await res.json();
      return {
        success: data.success ?? false,
        completed: data.completed ?? false,
        totalQualifying: data.totalQualifyingReferrals ?? 0,
      };
    } catch (err) {
      return { success: false, completed: false };
    }
  }

  dailyCheckin(): { success: boolean; reward: number; message: string } {
    const lastTimeStr = this.user.lastDailyLogin || this.user.lastDailyCheckin;
    const lastTime = lastTimeStr ? new Date(lastTimeStr).getTime() : 0;
    const now = Date.now();
    const total24h = 24 * 60 * 60 * 1000;
    const total48h = 48 * 60 * 60 * 1000;

    if (lastTime > 0 && (now - lastTime) < total24h) {
      const remainingMs = total24h - (now - lastTime);
      const hrs = Math.floor(remainingMs / (3600 * 1000));
      const mins = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
      return {
        success: false,
        reward: 0,
        message: `Daily Login reward is available once every 24 hours. Please wait ${hrs}h ${mins}m.`,
      };
    }

    // Determine current streak
    let currentStreak = this.user.loginStreak || 0;
    // If missed a day (time > 48h since last claim), reset streak to 1
    if (lastTime > 0 && (now - lastTime) > total48h) {
      currentStreak = 0;
    }

    currentStreak = (currentStreak % 30) + 1;

    // 30-Day Rewards Schedule
    const DAILY_REWARDS_30 = [
      3, 3, 3, 3, 20,
      3, 3, 3, 3, 50,
      3, 3, 3, 3, 3, 3, 3, 3, 3, 100,
      3, 3, 3, 3, 3, 3, 3, 3, 3, 250
    ];

    const rewardAur = DAILY_REWARDS_30[currentStreak - 1] || 3;
    this.user.coins = (this.user.coins || 0) + rewardAur;
    this.user.loginStreak = currentStreak;

    const nowIso = new Date(now).toISOString();
    const nextIso = new Date(now + total24h).toISOString();

    this.user.lastDailyLogin = nowIso;
    this.user.lastDailyCheckin = nowIso;
    this.user.nextDailyLogin = nextIso;

    if (!this.user.completedTaskIds) this.user.completedTaskIds = [];
    if (!this.user.completedTaskIds.includes('task-1')) {
      this.user.completedTaskIds.push('task-1');
    }

    const dailyTask = this.tasks.find((t) => t.id === 'task-1');
    if (dailyTask) {
      dailyTask.completed = true;
    }

    this.syncUserToFirestore();

    this.addTransaction({
      userId: this.user.id,
      type: 'Bonus',
      amount: rewardAur,
      currency: 'AUR',
      status: 'Completed',
      description: `30-Day Login Reward (Day ${currentStreak}/30 - +${rewardAur} AUR)`,
      createdAt: nowIso,
    });

    this.addNotification({
      title: '30-Day Login Reward Claimed! ⭐',
      message: `Day ${currentStreak} bonus (+${rewardAur} AUR) credited to your AUR Wallet.`,
      type: 'task',
    });

    this.notify();
    return { success: true, reward: rewardAur, message: `Day ${currentStreak} Bonus Claimed (+${rewardAur} AUR)!` };
  }

  // Admin Activity Logging & Store Actions
  async logActivity(action: string, details: string) {
    const logItem: Omit<ActivityLogItem, 'id'> = {
      action,
      details,
      adminId: this.user.telegramId ? String(this.user.telegramId) : this.user.id,
      timestamp: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, 'activity_logs'), logItem);
    } catch (e) {
      console.warn('Error logging activity:', e);
    }
  }

  async deleteUser(targetUserId: string) {
    try {
      const userRef = doc(db, 'users', targetUserId);
      await deleteDoc(userRef);
      await this.logActivity('DELETE_USER', `Deleted user account ID: ${targetUserId}`);
      this.notify();
    } catch (e) {
      console.error('Error deleting user:', e);
    }
  }

  async addUserBalance(targetUserId: string, amount: number, note?: string) {
    const target = this.allUsers.find((u) => u.id === targetUserId || u.telegramId === Number(targetUserId));
    if (!target) return;
    const newBal = parseFloat(((target.balance || 0) + amount).toFixed(2));
    await this.updateUserBalance(newBal, target.coins, target.id);
    await this.logActivity('ADD_BALANCE', `Added $${amount} USDT to @${target.username || target.telegramId}. ${note || ''}`);
    await this.sendNotificationToUser(target.id, 'Balance Credited 💰', `Admin credited +$${amount} USDT to your wallet balance.`, 'system');
  }

  async removeUserBalance(targetUserId: string, amount: number, note?: string) {
    const target = this.allUsers.find((u) => u.id === targetUserId || u.telegramId === Number(targetUserId));
    if (!target) return;
    const newBal = Math.max(0, parseFloat(((target.balance || 0) - amount).toFixed(2)));
    await this.updateUserBalance(newBal, target.coins, target.id);
    await this.logActivity('REMOVE_BALANCE', `Deducted $${amount} USDT from @${target.username || target.telegramId}. ${note || ''}`);
    await this.sendNotificationToUser(target.id, 'Balance Deducted ⚠️', `Admin deducted $${amount} USDT from your wallet balance.`, 'system');
  }

  async updateInvestment(invId: string, partial: Partial<Investment>) {
    try {
      const invRef = doc(db, 'investments', invId);
      await updateDoc(invRef, partial);
      await this.logActivity('UPDATE_MINING', `Updated mining rig ${invId}: ${JSON.stringify(partial)}`);
    } catch (e) {
      console.error('Error updating investment:', e);
    }
  }

  async deleteInvestment(invId: string) {
    try {
      const invRef = doc(db, 'investments', invId);
      await deleteDoc(invRef);
      await this.logActivity('DELETE_MINING', `Deleted mining rig ID: ${invId}`);
    } catch (e) {
      console.error('Error deleting investment:', e);
    }
  }

  async createPlan(planData: Omit<InvestmentPlan, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'plans'), planData);
      await this.logActivity('CREATE_PLAN', `Created investment package: ${planData.name}`);
      return { id: docRef.id, ...planData };
    } catch (e: any) {
      console.error('Error creating plan:', e);
      throw e;
    }
  }

  async updatePlan(id: string, partial: Partial<InvestmentPlan>) {
    try {
      const planRef = doc(db, 'plans', id);
      await updateDoc(planRef, partial);
      await this.logActivity('UPDATE_PLAN', `Updated investment package ${id}`);
    } catch (e) {
      console.error('Error updating plan:', e);
    }
  }

  async deletePlan(id: string) {
    try {
      const planRef = doc(db, 'plans', id);
      await deleteDoc(planRef);
      await this.logActivity('DELETE_PLAN', `Deleted investment package ID: ${id}`);
    } catch (e) {
      console.error('Error deleting plan:', e);
    }
  }

  async sendNotificationToUser(targetUserId: string, title: string, message: string, type: any = 'system') {
    const notif = {
      userId: targetUserId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, 'notifications'), notif);
      await this.logActivity('SEND_NOTIFICATION', `Sent notification "${title}" to user ${targetUserId}`);
    } catch (e) {
      console.error('Error sending notification to user:', e);
    }
  }

  // Admin Actions
  async approveDeposit(depositId: string) {
    const dep = this.deposits.find((d) => d.id === depositId);
    if (!dep || dep.status !== 'Pending') return;

    dep.status = 'Approved';
    dep.processedAt = new Date().toISOString();

    try {
      const depRef = doc(db, 'deposits', depositId);
      await updateDoc(depRef, { status: 'Approved', processedAt: dep.processedAt });

      if (dep.userId === this.user.id) {
        this.user.balance = parseFloat((this.user.balance + dep.amount).toFixed(2));
        
        // Auto-grant first deposit reward if deposit > 0 and not claimed before
        const depositTask = this.tasks.find(t => t.id === 'task-4' || t.title.toLowerCase().includes('first deposit'));
        if (!this.user.firstDepositRewardClaimed && dep.amount > 0) {
          if (depositTask) depositTask.completed = true;
          this.user.firstDepositRewardClaimed = true;
          if (!this.user.completedTaskIds) this.user.completedTaskIds = [];
          if (!this.user.completedTaskIds.includes('task-4')) {
            this.user.completedTaskIds.push('task-4');
          }
          this.user.coins += 50; // 50 AUX reward
          this.addNotification({
            title: 'Task Completed! 🏆',
            message: `You earned +50 AUX for "Complete First Deposit".`,
            type: 'task',
          });
        }
        this.syncUserToFirestore();

        // Increment referrer's depositing count if user was referred by someone
        if (this.user.referredBy) {
          this.updateReferrerDepositingCount(this.user.referredBy);
        }
      } else {
        const targetUserRef = doc(db, 'users', dep.userId);
        const targetSnap = await getDoc(targetUserRef);
        if (targetSnap.exists()) {
          const tData = targetSnap.data();
          const currentBal = tData.balance ?? 0;
          const currentCoins = tData.coins ?? 0;
          const isClaimed = tData.firstDepositRewardClaimed === true;
          const completedTasks: string[] = tData.completedTaskIds || [];

          let newCoins = currentCoins;
          let newClaimed = isClaimed;

          if (!isClaimed && dep.amount > 0) {
            newCoins += 50;
            newClaimed = true;
            if (!completedTasks.includes('task-4')) {
              completedTasks.push('task-4');
            }
          }

          await updateDoc(targetUserRef, {
            balance: parseFloat((currentBal + dep.amount).toFixed(2)),
            coins: newCoins,
            firstDepositRewardClaimed: newClaimed,
            completedTaskIds: completedTasks,
          });

          if (tData.referredBy) {
            this.updateReferrerDepositingCount(tData.referredBy);
          }
        }
      }

      await this.addTransaction({
        userId: dep.userId,
        type: 'Deposit',
        amount: dep.amount,
        currency: 'USDT',
        status: 'Approved',
        description: `Deposit of $${dep.amount} USDT approved (${dep.network})`,
        createdAt: dep.processedAt,
      });

      await this.logActivity('APPROVE_DEPOSIT', `Approved deposit of $${dep.amount} USDT for user ${dep.username || dep.userId}`);

      this.addNotification({
        title: 'Deposit Approved! ✅',
        message: `Your deposit of ${dep.amount} USDT has been verified and credited to your balance.`,
        type: 'deposit',
      });
    } catch (e) {
      console.error('Error approving deposit in Firestore:', e);
    }
  }

  async updateReferrerDepositingCount(referrerCodeOrId: string) {
    if (!referrerCodeOrId) return;
    try {
      let refDocId: string | null = null;
      let currentCount = 0;

      const referrer = this.allUsers.find(
        (u) =>
          u.referralCode === referrerCodeOrId ||
          u.id === referrerCodeOrId ||
          String(u.telegramId) === referrerCodeOrId
      );

      if (referrer) {
        refDocId = referrer.id;
        currentCount = referrer.depositingReferralsCount || 0;
      } else {
        const q = query(
          collection(db, 'users'),
          where('referralCode', '==', referrerCodeOrId)
        );
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          refDocId = qSnap.docs[0].id;
          currentCount = qSnap.docs[0].data().depositingReferralsCount || 0;
        }
      }

      if (refDocId) {
        const refUserRef = doc(db, 'users', refDocId);
        await updateDoc(refUserRef, {
          depositingReferralsCount: currentCount + 1,
        });

        if (this.user.id === refDocId) {
          this.user.depositingReferralsCount = currentCount + 1;
          this.notify();
        }
      }
    } catch (e) {
      console.warn('Error updating referrer depositing count:', e);
    }
  }

  async rejectDeposit(depositId: string) {
    const dep = this.deposits.find((d) => d.id === depositId);
    if (!dep || dep.status !== 'Pending') return;

    dep.status = 'Rejected';
    dep.processedAt = new Date().toISOString();

    try {
      const depRef = doc(db, 'deposits', depositId);
      await updateDoc(depRef, { status: 'Rejected', processedAt: dep.processedAt });

      this.addNotification({
        title: 'Deposit Rejected ❌',
        message: `Deposit of ${dep.amount} USDT was rejected. Please verify transaction details.`,
        type: 'deposit',
      });
    } catch (e) {
      console.error('Error rejecting deposit:', e);
    }
  }

  async approveWithdrawal(withdrawalId: string) {
    const wd = this.withdrawals.find((w) => w.id === withdrawalId);
    if (!wd || wd.status !== 'Pending') return;

    wd.status = 'Approved';
    wd.processedAt = new Date().toISOString();

    try {
      const wdRef = doc(db, 'withdrawals', withdrawalId);
      await updateDoc(wdRef, { status: 'Approved', processedAt: wd.processedAt });

      this.addNotification({
        title: 'Withdrawal Sent! 🚀',
        message: `Your withdrawal of ${wd.netAmount} USDT (${wd.network}) has been processed.`,
        type: 'withdrawal',
      });
    } catch (e) {
      console.error('Error approving withdrawal:', e);
    }
  }

  async rejectWithdrawal(withdrawalId: string) {
    const wd = this.withdrawals.find((w) => w.id === withdrawalId);
    if (!wd || wd.status !== 'Pending') return;

    wd.status = 'Rejected';
    wd.processedAt = new Date().toISOString();

    try {
      const wdRef = doc(db, 'withdrawals', withdrawalId);
      await updateDoc(wdRef, { status: 'Rejected', processedAt: wd.processedAt });

      if (wd.userId === this.user.id) {
        this.user.balance = parseFloat((this.user.balance + wd.amount).toFixed(2));
        this.syncUserToFirestore();
      } else {
        const targetUserRef = doc(db, 'users', wd.userId);
        const targetSnap = await getDoc(targetUserRef);
        if (targetSnap.exists()) {
          const currentBal = targetSnap.data().balance ?? 0;
          await updateDoc(targetUserRef, { balance: parseFloat((currentBal + wd.amount).toFixed(2)) });
        }
      }

      this.addNotification({
        title: 'Withdrawal Rejected ❌',
        message: `Withdrawal request for ${wd.amount} USDT was rejected and refunded to your balance.`,
        type: 'withdrawal',
      });
    } catch (e) {
      console.error('Error rejecting withdrawal:', e);
    }
  }

  async updateUserBalance(newUsdt: number, newCoins: number, targetUserId?: string) {
    const targetUid = targetUserId || this.user.id;
    if (targetUid === this.user.id) {
      this.user.balance = newUsdt;
      this.user.coins = newCoins;
      await this.syncUserToFirestore();
    } else {
      try {
        const targetUserRef = doc(db, 'users', targetUid);
        await updateDoc(targetUserRef, {
          balance: newUsdt,
          coins: newCoins,
        });
      } catch (e) {
        console.error('Error updating target user balance in Firestore:', e);
      }
    }
  }

  async toggleUserFreeze(targetUserId?: string) {
    const targetUid = targetUserId || this.user.id;
    if (targetUid === this.user.id) {
      this.user.status = this.user.status === 'Frozen' ? 'Active' : 'Frozen';
      await this.syncUserToFirestore();
    } else {
      try {
        const targetUserRef = doc(db, 'users', targetUid);
        const snap = await getDoc(targetUserRef);
        if (snap.exists()) {
          const currentStatus = snap.data().status || 'Active';
          const newStatus = currentStatus === 'Frozen' ? 'Active' : 'Frozen';
          await updateDoc(targetUserRef, { status: newStatus });
        }
      } catch (e) {
        console.error('Error toggling freeze on target user in Firestore:', e);
      }
    }
  }

  markNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notify();
  }

  resetAll() {
    this.user = { ...INITIAL_USER };
    this.investments = [...INITIAL_INVESTMENTS];
    this.copyPositions = [...INITIAL_COPY_POSITIONS];
    this.deposits = [...INITIAL_DEPOSITS];
    this.withdrawals = [...INITIAL_WITHDRAWALS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.notify();
  }

  toggleAutoMaintenance(investmentId: string) {
    const inv = this.investments.find((i) => i.id === investmentId);
    if (inv) {
      inv.autoMaintenanceEnabled = !inv.autoMaintenanceEnabled;
      this.notify();
    }
  }

  toggleGlobalAutoMaintenance(enabled?: boolean) {
    if (enabled !== undefined) {
      this.settings.autoMaintenanceGlobal = enabled;
    } else {
      this.settings.autoMaintenanceGlobal = !this.settings.autoMaintenanceGlobal;
    }
    this.notify();
  }

  updateEfficiencyThreshold(val: number) {
    this.settings.efficiencyAlertThreshold = val;
    this.notify();
  }

  triggerSimulatedPowerDrop(investmentId?: string): { success: boolean; message: string } {
    let inv = investmentId
      ? this.investments.find((i) => i.id === investmentId)
      : this.investments.find((i) => i.status === 'Active');

    if (!inv && this.investments.length > 0) {
      inv = this.investments[0];
    }

    if (inv) {
      inv.powerEfficiencyPercent = 65;
      inv.maintenanceStatus = 'Thermal Warning';
      inv.temperatureCelsius = 94;
      inv.fanRpm = 5200;
      inv.dustLevelPercent = 88;
      this.notify();
      return {
        success: true,
        message: `Simulated power drop triggered on ${inv.planName}! Efficiency dropped to 65%.`,
      };
    }

    return {
      success: false,
      message: 'No active mining rig available to simulate power drop!',
    };
  }

  updateSettings(partial: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.notify();
  }

  claimReferralMilestone(requiredDepositors: number): { success: boolean; message: string } {
    const milestone = REFERRAL_MILESTONES.find((m) => m.requiredDepositors === requiredDepositors);
    if (!milestone) return { success: false, message: 'Milestone not found!' };

    if (!this.user.referralMilestonesClaimed) {
      this.user.referralMilestonesClaimed = [];
    }

    if (this.user.referralMilestonesClaimed.includes(requiredDepositors)) {
      return { success: false, message: 'Milestone reward already claimed!' };
    }

    // Calculate verified referrals with approved deposits
    const verifiedReferrals = this.referrals.filter(
      (r) => r.totalInvested > 0 || r.status === 'Approved'
    );
    const effectiveCount = Math.max(
      this.user.depositingReferralsCount || 0,
      verifiedReferrals.length
    );

    if (effectiveCount >= requiredDepositors) {
      this.user.referralMilestonesClaimed.push(requiredDepositors);
      this.user.coins += milestone.rewardCoins;
      this.user.depositingReferralsCount = effectiveCount;
      this.syncUserToFirestore();

      this.addTransaction({
        userId: this.user.id,
        type: 'Referral Reward',
        amount: milestone.rewardCoins,
        currency: 'Coins',
        status: 'Completed',
        description: `Referral milestone reward (+${milestone.rewardCoins} AUX for ${requiredDepositors} referrals)`,
        createdAt: new Date().toISOString(),
      });

      this.addNotification({
        title: `🎁 Referral Milestone Claimed!`,
        message: `Claimed +${milestone.rewardCoins} AUX for ${requiredDepositors} verified referrals!`,
        type: 'task',
      });
      this.notify();

      return {
        success: true,
        message: `Claimed +${milestone.rewardCoins} AUX milestone bonus!`,
      };
    }

    return {
      success: false,
      message: `Requires ${requiredDepositors} verified referrals with approved deposits (Current: ${effectiveCount}).`,
    };
  }

  convertCoinsToUsdt(coins: number): { success: boolean; usdt: number; message: string } {
    if (coins <= 0 || this.user.coins < coins) {
      return { success: false, usdt: 0, message: 'Insufficient Aurex Coins balance!' };
    }

    const rate = this.settings?.coinsConversionRate || 1000;
    const usdt = parseFloat((coins / rate).toFixed(2));
    this.user.coins -= coins;
    this.user.balance = parseFloat((this.user.balance + usdt).toFixed(2));
    this.syncUserToFirestore();

    this.addNotification({
      title: 'Coins Converted! 🪙',
      message: `Converted ${coins} Aurex Coins into +$${usdt} USDT.`,
      type: 'task',
    });

    this.notify();
    return { success: true, usdt, message: `Converted ${coins} Aurex Coins to $${usdt} USDT!` };
  }

  createCopyTradePosition(traderId: string, amount: number, lockupPlanId: string = '1day') {
    if (this.user.balance < amount) return { success: false, message: 'Insufficient balance!' };

    const trader = COPY_TRADERS.find((t) => t.id === traderId);
    if (!trader) return { success: false, message: 'Trader not found!' };

    const plan = trader.plans.find((p) => p.id === lockupPlanId) || trader.plans[0] || DEFAULT_COPY_LOCKUP_PLANS[0];
    const totalExpectedProfit = parseFloat(((amount * plan.profitPercent) / 100).toFixed(2));
    const dailyYieldPercent = parseFloat((plan.profitPercent / plan.durationDays).toFixed(2));
    const dailyYieldUsdt = parseFloat(((amount * dailyYieldPercent) / 100).toFixed(2));

    const newPos: CopyTradePosition = {
      id: `copy_${Date.now()}`,
      userId: this.user.id,
      traderId: trader.id,
      traderName: trader.name,
      traderAvatar: trader.avatar,
      amount,
      planId: plan.id,
      planTitle: plan.title,
      durationDays: plan.durationDays,
      profitPercent: plan.profitPercent,
      totalExpectedProfit,
      dailyYieldPercent,
      dailyYieldUsdt,
      startDate: new Date().toISOString(),
      lastAccrualDate: new Date().toISOString(),
      claimedProfit: 0,
      unclaimedProfit: 0,
      daysElapsed: 0,
      status: 'Active',
    };

    this.user.balance = parseFloat((this.user.balance - amount).toFixed(2));
    this.copyPositions.push(newPos);
    this.syncUserToFirestore();

    this.addNotification({
      title: 'Copy Trade Started! 📈',
      message: `Copying master trader ${trader.name} with $${amount} USDT.`,
      type: 'investment',
    });

    this.notify();
    return { success: true, message: `Started copy trading with ${trader.name}!` };
  }

  closeCopyTradePosition(positionId: string) {
    const pos = this.copyPositions.find((p) => p.id === positionId);
    if (!pos || pos.status !== 'Active') return;

    pos.status = 'Closed';
    const totalReturn = pos.amount + pos.unclaimedProfit + pos.claimedProfit;
    this.user.balance = parseFloat((this.user.balance + totalReturn).toFixed(2));
    this.syncUserToFirestore();

    this.addNotification({
      title: 'Copy Trade Closed 🔒',
      message: `Closed position for ${pos.traderName}. Returned $${totalReturn.toFixed(2)} USDT.`,
      type: 'investment',
    });

    this.notify();
  }

  async addNotification(
    item: Omit<AppNotification, 'id' | 'userId' | 'read' | 'createdAt'>
  ) {
    const notif = {
      ...item,
      userId: this.user.id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, 'notifications'), notif);
    } catch (e) {
      console.error('Error adding notification:', e);
    }
  }

  async searchUserByGiftId(giftId: string) {
    try {
      const cleanGid = giftId.trim().toUpperCase();
      const endpoint = `/api/admin/gift-mining/user?giftId=${encodeURIComponent(cleanGid)}`;
      const res = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
        },
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.error(`[GIFT SEARCH API ERROR] Non-JSON response received (HTTP ${res.status}) from ${endpoint}: Content-Type: ${contentType}`);
        const rawText = await res.text();
        console.error(`[GIFT SEARCH RAW RESPONSE BODY]:`, rawText.slice(0, 200));
        return {
          success: false,
          error: 'NON_JSON_RESPONSE',
          message: `Endpoint ${endpoint} returned non-JSON response (HTTP ${res.status}). Received Content-Type: ${contentType || 'none'}`
        };
      }

      const data = await res.json();
      return data;
    } catch (e: any) {
      console.error('Error in searchUserByGiftId:', e);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: e.message || 'Network error attempting to reach search API.'
      };
    }
  }

  async grantGiftMining(payload: {
    userId?: string;
    giftId: string;
    giftValue?: number;
    durationHours?: number;
    rewardRate?: number;
    hashRate?: string;
    giftPackage?: string;
    adminUsername?: string;
  }) {
    try {
      const res = await fetch('/api/admin/gift-mining/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, message: `Server error (HTTP ${res.status}): non-JSON response.` };
      }
      const data = await res.json();
      return data;
    } catch (e: any) {
      console.error('Error in grantGiftMining:', e);
      return { success: false, message: e.message || 'Network error' };
    }
  }

  async getGiftHistory() {
    try {
      const res = await fetch('/api/admin/gift-history', {
        headers: { 'Accept': 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return [];
      }
      const data = await res.json();
      if (data.success && data.giftHistory) {
        return data.giftHistory;
      }
      return [];
    } catch (e) {
      console.error('Error fetching gift history:', e);
      return [];
    }
  }
}

export const store = new AppStore();
