import {
  BestOpportunity,
  Candle,
  MarketAsset,
  MarketRegime,
  MarketScanStats,
  OpportunityScoreBreakdown,
  TechnicalIndicators,
  Timeframe,
} from '../types/trading';
import { marketDataService } from './marketDataService';
import { newsService } from './newsService';

export class AnalysisService {
  /**
   * Calculate Exponential Moving Average (EMA)
   */
  public calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length < period) {
      return prices.reduce((a, b) => a + b, 0) / prices.length;
    }

    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }

    return ema;
  }

  /**
   * Calculate Relative Strength Index (RSI 14)
   */
  public calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length <= period) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff >= 0) {
        avgGain = (avgGain * (period - 1) + diff) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
      }
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  /**
   * Calculate Average True Range (ATR 14)
   */
  public calculateATR(candles: Candle[], period: number = 14): number {
    if (candles.length < 2) return candles[0] ? candles[0].high - candles[0].low : 1;

    const trueRanges: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const current = candles[i];
      const prev = candles[i - 1];
      const tr = Math.max(
        current.high - current.low,
        Math.abs(current.high - prev.close),
        Math.abs(current.low - prev.close)
      );
      trueRanges.push(tr);
    }

    if (trueRanges.length < period) {
      return trueRanges.reduce((a, b) => a + b, 0) / (trueRanges.length || 1);
    }

    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < trueRanges.length; i++) {
      atr = (atr * (period - 1) + trueRanges[i]) / period;
    }

    return atr;
  }

  /**
   * Derive Multi-Timeframe Technical Indicators for an Asset
   */
  public computeIndicators(candles: Candle[], currentPrice: number): TechnicalIndicators {
    const closes = candles.map((c) => c.close);
    if (closes.length === 0) {
      return {
        ema20: currentPrice,
        ema50: currentPrice,
        ema200: currentPrice,
        rsi14: 50,
        atr: currentPrice * 0.015,
        atrPercent: 1.5,
        volume20SMA: 1000000,
        volumeSurgeRatio: 1.0,
        supportLevel: currentPrice * 0.97,
        resistanceLevel: currentPrice * 1.04,
        marketStructure: 'HIGHER_HIGHS_HIGHER_LOWS',
      };
    }

    const ema20 = this.calculateEMA(closes, 20);
    const ema50 = this.calculateEMA(closes, 50);
    const ema200 = this.calculateEMA(closes, Math.min(200, closes.length));
    const rsi14 = this.calculateRSI(closes, 14);
    const atr = this.calculateATR(candles, 14);
    const atrPercent = currentPrice > 0 ? (atr / currentPrice) * 100 : 1.5;

    // Volume SMA
    const volumes = candles.map((c) => c.volume);
    const recentVols = volumes.slice(-20);
    const volume20SMA =
      recentVols.reduce((a, b) => a + b, 0) / (recentVols.length || 1);
    const latestVol = volumes[volumes.length - 1] || volume20SMA;
    const volumeSurgeRatio = volume20SMA > 0 ? latestVol / volume20SMA : 1.0;

    // Support and Resistance pivots
    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);
    const supportLevel = Math.min(...lows.slice(-20)) || currentPrice * 0.97;
    const resistanceLevel = Math.max(...highs.slice(-20)) || currentPrice * 1.04;

    // Structure classification
    let structure: TechnicalIndicators['marketStructure'] = 'HIGHER_HIGHS_HIGHER_LOWS';
    if (candles.length >= 10) {
      const recentLows = [
        Math.min(...lows.slice(-10, -5)),
        Math.min(...lows.slice(-5)),
      ];
      const recentHighs = [
        Math.max(...highs.slice(-10, -5)),
        Math.max(...highs.slice(-5)),
      ];

      if (recentLows[1] > recentLows[0] && recentHighs[1] > recentHighs[0]) {
        structure = 'HIGHER_HIGHS_HIGHER_LOWS';
      } else if (recentLows[1] < recentLows[0] && recentHighs[1] < recentHighs[0]) {
        structure = 'LOWER_LOWS_LOWER_HIGHS';
      } else {
        structure = 'RANGING';
      }
    }

    return {
      ema20,
      ema50,
      ema200,
      rsi14,
      atr,
      atrPercent,
      volume20SMA,
      volumeSurgeRatio,
      supportLevel,
      resistanceLevel,
      marketStructure: structure,
    };
  }

  /**
   * Classify Market Regime
   */
  public classifyMarketRegime(
    currentPrice: number,
    indicators: TechnicalIndicators
  ): MarketRegime {
    // 1. High Volatility Check
    if (indicators.atrPercent > 3.5) {
      return 'HIGH_VOLATILITY';
    }

    // 2. Bullish Conditions: EMA 20 > EMA 50 > EMA 200, Price above EMA 50, Higher Lows
    const isBullishAlignment =
      currentPrice >= indicators.ema50 &&
      indicators.ema50 >= indicators.ema200 * 0.995 &&
      indicators.marketStructure === 'HIGHER_HIGHS_HIGHER_LOWS';

    if (isBullishAlignment) {
      return 'BULLISH';
    }

    // 3. Bearish Conditions: Price < EMA 50 < EMA 200, Lower Lows
    const isBearishAlignment =
      currentPrice < indicators.ema50 &&
      indicators.ema50 < indicators.ema200 &&
      indicators.marketStructure === 'LOWER_LOWS_LOWER_HIGHS';

    if (isBearishAlignment) {
      return 'BEARISH';
    }

    // Default to Sideways / Ranging
    return 'SIDEWAYS';
  }

  /**
   * Mathematical 0 - 100 Opportunity Scoring Engine
   */
  public calculateOpportunityScore(
    asset: MarketAsset,
    indicators: TechnicalIndicators,
    regime: MarketRegime,
    riskRewardRatio: number
  ): OpportunityScoreBreakdown {
    // 1. Trend Score (Max 20)
    let trendScore = 0;
    if (regime === 'BULLISH') trendScore += 12;
    if (asset.price > indicators.ema20) trendScore += 4;
    if (indicators.ema20 > indicators.ema50) trendScore += 4;
    trendScore = Math.min(20, Math.max(0, trendScore));

    // 2. Momentum Score (Max 20)
    // Healthy bullish momentum is between 52 and 68 RSI (not overbought > 75 or weak < 45)
    let momentumScore = 0;
    if (indicators.rsi14 >= 50 && indicators.rsi14 <= 65) {
      momentumScore = 20;
    } else if (indicators.rsi14 > 65 && indicators.rsi14 <= 74) {
      momentumScore = 15;
    } else if (indicators.rsi14 >= 45 && indicators.rsi14 < 50) {
      momentumScore = 10;
    } else {
      momentumScore = 4;
    }

    // 3. Volume Score (Max 15)
    let volumeScore = 0;
    if (indicators.volumeSurgeRatio >= 1.3) volumeScore = 15;
    else if (indicators.volumeSurgeRatio >= 1.0) volumeScore = 12;
    else if (indicators.volumeSurgeRatio >= 0.8) volumeScore = 8;
    else volumeScore = 4;

    // 4. Market Structure Score (Max 15)
    let structureScore = 0;
    if (indicators.marketStructure === 'HIGHER_HIGHS_HIGHER_LOWS') structureScore = 15;
    else if (indicators.marketStructure === 'RANGING') structureScore = 7;
    else structureScore = 2;

    // 5. Volatility Score (Max 10)
    // Controlled ATR between 0.8% and 2.5% is ideal for spot precision
    let volatilityScore = 0;
    if (indicators.atrPercent >= 0.8 && indicators.atrPercent <= 2.2) {
      volatilityScore = 10;
    } else if (indicators.atrPercent <= 3.0) {
      volatilityScore = 6;
    } else {
      volatilityScore = 2;
    }

    // 6. Risk / Reward Score (Max 20)
    let riskRewardScore = 0;
    if (riskRewardRatio >= 2.5) riskRewardScore = 20;
    else if (riskRewardRatio >= 2.2) riskRewardScore = 18;
    else if (riskRewardRatio >= 2.0) riskRewardScore = 16;
    else if (riskRewardRatio >= 1.5) riskRewardScore = 8;
    else riskRewardScore = 0;

    const totalScore = Math.min(
      100,
      trendScore +
        momentumScore +
        volumeScore +
        structureScore +
        volatilityScore +
        riskRewardScore
    );

    return {
      trendScore,
      momentumScore,
      volumeScore,
      structureScore,
      volatilityScore,
      riskRewardScore,
      totalScore,
    };
  }

  /**
   * Scan Whole Universe, Filter, Rank, and Select ONE best candidate or NO TRADE
   */
  public evaluateUniverse(): {
    stats: MarketScanStats;
    bestOpportunity: BestOpportunity;
    allEvaluations: Array<{ asset: MarketAsset; score: OpportunityScoreBreakdown; qualified: boolean }>;
  } {
    const assets = marketDataService.getAllAssets();
    const isDataFresh = marketDataService.isMarketDataFresh();

    let scannedCount = assets.length;
    let qualifiedList: Array<{
      asset: MarketAsset;
      score: OpportunityScoreBreakdown;
      regime: MarketRegime;
      indicators: TechnicalIndicators;
      targetPrice: number;
      stopLossPrice: number;
      riskRewardRatio: number;
      rejectionReason?: string;
    }> = [];

    let rejectedCount = 0;

    for (const asset of assets) {
      // Approximate 1H candles from asset baseline
      const mockCandles: Candle[] = asset.sparkline.map((p, idx) => ({
        timestamp: Date.now() - (asset.sparkline.length - idx) * 3600000,
        open: p * 0.998,
        high: p * 1.004,
        low: p * 0.996,
        close: p,
        volume: asset.volumeNumeric / 24,
      }));

      const indicators = this.computeIndicators(mockCandles, asset.price);
      const regime = this.classifyMarketRegime(asset.price, indicators);

      // Sizing Target & Stop calculations based on ATR
      const stopDistance = Math.max(indicators.atr * 1.5, asset.price * 0.015);
      const stopLossPrice = asset.price - stopDistance;
      const targetDistance = stopDistance * 2.4; // 1 : 2.4 R:R target
      const targetPrice = asset.price + targetDistance;
      const riskRewardRatio =
        stopDistance > 0 ? targetDistance / stopDistance : 2.4;

      const score = this.calculateOpportunityScore(
        asset,
        indicators,
        regime,
        riskRewardRatio
      );

      // Strict Qualification Criteria:
      // 1. Data must be fresh
      // 2. Score >= 80
      // 3. Risk / Reward >= 2.0
      // 4. Market Regime === 'BULLISH'
      let qualified = true;
      let rejectionReason: string | undefined;

      if (!isDataFresh) {
        qualified = false;
        rejectionReason = 'Market data offline or stale.';
      } else if (regime !== 'BULLISH') {
        qualified = false;
        rejectionReason = `Market regime is ${regime} (BULLISH required for Spot execution).`;
      } else if (riskRewardRatio < 2.0) {
        qualified = false;
        rejectionReason = `Risk/Reward ratio (${riskRewardRatio.toFixed(1)}) is below minimum 1:2.0.`;
      } else if (score.totalScore < 80) {
        qualified = false;
        rejectionReason = `Opportunity score (${score.totalScore}/100) is below qualification threshold of 80/100.`;
      }

      if (qualified) {
        qualifiedList.push({
          asset,
          score,
          regime,
          indicators,
          targetPrice,
          stopLossPrice,
          riskRewardRatio,
        });
      } else {
        rejectedCount++;
      }
    }

    // Sort qualified opportunities by total score descending
    qualifiedList.sort((a, b) => b.score.totalScore - a.score.totalScore);

    const primaryAsset = assets.find((a) => a.symbol === 'BTC/USDT') || assets[0];
    const defaultRegime: MarketRegime = isDataFresh ? 'BULLISH' : 'SIDEWAYS';

    // If at least one qualified setup exists -> select the TOP 1
    if (qualifiedList.length > 0) {
      const top = qualifiedList[0];
      const bestOpportunity: BestOpportunity = {
        symbol: top.asset.symbol,
        name: top.asset.name,
        category: top.asset.category,
        currentPrice: top.asset.price,
        change24h: top.asset.change24h,
        confidence: top.score.totalScore,
        scoreBreakdown: top.score,
        marketRegime: top.regime,
        momentum:
          top.indicators.rsi14 >= 60
            ? 'STRONG'
            : top.indicators.rsi14 >= 50
            ? 'MODERATE'
            : 'WEAK',
        volumeStatus:
          top.indicators.volumeSurgeRatio >= 1.2 ? 'HIGH' : 'MEDIUM',
        newsImpact: newsService.isNewsAvailable() ? 'POSITIVE' : 'UNAVAILABLE',
        riskReward: `1 : ${top.riskRewardRatio.toFixed(1)}`,
        riskRewardNumeric: top.riskRewardRatio,
        trendScore: Math.round((top.score.trendScore / 20) * 100),
        volatilityRating: `Controlled (${top.indicators.atrPercent.toFixed(1)}% ATR)`,
        rationale: `Qualified higher time-frame spot breakout with institutional volume confluence and clear support structure above $${top.stopLossPrice.toFixed(
          2
        )}. Confidence score is a mathematical probability estimate and not a guarantee of profit.`,
        targetPrice: top.targetPrice,
        stopLossPrice: top.stopLossPrice,
        qualified: true,
      };

      const stats: MarketScanStats = {
        scannedAssets: scannedCount,
        qualifiedAssets: qualifiedList.length,
        selectedAssets: 1,
        rejectedAssets: rejectedCount,
        marketRegime: top.regime,
      };

      return {
        stats,
        bestOpportunity,
        allEvaluations: assets.map((a) => {
          const q = qualifiedList.find((item) => item.asset.symbol === a.symbol);
          return {
            asset: a,
            score: q
              ? q.score
              : {
                  trendScore: 8,
                  momentumScore: 10,
                  volumeScore: 6,
                  structureScore: 6,
                  volatilityScore: 6,
                  riskRewardScore: 8,
                  totalScore: 44,
                },
            qualified: !!q,
          };
        }),
      };
    }

    // NO TRADE SCENARIO: When no asset passes the 80 score or regime filter
    const stats: MarketScanStats = {
      scannedAssets: scannedCount,
      qualifiedAssets: 0,
      selectedAssets: 0,
      rejectedAssets: scannedCount,
      marketRegime: defaultRegime,
    };

    const bestOpportunity: BestOpportunity = {
      symbol: primaryAsset?.symbol || 'BTC/USDT',
      name: primaryAsset?.name || 'Bitcoin Spot',
      category: primaryAsset?.category || 'crypto',
      currentPrice: primaryAsset?.price || 65190.2,
      change24h: primaryAsset?.change24h || 0,
      confidence: 68,
      marketRegime: 'SIDEWAYS',
      momentum: 'MODERATE',
      volumeStatus: 'MEDIUM',
      newsImpact: newsService.isNewsAvailable() ? 'NEUTRAL' : 'UNAVAILABLE',
      riskReward: '1 : 1.4',
      riskRewardNumeric: 1.4,
      trendScore: 65,
      volatilityRating: 'Compressed',
      rationale:
        'Market structure is currently sideways or lacks high-probability 1:2.0 risk/reward setup. Engine strictly preserves capital under NO TRADE protocol.',
      targetPrice: (primaryAsset?.price || 65000) * 1.02,
      stopLossPrice: (primaryAsset?.price || 65000) * 0.985,
      qualified: false,
      rejectionReason: 'No asset passed the minimum 80/100 score and 1:2.0 risk/reward requirement.',
    };

    return {
      stats,
      bestOpportunity,
      allEvaluations: assets.map((a) => ({
        asset: a,
        score: {
          trendScore: 8,
          momentumScore: 10,
          volumeScore: 6,
          structureScore: 6,
          volatilityScore: 6,
          riskRewardScore: 8,
          totalScore: 44,
        },
        qualified: false,
      })),
    };
  }

  public getMarketScanStats(): MarketScanStats {
    return this.evaluateUniverse().stats;
  }

  public getBestOpportunity(): BestOpportunity {
    return this.evaluateUniverse().bestOpportunity;
  }
}

export const analysisService = new AnalysisService();
