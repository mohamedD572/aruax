export type NetworkType = 'USDT (BEP20)' | 'TRX (TRON)' | 'BNB (BEP20)';

export interface DepositWallet {
  id: string;
  network: NetworkType;
  walletAddress: string;
  qrImage: string;
  enabled: boolean;
  createdAt?: string;
}

export type TransactionStatus = 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Completed';

export type LanguageCode = 'en' | 'ar' | 'es' | 'ru' | 'tr';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export interface UserProfile {
  id: string; // Telegram ID or unique string
  telegramId: number;
  username: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  balance: number; // USDT balance
  coins: number; // Coins balance
  totalInvested: number;
  totalEarned: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  depositingReferralsCount: number; // Only counting referrals who deposited
  referralMilestonesClaimed: number[]; // e.g. [1, 5, 10, 20, 50]
  referralEarnings: number;
  status: 'Active' | 'Frozen' | 'VIP';
  isAdmin?: boolean;
  createdAt: string;
  lastDailyCheckin?: string;
  lastDailyLogin?: string;
  nextDailyLogin?: string;
  loginStreak?: number;
  currentLoginDay?: number;
  completedTaskIds?: string[];
  firstDepositRewardClaimed?: boolean;
  giftId?: string; // Permanent unique Gift ID, e.g. AUR-8F4K2M
}

export interface InvestmentPlan {
  id: string;
  name: string;
  rigModel: string;
  hashRate: string;
  powerUsage: string;
  efficiency: string;
  minAmount: number;
  maxAmount: number;
  dailyPercent: number; // e.g. 4.5, 6.0, 14.0
  durationDays: number; // 25
  badge: string;
  color: string;
  metalTheme: 'bronze' | 'steel' | 'gold' | 'titanium' | 'platinum' | 'diamond' | 'quantum';
  metalGradient: string;
  rigImage: string;
  description: string;
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  dailyPercent: number;
  dailyYieldUsdt: number;
  totalExpectedReturn: number;
  daysElapsed: number;
  durationDays: number;
  startDate: string; // ISO string
  lastAccrualDate: string; // ISO string
  investmentStartTime?: string; // ISO string
  lastProfitTime?: string; // ISO string
  nextProfitTime?: string; // ISO string
  claimedProfit: number;
  unclaimedProfit: number;
  status: 'Active' | 'Completed';
  // Equipment Health & Power Efficiency
  powerEfficiencyPercent?: number; // 0 to 100%
  maintenanceStatus?: 'Optimal' | 'Thermal Warning' | 'Maintenance Due' | 'Degraded';
  lastMaintenanceDate?: string;
  lastAlertSentAt?: string;
  autoMaintenanceEnabled?: boolean;
  temperatureCelsius?: number; // e.g. 62°C to 85°C
  fanRpm?: number; // e.g. 3200 to 6500 RPM
  dustLevelPercent?: number; // e.g. 10% to 85%
  isGift?: boolean;
  giftMiningId?: string;
  durationHours?: number; // e.g. 24
  endTimeIso?: string; // ISO string when the gift finishes
  grantedByAdminId?: string;
  hashRate?: string;
  rigModel?: string;
  powerUsage?: string;
  efficiency?: string;
}

export interface CopyLockupPlan {
  id: string; // e.g. '1day', '2day', '3day', '7day', '14day', '30day'
  durationDays: number; // 1 to 30 days
  profitPercent: number; // e.g. 5% to 120%
  minAmount: number; // e.g. $100, $150, $200, $500, $1000
  title: string; // e.g. '1 Day Lockup', '30 Days (1 Month)'
}

export const DEFAULT_COPY_LOCKUP_PLANS: CopyLockupPlan[] = [
  { id: '1day', durationDays: 1, profitPercent: 5, minAmount: 100, title: '1 Day Lockup' },
  { id: '2day', durationDays: 2, profitPercent: 8, minAmount: 150, title: '2 Days Lockup' },
  { id: '3day', durationDays: 3, profitPercent: 12, minAmount: 200, title: '3 Days Lockup' },
  { id: '7day', durationDays: 7, profitPercent: 20, minAmount: 300, title: '7 Days Lockup' },
  { id: '14day', durationDays: 14, profitPercent: 45, minAmount: 500, title: '14 Days Lockup' },
  { id: '30day', durationDays: 30, profitPercent: 100, minAmount: 1000, title: '30 Days (1 Month)' },
];

export interface CopyTrader {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  dailyYieldPercent: number;
  minCopyAmount: number;
  totalCopiers: number;
  winRate: number;
  totalProfitUsdt: number;
  tags: string[];
  bio: string;
  plans: CopyLockupPlan[]; // Custom distinct lockup plans per trader
}

export interface CopyTradePosition {
  id: string;
  userId: string;
  traderId: string;
  traderName: string;
  traderAvatar: string;
  amount: number;
  planId: string;
  planTitle: string;
  durationDays: number;
  profitPercent: number;
  totalExpectedProfit: number;
  dailyYieldPercent: number;
  dailyYieldUsdt: number;
  startDate: string;
  lastAccrualDate: string;
  claimedProfit: number;
  unclaimedProfit: number;
  daysElapsed: number;
  status: 'Active' | 'Completed' | 'Closed';
}

export interface ReferralMilestone {
  requiredDepositors: number;
  rewardCoins: number;
  title: string;
  description: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  network: NetworkType;
  walletAddress?: string;
  imageProof?: string;
  txHash: string;
  status: TransactionStatus;
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  fee: number;
  netAmount: number;
  network: NetworkType;
  address: string;
  status: TransactionStatus;
  createdAt: string;
  processedAt?: string;
  adminNote?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  category: 'social' | 'video' | 'daily' | 'invite' | 'simple' | 'medium' | 'premium';
  iconName: string;
  actionUrl?: string;
  completed?: boolean;
}

export interface UserTaskProgress {
  id: string;
  userId: string;
  taskId: string;
  completedAt: string;
  rewardClaimed: number;
}

export interface ReferralUser {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  photoUrl?: string;
  joinedAt: string;
  totalInvested: number;
  commissionEarned: number;
  level: 1 | 2 | 3;
  status?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'profit' | 'task' | 'system' | 'maintenance' | 'efficiency';
  read: boolean;
  createdAt: string;
  actionRequired?: boolean;
  investmentId?: string;
}

export interface TransactionHistoryItem {
  id: string;
  userId: string;
  type: 'Deposit' | 'Withdrawal' | 'Investment' | 'Daily Profit' | 'Mining Reward' | 'Gift Mining Reward' | 'Task Reward' | 'Referral Reward' | 'Swap' | 'Coin Conversion' | 'Capital Returned' | 'Plan Expired' | 'Bonus' | 'Transfer';
  amount: number;
  currency: 'USDT' | 'Coins' | 'AUX' | 'AUR' | 'TRX';
  status: TransactionStatus;
  description: string;
  createdAt: string;
  txHash?: string;
}

export interface GiftMiningRecord {
  id: string;
  giftId: string;
  userId: string;
  username: string;
  giftMiningId: string;
  giftPackage: string;
  giftValue: number;
  durationHours: number;
  rewardRate: number;
  startTime: string;
  endTime: string;
  rewardEarned: number;
  status: 'ACTIVE' | 'COMPLETED';
  adminUsername: string;
  createdAt: string;
}

export interface AppSettings {
  botToken: string;
  botUsername: string;
  miniAppUrl: string;
  supportUsername: string;
  trc20Address: string;
  bep20Address: string;
  tonAddress: string;
  isMockTelegramMode: boolean;
  minWithdrawal: number;
  withdrawalFeePercent: number;
  coinsConversionRate: number; // e.g. 1000 coins = 1 USDT
  // Power & Equipment Maintenance Alert Settings
  autoMaintenanceGlobal?: boolean;
  efficiencyAlertThreshold?: number; // e.g. 80 (%)
  soundVibrationAlerts?: boolean;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  details: string;
  adminId?: string;
  timestamp: string;
}

export type DialogType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AppDialogConfig {
  id?: string;
  type: DialogType;
  title: string;
  message: string;
  primaryButtonText?: string;
  primaryAction?: () => void;
  secondaryButtonText?: string;
  secondaryAction?: () => void;
  onClose?: () => void;
  navigateToTab?: string;
}

