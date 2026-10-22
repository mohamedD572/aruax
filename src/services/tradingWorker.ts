import {
  BestOpportunity,
  EngineStatus,
  MarketDataStatus,
  MarketRegime,
  Position,
  TradeRecord,
} from '../types/trading';
import { analysisService } from './analysisService';
import { marketDataService } from './marketDataService';
import { paperTradingService, PositionUpdateResult } from './paperTradingService';
import { riskService } from './riskService';

/**
 * 24/7 Trading Worker Abstraction
 * Completely decoupled from React render loops.
 * Can run standalone in Node, Cloud Functions, or background Web Worker.
 */
export class TradingWorker {
  private isRunning: boolean = true;
  private autoPilot: boolean = true;
  private lastScanTimestamp: number = Date.now();
  private scanIntervalSeconds: number = 60;
  private currentRegime: MarketRegime = 'BULLISH';

  // Callbacks for decoupled listeners (Store, WebSockets, Telegram Bots)
  private onTradeExecutedListeners: Array<(pos: Position) => void> = [];
  private onTradeClosedListeners: Array<(trade: TradeRecord, event: string) => void> = [];
  private onScanCycleListeners: Array<(opportunity: BestOpportunity, decision: string) => void> = [];

  public start(): void {
    this.isRunning = true;
  }

  public stop(): void {
    this.isRunning = false;
  }

  public toggleAutoPilot(enabled: boolean): void {
    this.autoPilot = enabled;
  }

  public isAutoPilotActive(): boolean {
    return this.autoPilot && this.isRunning;
  }

  /**
   * Scan universe, evaluate multi-timeframe indicators and rank opportunities
   */
  public async scanMarkets(): Promise<{
    opportunity: BestOpportunity;
    regime: MarketRegime;
    dataStatus: MarketDataStatus;
  }> {
    this.lastScanTimestamp = Date.now();

    // 1. Sync live tickers from market data layer
    await marketDataService.syncLiveTickers();
    const dataStatus = marketDataService.getStatus();

    // 2. Multi-timeframe technical scan & evaluation
    const evaluation = analysisService.evaluateUniverse();
    this.currentRegime = evaluation.stats.marketRegime;

    return {
      opportunity: evaluation.bestOpportunity,
      regime: this.currentRegime,
      dataStatus,
    };
  }

  /**
   * Evaluate if a qualified opportunity can be executed under paper trading risk rules
   */
  public evaluateOpportunity(
    opportunity: BestOpportunity,
    activePosition: Position | null,
    equity: number,
    availableBalance: number
  ): {
    canExecute: boolean;
    reason: string;
    decision: 'PAPER BUY' | 'NO TRADE';
  } {
    // 1. Check one position rule & minimum thresholds
    const suitability = riskService.canOpenNewPosition(
      activePosition,
      opportunity.confidence,
      opportunity.riskRewardNumeric
    );

    if (!suitability.canOpen) {
      return {
        canExecute: false,
        reason: suitability.reason || 'Opportunity did not pass risk filters.',
        decision: 'NO TRADE',
      };
    }

    // 2. Check market data freshness
    if (!marketDataService.isMarketDataFresh()) {
      return {
        canExecute: false,
        reason: 'Market data is offline or stale. Execution paused for safety.',
        decision: 'NO TRADE',
      };
    }

    // 3. Check market regime
    if (opportunity.marketRegime !== 'BULLISH') {
      return {
        canExecute: false,
        reason: `Market regime is ${opportunity.marketRegime}. Spot LONG requires BULLISH regime.`,
        decision: 'NO TRADE',
      };
    }

    // 4. Check sizing eligibility
    const riskCalc = riskService.calculatePositionRisk(
      equity,
      availableBalance,
      opportunity.currentPrice,
      opportunity.stopLossPrice,
      opportunity.targetPrice
    );

    if (!riskCalc.isValid) {
      return {
        canExecute: false,
        reason: riskCalc.validationError || 'Position sizing check failed.',
        decision: 'NO TRADE',
      };
    }

    return {
      canExecute: true,
      reason: `Qualified 1:2.0+ setup with ${opportunity.confidence}/100 confidence. 1% max risk applied.`,
      decision: 'PAPER BUY',
    };
  }

  /**
   * Execute paper trade for a qualified opportunity
   */
  public executePaperTrade(
    opportunity: BestOpportunity,
    equity: number,
    availableBalance: number,
    userId?: string | number
  ): { success: boolean; position?: Position; error?: string } {
    const result = paperTradingService.openTrade(
      opportunity,
      equity,
      availableBalance,
      userId
    );

    if (result.success && result.position) {
      this.onTradeExecutedListeners.forEach((fn) => fn(result.position!));
    }

    return result;
  }

  /**
   * Manage active open position against live price updates
   */
  public manageOpenPosition(
    position: Position,
    currentLivePrice: number
  ): PositionUpdateResult {
    const result = paperTradingService.evaluatePosition(position, currentLivePrice);

    if (result.closedTrade && result.event) {
      this.onTradeClosedListeners.forEach((fn) =>
        fn(result.closedTrade!, result.event!)
      );
    }

    return result;
  }

  /**
   * Get formatted Engine Status for UI or reporting
   */
  public getStatus(): EngineStatus {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - this.lastScanTimestamp) / 1000);
    const nextScan = Math.max(
      0,
      this.scanIntervalSeconds - (elapsedSeconds % this.scanIntervalSeconds)
    );

    const scanDate = new Date(this.lastScanTimestamp);
    const hours = scanDate.getHours().toString().padStart(2, '0');
    const minutes = scanDate.getMinutes().toString().padStart(2, '0');
    const seconds = scanDate.getSeconds().toString().padStart(2, '0');

    const dataStatus = marketDataService.getStatus();

    return {
      isOnline: this.isRunning,
      lastScanTime: `${hours}:${minutes}:${seconds}`,
      nextScanInSeconds: nextScan,
      marketScannerConnected: dataStatus === 'ONLINE',
      newsAnalyzerConnected: true,
      riskEngineActive: true,
      paperExecutionActive: true,
      autoPilot: this.autoPilot,
      marketDataStatus: dataStatus,
      marketRegime: this.currentRegime,
    };
  }

  // Listener subscriptions
  public onTradeExecuted(fn: (pos: Position) => void): () => void {
    this.onTradeExecutedListeners.push(fn);
    return () => {
      this.onTradeExecutedListeners = this.onTradeExecutedListeners.filter(
        (l) => l !== fn
      );
    };
  }

  public onTradeClosed(
    fn: (trade: TradeRecord, event: string) => void
  ): () => void {
    this.onTradeClosedListeners.push(fn);
    return () => {
      this.onTradeClosedListeners = this.onTradeClosedListeners.filter(
        (l) => l !== fn
      );
    };
  }
}

export const tradingWorker = new TradingWorker();
