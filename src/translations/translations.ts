export type Language = 'ar' | 'en';

export interface Translations {
  // Brand & Global
  appName: string;
  appSubtitle: string;
  paperModeProtected: string;
  spotOnly: string;
  engineOnline: string;
  engineOffline: string;
  enginePaused: string;
  connected: string;
  active: string;
  close: string;
  cancel: string;
  confirm: string;
  save: string;
  today: string;
  now: string;
  scanNow: string;
  scanning: string;
  viewAnalysis: string;
  remainingDays: string;
  days: string;
  day: string;
  all: string;
  win: string;
  loss: string;
  winning: string;
  losing: string;

  // Nav
  navDashboard: string;
  navMarkets: string;
  navTrades: string;
  navPerformance: string;
  navRules: string;
  navProfile: string;

  // Header & Balance
  paperBalance: string;
  paperPortfolio: string;
  totalReturn: string;
  availableBalance: string;
  totalEquity: string;
  todayPnl: string;
  realizedPnl: string;
  unrealizedPnl: string;

  // Trial
  trialTitle: string;
  trialSubtitle: string;
  dayOfTrial: string;
  trialRemaining: string;

  // Engine
  engineTitle: string;
  engineSubtitle: string;
  marketScanner: string;
  newsAnalyzer: string;
  riskEngine: string;
  paperExecution: string;
  lastScan: string;
  nextScanIn: string;

  // Current Position
  currentPositionTitle: string;
  currentPositionSubtitle: string;
  noActiveTradeTitle: string;
  noActiveTradeDesc: string;
  scanningGlobalAssets: string;
  simulateNoTrade: string;
  simulateOpenPosition: string;
  entryPrice: string;
  currentPrice: string;
  takeProfit: string;
  stopLoss: string;
  trailingStopActive: string;
  closePosition: string;
  confidenceScore: string;
  longSpot: string;

  // Scanner
  scannerTitle: string;
  scannerSubtitle: string;
  scannedAssets: string;
  qualified: string;
  selected: string;
  rejected: string;
  bestOpportunity: string;
  marketRegime: string;
  momentum: string;
  volumeStatus: string;
  newsImpact: string;
  riskReward: string;

  // Decision Log
  decisionLogTitle: string;
  decisionLogSubtitle: string;
  liveStream: string;

  // Markets Page
  marketsTitle: string;
  marketsSubtitle: string;
  searchPlaceholder: string;
  allAssets: string;
  crypto: string;
  stocks: string;
  metals: string;
  liveSpotPrice: string;
  volume24h: string;
  score: string;

  // Detail Modal
  assetDeepAnalysis: string;
  trendScore: string;
  volumeProfile: string;
  structure: string;
  sentimentCatalyst: string;
  closeAnalysis: string;

  // History Page
  historyTitle: string;
  historySubtitle: string;
  winRate: string;
  avgDuration: string;
  returnAmount: string;
  entry: string;
  exit: string;

  // Performance Page
  performanceTitle: string;
  performanceSubtitle: string;
  equityProgression: string;
  netReturn: string;
  sharpeRatio: string;
  totalTrades: string;
  profitFactor: string;
  maxDrawdown: string;
  avgWinningTrade: string;
  avgLosingTrade: string;

  // Rules Page
  rulesTitle: string;
  rulesSubtitle: string;
  strict: string;
  enforced: string;
  capitalPreservation: string;
  threshold: string;
  mathematicalEdge: string;

  // Profile Page
  profileTitle: string;
  profileSubtitle: string;
  verifiedSession: string;
  telegramPremium: string;
  telegramId: string;
  resetPaperAccount: string;
  resetConfirmPrompt: string;
  platformSecurity: string;
  securityP1: string;
  securityP2: string;
  securityP3: string;

  // Settings Modal
  settingsTitle: string;
  settingsSubtitle: string;
  tradingMode: string;
  zeroRiskDesc: string;
  paperTrialLabel: string;
  riskPerTrade: string;
  riskPerTradeDesc: string;
  minConfidence: string;
  minConfidenceDesc: string;
  spotOnlyDesc: string;
  newsFilter: string;
  newsFilterDesc: string;
  aiAutoPilot: string;
  aiAutoPilotActiveDesc: string;
  aiAutoPilotPausedDesc: string;
  activeStatus: string;
  pausedStatus: string;
  languageSelect: string;
  languageSelectDesc: string;

  // Notifications Modal
  notificationsTitle: string;
  notificationsSubtitle: string;
  markAllRead: string;

  // Auth Screen
  connectingTelegram: string;
  connectingTelegramDesc: string;
  verifyingAccount: string;
  verifyingAccountDesc: string;
  launchTitle: string;
  launchDesc: string;
  launchInTelegram: string;
  exploreWebPreview: string;
  authFooter: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    // Brand & Global
    appName: 'أوريكس الذكي',
    appSubtitle: 'منصة التداول التجريبي الآلي بالذكاء الاصطناعي',
    paperModeProtected: 'محمي بوضع التداول الافتراضي (Paper)',
    spotOnly: 'سبوت فقط (Spot Only)',
    engineOnline: 'المحرك: متصل (ONLINE)',
    engineOffline: 'المحرك: غير متصل (OFFLINE)',
    enginePaused: 'المحرك: متوقف مؤقتاً',
    connected: 'متصل',
    active: 'نشط',
    close: 'إغلاق',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    save: 'حفظ',
    today: 'اليوم',
    now: 'الآن',
    scanNow: 'فحص فوري',
    scanning: 'جارٍ الفحص...',
    viewAnalysis: 'عرض التحليل الشامل',
    remainingDays: 'أيام متبقية',
    days: 'أيام',
    day: 'يوم',
    all: 'الكل',
    win: 'ربح',
    loss: 'خسارة',
    winning: 'الرابحة',
    losing: 'الخاسرة',

    // Nav
    navDashboard: 'الرئيسية',
    navMarkets: 'الأسواق',
    navTrades: 'الصفقات',
    navPerformance: 'الأداء',
    navRules: 'القواعد',
    navProfile: 'الحساب',

    // Header & Balance
    paperBalance: 'الرصيد التجريبي',
    paperPortfolio: 'محفظة التداول التجريبي',
    totalReturn: 'إجمالي العائد',
    availableBalance: 'الرصيد المتاح',
    totalEquity: 'إجمالي حقوق الحساب',
    todayPnl: 'أرباح اليوم',
    realizedPnl: 'الأرباح المحققة',
    unrealizedPnl: 'الأرباح غير المحققة',

    // Trial
    trialTitle: 'تجربة التداول الافتراضي لمدة 30 يوماً',
    trialSubtitle: 'بيئة تداول خالية تماماً من المخاطر مع وصول كامل لمحرك الذكاء الاصطناعي',
    dayOfTrial: 'اليوم',
    trialRemaining: 'المتبقي',

    // Engine
    engineTitle: 'محرك التداول بالذكاء الاصطناعي',
    engineSubtitle: 'مراقبة آلية مستمرة لأسواق المال وإدارة مخاطر الصفقات الفورية',
    marketScanner: 'ماسح الأسواق',
    newsAnalyzer: 'محلل الأخبار',
    riskEngine: 'محرك المخاطر',
    paperExecution: 'التنفيذ التجريبي',
    lastScan: 'آخر فحص',
    nextScanIn: 'الفحص القادم خلال',

    // Current Position
    currentPositionTitle: 'الصفقة الحالية المفتوحة',
    currentPositionSubtitle: 'صفقة سبوت نشطة تُدار آلياً بوقف خسارة وجني أرباح ديناميكي',
    noActiveTradeTitle: 'لا توجد صفقة نشطة حالياً',
    noActiveTradeDesc: 'ظروف السوق الحالية غير مثالية. الذكاء الاصطناعي ينتظر إشارة عالية الدقة تطابق معايير الأمان (نسبة ثقة 80%+).',
    scanningGlobalAssets: 'الذكاء الاصطناعي يفحص 147 أصل مالي عالمي...',
    simulateNoTrade: 'محاكاة: وضع الانتظار',
    simulateOpenPosition: 'محاكاة: صفقة مفتوحة',
    entryPrice: 'سعر الدخول',
    currentPrice: 'السعر الحالي',
    takeProfit: 'جني الأرباح',
    stopLoss: 'وقف الخسارة (ديناميكي)',
    trailingStopActive: 'وقف الخسارة المتحرك نشط عند',
    closePosition: 'إغلاق الصفقة التجريبية',
    confidenceScore: 'نسبة الثقة',
    longSpot: 'شراء سبوت (LONG / SPOT)',

    // Scanner
    scannerTitle: 'ماسح السوق الذكي',
    scannerSubtitle: 'محرك فلترة متعدد الأصول عبر العملات المشفرة والأسهم والمعادن',
    scannedAssets: 'الأصول المفحوصة',
    qualified: 'المؤهلة',
    selected: 'تم اختيارها',
    rejected: 'المرفوضة',
    bestOpportunity: 'أفضل فرصة استثمارية',
    marketRegime: 'حالة السوق',
    momentum: 'الزخم',
    volumeStatus: 'السيولة والحجم',
    newsImpact: 'تأثير الأخبار',
    riskReward: 'العائد / المخاطرة',

    // Decision Log
    decisionLogTitle: 'سجل قرارات الذكاء الاصطناعي',
    decisionLogSubtitle: 'المنطق الشفاف وراء اختيار الفرص وفلترتها خطوة بخطوة',
    liveStream: 'مباشر',

    // Markets Page
    marketsTitle: 'الأسواق المالية',
    marketsSubtitle: 'مراقبة حية بالذكاء الاصطناعي للعملات الرقمية، الأسهم العالمية، والمعادن الثمينة',
    searchPlaceholder: 'ابحث عن BTC, NVDA, Gold...',
    allAssets: 'جميع الأصول',
    crypto: 'عملات رقمية',
    stocks: 'أسهم',
    metals: 'معادن',
    liveSpotPrice: 'السعر الفوري المباشر',
    volume24h: 'حجم 24 ساعة',
    score: 'التقييم',

    // Detail Modal
    assetDeepAnalysis: 'مصفوفة التحليل العميق بالذكاء الاصطناعي',
    trendScore: 'نقاط الاتجاه',
    volumeProfile: 'حجم التداول والسيولة',
    structure: 'الهيكل الفني',
    sentimentCatalyst: 'محفز المشاعر والأخبار الحالية',
    closeAnalysis: 'إغلاق التحليل',

    // History Page
    historyTitle: 'سجل الصفقات',
    historySubtitle: 'سجل تفصيلي بكافة الصفقات الآلية المنفذة تجريبياً بواسطة Aurex AI',
    winRate: 'نسبة الصفقات الرابحة',
    avgDuration: 'متوسط مدة الصفقة',
    returnAmount: 'قيمة العائد',
    entry: 'دخول',
    exit: 'خروج',

    // Performance Page
    performanceTitle: 'الأداء والتحليلات',
    performanceSubtitle: 'المقاييس التفصيلية، تحليلات المخاطر وتطور رأس المال التجريبي',
    equityProgression: 'تطور رأس المال التجريبي (أساس 100$)',
    netReturn: 'صافي العائد',
    sharpeRatio: 'نسبة شارب (Sharpe)',
    totalTrades: 'إجمالي الصفقات',
    profitFactor: 'معامل الربحية',
    maxDrawdown: 'أقصى تراجع (Drawdown)',
    avgWinningTrade: 'متوسط الصفقة الرابحة',
    avgLosingTrade: 'متوسط الصفقة الخاسرة',

    // Rules Page
    rulesTitle: 'قواعد التداول الآلي',
    rulesSubtitle: 'المعايير الرياضية وإدارة المخاطر الصارمة التي ينفذها Aurex AI Trader تلقائياً',
    strict: 'صارم',
    enforced: 'مُطبق بدقة',
    capitalPreservation: 'حماية رأس المال',
    threshold: 'حد أدنى',
    mathematicalEdge: 'تفوق إحصائي',

    // Profile Page
    profileTitle: 'الملف الشخصي وحساب تيليجرام',
    profileSubtitle: 'بيانات حساب تيليجرام الموثقة، حالة التجربة المجانية، وإعدادات الحساب',
    verifiedSession: 'جلسة موثقة',
    telegramPremium: 'تيليجرام بريميوم',
    telegramId: 'معرف تيليجرام',
    resetPaperAccount: 'إعادة تعيين الحساب التجريبي (100$)',
    resetConfirmPrompt: 'هل ترغب بإعادة تعيين رصيدك التجريبي إلى 100.00$ وتجديد فترة التجربة لـ 30 يوماً؟',
    platformSecurity: 'أمان المنصة وسياسة التنفيذ الافتراضي',
    securityP1: 'لا توجد أموال حقيقية: جميع الصفقات والعمليات هي تداول افتراضي تجريبي (Paper Trading) بنسبة 100%.',
    securityP2: 'لا يتم طلب أو تخزين أي مفاتيح خاصة أو مفاتيح API لمنصات التداول إطلاقاً.',
    securityP3: 'يتم التحقق الآمن عبر تشفير تيليجرام لضمان عزل الجلسات وحفظ إحصائيات التجربة.',

    // Settings Modal
    settingsTitle: 'إعدادات البوت والمخاطر',
    settingsSubtitle: 'معايير وخوارزميات التداول الآلي',
    tradingMode: 'وضع التداول',
    zeroRiskDesc: 'صفر أموال حقيقية معرضة للمخاطرة',
    paperTrialLabel: 'فترة التجربة الافتراضية',
    riskPerTrade: 'المخاطرة لكل صفقة',
    riskPerTradeDesc: 'حماية صارمة لرأس مال المحفظة',
    minConfidence: 'الحد الأدنى لثقة الذكاء الاصطناعي',
    minConfidenceDesc: 'استبعاد الفرص ذات الاحتمالية المنخفضة',
    spotOnlyDesc: 'بدون رافعة مالية، بدون مخاطر تصفية',
    newsFilter: 'فلتر الأخبار والمشاعر',
    newsFilterDesc: 'الحماية من تقلبات مؤشرات التضخم والفائدة الفجائية',
    aiAutoPilot: 'الطيار الآلي للذكاء الاصطناعي',
    aiAutoPilotActiveDesc: 'يقوم بفحص وتنفيذ الصفقات المؤهلة باستمرار',
    aiAutoPilotPausedDesc: 'متوقف مؤقتاً بطلب المستخدم',
    activeStatus: 'نشط',
    pausedStatus: 'متوقف',
    languageSelect: 'لغة الواجهة',
    languageSelectDesc: 'التبديل بين العربية والإنجليزية',

    // Notifications Modal
    notificationsTitle: 'تنبيهات التداول الذكية',
    notificationsSubtitle: 'أحداث البوت وإشارات الدخول والخروج اللحظية',
    markAllRead: 'تحديد الكل كمقروء',

    // Auth Screen
    connectingTelegram: 'جارٍ الاتصال بتيليجرام...',
    connectingTelegramDesc: 'التحقق من هوية تيليجرام والحساب التجريبي',
    verifyingAccount: 'جارٍ التحقق من الحساب...',
    verifyingAccountDesc: 'تهيئة الرصيد التجريبي بقيمة 100$',
    launchTitle: 'ابدأ تداول Aurex AI التجريبي',
    launchDesc: 'خض تجربة التداول بالذكاء الاصطناعي مع 100$ رصيد افتراضي وتجربة مجانية لمدة 30 يوماً داخل تيليجرام.',
    launchInTelegram: 'فتح في تيليجرام',
    exploreWebPreview: 'معاينة تجريبية على الويب (100$ Paper)',
    authFooter: 'تجربة تداول افتراضي 30 يوماً • رصيد ابتدائي 100$',
  },

  en: {
    // Brand & Global
    appName: 'Aurex AI',
    appSubtitle: 'Autonomous Spot Paper AI Trading Platform',
    paperModeProtected: 'Paper Mode Protected',
    spotOnly: 'SPOT ONLY',
    engineOnline: 'AI Engine: ONLINE',
    engineOffline: 'AI Engine: OFFLINE',
    enginePaused: 'AI Engine: PAUSED',
    connected: 'CONNECTED',
    active: 'ACTIVE',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    today: 'Today',
    now: 'Now',
    scanNow: 'Scan Now',
    scanning: 'Scanning...',
    viewAnalysis: 'VIEW ANALYSIS',
    remainingDays: 'Days Remaining',
    days: 'Days',
    day: 'Day',
    all: 'All',
    win: 'Win',
    loss: 'Loss',
    winning: 'Winning',
    losing: 'Losing',

    // Nav
    navDashboard: 'Dashboard',
    navMarkets: 'Markets',
    navTrades: 'Trades',
    navPerformance: 'Performance',
    navRules: 'Rules',
    navProfile: 'Profile',

    // Header & Balance
    paperBalance: 'Paper Bal',
    paperPortfolio: 'Paper Trading Portfolio',
    totalReturn: 'Total Return',
    availableBalance: 'Available Balance',
    totalEquity: 'Total Equity',
    todayPnl: 'Today P&L',
    realizedPnl: 'Realized P/L',
    unrealizedPnl: 'Unrealized P/L',

    // Trial
    trialTitle: '30 DAY PAPER TRIAL',
    trialSubtitle: 'Risk-free paper trading environment with full AI engine access',
    dayOfTrial: 'Day',
    trialRemaining: 'Remaining',

    // Engine
    engineTitle: 'AI TRADING ENGINE',
    engineSubtitle: 'Continuous autonomous market surveillance & spot risk management',
    marketScanner: 'Market Scanner',
    newsAnalyzer: 'News Analyzer',
    riskEngine: 'Risk Engine',
    paperExecution: 'Paper Execution',
    lastScan: 'Last Scan',
    nextScanIn: 'Next scan in',

    // Current Position
    currentPositionTitle: 'CURRENT POSITION',
    currentPositionSubtitle: 'Active spot trade managed by Aurex Dynamic SL/TP engine',
    noActiveTradeTitle: 'NO ACTIVE TRADE',
    noActiveTradeDesc: 'Market conditions are currently unfavorable. The AI is waiting for a high-quality setup meeting strict risk-reward (Min Confidence 80%).',
    scanningGlobalAssets: 'AI is actively scanning 147 global assets...',
    simulateNoTrade: 'Simulate No-Trade State',
    simulateOpenPosition: 'Simulate Open Position',
    entryPrice: 'Entry Price',
    currentPrice: 'Current Price',
    takeProfit: 'Take Profit',
    stopLoss: 'Stop Loss (Dynamic)',
    trailingStopActive: 'Trailing Stop Active at',
    closePosition: 'Close Paper Position',
    confidenceScore: 'Confidence',
    longSpot: 'LONG / SPOT',

    // Scanner
    scannerTitle: 'AI MARKET SCANNER',
    scannerSubtitle: 'Multi-asset filtering engine across Crypto, Stocks & Metals',
    scannedAssets: 'Scanned Assets',
    qualified: 'Qualified',
    selected: 'Selected',
    rejected: 'Rejected',
    bestOpportunity: 'BEST OPPORTUNITY',
    marketRegime: 'Regime',
    momentum: 'Momentum',
    volumeStatus: 'Volume',
    newsImpact: 'News Impact',
    riskReward: 'Risk / Reward',

    // Decision Log
    decisionLogTitle: 'AI DECISION LOG',
    decisionLogSubtitle: 'Transparent step-by-step reasoning behind candidate selection',
    liveStream: 'Live Stream',

    // Markets Page
    marketsTitle: 'MARKETS',
    marketsSubtitle: 'Realtime AI surveillance across global Crypto, Equities, and Precious Metals',
    searchPlaceholder: 'Search BTC, NVDA, Gold...',
    allAssets: 'All Assets',
    crypto: 'Crypto',
    stocks: 'Stocks',
    metals: 'Metals',
    liveSpotPrice: 'Live Spot Price',
    volume24h: '24h Vol',
    score: 'Score',

    // Detail Modal
    assetDeepAnalysis: 'AI Deep Analysis Matrix',
    trendScore: 'Trend Score',
    volumeProfile: 'Volume Profile',
    structure: 'Structure',
    sentimentCatalyst: 'Latest Sentiment Catalyst',
    closeAnalysis: 'Close Analysis',

    // History Page
    historyTitle: 'TRADE HISTORY',
    historySubtitle: 'Historical log of all automated paper spot trades executed by Aurex AI',
    winRate: 'Win Rate',
    avgDuration: 'Avg Duration',
    returnAmount: 'Return Amount',
    entry: 'Entry',
    exit: 'Exit',

    // Performance Page
    performanceTitle: 'PERFORMANCE',
    performanceSubtitle: 'Detailed metrics, risk analytics, and equity progression for your paper trading portfolio',
    equityProgression: 'Paper Equity Progression ($100 Baseline)',
    netReturn: 'net return',
    sharpeRatio: 'Sharpe Ratio',
    totalTrades: 'Total Trades',
    profitFactor: 'Profit Factor',
    maxDrawdown: 'Max Drawdown',
    avgWinningTrade: 'Average Winning Trade',
    avgLosingTrade: 'Average Losing Trade',

    // Rules Page
    rulesTitle: 'TRADING RULES',
    rulesSubtitle: 'Strict mathematical rules and risk controls executed autonomously by Aurex AI Trader',
    strict: 'STRICT',
    enforced: 'ENFORCED',
    capitalPreservation: 'CAPITAL PRESERVATION',
    threshold: 'THRESHOLD',
    mathematicalEdge: 'MATHEMATICAL EDGE',

    // Profile Page
    profileTitle: 'PROFILE & TELEGRAM ACCOUNT',
    profileSubtitle: 'Connected Telegram account credentials, 30-Day Paper Trial status, and bot settings',
    verifiedSession: 'Verified Session',
    telegramPremium: 'Telegram Premium',
    telegramId: 'Telegram ID',
    resetPaperAccount: 'Reset Paper Account ($100)',
    resetConfirmPrompt: 'Reset your Paper Trading Balance to $100.00 and renew your 30-Day Paper Trial?',
    platformSecurity: 'Platform Security & Execution Policy',
    securityP1: 'Zero real funds required: All market executions are 100% simulated paper trades.',
    securityP2: 'No exchange API keys or private keys are ever requested or stored.',
    securityP3: 'Cryptographic Telegram authentication ensures session isolation and trial synchronization.',

    // Settings Modal
    settingsTitle: 'Bot Settings & Risk',
    settingsSubtitle: 'Autonomous strategy parameters',
    tradingMode: 'Trading Mode',
    zeroRiskDesc: 'Zero real funds at risk',
    paperTrialLabel: 'Paper Trial',
    riskPerTrade: 'Risk Per Trade',
    riskPerTradeDesc: 'Strict account capital preservation',
    minConfidence: 'Minimum Confidence',
    minConfidenceDesc: 'Filter out low-probability setups',
    spotOnlyDesc: 'No leverage, no margin liquidation risk',
    newsFilter: 'News Sentiment Filter',
    newsFilterDesc: 'Protects against CPI / FOMC high volatility spikes',
    aiAutoPilot: 'AI Auto-Pilot Engine',
    aiAutoPilotActiveDesc: 'Actively scanning & executing setups',
    aiAutoPilotPausedDesc: 'Paused by user',
    activeStatus: 'ACTIVE',
    pausedStatus: 'PAUSED',
    languageSelect: 'Interface Language',
    languageSelectDesc: 'Switch between Arabic and English',

    // Notifications Modal
    notificationsTitle: 'AI Trading Alerts',
    notificationsSubtitle: 'Autonomous bot events and signals',
    markAllRead: 'Mark all as read',

    // Auth Screen
    connectingTelegram: 'Connecting to Telegram...',
    connectingTelegramDesc: 'Verifying Telegram identity & 30-Day Paper Account',
    verifyingAccount: 'Verifying account...',
    verifyingAccountDesc: 'Initializing $100 Paper Trading balance',
    launchTitle: 'Launch Aurex AI Trader',
    launchDesc: 'Experience algorithmic paper trading with $100 simulated capital and a 30-day risk-free trial inside Telegram.',
    launchInTelegram: 'Launch in Telegram',
    exploreWebPreview: 'Explore Web Preview ($100 Paper Mode)',
    authFooter: '30-Day Paper Trial • $100 Initial Balance',
  },
};
