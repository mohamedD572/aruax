export type TabType =
  | 'dashboard'
  | 'markets'
  | 'trades'
  | 'performance'
  | 'rules'
  | 'profile';

export type AuthStatus =
  | 'connecting'
  | 'verifying'
  | 'authenticated'
  | 'outside_telegram'
  | 'error';

export type MarketDataStatus = 'ONLINE' | 'OFFLINE' | 'STALE';

export type MarketRegime = 'BULLISH' | 'BEARISH' | 'SIDEWAYS' | 'HIGH_VOLATILITY';

export type Timeframe = '5m' | '15m' | '1h' | '4h';

export interface TelegramVerifiedUser {
  id: number;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
  languageCode?: string;
  isPremium?: boolean;
}

export interface TelegramAuthState {
  status: AuthStatus;
  user: TelegramVerifiedUser | null;
  error?: string | null;
  initData?: string | null;
}

export interface PaperAccount {
  paperBalance: number;
  initialBalance: number;
  equity: number;
  availableBalance: number;
  todayPnl: number;
  todayPnlPercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  trialStartDate: number;
  trialDurationDays: number;
}

export interface EngineStatus {
  isOnline: boolean;
  lastScanTime: string;
  nextScanInSeconds: number;
  marketScannerConnected: boolean;
  newsAnalyzerConnected: boolean;
  riskEngineActive: boolean;
  paperExecutionActive: boolean;
  autoPilot: boolean;
  marketDataStatus: MarketDataStatus;
  marketRegime: MarketRegime;
  workerStatus?: 'ONLINE' | 'OFFLINE' | 'ERROR' | string;
  lastHeartbeat?: number;
  lastRun?: string;
  lastMarketScan?: string;
  lastError?: string | null;
  lastDecision?: string;
  isHeartbeatFresh?: boolean;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MultiTimeframeCandles {
  '5m': Candle[];
  '15m': Candle[];
  '1h': Candle[];
  '4h': Candle[];
}

export interface TechnicalIndicators {
  ema20: number;
  ema50: number;
  ema200: number;
  rsi14: number;
  atr: number;
  atrPercent: number;
  volume20SMA: number;
  volumeSurgeRatio: number;
  supportLevel: number;
  resistanceLevel: number;
  marketStructure: 'HIGHER_HIGHS_HIGHER_LOWS' | 'LOWER_LOWS_LOWER_HIGHS' | 'RANGING';
}

export interface OpportunityScoreBreakdown {
  trendScore: number;       // Max 20
  momentumScore: number;    // Max 20
  volumeScore: number;      // Max 15
  structureScore: number;   // Max 15
  volatilityScore: number;  // Max 10
  riskRewardScore: number;  // Max 20
  totalScore: number;       // 0 to 100
}

export interface Position {
  id: string;
  tradeId?: string;
  userId?: string | number;
  symbol: string;
  name: string;
  category: 'crypto' | 'stocks' | 'metals';
  type: 'LONG / SPOT';
  side: 'SPOT_BUY';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  investedAmount: number;
  pnl: number;
  pnlPercent: number;
  takeProfit: number;
  stopLoss: number;
  trailingStop: number | null;
  confidenceScore: number;
  scoreBreakdown?: OpportunityScoreBreakdown;
  openedAt: number;
  closedAt?: number;
  status: 'OPEN' | 'TP_HIT' | 'SL_HIT' | 'CLOSED';
  closePrice?: number;
  closeTime?: number;
  closeReason?: string;
  riskRewardRatio: number;
}

export interface MarketScanStats {
  scannedAssets: number;
  qualifiedAssets: number;
  selectedAssets: number;
  rejectedAssets: number;
  marketRegime: MarketRegime;
}

export interface BestOpportunity {
  symbol: string;
  name: string;
  category: 'crypto' | 'stocks' | 'metals';
  currentPrice: number;
  change24h: number;
  confidence: number;
  scoreBreakdown?: OpportunityScoreBreakdown;
  marketRegime: MarketRegime;
  momentum: 'STRONG' | 'MODERATE' | 'WEAK';
  volumeStatus: 'HIGH' | 'MEDIUM' | 'LOW';
  newsImpact: 'LOW' | 'POSITIVE' | 'NEUTRAL' | 'HIGH_VOLATILITY' | 'UNAVAILABLE';
  riskReward: string;
  riskRewardNumeric: number;
  trendScore: number;
  volatilityRating: string;
  rationale: string;
  targetPrice: number;
  stopLossPrice: number;
  qualified: boolean;
  rejectionReason?: string;
}

export interface DecisionLogItem {
  id: string;
  timestamp: string;
  type: 'scan' | 'reject' | 'select' | 'execute' | 'risk' | 'info' | 'tp_hit' | 'sl_hit' | 'warning';
  title: string;
  details?: string;
  asset?: string;
  confidence?: number;
  marketRegime?: MarketRegime;
  decision?: 'PAPER BUY' | 'NO TRADE' | 'MANAGE POSITION' | 'TRAILING STOP TRIGGERED';
}

export interface TradeRecord {
  id: string;
  tradeId?: string;
  userId?: string | number;
  symbol: string;
  name: string;
  category: 'crypto' | 'stocks' | 'metals';
  type: 'LONG / SPOT';
  side: 'SPOT_BUY';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  investedAmount: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  pnlPercent: number;
  returnAmount: number;
  duration: string;
  confidence: number;
  reason: string;
  entryTime: number;
  exitTime: number;
  openedAt?: number;
  closedAt?: number;
  status: 'WIN' | 'LOSS' | 'TP_HIT' | 'SL_HIT' | 'CLOSED';
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  equityCurve: {
    timestamp: string;
    dateLabel: string;
    equity: number;
    tradeIndex: number;
  }[];
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: 'crypto' | 'stocks' | 'metals';
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  volumeNumeric: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  momentumRsi: number;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  aiSignal: 'STRONG BUY' | 'BUY' | 'WATCHLIST' | 'NEUTRAL' | 'AVOID';
  sparkline: number[];
  description: string;
  structure: string;
  newsHeadline: string;
  lastUpdated: number;
}

export interface TradingNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type:
    | 'opportunity'
    | 'trade_opened'
    | 'tp_hit'
    | 'sl_moved'
    | 'trade_closed'
    | 'market_warning'
    | 'engine_status'
    | 'trial';
  isRead: boolean;
}

export interface TradingRulesConfig {
  spotOnly: boolean;
  onePositionOnly: boolean;
  maxRiskPerTradePercent: number;
  minConfidence: number;
  minRiskReward: string;
  stopLossType: string;
  takeProfitType: string;
  trailingStopEnabled: boolean;
  newsProtectionEnabled: boolean;
  marketRegimeFilterEnabled: boolean;
}
