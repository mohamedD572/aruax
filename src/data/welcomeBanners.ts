export interface WelcomeBanner {
  id: string;
  themeNumber: number;
  themeName: string;
  title: string;
  tagline: string;
  image: string;
  imageFileName: string;
  badge: string;
  welcomeMessage: string;
}

export const WELCOME_BANNERS: WelcomeBanner[] = [
  {
    id: 'theme_1',
    themeNumber: 1,
    themeName: 'Modern Crypto Trading Office',
    title: 'AUREX | Institutional Crypto Trading',
    tagline: 'AI-Powered Yield Acceleration & High-Frequency Mining',
    image: '/assets/images/aurex_banner_trading_office_1785490660416.jpg',
    imageFileName: 'aurex_banner_trading_office_1785490660416.jpg',
    badge: 'INSTITUTIONAL GRADE',
    welcomeMessage: `⚡ Welcome to AUREX Institutional Trading Terminal!

Aurex bridges automated algorithmic cloud mining with premier USDT yield strategies.

📊 KEY PLATFORM HIGHLIGHTS:
• Returns: Up to 10% Daily Yield for 25 Days
• Security: Institutional-Grade Multi-Sig Cold Storage
• Speed: Real-time automated profit settlements
• Referral: 3-Tier Multiplier Commission Structure

Tap "OPEN AUREX" below to access your trading suite!`
  },
  {
    id: 'theme_2',
    themeNumber: 2,
    themeName: 'AI Data Center',
    title: 'AUREX | Quantum Neural Mining Node',
    tagline: 'Self-Optimizing Hashrate Allocation Engine',
    image: '/assets/images/aurex_banner_ai_center_1785490682906.jpg',
    imageFileName: 'aurex_banner_ai_center_1785490682906.jpg',
    badge: 'AI DRIVEN ENGINE',
    welcomeMessage: `🤖 Welcome to AUREX AI Data Center!

Experience next-generation neural cloud mining powered by deep-learning hashrate optimization.

✨ REVOLUTIONARY FEATURES:
• Automated Smart Rig Switching (Max Profitability)
• Up to 10% Daily Accrued USDT Mining Profits
• 25-Day Guaranteed High-Yield Contract Duration
• 24/7 Automated Diagnostics & Real-time Telemetry

Click "OPEN AUREX" below to initialize your neural miner now!`
  },
  {
    id: 'theme_3',
    themeNumber: 3,
    themeName: 'Cloud Mining Server Room',
    title: 'AUREX | High-Density Hashrate Cluster',
    tagline: 'Tier-4 Datacenter Infrastructure',
    image: '/assets/images/aurex_bot_banner_1785414303783.jpg',
    imageFileName: 'aurex_bot_banner_1785414303783.jpg',
    badge: 'TIER-4 INFRASTRUCTURE',
    welcomeMessage: `🌟 Welcome to AUREX Cloud Mining Operations!

Deploy ASIC & GPU cloud mining contracts backed by high-density server infrastructure.

⛏️ CLOUD MINING BENEFITS:
• Daily Returns: Up to 10% USDT Yield
• Duration: 25 Days Active Hashrate Lifecycle
• Payouts: Instant On-Demand USDT Withdrawals
• Zero Maintenance & Power Overhead for Users

Tap "OPEN AUREX" to start mining cryptocurrencies immediately!`
  },
  {
    id: 'theme_4',
    themeNumber: 4,
    themeName: 'Digital Blockchain Network',
    title: 'AUREX | Decoupled Distributed Ledger',
    tagline: 'Ultra-Fast Decentralized Validation Fabric',
    image: '/assets/images/aurex_banner_global_network_1785490735795.jpg',
    imageFileName: 'aurex_banner_global_network_1785490735795.jpg',
    badge: 'BLOCKCHAIN MATRIX',
    welcomeMessage: `🌐 Welcome to AUREX Distributed Blockchain Matrix!

Seamlessly participate in multi-chain validation and cloud liquidity farming.

⚡ NETWORK SPECIFICATIONS:
• Guaranteed Yields: Up to 10% Daily ROI for 25 Days
• Multi-Chain Support: USDT (BEP20 & TRC20)
• Transparent Ledger Audits & Real-Time Sync
• Direct Wallet Connection & Fast Settlements

Press "OPEN AUREX" to connect your node!`
  },
  {
    id: 'theme_5',
    themeNumber: 5,
    themeName: 'Premium Investment Dashboard',
    title: 'AUREX | Luxury Wealth Command',
    tagline: 'Precision Asset Management & Daily Compounding',
    image: '/assets/images/aurex_banner_growth_charts_1785490710636.jpg',
    imageFileName: 'aurex_banner_growth_charts_1785490710636.jpg',
    badge: 'WEALTH COMMAND',
    welcomeMessage: `📈 Welcome to AUREX Premium Wealth Management!

Take control of your digital asset growth with our high-yield cloud investment dashboard.

💰 INVESTMENT HIGHLIGHTS:
• Daily ROI: Earn up to 10% Daily Returns
• Active Term: 25 Days Fixed High-Yield Term
• Instant Payouts: Withdraw earnings anytime
• Referral Growth: Earn commission on 3 affiliate tiers

Click "OPEN AUREX" to view your financial growth stats!`
  },
  {
    id: 'theme_6',
    themeNumber: 6,
    themeName: 'Golden Cryptocurrency Vault',
    title: 'AUREX | Gold Standard Crypto Vault',
    tagline: 'Fortress Security & High-Yield Reserve Storage',
    image: '/assets/images/aurex_banner_gold_vault_1785490671980.jpg',
    imageFileName: 'aurex_banner_gold_vault_1785490671980.jpg',
    badge: 'GOLD VAULT SECURITY',
    welcomeMessage: `👑 Welcome to AUREX Gold Standard Vault!

Store, mine, and grow your USDT reserves with maximum security and guaranteed daily yield.

🛡️ VAULT GUARANTEES:
• Up to 10% Daily Capital Growth for 25 Days
• Insured Cold Storage Protocol & AES-256 Encryption
• No Lockups on Profit Claims – Withdraw Daily
• VIP Copy-Trading & Elite Trader Syncing

Press "OPEN AUREX" to unlock your golden vault!`
  },
  {
    id: 'theme_7',
    themeNumber: 7,
    themeName: 'Financial Growth Charts',
    title: 'AUREX | Exponential Yield Trajectory',
    tagline: 'Data-Driven High Returns for Digital Capital',
    image: '/assets/images/aurex_banner_growth_charts_1785490710636.jpg',
    imageFileName: 'aurex_banner_growth_charts_1785490710636.jpg',
    badge: 'EXPONENTIAL YIELD',
    welcomeMessage: `📊 Welcome to AUREX Growth Analytics!

Track your portfolio's upward velocity with automated daily compounding and real-time statistics.

🚀 FINANCIAL ADVANTAGES:
• Fixed Daily Growth: Up to 10% Daily Yield
• Term Length: 25 Days Active Production Cycle
• Transparent Profit Distribution Every 24 Hours
• Instant USDT Transfers Direct to Your Wallet

Tap "OPEN AUREX" to accelerate your portfolio!`
  },
  {
    id: 'theme_8',
    themeNumber: 8,
    themeName: 'USDT Digital Ecosystem',
    title: 'AUREX | USDT Yield Matrix',
    tagline: 'The Ultimate Stablecoin Passive Income Hub',
    image: '/assets/images/aurex_banner_usdt_ecosystem_1785490723139.jpg',
    imageFileName: 'aurex_banner_usdt_ecosystem_1785490723139.jpg',
    badge: 'USDT STABLECOIN HUB',
    welcomeMessage: `💵 Welcome to AUREX USDT Yield Ecosystem!

Maximize your Tether stablecoin earnings with steady, low-risk, high-reward cloud mining.

💎 STABLECOIN RECOVERY & GROWTH:
• Daily Stable Income: Up to 10% Daily on USDT
• Guaranteed 25-Day Yield Lifecycle
• Instant Processing for BEP20 & TRC20 Networks
• Low Minimum Entry Thresholds

Press "OPEN AUREX" to deposit and start earning USDT!`
  },
  {
    id: 'theme_9',
    themeNumber: 9,
    themeName: 'BNB Smart Chain Technology',
    title: 'AUREX | BEP20 Smart Contract Protocol',
    tagline: 'High-Speed Low-Gas Binance Smart Chain Infrastructure',
    image: '/assets/images/platinum_datacenter_1785271148443.jpg',
    imageFileName: 'platinum_datacenter_1785271148443.jpg',
    badge: 'BNB CHAIN OPTIMIZED',
    welcomeMessage: `⚡ Welcome to AUREX BNB Smart Chain Engine!

Leverage ultra-fast BEP20 smart contracts for instant deposits and zero-delay payouts.

🔥 SMART CHAIN PERFORMANCE:
• Returns: Up to 10% Daily Yield for 25 Days
• Ultra-Low Network Gas Fees & Instant Confirmations
• Automated Smart Contract Profit Distribution
• Direct BEP20 Wallet Synchronization

Click "OPEN AUREX" to launch the Smart Chain Terminal!`
  },
  {
    id: 'theme_10',
    themeNumber: 10,
    themeName: 'TRON Blockchain Network',
    title: 'AUREX | TRC20 High-Speed Node',
    tagline: 'Sub-Second Finality & High Throughput Yield',
    image: '/assets/images/aurex_mining_node_1785409346290.jpg',
    imageFileName: 'aurex_mining_node_1785409346290.jpg',
    badge: 'TRC20 ULTRA-SPEED',
    welcomeMessage: `🔴 Welcome to AUREX TRON Network Integration!

Experience lightning-fast TRC20 USDT transactions backed by high-yield cloud hashrates.

🚀 TRON PROTOCOL ADVANTAGES:
• Earn up to 10% Daily Returns for 25 Days
• Zero Transfer Friction & Instant Settlement
• 24/7 Multi-Node Redundancy & Uptime
• Direct TRC20 USDT Deposit Verification

Tap "OPEN AUREX" to begin instant TRC20 mining!`
  },
  {
    id: 'theme_11',
    themeNumber: 11,
    themeName: 'Luxury Fintech Headquarters',
    title: 'AUREX | Global Fintech Headquarters',
    tagline: 'Where Technology Meets Financial Freedom',
    image: '/assets/images/aurex_banner_fintech_hq_1785490746070.jpg',
    imageFileName: 'aurex_banner_fintech_hq_1785490746070.jpg',
    badge: 'GLOBAL HEADQUARTERS',
    welcomeMessage: `🏛️ Welcome to AUREX Executive Fintech Suite!

Join thousands of global investors benefiting from elite algorithmic yield engineering.

🌟 EXECUTIVE BENEFIT PACKAGE:
• Up to 10% Daily Yield for 25 Days
• VIP Copy-Trading & Automated Master Syncing
• Dedicated Support & 24/7 System Health Audit
• Multi-Currency Deposit Gateway (USDT, BNB, TRX)

Press "OPEN AUREX" to step into the executive lounge!`
  },
  {
    id: 'theme_12',
    themeNumber: 12,
    themeName: 'Global Crypto Network',
    title: 'AUREX | Planetwide Hashrate Grid',
    tagline: 'Connecting Investors Across 180+ Countries',
    image: '/assets/images/aurex_banner_global_network_1785490735795.jpg',
    imageFileName: 'aurex_banner_global_network_1785490735795.jpg',
    badge: 'PLANETWIDE GRID',
    welcomeMessage: `🌍 Welcome to AUREX Worldwide Crypto Network!

Participate in a global, borderless financial ecosystem powered by decentralized cloud mining.

🌐 GLOBAL NETWORK METRICS:
• Daily Yield: Up to 10% Daily Returns (25 Days)
• Global Availability 24 hours a day, 365 days a year
• Instant Worldwide Withdrawals & No Border Restrictions
• Multilingual Support & Global Community

Click "OPEN AUREX" to connect to the global network!`
  },
  {
    id: 'theme_13',
    themeNumber: 13,
    themeName: 'Professional Mining Infrastructure',
    title: 'AUREX | Enterprise ASIC Hash Farm',
    tagline: 'Industrial-Scale Power & Next-Gen Hydro Cooling',
    image: '/assets/images/silver_cyber_rack_1785271129179.jpg',
    imageFileName: 'silver_cyber_rack_1785271129179.jpg',
    badge: 'ENTERPRISE ASIC FARM',
    welcomeMessage: `🏭 Welcome to AUREX Enterprise Mining Infrastructure!

Directly rent industrial-grade ASIC blades with 99.9% uptime and hydro-cooling technology.

⚡ ENTERPRISE CONTRACT HIGHLIGHTS:
• High Efficiency Hashrates: Earn Up to 10% Daily
• 25 Days Active Rig Operation Life
• Fully Automated Daily Profit Crediting
• Instant Withdrawal Engine Enabled

Tap "OPEN AUREX" to deploy your industrial rig!`
  },
  {
    id: 'theme_14',
    themeNumber: 14,
    themeName: 'Digital Finance City',
    title: 'AUREX | Cyber Financial Metropolis',
    tagline: 'The Future of Decentralized Finance & Mining',
    image: '/assets/images/aurex_banner_digital_city_1785490692619.jpg',
    imageFileName: 'aurex_banner_digital_city_1785490692619.jpg',
    badge: 'CYBER FINTECH CITY',
    welcomeMessage: `🏙️ Welcome to AUREX Cyber Financial Metropolis!

Step into the next era of digital asset acceleration with state-of-the-art cloud tools.

✨ METROPOLIS ADVANTAGES:
• Up to 10% Daily Returns for 25 Days
• Interactive Mining Gamification & Coin Rewards
• Automated Copy-Trading & Pro Trader Signals
• Instant Payout System to Any Crypto Wallet

Press "OPEN AUREX" to enter the cyber city!`
  },
  {
    id: 'theme_15',
    themeNumber: 15,
    themeName: 'Artificial Intelligence Control Center',
    title: 'AUREX | Autonomous AI Command',
    tagline: 'Algorithmic Execution & Zero-Human Delay',
    image: '/assets/images/diamond_quantum_rig_1785271159012.jpg',
    imageFileName: 'diamond_quantum_rig_1785271159012.jpg',
    badge: 'AI AUTONOMOUS COMMAND',
    welcomeMessage: `🧠 Welcome to AUREX Autonomous AI Control Center!

Our neural algorithms continuously rebalance mining pools to deliver maximum yield.

🤖 AI COMMAND SPECIFICATIONS:
• Returns: Up to 10% Daily Yield for 25 Days
• Autonomous Pool Selection & Arbitrage
• Real-Time Equipment Telemetry & Diagnostics
• Instant Multi-Tier Affiliate Rewards

Click "OPEN AUREX" to start AI-driven mining!`
  },
  {
    id: 'theme_16',
    themeNumber: 16,
    themeName: 'Secure Blockchain Technology',
    title: 'AUREX | Cyber Fortress Security',
    tagline: 'Zero-Trust Protocol & Military Security Standards',
    image: '/assets/images/steel_hash_server_1785271119463.jpg',
    imageFileName: 'steel_hash_server_1785271119463.jpg',
    badge: 'FORTRESS SECURITY',
    welcomeMessage: `🔒 Welcome to AUREX Cyber Fortress Security Node!

Your investments are protected by multi-layered encryption, cold storage, and DDoS shields.

🛡️ SECURITY & YIELD ASSURANCE:
• Daily Yield: Up to 10% Daily Returns (25 Days)
• Multi-Signature Wallets & Fraud Prevention
• Encrypted Data Transmission & Strict Uptime
• Instant Authorized Payouts

Press "OPEN AUREX" to access your secure terminal!`
  },
  {
    id: 'theme_17',
    themeNumber: 17,
    themeName: 'Passive Income Concept',
    title: 'AUREX | Automated Income Generator',
    tagline: 'Earn Money While You Sleep',
    image: '/assets/images/gold_mining_rig_1785271138710.jpg',
    imageFileName: 'gold_mining_rig_1785271138710.jpg',
    badge: 'PASSIVE INCOME ENGINE',
    welcomeMessage: `💸 Welcome to AUREX Passive Income Accelerator!

Turn your digital USDT capital into a continuous 24/7 revenue stream without manual effort.

☀️ PASSIVE EARNING BENEFITS:
• Earnings: Up to 10% Daily ROI credited every 24 hours
• Contract Duration: 25 Days of passive cashflow
• Effortless Setup: Rent a rig and watch profits grow
• 3-Tier Referral Commissions: Share & earn even more!

Tap "OPEN AUREX" to start building passive wealth!`
  },
  {
    id: 'theme_18',
    themeNumber: 18,
    themeName: 'Wealth Growth Visualization',
    title: 'AUREX | Compound Wealth Simulator',
    tagline: 'Watch Your Crypto Portfolio Multiply',
    image: '/assets/images/aurex_banner_growth_charts_1785490710636.jpg',
    imageFileName: 'aurex_banner_growth_charts_1785490710636.jpg',
    badge: 'WEALTH MULTIPLIER',
    welcomeMessage: `📈 Welcome to AUREX Wealth Growth Visualizer!

Experience the power of structured high-yield daily returns and transparent portfolio tracking.

📊 GROWTH METRICS:
• Up to 10% Daily Profit Rate (25 Days Duration)
• Daily Profit Accumulation & Real-Time Balance Updates
• Flexible Reinvestment & Mining Package Upgrades
• Instant USDT Payouts directly to your wallet

Click "OPEN AUREX" to chart your financial path!`
  },
  {
    id: 'theme_19',
    themeNumber: 19,
    themeName: 'Premium Crypto Investment Environment',
    title: 'AUREX | Elite Investor Environment',
    tagline: 'Designed for High Net-Worth Digital Capitalists',
    image: '/assets/images/aurex_banner_trading_office_1785490660416.jpg',
    imageFileName: 'aurex_banner_trading_office_1785490660416.jpg',
    badge: 'ELITE INVESTOR SUITE',
    welcomeMessage: `👔 Welcome to AUREX Elite Crypto Environment!

Access VIP cloud mining tiers, custom liquidity allocation, and top-tier affiliate multipliers.

💎 VIP PLATFORM PERKS:
• Returns: Up to 10% Daily ROI for 25 Days
• VIP Pro Rigs & Quantum Mining Contracts
• Priority Withdrawal Processing & Zero Delays
• Comprehensive Copy-Trading Suite

Press "OPEN AUREX" to step into the VIP lounge!`
  },
  {
    id: 'theme_20',
    themeNumber: 20,
    themeName: 'High-Tech Financial Laboratory',
    title: 'AUREX | Quantum Fintech Lab',
    tagline: 'Pioneering Next-Gen Cloud Mining Algorithms',
    image: '/assets/images/copper_gpu_rig_1785271096149.jpg',
    imageFileName: 'copper_gpu_rig_1785271096149.jpg',
    badge: 'FINTECH LAB R&D',
    welcomeMessage: `🔬 Welcome to AUREX High-Tech Financial Laboratory!

Benefit from experimental high-efficiency GPU/ASIC hash optimization and automated yields.

🧪 LAB SPECIFICATIONS:
• High Yield Output: Earn Up to 10% Daily for 25 Days
• Advanced Telemetry & Equipment Health Diagnostics
• Automated Daily Settlement & Reward System
• 100% Transparent Operation Metrics

Click "OPEN AUREX" to start your mining experiment!`
  }
];

export function getRandomWelcomeBanner(): WelcomeBanner {
  const randomIndex = Math.floor(Math.random() * WELCOME_BANNERS.length);
  return WELCOME_BANNERS[randomIndex];
}
