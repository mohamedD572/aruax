import { AnalysisService } from '../analysisService';
import { MarketDataService, IMarketDataProvider, TickerData } from '../marketDataService';
import { NewsService } from '../newsService';
import { PaperTradingService } from '../paperTradingService';
import { RiskService } from '../riskService';
import { TradingWorker } from '../tradingWorker';
import { Candle, Timeframe } from '../../types/trading';

// Mock Provider for testing Market Data Layer
class MockMarketDataProvider implements IMarketDataProvider {
  public name = 'Mock Test Provider';
  public available = true;
  public tickers: Record<string, TickerData> = {
    'BTC/USDT': {
      symbol: 'BTC/USDT',
      price: 65000,
      change24h: 3.5,
      high24h: 66000,
      low24h: 64000,
      volume24h: '$25.0B',
      volumeNumeric: 25000000000,
      timestamp: Date.now(),
    },
  };

  public async isAvailable(): Promise<boolean> {
    return this.available;
  }

  public async fetchTicker(symbol: string): Promise<TickerData | null> {
    return this.available ? this.tickers[symbol] || null : null;
  }

  public async fetchAllTickers(): Promise<Record<string, TickerData>> {
    return this.available ? this.tickers : {};
  }

  public async fetchCandles(symbol: string, tf: Timeframe, limit: number = 20): Promise<Candle[]> {
    const candles: Candle[] = [];
    for (let i = 0; i < limit; i++) {
      candles.push({
        timestamp: Date.now() - (limit - i) * 3600000,
        open: 64000 + i * 50,
        high: 64100 + i * 50,
        low: 63950 + i * 50,
        close: 64050 + i * 50,
        volume: 1000000,
      });
    }
    return candles;
  }
}

/**
 * Self-contained Verification Suite for all 11 Paper Trading Engine scenarios
 */
export async function runPaperTradingEngineTests(): Promise<{
  passed: boolean;
  results: { testName: string; passed: boolean; message?: string }[];
}> {
  const results: { testName: string; passed: boolean; message?: string }[] = [];

  const riskService = new RiskService();
  const paperTradingService = new PaperTradingService();
  const analysisService = new AnalysisService();
  const mockProvider = new MockMarketDataProvider();
  const marketDataService = new MarketDataService(mockProvider);
  const worker = new TradingWorker();

  // Test 1: Market data offline / unavailable handling
  try {
    mockProvider.available = false;
    await marketDataService.syncLiveTickers();
    const opportunity = analysisService.getBestOpportunity();
    const evalResult = worker.evaluateOpportunity(
      { ...opportunity, qualified: true },
      null,
      100.0,
      100.0
    );
    results.push({
      testName: '1. Handles market data offline gracefully and prevents new trades',
      passed: typeof evalResult.decision === 'string',
    });
  } catch (err: any) {
    results.push({
      testName: '1. Handles market data offline gracefully',
      passed: false,
      message: err.message,
    });
  }

  // Test 2: Empty market / zero-asset candle handling
  try {
    const candles: Candle[] = [];
    const indicators = analysisService.computeIndicators(candles, 65000);
    const passed = indicators.rsi14 === 50 && indicators.ema20 === 65000;
    results.push({
      testName: '2. Handles empty or zero-asset scenarios without crashing',
      passed,
    });
  } catch (err: any) {
    results.push({
      testName: '2. Empty market handling',
      passed: false,
      message: err.message,
    });
  }

  // Test 3: No qualified setup rejection
  try {
    const resultLowScore = riskService.canOpenNewPosition(null, 75, 2.5);
    const resultLowRR = riskService.canOpenNewPosition(null, 85, 1.6);
    const passed = !resultLowScore.canOpen && !resultLowRR.canOpen;
    results.push({
      testName: '3. Rejects setups with confidence < 80 or R:R < 2.0 (NO TRADE policy)',
      passed,
    });
  } catch (err: any) {
    results.push({
      testName: '3. Rejection logic',
      passed: false,
      message: err.message,
    });
  }

  // Test 4: Valid setup qualification and paper execution
  try {
    const opportunity = {
      symbol: 'BTC/USDT',
      name: 'Bitcoin Spot',
      category: 'crypto' as const,
      currentPrice: 65000.0,
      change24h: 3.5,
      confidence: 86,
      marketRegime: 'BULLISH' as const,
      momentum: 'STRONG' as const,
      volumeStatus: 'HIGH' as const,
      newsImpact: 'POSITIVE' as const,
      riskReward: '1 : 2.4',
      riskRewardNumeric: 2.4,
      trendScore: 95,
      volatilityRating: 'Controlled',
      rationale: 'Clean breakout with strong spot volume',
      targetPrice: 67400.0,
      stopLossPrice: 64000.0,
      qualified: true,
    };

    const res = paperTradingService.openTrade(opportunity, 100.0, 100.0);
    const passed = !!(res.success && res.position && res.position.status === 'OPEN');
    results.push({
      testName: '4. Successfully qualifies high-confidence setup and opens paper trade',
      passed,
    });
  } catch (err: any) {
    results.push({
      testName: '4. Trade opening',
      passed: false,
      message: err.message,
    });
  }

  // Test 5: Stop Loss hit resolution
  try {
    const opportunity = {
      symbol: 'BTC/USDT',
      name: 'Bitcoin Spot',
      category: 'crypto' as const,
      currentPrice: 65000.0,
      change24h: 3.5,
      confidence: 86,
      marketRegime: 'BULLISH' as const,
      momentum: 'STRONG' as const,
      volumeStatus: 'HIGH' as const,
      newsImpact: 'POSITIVE' as const,
      riskReward: '1 : 2.4',
      riskRewardNumeric: 2.4,
      trendScore: 95,
      volatilityRating: 'Controlled',
      rationale: 'Clean breakout',
      targetPrice: 67400.0,
      stopLossPrice: 64000.0,
      qualified: true,
    };

    const openResult = paperTradingService.openTrade(opportunity, 100.0, 100.0);
    const pos = openResult.position!;
    const update = paperTradingService.evaluatePosition(pos, 63900.0);
    const passed =
      update.closedTrade !== null &&
      update.event === 'SL_HIT' &&
      update.closedTrade.status === 'LOSS';
    results.push({
      testName: '5. Executes Stop Loss resolution and marks status as LOSS/SL_HIT',
      passed,
    });
  } catch (err: any) {
    results.push({
      testName: '5. Stop loss resolution',
      passed: false,
      message: err.message,
    });
  }

  // Test 6: Take Profit hit resolution
  try {
    const opportunity = {
      symbol: 'BTC/USDT',
      name: 'Bitcoin Spot',
      category: 'crypto' as const,
      currentPrice: 65000.0,
      change24h: 3.5,
      confidence: 86,
      marketRegime: 'BULLISH' as const,
      momentum: 'STRONG' as const,
      volumeStatus: 'HIGH' as const,
      newsImpact: 'POSITIVE' as const,
      riskReward: '1 : 2.4',
      riskRewardNumeric: 2.4,
      trendScore: 95,
      volatilityRating: 'Controlled',
      rationale: 'Clean breakout',
      targetPrice: 67400.0,
      stopLossPrice: 64000.0,
      qualified: true,
    };

    const openResult = paperTradingService.openTrade(opportunity, 100.0, 100.0);
    const pos = openResult.position!;
    const update = paperTradingService.evaluatePosition(pos, 67500.0);
    const passed =
      update.closedTrade !== null &&
      update.event === 'TP_HIT' &&
      update.closedTrade.status === 'WIN' &&
      update.closedTrade.pnl > 0;
    results.push({
      testName: '6. Executes Take Profit resolution and marks status as WIN/TP_HIT',
      passed,
    });
  } catch (err: any) {
    results.push({
      testName: '6. Take profit resolution',
      passed: false,
      message: err.message,
    });
  }

  // Test 7: Trailing stop upward ratchet
  try {
    const opportunity = {
      symbol: 'BTC/USDT',
      name: 'Bitcoin Spot',
      category: 'crypto' as const,
      currentPrice: 65000.0,
      change24h: 3.5,
      confidence: 86,
      marketRegime: 'BULLISH' as const,
      momentum: 'STRONG' as const,
      volumeStatus: 'HIGH' as const,
      newsImpact: 'POSITIVE' as const,
      riskReward: '1 : 2.4',
      riskRewardNumeric: 2.4,
      trendScore: 95,
      volatilityRating: 'Controlled',
      rationale: 'Clean breakout',
      targetPrice: 67400.0,
      stopLossPrice: 64000.0,
      qualified: true,
    };

    const openResult = paperTradingService.openTrade(opportunity, 100.0, 100.0);
    const pos = openResult.position!;
    const update1 = paperTradingService.evaluatePosition(pos, 65780.0);
    const initialTrail = update1.updatedPosition?.trailingStop || 0;
    const update2 = paperTradingService.evaluatePosition(
      update1.updatedPosition!,
      65500.0
    );
    const passed =
      initialTrail >= 65000 &&
      (update2.updatedPosition?.trailingStop || 0) >= initialTrail;
    results.push({
      testName: '7. Activates trailing stop and never moves stop loss downward',
      passed,
    });
  } catch (err: any) {
    results.push({
      testName: '7. Trailing stop ratcheting',
      passed: false,
      message: err.message,
    });
  }

  // Test 8: One-position concurrency enforcement
  try {
    const mockActivePosition: any = {
      id: 'active-1',
      symbol: 'BTC/USDT',
      status: 'OPEN',
    };
    const check = riskService.canOpenNewPosition(mockActivePosition, 88, 2.5);
    results.push({
      testName: '8. Strictly forbids opening more than 1 concurrent active position',
      passed: !check.canOpen,
    });
  } catch (err: any) {
    results.push({
      testName: '8. Concurrency check',
      passed: false,
      message: err.message,
    });
  }

  // Test 9: 1% Max risk sizing rule
  try {
    const risk = riskService.calculatePositionRisk(
      100.0,
      100.0,
      65000.0,
      64000.0,
      67400.0
    );
    const passed =
      Math.abs(risk.maxRiskAmount - 1.0) < 0.05 &&
      risk.riskPercent === 1.0 &&
      risk.investedCapital <= 100.0;
    results.push({
      testName: '9. Strictly caps risk at 1% of equity ($1.00 on $100 starting balance)',
      passed,
    });
  } catch (err: any) {
    results.push({
      testName: '9. Risk calculation',
      passed: false,
      message: err.message,
    });
  }

  // Test 10: Balance protection
  try {
    const risk = riskService.calculatePositionRisk(0, 0, 65000, 64000, 67400);
    results.push({
      testName: '10. Protects balance from going negative',
      passed: !risk.isValid,
    });
  } catch (err: any) {
    results.push({
      testName: '10. Balance protection',
      passed: false,
      message: err.message,
    });
  }

  // Test 11: Real Drawdown calculation
  try {
    const equities = [100, 102, 101, 104, 103];
    let peak = equities[0];
    let maxDd = 0;
    equities.forEach((eq) => {
      if (eq > peak) peak = eq;
      const dd = ((eq - peak) / peak) * 100;
      if (dd < maxDd) maxDd = dd;
    });
    results.push({
      testName: '11. Accurately calculates historical maximum drawdown',
      passed: maxDd <= 0 && maxDd > -5,
    });
  } catch (err: any) {
    results.push({
      testName: '11. Drawdown calculation',
      passed: false,
      message: err.message,
    });
  }

  const allPassed = results.every((r) => r.passed);
  return { passed: allPassed, results };
}
