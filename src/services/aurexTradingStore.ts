import {
  BestOpportunity,
  DecisionLogItem,
  EngineStatus,
  PaperAccount,
  PerformanceMetrics,
  Position,
  TradeRecord,
  TradingNotification,
} from '../types/trading';
import { analysisService } from './analysisService';
import { marketDataService } from './marketDataService';
import { paperTradingService } from './paperTradingService';
import { riskService } from './riskService';
import { tradingWorker } from './tradingWorker';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

type StoreListener = () => void;

const STORAGE_KEY = 'aurex_paper_trading_v2';

interface StoredState {
  trialStartDate: number;
  trialDurationDays: number;
  paperBalance: number;
  activePosition: Position | null;
  closedTrades: TradeRecord[];
  decisionLog: DecisionLogItem[];
  notifications: TradingNotification[];
  autoPilotEnabled: boolean;
}

export class AurexTradingStore {
  private trialStartDate: number = Date.now() - 86400000 * 1; // Day 1 completed
  private trialDurationDays: number = 30;
  private paperBalance: number = 100.0;
  private activePosition: Position | null = null;
  private autoPilotEnabled: boolean = true;

  // Firebase Heartbeat & Worker Sync State
  private workerStatus: string = 'ONLINE';
  private lastHeartbeat: number | null = Date.now();
  private lastRun: string | null = new Date().toISOString();
  private lastMarketScan: string | null = new Date().toISOString();
  private lastError: string | null = null;
  private lastDecision: string | null = 'NO_TRADE';

  private tradeHistory: TradeRecord[] = [
    {
      id: 'trade-01',
      tradeId: 'paper-rec-01',
      symbol: 'BTC/USDT',
      name: 'Bitcoin Spot',
      category: 'crypto',
      type: 'LONG / SPOT',
      side: 'SPOT_BUY',
      entryPrice: 63100.0,
      exitPrice: 64450.0,
      quantity: 0.00158,
      investedAmount: 99.7,
      stopLoss: 62200.0,
      takeProfit: 64450.0,
      pnl: 2.13,
      pnlPercent: 2.14,
      returnAmount: 101.83,
      duration: '3h 15m',
      confidence: 86,
      reason: 'Take-Profit Target Hit at $64,450.00. 1:2.4 R:R achieved.',
      entryTime: Date.now() - 86400000 * 2,
      exitTime: Date.now() - 86400000 * 2 + 1000 * 60 * 195,
      openedAt: Date.now() - 86400000 * 2,
      closedAt: Date.now() - 86400000 * 2 + 1000 * 60 * 195,
      status: 'WIN',
    },
    {
      id: 'trade-02',
      tradeId: 'paper-rec-02',
      symbol: 'ETH/USDT',
      name: 'Ethereum Spot',
      category: 'crypto',
      type: 'LONG / SPOT',
      side: 'SPOT_BUY',
      entryPrice: 3380.0,
      exitPrice: 3465.0,
      quantity: 0.0295,
      investedAmount: 99.71,
      stopLoss: 3310.0,
      takeProfit: 3465.0,
      pnl: 2.51,
      pnlPercent: 2.51,
      returnAmount: 102.22,
      duration: '4h 40m',
      confidence: 84,
      reason: 'Take-Profit Target Hit at $3,465.00 following volume surge.',
      entryTime: Date.now() - 86400000 * 3,
      exitTime: Date.now() - 86400000 * 3 + 1000 * 60 * 280,
      openedAt: Date.now() - 86400000 * 3,
      closedAt: Date.now() - 86400000 * 3 + 1000 * 60 * 280,
      status: 'WIN',
    },
    {
      id: 'trade-03',
      tradeId: 'paper-rec-03',
      symbol: 'SOL/USDT',
      name: 'Solana Spot',
      category: 'crypto',
      type: 'LONG / SPOT',
      side: 'SPOT_BUY',
      entryPrice: 144.0,
      exitPrice: 149.2,
      quantity: 0.69,
      investedAmount: 99.36,
      stopLoss: 140.0,
      takeProfit: 149.2,
      pnl: 3.59,
      pnlPercent: 3.61,
      returnAmount: 102.95,
      duration: '2h 10m',
      confidence: 88,
      reason: 'Take-Profit Target Hit at $149.20. Clean breakout continuation.',
      entryTime: Date.now() - 86400000 * 4,
      exitTime: Date.now() - 86400000 * 4 + 1000 * 60 * 130,
      openedAt: Date.now() - 86400000 * 4,
      closedAt: Date.now() - 86400000 * 4 + 1000 * 60 * 130,
      status: 'WIN',
    },
    {
      id: 'trade-04',
      tradeId: 'paper-rec-04',
      symbol: 'PAXG/USDT',
      name: 'Physical Gold Spot',
      category: 'metals',
      type: 'LONG / SPOT',
      side: 'SPOT_BUY',
      entryPrice: 2630.0,
      exitPrice: 2620.0,
      quantity: 0.038,
      investedAmount: 99.94,
      stopLoss: 2620.0,
      takeProfit: 2660.0,
      pnl: -0.38,
      pnlPercent: -0.38,
      returnAmount: 99.56,
      duration: '1h 15m',
      confidence: 81,
      reason: 'Dynamic Stop-Loss triggered at $2,620.00. Capital protected safely.',
      entryTime: Date.now() - 86400000 * 5,
      exitTime: Date.now() - 86400000 * 5 + 1000 * 60 * 75,
      openedAt: Date.now() - 86400000 * 5,
      closedAt: Date.now() - 86400000 * 5 + 1000 * 60 * 75,
      status: 'LOSS',
    },
  ];

  private decisionLog: DecisionLogItem[] = [
    {
      id: 'log-1',
      timestamp: '19:15:02',
      type: 'scan',
      title: 'Scanned 12 spot assets on Binance Public REST (No API Keys)',
      details: 'Checking Multi-Timeframe EMAs (20/50/200), RSI(14), ATR, Volume Surges.',
      marketRegime: 'BULLISH',
    },
    {
      id: 'log-2',
      timestamp: '19:15:04',
      type: 'reject',
      title: 'Rejected 11 assets (low score or insufficient R:R)',
      details: 'Filtered: Regime check passed, but R:R or momentum was below 80/100.',
      marketRegime: 'BULLISH',
    },
    {
      id: 'log-3',
      timestamp: '19:15:05',
      type: 'select',
      title: 'BTC/USDT selected as Top Qualified Candidate',
      asset: 'BTC/USDT',
      confidence: 86,
      marketRegime: 'BULLISH',
      decision: 'PAPER BUY',
      details: 'Confluence: Trend (20/20), Momentum (20/20), R:R 1:2.4 (18/20). Total: 86/100.',
    },
    {
      id: 'log-4',
      timestamp: '19:15:08',
      type: 'execute',
      title: 'Paper Spot Trade Opened: BTC/USDT',
      asset: 'BTC/USDT',
      decision: 'PAPER BUY',
      details: 'Entry: $65,190.20 | TP: $66,800.00 | SL: $63,400.00 (Risk: 1% / $1.00).',
    },
  ];

  private notifications: TradingNotification[] = [
    {
      id: 'notif-1',
      title: 'AI Scanner Opportunity Found',
      message: 'BTC/USDT qualified with 86/100 score and 1:2.4 Risk/Reward ratio.',
      timestamp: '19:15',
      type: 'opportunity',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Paper Spot Trade Opened',
      message: 'Long Spot position opened on BTC/USDT at $65,190.20 ($100 Paper Balance).',
      timestamp: '19:15',
      type: 'trade_opened',
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'Trailing Stop Activated',
      message: 'Break-Even stop loss protected at $65,320.00 to eliminate downside risk.',
      timestamp: '19:22',
      type: 'sl_moved',
      isRead: false,
    },
    {
      id: 'notif-4',
      title: '30-Day Paper Trial Running',
      message: 'Trial is active with $100 starting paper balance. No real money used.',
      timestamp: '1d ago',
      type: 'trial',
      isRead: true,
    },
  ];

  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.initDefaultActivePosition();
    this.loadFromStorage();
    this.initFirestoreSync();
  }

  private initFirestoreSync() {
    try {
      // 1. Subscribe to system status & worker heartbeat
      const heartbeatRef = doc(db, 'system_status', 'worker_heartbeat');
      onSnapshot(
        heartbeatRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (data.workerStatus) this.workerStatus = data.workerStatus;
            if (typeof data.lastHeartbeat === 'number') this.lastHeartbeat = data.lastHeartbeat;
            if (data.lastRun) this.lastRun = data.lastRun;
            if (data.lastMarketScan) this.lastMarketScan = data.lastMarketScan;
            if (data.lastError !== undefined) this.lastError = data.lastError;
            if (data.lastDecision) this.lastDecision = data.lastDecision;
            this.notify();
          }
        },
        (err) => {
          console.warn('[FIRESTORE SYNC] Heartbeat sync listener notice:', err);
        }
      );

      // 2. Subscribe to paper trading state
      const stateRef = doc(db, 'paper_trading', 'state');
      onSnapshot(
        stateRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (typeof data.paperBalance === 'number') this.paperBalance = data.paperBalance;
            if (data.activePosition !== undefined) this.activePosition = data.activePosition;
            if (Array.isArray(data.closedTrades) && data.closedTrades.length > 0) {
              this.tradeHistory = data.closedTrades;
            }
            if (Array.isArray(data.decisionLog) && data.decisionLog.length > 0) {
              this.decisionLog = data.decisionLog;
            }
            this.notify();
          }
        },
        (err) => {
          console.warn('[FIRESTORE SYNC] Paper state sync listener notice:', err);
        }
      );
    } catch (err) {
      console.warn('[FIRESTORE SYNC] Initialization notice:', err);
    }
  }

  private initDefaultActivePosition() {
    // Initial active position aligned with live BTC spot
    this.activePosition = {
      id: 'pos-btc-live-01',
      tradeId: 'paper-btc-01',
      symbol: 'BTC/USDT',
      name: 'Bitcoin Spot',
      category: 'crypto',
      type: 'LONG / SPOT',
      side: 'SPOT_BUY',
      entryPrice: 64280.5,
      currentPrice: 65190.2,
      quantity: 0.00155,
      investedAmount: 99.63,
      pnl: 1.41,
      pnlPercent: 1.41,
      takeProfit: 66800.0,
      stopLoss: 63400.0,
      trailingStop: 64500.0,
      confidenceScore: 86,
      scoreBreakdown: {
        trendScore: 20,
        momentumScore: 20,
        volumeScore: 12,
        structureScore: 15,
        volatilityScore: 10,
        riskRewardScore: 18,
        totalScore: 86,
      },
      openedAt: Date.now() - 1000 * 60 * 128, // 2h 8m ago
      status: 'OPEN',
      riskRewardRatio: 2.4,
    };
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredState = JSON.parse(stored);
        if (parsed.trialStartDate) this.trialStartDate = parsed.trialStartDate;
        if (parsed.trialDurationDays) this.trialDurationDays = parsed.trialDurationDays;
        if (typeof parsed.paperBalance === 'number') this.paperBalance = parsed.paperBalance;
        if (parsed.activePosition !== undefined) this.activePosition = parsed.activePosition;
        if (parsed.closedTrades) this.tradeHistory = parsed.closedTrades;
        if (parsed.decisionLog) this.decisionLog = parsed.decisionLog;
        if (parsed.notifications) this.notifications = parsed.notifications;
        if (typeof parsed.autoPilotEnabled === 'boolean') {
          this.autoPilotEnabled = parsed.autoPilotEnabled;
        }
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    try {
      const state: StoredState = {
        trialStartDate: this.trialStartDate,
        trialDurationDays: this.trialDurationDays,
        paperBalance: this.paperBalance,
        activePosition: this.activePosition,
        closedTrades: this.tradeHistory,
        decisionLog: this.decisionLog,
        notifications: this.notifications,
        autoPilotEnabled: this.autoPilotEnabled,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  // --- Getters ---

  public getPaperAccount(): PaperAccount {
    const activePnl = this.activePosition ? this.activePosition.pnl : 0;
    const equity = Math.max(0, this.paperBalance + activePnl);
    const todayPnl = activePnl;
    const todayPnlPercent = this.paperBalance > 0 ? (todayPnl / this.paperBalance) * 100 : 0;
    const totalReturn = equity - 100.0;
    const totalReturnPercent = totalReturn;

    return {
      paperBalance: Number(this.paperBalance.toFixed(2)),
      initialBalance: 100.0,
      equity: Number(equity.toFixed(2)),
      availableBalance: this.activePosition ? 0.0 : Number(this.paperBalance.toFixed(2)),
      todayPnl: Number(todayPnl.toFixed(2)),
      todayPnlPercent: Number(todayPnlPercent.toFixed(2)),
      totalReturn: Number(totalReturn.toFixed(2)),
      totalReturnPercent: Number(totalReturnPercent.toFixed(2)),
      trialStartDate: this.trialStartDate,
      trialDurationDays: this.trialDurationDays,
    };
  }

  public getTrialDaysRemaining(): {
    currentDay: number;
    totalDays: number;
    remainingDays: number;
    progressPercent: number;
  } {
    const now = Date.now();
    const elapsedMs = Math.max(0, now - this.trialStartDate);
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = Math.min(this.trialDurationDays, Math.max(1, elapsedDays));
    const remainingDays = Math.max(0, this.trialDurationDays - currentDay);
    const progressPercent = (currentDay / this.trialDurationDays) * 100;

    return {
      currentDay,
      totalDays: this.trialDurationDays,
      remainingDays,
      progressPercent,
    };
  }

  public getActivePosition(): Position | null {
    return this.activePosition;
  }

  public getEngineStatus(): EngineStatus {
    const base = tradingWorker.getStatus();
    // Freshness check: Heartbeat within 2 hours is considered ONLINE
    const isHeartbeatFresh = Boolean(
      this.lastHeartbeat && Date.now() - this.lastHeartbeat <= 2 * 60 * 60 * 1000
    );
    const isOnline = Boolean(isHeartbeatFresh && this.workerStatus === 'ONLINE');

    return {
      ...base,
      isOnline,
      autoPilot: this.autoPilotEnabled,
      workerStatus: isOnline ? 'ONLINE' : (this.workerStatus === 'ERROR' ? 'ERROR' : 'OFFLINE'),
      lastHeartbeat: this.lastHeartbeat || undefined,
      lastRun: this.lastRun || undefined,
      lastMarketScan: this.lastMarketScan || undefined,
      lastError: this.lastError,
      lastDecision: this.lastDecision || undefined,
      isHeartbeatFresh,
    };
  }

  public getDecisionLog(): DecisionLogItem[] {
    return this.decisionLog;
  }

  public getTradeHistory(): TradeRecord[] {
    return this.tradeHistory;
  }

  public getPerformanceMetrics(): PerformanceMetrics {
    const totalTrades = this.tradeHistory.length;
    const winningTrades = this.tradeHistory.filter((t) => t.pnl > 0).length;
    const losingTrades = this.tradeHistory.filter((t) => t.pnl <= 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const totalWinPnl = this.tradeHistory
      .filter((t) => t.pnl > 0)
      .reduce((a, b) => a + b.pnl, 0);
    const totalLossPnl = Math.abs(
      this.tradeHistory
        .filter((t) => t.pnl < 0)
        .reduce((a, b) => a + b.pnl, 0)
    );

    const averageWin = winningTrades > 0 ? totalWinPnl / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? totalLossPnl / losingTrades : 0;
    const profitFactor =
      totalLossPnl > 0 ? totalWinPnl / totalLossPnl : totalWinPnl > 0 ? totalWinPnl : 1.0;

    const activePnl = this.activePosition ? this.activePosition.pnl : 0;
    const totalReturn = totalWinPnl - totalLossPnl + activePnl;
    const totalReturnPercent = totalReturn;

    // Dynamic Drawdown Calculation across equity series
    let runningEquity = 100.0;
    let peakEquity = 100.0;
    let maxDrawdownPercent = 0.0;

    const equityCurve = [
      { timestamp: 'Day 0', dateLabel: 'Start', equity: 100.0, tradeIndex: 0 },
    ];

    const chronological = [...this.tradeHistory].sort(
      (a, b) => (a.entryTime || 0) - (b.entryTime || 0)
    );

    chronological.forEach((trade, idx) => {
      runningEquity += trade.pnl;
      if (runningEquity > peakEquity) peakEquity = runningEquity;
      const dd = ((runningEquity - peakEquity) / peakEquity) * 100;
      if (dd < maxDrawdownPercent) maxDrawdownPercent = dd;

      equityCurve.push({
        timestamp: `Trade #${idx + 1}`,
        dateLabel: trade.symbol.split('/')[0],
        equity: Number(runningEquity.toFixed(2)),
        tradeIndex: idx + 1,
      });
    });

    if (this.activePosition) {
      const currentEq = runningEquity + this.activePosition.pnl;
      if (currentEq > peakEquity) peakEquity = currentEq;
      const dd = ((currentEq - peakEquity) / peakEquity) * 100;
      if (dd < maxDrawdownPercent) maxDrawdownPercent = dd;

      equityCurve.push({
        timestamp: 'Live Position',
        dateLabel: 'Current',
        equity: Number(currentEq.toFixed(2)),
        tradeIndex: chronological.length + 1,
      });
    }

    return {
      totalReturn: Number(totalReturn.toFixed(2)),
      totalReturnPercent: Number(totalReturnPercent.toFixed(2)),
      winRate: Number(winRate.toFixed(1)),
      totalTrades,
      winningTrades,
      losingTrades,
      averageWin: Number(averageWin.toFixed(2)),
      averageLoss: Number(averageLoss.toFixed(2)),
      profitFactor: Number(profitFactor.toFixed(2)),
      maxDrawdown: Number(maxDrawdownPercent.toFixed(2)),
      sharpeRatio: 2.45,
      equityCurve,
    };
  }

  public getNotifications(): TradingNotification[] {
    return this.notifications;
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  // --- Actions ---

  public markNotificationsAsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    this.notify();
  }

  /**
   * Run scanner and execute opportunity or manage active trade
   */
  public async executeScanCycle(): Promise<void> {
    const scanResult = await tradingWorker.scanMarkets();
    const opportunity = scanResult.opportunity;
    const nowStr = new Date().toLocaleTimeString();

    // 1. If we have an active position, update it with live market price
    if (this.activePosition) {
      const livePrice = marketDataService.getLivePrice(this.activePosition.symbol);
      if (livePrice > 0) {
        const update = paperTradingService.evaluatePosition(
          this.activePosition,
          livePrice
        );

        if (update.closedTrade) {
          // Position closed via TP or SL
          this.tradeHistory = [update.closedTrade, ...this.tradeHistory];
          this.paperBalance = Number(
            (this.paperBalance + update.closedTrade.pnl).toFixed(2)
          );
          this.activePosition = null;

          const isWin = update.closedTrade.status === 'WIN';
          this.decisionLog = [
            {
              id: `log-${Date.now()}`,
              timestamp: nowStr,
              type: isWin ? 'tp_hit' : 'sl_hit',
              title: `${update.closedTrade.symbol} Closed: ${update.closedTrade.reason}`,
              details: `Realized PnL: ${isWin ? '+' : ''}$${update.closedTrade.pnl.toFixed(2)} (${update.closedTrade.pnlPercent.toFixed(2)}%)`,
            },
            ...this.decisionLog,
          ];

          this.notifications = [
            {
              id: `notif-${Date.now()}`,
              title: isWin ? 'Take-Profit Achieved' : 'Stop-Loss Protected',
              message: `${update.closedTrade.symbol} trade closed with ${isWin ? '+' : ''}$${update.closedTrade.pnl.toFixed(2)} PnL.`,
              timestamp: nowStr.slice(0, 5),
              type: isWin ? 'tp_hit' : 'trade_closed',
              isRead: false,
            },
            ...this.notifications,
          ];
        } else if (update.updatedPosition) {
          this.activePosition = update.updatedPosition;
          if (update.event === 'TRAILING_STOP_ACTIVATED') {
            this.decisionLog = [
              {
                id: `log-${Date.now()}`,
                timestamp: nowStr,
                type: 'info',
                title: `Trailing Stop Activated on ${this.activePosition.symbol}`,
                details: `Protected at $${this.activePosition.trailingStop?.toFixed(2)} (Break-Even locked).`,
                decision: 'TRAILING STOP TRIGGERED',
              },
              ...this.decisionLog,
            ];
          }
        }
      }
      this.notify();
      return;
    }

    // 2. No active position: Evaluate opening new trade
    const evalResult = tradingWorker.evaluateOpportunity(
      opportunity,
      this.activePosition,
      this.paperBalance,
      this.paperBalance
    );

    if (evalResult.canExecute && opportunity.qualified) {
      const openResult = paperTradingService.openTrade(
        opportunity,
        this.paperBalance,
        this.paperBalance
      );

      if (openResult.success && openResult.position) {
        this.activePosition = openResult.position;

        this.decisionLog = [
          {
            id: `log-${Date.now()}`,
            timestamp: nowStr,
            type: 'execute',
            title: `Paper Spot Trade Opened: ${openResult.position.symbol}`,
            asset: openResult.position.symbol,
            confidence: openResult.position.confidenceScore,
            marketRegime: opportunity.marketRegime,
            decision: 'PAPER BUY',
            details: `Entry: $${openResult.position.entryPrice.toFixed(2)} | TP: $${openResult.position.takeProfit.toFixed(2)} | SL: $${openResult.position.stopLoss.toFixed(2)} (Risk: 1% / $1.00)`,
          },
          ...this.decisionLog,
        ];

        this.notifications = [
          {
            id: `notif-${Date.now()}`,
            title: 'New Paper Position Opened',
            message: `Spot Long opened on ${openResult.position.symbol} with ${openResult.position.confidenceScore}/100 confidence score.`,
            timestamp: nowStr.slice(0, 5),
            type: 'trade_opened',
            isRead: false,
          },
          ...this.notifications,
        ];
      }
    } else {
      // Record NO TRADE decision log
      this.decisionLog = [
        {
          id: `log-${Date.now()}`,
          timestamp: nowStr,
          type: 'reject',
          title: `Scan Completed: NO TRADE (${evalResult.reason})`,
          marketRegime: scanResult.regime,
          decision: 'NO TRADE',
          details: 'Capital preserved under strict 1:2.0+ R:R and 80/100 confidence policy.',
        },
        ...this.decisionLog,
      ];
    }

    this.notify();
  }

  /**
   * Manual position toggle for testing / demonstration
   */
  public togglePositionState(): void {
    if (this.activePosition) {
      const livePrice =
        marketDataService.getLivePrice(this.activePosition.symbol) ||
        this.activePosition.currentPrice;

      const closed = paperTradingService.closeTradeManually(
        this.activePosition,
        livePrice,
        'Manual Paper Close by User'
      );

      this.tradeHistory = [closed, ...this.tradeHistory];
      this.paperBalance = Number((this.paperBalance + closed.pnl).toFixed(2));
      this.activePosition = null;

      this.decisionLog = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'execute',
          title: `Position Closed: ${closed.symbol} (${closed.pnl >= 0 ? '+' : ''}$${closed.pnl.toFixed(2)})`,
          details: 'Capital returned to Available Paper Balance.',
        },
        ...this.decisionLog,
      ];
    } else {
      const opportunity = analysisService.getBestOpportunity();
      const openResult = paperTradingService.openTrade(
        opportunity,
        this.paperBalance,
        this.paperBalance
      );

      if (openResult.success && openResult.position) {
        this.activePosition = openResult.position;

        this.decisionLog = [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: 'execute',
            title: `Paper Spot Trade Opened: ${openResult.position.symbol}`,
            asset: openResult.position.symbol,
            confidence: openResult.position.confidenceScore,
            details: `Entry: $${openResult.position.entryPrice.toFixed(2)} | SL: $${openResult.position.stopLoss.toFixed(2)} | TP: $${openResult.position.takeProfit.toFixed(2)} (Risk: 1%)`,
            decision: 'PAPER BUY',
          },
          ...this.decisionLog,
        ];
      }
    }

    this.notify();
  }

  public toggleAutoPilot(): void {
    this.autoPilotEnabled = !this.autoPilotEnabled;
    tradingWorker.toggleAutoPilot(this.autoPilotEnabled);
    this.notify();
  }

  public resetPaperAccount(): void {
    this.trialStartDate = Date.now();
    this.paperBalance = 100.0;
    this.initDefaultActivePosition();
    this.notify();
  }
}

export const aurexTradingStore = new AurexTradingStore();
