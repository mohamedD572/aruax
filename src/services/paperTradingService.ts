import {
  BestOpportunity,
  Position,
  TradeRecord,
} from '../types/trading';
import { riskService } from './riskService';

export interface PositionUpdateResult {
  updatedPosition: Position | null;
  closedTrade: TradeRecord | null;
  event?: 'TP_HIT' | 'SL_HIT' | 'TRAILING_STOP_ACTIVATED' | 'PRICE_UPDATE';
  message?: string;
}

export class PaperTradingService {
  /**
   * Open a new Paper Trade from a qualified opportunity
   */
  public openTrade(
    opportunity: BestOpportunity,
    equity: number,
    availableBalance: number,
    userId?: string | number
  ): { success: boolean; position?: Position; error?: string } {
    // 1. Calculate safe 1% risk sizing
    const risk = riskService.calculatePositionRisk(
      equity,
      availableBalance,
      opportunity.currentPrice,
      opportunity.stopLossPrice,
      opportunity.targetPrice
    );

    if (!risk.isValid) {
      return {
        success: false,
        error: risk.validationError || 'Trade did not meet risk management criteria.',
      };
    }

    const tradeId = `paper-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const position: Position = {
      id: tradeId,
      tradeId,
      userId: userId || 'tg-user',
      symbol: opportunity.symbol,
      name: opportunity.name,
      category: opportunity.category,
      type: 'LONG / SPOT',
      side: 'SPOT_BUY',
      entryPrice: opportunity.currentPrice,
      currentPrice: opportunity.currentPrice,
      quantity: risk.recommendedUnits,
      investedAmount: risk.investedCapital,
      pnl: 0.0,
      pnlPercent: 0.0,
      takeProfit: opportunity.targetPrice,
      stopLoss: opportunity.stopLossPrice,
      trailingStop: null,
      confidenceScore: opportunity.confidence,
      scoreBreakdown: opportunity.scoreBreakdown,
      openedAt: Date.now(),
      status: 'OPEN',
      riskRewardRatio: risk.riskRewardRatio,
    };

    return { success: true, position };
  }

  /**
   * Monitor and manage open position against live price updates
   */
  public evaluatePosition(
    position: Position,
    currentLivePrice: number
  ): PositionUpdateResult {
    if (position.status !== 'OPEN') {
      return { updatedPosition: null, closedTrade: null };
    }

    const entryPrice = position.entryPrice;
    const quantity = position.quantity;
    const investedAmount = position.investedAmount;

    // Calculate current PnL
    const unrealizedPnl = (currentLivePrice - entryPrice) * quantity;
    const pnlPercent = entryPrice > 0 ? ((currentLivePrice - entryPrice) / entryPrice) * 100 : 0;

    let currentStop = position.trailingStop !== null ? position.trailingStop : position.stopLoss;
    let event: PositionUpdateResult['event'] = 'PRICE_UPDATE';
    let message: string | undefined;

    // 1. Check Take Profit Hit
    if (currentLivePrice >= position.takeProfit) {
      const exitPrice = position.takeProfit;
      const realizedPnl = (exitPrice - entryPrice) * quantity;
      const returnPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
      const durationFormatted = this.formatDuration(Date.now() - position.openedAt);

      const closedTrade: TradeRecord = {
        id: position.id,
        tradeId: position.tradeId,
        userId: position.userId,
        symbol: position.symbol,
        name: position.name,
        category: position.category,
        type: 'LONG / SPOT',
        side: 'SPOT_BUY',
        entryPrice,
        exitPrice,
        quantity,
        investedAmount,
        stopLoss: position.stopLoss,
        takeProfit: position.takeProfit,
        pnl: realizedPnl,
        pnlPercent: returnPercent,
        returnAmount: investedAmount + realizedPnl,
        duration: durationFormatted,
        confidence: position.confidenceScore,
        reason: `Take-Profit Target Hit at $${exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Full profit locked safely.`,
        entryTime: position.openedAt,
        exitTime: Date.now(),
        openedAt: position.openedAt,
        closedAt: Date.now(),
        status: 'WIN',
      };

      return {
        updatedPosition: null,
        closedTrade,
        event: 'TP_HIT',
        message: `Take-profit triggered on ${position.symbol} (+$${realizedPnl.toFixed(2)}).`,
      };
    }

    // 2. Check Stop Loss or Trailing Stop Hit
    if (currentLivePrice <= currentStop) {
      const exitPrice = currentStop;
      const realizedPnl = (exitPrice - entryPrice) * quantity;
      const returnPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
      const isWin = realizedPnl >= 0;
      const durationFormatted = this.formatDuration(Date.now() - position.openedAt);

      const closedTrade: TradeRecord = {
        id: position.id,
        tradeId: position.tradeId,
        userId: position.userId,
        symbol: position.symbol,
        name: position.name,
        category: position.category,
        type: 'LONG / SPOT',
        side: 'SPOT_BUY',
        entryPrice,
        exitPrice,
        quantity,
        investedAmount,
        stopLoss: position.stopLoss,
        takeProfit: position.takeProfit,
        pnl: realizedPnl,
        pnlPercent: returnPercent,
        returnAmount: Math.max(0, investedAmount + realizedPnl),
        duration: durationFormatted,
        confidence: position.confidenceScore,
        reason:
          position.trailingStop !== null
            ? `Trailing Stop Hit at $${exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Capital preserved.`
            : `Stop-Loss triggered at $${exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Risk capped at strictly 1%.`,
        entryTime: position.openedAt,
        exitTime: Date.now(),
        openedAt: position.openedAt,
        closedAt: Date.now(),
        status: isWin ? 'WIN' : 'LOSS',
      };

      return {
        updatedPosition: null,
        closedTrade,
        event: 'SL_HIT',
        message: `Stop triggered on ${position.symbol} ($${realizedPnl.toFixed(2)}).`,
      };
    }

    // 3. Dynamic Trailing Stop Adjustment:
    // When price reaches +1.0% gain (or 1R), move stop to Break-Even + buffer
    let newTrailingStop = position.trailingStop;
    if (pnlPercent >= 1.0) {
      const breakEvenPrice = entryPrice * 1.002; // Entry + 0.2% fee cushion
      if (newTrailingStop === null || breakEvenPrice > newTrailingStop) {
        newTrailingStop = breakEvenPrice;
        event = 'TRAILING_STOP_ACTIVATED';
        message = `Break-Even Stop activated at $${newTrailingStop.toFixed(2)}. Trade is now risk-free.`;
      }
    }

    // If profit expands above +2.0%, trail by half the initial stop distance
    if (pnlPercent >= 2.0) {
      const initialRiskDistance = Math.abs(entryPrice - position.stopLoss);
      const dynamicTrail = currentLivePrice - initialRiskDistance * 0.75;
      if (newTrailingStop === null || dynamicTrail > newTrailingStop) {
        // Enforce rule: Stop loss ONLY moves UP, NEVER down
        newTrailingStop = Math.max(newTrailingStop || 0, dynamicTrail);
      }
    }

    const updatedPosition: Position = {
      ...position,
      currentPrice: currentLivePrice,
      pnl: unrealizedPnl,
      pnlPercent,
      trailingStop: newTrailingStop,
    };

    return {
      updatedPosition,
      closedTrade: null,
      event,
      message,
    };
  }

  /**
   * Manually close an active position at current live price
   */
  public closeTradeManually(
    position: Position,
    currentLivePrice: number,
    closeReason: string = 'Manually closed by user'
  ): TradeRecord {
    const entryPrice = position.entryPrice;
    const quantity = position.quantity;
    const investedAmount = position.investedAmount;
    const realizedPnl = (currentLivePrice - entryPrice) * quantity;
    const returnPercent = ((currentLivePrice - entryPrice) / entryPrice) * 100;
    const durationFormatted = this.formatDuration(Date.now() - position.openedAt);

    return {
      id: position.id,
      tradeId: position.tradeId,
      userId: position.userId,
      symbol: position.symbol,
      name: position.name,
      category: position.category,
      type: 'LONG / SPOT',
      side: 'SPOT_BUY',
      entryPrice,
      exitPrice: currentLivePrice,
      quantity,
      investedAmount,
      stopLoss: position.stopLoss,
      takeProfit: position.takeProfit,
      pnl: realizedPnl,
      pnlPercent: returnPercent,
      returnAmount: Math.max(0, investedAmount + realizedPnl),
      duration: durationFormatted,
      confidence: position.confidenceScore,
      reason: closeReason,
      entryTime: position.openedAt,
      exitTime: Date.now(),
      openedAt: position.openedAt,
      closedAt: Date.now(),
      status: realizedPnl >= 0 ? 'WIN' : 'LOSS',
    };
  }

  private formatDuration(ms: number): string {
    const minutes = Math.max(1, Math.floor(ms / 60000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remMins = minutes % 60;
    return `${hours}h ${remMins}m`;
  }
}

export const paperTradingService = new PaperTradingService();
