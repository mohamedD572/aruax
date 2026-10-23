import { AppSettings, InvestmentPlan, UserProfile, TaskItem, Investment, DepositRequest, WithdrawalRequest, AppNotification, TransactionHistoryItem, ReferralUser, CopyTrader, CopyTradePosition, ReferralMilestone, DepositWallet } from '../types';

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    rigModel: 'Aurex RTX 4080 GPU Rig',
    hashRate: '150 MH/s',
    powerUsage: '450W',
    efficiency: '30.0 J/MH',
    minAmount: 10,
    maxAmount: 49,
    dailyPercent: 2.3,
    dailyCoinsRate: 80, // Produces 80 AUR Coins / day for $10
    durationDays: 30,
    badge: 'Starter ($10 Min)',
    color: '#10B981',
    metalTheme: 'bronze',
    metalGradient: 'from-emerald-500/25 via-teal-500/15 to-emerald-900/25',
    rigImage: '/src/assets/images/copper_gpu_rig_1785271096149.jpg',
    description: 'Entry-level compact GPU mining rig starting from $10 USDT. Generates 2.3% daily profit and 80 AUR coins/day for 30 days.'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    rigModel: 'Antminer S19 Hydro',
    hashRate: '350 TH/s',
    powerUsage: '1,200W',
    efficiency: '24.0 J/TH',
    minAmount: 10,
    maxAmount: 49,
    dailyPercent: 5.0,
    dailyCoinsRate: 220, // Produces 220 AUR Coins / day
    durationDays: 30,
    badge: 'Advanced ($10 Min)',
    color: '#F59E0B',
    metalTheme: 'gold',
    metalGradient: 'from-amber-400/25 via-yellow-500/15 to-amber-800/25',
    rigImage: '/src/assets/images/bronze_asic_blade_1785271108363.jpg',
    description: 'High-efficiency ASIC blade rig starting from $10 USDT. Generates 5.0% daily profit and 220 AUR coins/day for 30 days.'
  },
  {
    id: 'pro',
    name: 'Pro Hash Server',
    rigModel: 'Whatsminer M50S Steel',
    hashRate: '850 TH/s',
    powerUsage: '2,200W',
    efficiency: '20.0 J/TH',
    minAmount: 50,
    maxAmount: 199,
    dailyPercent: 6.5,
    dailyCoinsRate: 500, // Produces 500 AUR Coins / day
    durationDays: 30,
    badge: 'Pro Server ($50 Min)',
    color: '#38BDF8',
    metalTheme: 'steel',
    metalGradient: 'from-sky-400/25 via-blue-500/15 to-slate-800/25',
    rigImage: '/src/assets/images/steel_hash_server_1785271119463.jpg',
    description: 'Industrial steel hash server providing 6.5% daily mining returns and 500 AUR coins/day for 30 days.'
  },
  {
    id: 'silver',
    name: 'Silver Cyber Rack',
    rigModel: 'AvalonMiner 1366 Silver',
    hashRate: '2.5 EH/s',
    powerUsage: '3,500W',
    efficiency: '17.5 J/TH',
    minAmount: 200,
    maxAmount: 999,
    dailyPercent: 8.0,
    dailyCoinsRate: 2400, // Produces 2,400 AUR Coins / day
    durationDays: 30,
    badge: 'Silver Rack ($200 Min)',
    color: '#94A3B8',
    metalTheme: 'titanium',
    metalGradient: 'from-slate-300/25 via-slate-400/15 to-slate-700/25',
    rigImage: '/src/assets/images/silver_cyber_rack_1785271129179.jpg',
    description: 'High-speed silver server rack cluster yielding 8.0% daily profit and 2,400 AUR coins/day for 30 days.'
  },
  {
    id: 'gold',
    name: 'Gold Mining Rig Pro',
    rigModel: 'Antminer S21 Hydro Gold',
    hashRate: '10.0 EH/s',
    powerUsage: '5,000W',
    efficiency: '14.0 J/TH',
    minAmount: 1000,
    maxAmount: 4999,
    dailyPercent: 10.0,
    dailyCoinsRate: 14000, // Produces 14,000 AUR Coins / day
    durationDays: 30,
    badge: 'Gold Edition ($1k Min)',
    color: '#EAB308',
    metalTheme: 'gold',
    metalGradient: 'from-amber-400/30 via-yellow-400/20 to-amber-700/25',
    rigImage: '/src/assets/images/gold_mining_rig_1785271138710.jpg',
    description: 'Heavy gold-plated industrial mining rig earning 10.0% daily yield and 14,000 AUR coins/day for 30 days.'
  },
  {
    id: 'platinum',
    name: 'Platinum Datacenter',
    rigModel: 'Platinum Hash Pod Matrix',
    hashRate: '25.0 EH/s',
    powerUsage: '8,500W',
    efficiency: '11.5 J/TH',
    minAmount: 5000,
    maxAmount: 14999,
    dailyPercent: 12.5,
    dailyCoinsRate: 80000, // Produces 80,000 AUR Coins / day
    durationDays: 30,
    badge: 'Platinum ($5k Min)',
    color: '#A855F7',
    metalTheme: 'platinum',
    metalGradient: 'from-purple-400/30 via-indigo-500/20 to-slate-800/30',
    rigImage: '/src/assets/images/platinum_datacenter_1785271148443.jpg',
    description: 'Ultra-scale platinum cloud datacenter generating 12.5% daily mining returns and 80,000 AUR coins/day for 30 days.'
  },
  {
    id: 'diamond',
    name: 'Diamond Quantum Rig',
    rigModel: 'Quantum Diamond Laser Hash',
    hashRate: '75.0 EH/s',
    powerUsage: '14,000W',
    efficiency: '8.0 J/TH',
    minAmount: 15000,
    maxAmount: 100000,
    dailyPercent: 15.0,
    dailyCoinsRate: 280000, // Produces 280,000 AUR Coins / day
    durationDays: 30,
    badge: 'Diamond ($15k Min)',
    color: '#EC4899',
    metalTheme: 'quantum',
    metalGradient: 'from-pink-500/30 via-cyan-400/25 to-purple-800/30',
    rigImage: '/src/assets/images/diamond_quantum_rig_1785271159012.jpg',
    description: 'Next-gen quantum mining supercomputer delivering 15.0% daily return and 280,000 AUR coins/day for 30 days.'
  }
];

export const COPY_TRADERS: CopyTrader[] = [
  {
    id: 'trader-1',
    name: 'Satoshi Flash Trader',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    badge: '1 Day Flash 6%',
    dailyYieldPercent: 6.0,
    minCopyAmount: 50,
    totalCopiers: 3420,
    winRate: 99.4,
    totalProfitUsdt: 48500,
    tags: ['1 Day (6% ROI)', 'Flash Spot', 'Instant Yield'],
    bio: 'High-frequency 1-day spot arbitrage generating guaranteed 6% ROI within 24 hours.',
    plans: [
      { id: '1day', durationDays: 1, profitPercent: 6, minAmount: 50, title: '1 Day Lockup (6% ROI)' },
      { id: '2day', durationDays: 2, profitPercent: 12, minAmount: 80, title: '2 Days Lockup (12% ROI)' }
    ]
  },
  {
    id: 'trader-2',
    name: 'Crypto Shield Pro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    badge: '7 Days Growth',
    dailyYieldPercent: 6.5,
    minCopyAmount: 100,
    totalCopiers: 2850,
    winRate: 98.8,
    totalProfitUsdt: 82400,
    tags: ['7 Days (42% ROI)', 'Hedge Shield', 'Low Drawdown'],
    bio: 'Algorithmic hedging across ETH & SOL with automated stop-loss protection.',
    plans: [
      { id: '3day', durationDays: 3, profitPercent: 18, minAmount: 100, title: '3 Days Lockup (18% ROI)' },
      { id: '7day', durationDays: 7, profitPercent: 42, minAmount: 150, title: '7 Days Lockup (42% ROI)' }
    ]
  },
  {
    id: 'trader-3',
    name: 'Elena Market Maker',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    badge: '15 Days Arbitrage',
    dailyYieldPercent: 7.0,
    minCopyAmount: 200,
    totalCopiers: 4120,
    winRate: 97.9,
    totalProfitUsdt: 125000,
    tags: ['15 Days (105% ROI)', 'Cross-DEX', 'DeFi Liquidity'],
    bio: 'DeFi orderbook market making and cross-DEX liquidity arbitrage.',
    plans: [
      { id: '10day', durationDays: 10, profitPercent: 70, minAmount: 200, title: '10 Days Lockup (70% ROI)' },
      { id: '15day', durationDays: 15, profitPercent: 105, minAmount: 300, title: '15 Days Lockup (105% ROI)' }
    ]
  },
  {
    id: 'trader-4',
    name: 'Quant Master AI',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    badge: '30 Days Quant AI',
    dailyYieldPercent: 7.5,
    minCopyAmount: 300,
    totalCopiers: 3190,
    winRate: 96.8,
    totalProfitUsdt: 210000,
    tags: ['30 Days (225% ROI)', 'AI Neural', 'SOL Breakout'],
    bio: 'Deep neural model identifying micro-breakouts across top 20 crypto pairs.',
    plans: [
      { id: '21day', durationDays: 21, profitPercent: 157, minAmount: 300, title: '21 Days Lockup (157% ROI)' },
      { id: '30day', durationDays: 30, profitPercent: 225, minAmount: 500, title: '30 Days Lockup (225% ROI)' }
    ]
  },
  {
    id: 'trader-5',
    name: 'Apex Legend 90D',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    badge: '90 Days 8%/Day Max',
    dailyYieldPercent: 8.0,
    minCopyAmount: 500,
    totalCopiers: 5890,
    winRate: 95.5,
    totalProfitUsdt: 540000,
    tags: ['90 Days (8% Daily ROI)', 'Supreme Alpha', '720% Net Return'],
    bio: 'Institutional 90-day master strategy delivering 8.0% daily ROI (720% total profit).',
    plans: [
      { id: '45day', durationDays: 45, profitPercent: 360, minAmount: 500, title: '45 Days Lockup (360% ROI)' },
      { id: '90day', durationDays: 90, profitPercent: 720, minAmount: 1000, title: '90 Days Lockup (8%/Day - 720% ROI)' }
    ]
  }
];

export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  {
    requiredDepositors: 1,
    rewardCoins: 50,
    title: 'First Referral',
    description: 'Get 1 friend who registers and completes their first deposit.'
  },
  {
    requiredDepositors: 5,
    rewardCoins: 300,
    title: '5 Referrals',
    description: 'Reach 5 active referrals with completed deposits.'
  },
  {
    requiredDepositors: 10,
    rewardCoins: 1000,
    title: '10 Referrals',
    description: 'Reach 10 active referrals with completed deposits.'
  },
  {
    requiredDepositors: 20,
    rewardCoins: 2500,
    title: '20 Referrals',
    description: 'Reach 20 active referrals with completed deposits.'
  },
  {
    requiredDepositors: 50,
    rewardCoins: 6000,
    title: '50 Referrals',
    description: 'Reach 50 active referrals with completed deposits.'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  botToken: '',
  botUsername: '@AurexOneBot',
  miniAppUrl: '',
  supportUsername: '@aurex_support',
  trc20Address: 'TAUREX_USDT_TRC20_OfficialPlatformDepositAddress',
  bep20Address: '0xAUREX_USDT_BEP20_OfficialPlatformDepositAddress',
  tonAddress: 'EQAUREX_USDT_TON_OfficialPlatformDepositAddress',
  isMockTelegramMode: false,
  minWithdrawal: 0.1,
  withdrawalFeePercent: 5.0,
  coinsConversionRate: 1000 // 1000 Coins = 1 USDT
};

export const INITIAL_USER: UserProfile = {
  id: '',
  telegramId: 0,
  username: '',
  firstName: '',
  lastName: '',
  photoUrl: '',
  balance: 0,
  coins: 0,
  totalInvested: 0,
  totalEarned: 0,
  referralCode: '',
  referralCount: 0,
  depositingReferralsCount: 0,
  referralMilestonesClaimed: [],
  referralEarnings: 0,
  status: 'Active',
  isAdmin: false,
  createdAt: new Date().toISOString(),
  lastDailyLogin: '',
  nextDailyLogin: '',
  completedTaskIds: [],
  firstDepositRewardClaimed: false,
  giftId: 'AUR-8F4K2M',
};

export const INITIAL_COPY_POSITIONS: CopyTradePosition[] = [];

export const INITIAL_INVESTMENTS: Investment[] = [];

export const INITIAL_DEPOSITS: DepositRequest[] = [];

export const INITIAL_WALLETS: DepositWallet[] = [
  // USDT (BEP20) - 3 Wallets
  {
    id: 'usdt-wallet-1',
    network: 'USDT (BEP20)',
    walletAddress: '0x1B1A26E89d0DB6b0E98B781Bc52dF8091f4ABeB5',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=0x1B1A26E89d0DB6b0E98B781Bc52dF8091f4ABeB5',
    enabled: true,
  },
  {
    id: 'usdt-wallet-2',
    network: 'USDT (BEP20)',
    walletAddress: '0xeE7D13B80788367f398C63fCc11Ed9e943C893aD',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=0xeE7D13B80788367f398C63fCc11Ed9e943C893aD',
    enabled: true,
  },
  {
    id: 'usdt-wallet-3',
    network: 'USDT (BEP20)',
    walletAddress: '0xa4eec10091f70942BF6963b9Abe177848E7A426f',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=0xa4eec10091f70942BF6963b9Abe177848E7A426f',
    enabled: true,
  },
  // TRX (TRON) - 3 Wallets
  {
    id: 'trx-wallet-1',
    network: 'TRX (TRON)',
    walletAddress: 'TPSXH4LjdFdxqFWEftqTn6MaJ4jz15vcXr',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=TPSXH4LjdFdxqFWEftqTn6MaJ4jz15vcXr',
    enabled: true,
  },
  {
    id: 'trx-wallet-2',
    network: 'TRX (TRON)',
    walletAddress: 'TMcSQ3EhysXhUWHuFAu6447NzWGE7SdTcU',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=TMcSQ3EhysXhUWHuFAu6447NzWGE7SdTcU',
    enabled: true,
  },
  {
    id: 'trx-wallet-3',
    network: 'TRX (TRON)',
    walletAddress: 'THsRR6mSKgfswMzUntz3ufcrsCa5fRWvCj',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=THsRR6mSKgfswMzUntz3ufcrsCa5fRWvCj',
    enabled: true,
  },
  // BNB (BEP20) - 3 Wallets
  {
    id: 'bnb-wallet-1',
    network: 'BNB (BEP20)',
    walletAddress: '0x1B1A26E89d0DB6b0E98B781Bc52dF8091f4ABeB5',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=0x1B1A26E89d0DB6b0E98B781Bc52dF8091f4ABeB5',
    enabled: true,
  },
  {
    id: 'bnb-wallet-2',
    network: 'BNB (BEP20)',
    walletAddress: '0xeE7D13B80788367f398C63fCc11Ed9e943C893aD',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=0xeE7D13B80788367f398C63fCc11Ed9e943C893aD',
    enabled: true,
  },
  {
    id: 'bnb-wallet-3',
    network: 'BNB (BEP20)',
    walletAddress: '0xa4eec10091f70942BF6963b9Abe177848E7A426f',
    qrImage: 'https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=0xa4eec10091f70942BF6963b9Abe177848E7A426f',
    enabled: true,
  },
];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Daily Login',
    description: 'Log in once every 24 hours to earn 5 AUX reward.',
    rewardCoins: 5,
    category: 'daily',
    iconName: 'Calendar',
    actionUrl: ''
  },
  {
    id: 'task-2',
    title: 'Join Official Telegram Channel',
    description: 'Join our official Telegram channel for live updates and announcements.',
    rewardCoins: 3,
    category: 'social',
    iconName: 'Send',
    actionUrl: 'https://t.me/AurexOfficia'
  },
  {
    id: 'task-3',
    title: 'Subscribe to Official YouTube',
    description: 'Subscribe to our official YouTube channel.',
    rewardCoins: 3,
    category: 'video',
    iconName: 'PlayCircle',
    actionUrl: 'https://www.youtube.com/@AurexOfficia'
  },
  {
    id: 'task-4',
    title: 'Complete First Deposit',
    description: 'Complete your first approved deposit to unlock 50 AUX reward.',
    rewardCoins: 50,
    category: 'premium',
    iconName: 'Coins',
    actionUrl: ''
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

export const INITIAL_TRANSACTIONS: TransactionHistoryItem[] = [];

export const INITIAL_REFERRALS: ReferralUser[] = [];
