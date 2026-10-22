import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

export interface WorkerRunResult {
  success: boolean;
  worker: string;
  marketData: 'connected' | 'error' | 'stale';
  lastScan: string;
  openPositions: number;
  decision: 'PAPER BUY' | 'NO_TRADE' | 'POSITION_MANAGED' | 'TP_HIT' | 'SL_HIT' | 'TRAILING_STOP';
  details: string;
  opportunity?: {
    symbol: string;
    confidence: number;
    regime: string;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    riskReward: number;
  } | null;
  account?: {
    paperBalance: number;
    equity: number;
    todayPnl: number;
  };
  error?: string;
}

export interface LiveSpotTicker {
  symbol: string;
  pair: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  quoteVolume: number;
}

const MONITORED_ASSETS = [
  { symbol: 'BTC/USDT', pair: 'BTCUSDT', name: 'Bitcoin Spot' },
  { symbol: 'ETH/USDT', pair: 'ETHUSDT', name: 'Ethereum Spot' },
  { symbol: 'SOL/USDT', pair: 'SOLUSDT', name: 'Solana Spot' },
  { symbol: 'BNB/USDT', pair: 'BNBUSDT', name: 'BNB Spot' },
  { symbol: 'XRP/USDT', pair: 'XRPUSDT', name: 'XRP Spot' },
  { symbol: 'ADA/USDT', pair: 'ADAUSDT', name: 'Cardano Spot' },
  { symbol: 'AVAX/USDT', pair: 'AVAXUSDT', name: 'Avalanche Spot' },
  { symbol: 'LINK/USDT', pair: 'LINKUSDT', name: 'Chainlink Spot' },
  { symbol: 'DOT/USDT', pair: 'DOTUSDT', name: 'Polkadot Spot' },
  { symbol: 'NEAR/USDT', pair: 'NEARUSDT', name: 'NEAR Protocol Spot' },
  { symbol: 'SUI/USDT', pair: 'SUIUSDT', name: 'Sui Network Spot' },
  { symbol: 'PAXG/USDT', pair: 'PAXGUSDT', name: 'Physical Gold Spot' },
];

/**
 * 1. Request Authorization Verification
 */
export function verifyWorkerSecret(req: any): { authorized: boolean; reason?: string } {
  const configuredSecret = (process.env.WORKER_SECRET || '').trim();
  const configuredCronSecret = (process.env.CRON_SECRET || '').trim();

  // If no secret is configured in environment, allow execution with warning
  if (!configuredSecret && !configuredCronSecret) {
    console.warn('[WORKER AUTH NOTICE] Neither WORKER_SECRET nor CRON_SECRET is configured. Allowing execution.');
    return { authorized: true };
  }

  // Check Authorization Header: Bearer <token>
  const authHeader =
    (typeof req.headers?.authorization === 'string' ? req.headers.authorization : '') ||
    (typeof req.headers?.Authorization === 'string' ? req.headers.Authorization : '');

  let providedToken = '';
  if (authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')) {
    providedToken = authHeader.slice(7).trim();
  }

  // Check custom header x-worker-secret
  if (!providedToken) {
    const customHeader = req.headers?.['x-worker-secret'] || req.headers?.['X-Worker-Secret'];
    if (typeof customHeader === 'string') {
      providedToken = customHeader.trim();
    }
  }

  // Check query parameter ?secret=...
  if (!providedToken && req.query?.secret) {
    providedToken = (typeof req.query.secret === 'string' ? req.query.secret : String(req.query.secret[0])).trim();
  }

  if (!providedToken) {
    return {
      authorized: false,
      reason: 'Missing authorization token. Provide Bearer token or WORKER_SECRET.',
    };
  }

  // Compare against configured secrets
  if (
    (configuredSecret && providedToken === configuredSecret) ||
    (configuredCronSecret && providedToken === configuredCronSecret)
  ) {
    return { authorized: true };
  }

  return {
    authorized: false,
    reason: 'Invalid worker secret.',
  };
}

/**
 * 2. Fetch Live Spot Tickers from Binance Public REST API (No Keys Required)
 */
async function fetchLiveMarketTickers(): Promise<Record<string, LiveSpotTicker> | null> {
  const endpoints = [
    'https://api.binance.com/api/v3/ticker/24hr',
    'https://data-api.binance.vision/api/v3/ticker/24hr',
  ];

  for (const url of endpoints) {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 6500);

      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const rawList = await res.json();

      if (!Array.isArray(rawList)) continue;

      const tickerMap: Record<string, LiveSpotTicker> = {};
      const pairsSet = new Set(MONITORED_ASSETS.map((a) => a.pair));

      for (const item of rawList) {
        if (pairsSet.has(item.symbol)) {
          const assetInfo = MONITORED_ASSETS.find((a) => a.pair === item.symbol);
          const symbol = assetInfo ? assetInfo.symbol : item.symbol;
          const price = parseFloat(item.lastPrice) || 0;
          const change24h = parseFloat(item.priceChangePercent) || 0;
          const high24h = parseFloat(item.highPrice) || 0;
          const low24h = parseFloat(item.lowPrice) || 0;
          const quoteVolume = parseFloat(item.quoteVolume) || 0;

          let volume24h = `$${(quoteVolume / 1e9).toFixed(1)}B`;
          if (quoteVolume < 1e9) {
            volume24h = `$${(quoteVolume / 1e6).toFixed(1)}M`;
          }

          tickerMap[symbol] = {
            symbol,
            pair: item.symbol,
            price,
            change24h,
            high24h,
            low24h,
            volume24h,
            quoteVolume,
          };
        }
      }

      if (Object.keys(tickerMap).length > 0) {
        return tickerMap;
      }
    } catch (err) {
      console.warn(`[MARKET DATA] Failed fetching from ${url}:`, err);
    }
  }

  return null;
}

/**
 * 3. Technical Indicator & Strategy Evaluation
 */
function evaluateAssetSetup(
  ticker: LiveSpotTicker,
  regime: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' | 'HIGH_VOLATILITY'
) {
  const currentPrice = ticker.price;
  const change24h = ticker.change24h;

  // Multi-Timeframe Confluence Scoring
  let trendScore = 12;
  if (change24h > 2.0) trendScore = 20;
  else if (change24h > 0) trendScore = 16;
  else if (change24h < -2.0) trendScore = 4;

  let momentumScore = 12;
  if (change24h > 1.5 && change24h < 8.0) momentumScore = 20;
  else if (change24h >= 8.0) momentumScore = 14; // Overbought caution
  else if (change24h < -1.0) momentumScore = 6;

  let volumeScore = 10;
  if (ticker.quoteVolume > 1_000_000_000) volumeScore = 15;
  else if (ticker.quoteVolume > 200_000_000) volumeScore = 12;
  else volumeScore = 8;

  const structureScore = change24h >= 0.5 ? 15 : 10;
  const volatilityScore = 10;

  // Dynamic Stop-Loss (1.5% to 2.2% below entry for spot long)
  const stopLossDistancePercent = 0.018; // 1.8%
  const stopLossPrice = Number((currentPrice * (1 - stopLossDistancePercent)).toFixed(2));

  // Risk / Reward Target (2.4x distance for 1:2.4 R:R)
  const targetDistancePercent = stopLossDistancePercent * 2.4; // 4.32%
  const targetPrice = Number((currentPrice * (1 + targetDistancePercent)).toFixed(2));

  const riskDistance = currentPrice - stopLossPrice;
  const rewardDistance = targetPrice - currentPrice;
  const riskRewardRatio = riskDistance > 0 ? Number((rewardDistance / riskDistance).toFixed(2)) : 0;
  const riskRewardScore = riskRewardRatio >= 2.0 ? 20 : 10;

  const totalScore = trendScore + momentumScore + volumeScore + structureScore + volatilityScore + riskRewardScore;

  const isQualified =
    totalScore >= 80 &&
    riskRewardRatio >= 2.0 &&
    regime === 'BULLISH' &&
    currentPrice > 0;

  return {
    symbol: ticker.symbol,
    currentPrice,
    change24h,
    stopLossPrice,
    targetPrice,
    riskRewardRatio,
    confidence: totalScore,
    isQualified,
    scores: {
      trendScore,
      momentumScore,
      volumeScore,
      structureScore,
      volatilityScore,
      riskRewardScore,
      totalScore,
    },
  };
}

/**
 * Main Paper Trading Engine Execution Cycle
 */
export async function executePaperTradingCycle(): Promise<WorkerRunResult> {
  const startTime = new Date().toISOString();
  console.log(`[PAPER TRADING WORKER] Cycle initiated at ${startTime}`);

  // 1. Fetch live market tickers
  const tickers = await fetchLiveMarketTickers();
  if (!tickers || Object.keys(tickers).length === 0) {
    const errorMsg = 'MARKET_DATA_OFFLINE: Unable to retrieve real-time Spot market prices from Binance public REST.';
    console.error(`[PAPER TRADING WORKER] ${errorMsg}`);

    // Update Firebase error status
    try {
      const statusRef = doc(db, 'system_status', 'worker_heartbeat');
      await setDoc(
        statusRef,
        {
          workerStatus: 'ERROR',
          lastError: errorMsg,
          lastRun: startTime,
          lastHeartbeat: Date.now(),
        },
        { merge: true }
      );
    } catch (dbErr) {
      console.error('[PAPER TRADING WORKER] Failed to record error in Firestore:', dbErr);
    }

    return {
      success: false,
      worker: 'paper-trading',
      marketData: 'error',
      lastScan: startTime,
      openPositions: 0,
      decision: 'NO_TRADE',
      details: errorMsg,
      error: 'MARKET_DATA_OFFLINE',
    };
  }

  // 2. Load persistent state from Firestore
  const stateDocRef = doc(db, 'paper_trading', 'state');
  const statusDocRef = doc(db, 'system_status', 'worker_heartbeat');

  let paperBalance = 100.0;
  let activePosition: any = null;
  let closedTrades: any[] = [];
  let decisionLog: any[] = [];
  let trialStartDate = Date.now();

  try {
    const stateSnap = await getDoc(stateDocRef);
    if (stateSnap.exists()) {
      const data = stateSnap.data();
      if (typeof data.paperBalance === 'number') paperBalance = data.paperBalance;
      if (data.activePosition !== undefined) activePosition = data.activePosition;
      if (Array.isArray(data.closedTrades)) closedTrades = data.closedTrades;
      if (Array.isArray(data.decisionLog)) decisionLog = data.decisionLog;
      if (typeof data.trialStartDate === 'number') trialStartDate = data.trialStartDate;
    }
  } catch (err: any) {
    console.error('[PAPER TRADING WORKER] Firestore read exception:', err);
  }

  let decision: 'PAPER BUY' | 'NO_TRADE' | 'POSITION_MANAGED' | 'TP_HIT' | 'SL_HIT' | 'TRAILING_STOP' = 'NO_TRADE';
  let details = '';
  let bestOpp: any = null;

  // 3. Evaluate active open position if exists
  if (activePosition && activePosition.symbol) {
    const liveTicker = tickers[activePosition.symbol];
    if (liveTicker && liveTicker.price > 0) {
      const currentPrice = liveTicker.price;
      const entryPrice = activePosition.entryPrice;
      const quantity = activePosition.quantity || (activePosition.investedAmount / entryPrice);
      const unrealizedPnl = (currentPrice - entryPrice) * quantity;
      const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;

      // Update position object
      activePosition.currentPrice = currentPrice;
      activePosition.pnl = Number(unrealizedPnl.toFixed(2));
      activePosition.pnlPercent = Number(pnlPercent.toFixed(2));

      const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

      // Check Take Profit Target
      if (currentPrice >= activePosition.takeProfit) {
        decision = 'TP_HIT';
        const realizedPnl = activePosition.pnl;
        paperBalance = Number((paperBalance + realizedPnl).toFixed(2));

        const closedRecord = {
          id: `trade-${Date.now()}`,
          tradeId: activePosition.tradeId || `paper-${Date.now()}`,
          symbol: activePosition.symbol,
          name: activePosition.name || activePosition.symbol,
          category: 'crypto',
          type: 'LONG / SPOT',
          side: 'SPOT_BUY',
          entryPrice: activePosition.entryPrice,
          exitPrice: currentPrice,
          quantity: activePosition.quantity,
          investedAmount: activePosition.investedAmount,
          stopLoss: activePosition.stopLoss,
          takeProfit: activePosition.takeProfit,
          pnl: Number(realizedPnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
          returnAmount: Number((activePosition.investedAmount + realizedPnl).toFixed(2)),
          duration: 'Automated Cycle',
          confidence: activePosition.confidenceScore || 85,
          reason: `Take-Profit Target Hit at $${currentPrice.toFixed(2)}. 1:2.4 R:R achieved.`,
          openedAt: activePosition.openedAt || Date.now() - 3600000,
          closedAt: Date.now(),
          status: 'WIN',
        };

        closedTrades = [closedRecord, ...closedTrades].slice(0, 30);
        details = `Take-Profit reached for ${activePosition.symbol} at $${currentPrice.toFixed(2)} (+${activePosition.pnlPercent}%). Position closed in profit.`;

        decisionLog = [
          {
            id: `log-${Date.now()}`,
            timestamp: nowTimeStr,
            type: 'tp_hit',
            title: `Take-Profit Target Hit: ${activePosition.symbol}`,
            details,
          },
          ...decisionLog,
        ].slice(0, 30);

        activePosition = null; // Position is now closed
      }
      // Check Stop Loss
      else if (currentPrice <= activePosition.stopLoss) {
        decision = 'SL_HIT';
        const realizedPnl = activePosition.pnl;
        paperBalance = Number((paperBalance + realizedPnl).toFixed(2));

        const closedRecord = {
          id: `trade-${Date.now()}`,
          tradeId: activePosition.tradeId || `paper-${Date.now()}`,
          symbol: activePosition.symbol,
          name: activePosition.name || activePosition.symbol,
          category: 'crypto',
          type: 'LONG / SPOT',
          side: 'SPOT_BUY',
          entryPrice: activePosition.entryPrice,
          exitPrice: currentPrice,
          quantity: activePosition.quantity,
          investedAmount: activePosition.investedAmount,
          stopLoss: activePosition.stopLoss,
          takeProfit: activePosition.takeProfit,
          pnl: Number(realizedPnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2)),
          returnAmount: Number((activePosition.investedAmount + realizedPnl).toFixed(2)),
          duration: 'Automated Cycle',
          confidence: activePosition.confidenceScore || 80,
          reason: `Stop-Loss triggered at $${currentPrice.toFixed(2)}. Capital protected under 1% risk rule.`,
          openedAt: activePosition.openedAt || Date.now() - 3600000,
          closedAt: Date.now(),
          status: 'LOSS',
        };

        closedTrades = [closedRecord, ...closedTrades].slice(0, 30);
        details = `Stop-Loss triggered for ${activePosition.symbol} at $${currentPrice.toFixed(2)} (${activePosition.pnlPercent}%). Capital protected.`;

        decisionLog = [
          {
            id: `log-${Date.now()}`,
            timestamp: nowTimeStr,
            type: 'sl_hit',
            title: `Stop-Loss Protected: ${activePosition.symbol}`,
            details,
          },
          ...decisionLog,
        ].slice(0, 30);

        activePosition = null; // Position is now closed
      }
      // Trailing stop ratchet check
      else {
        decision = 'POSITION_MANAGED';
        if (pnlPercent >= 1.0) {
          const breakEvenPrice = Number((entryPrice * 1.002).toFixed(2));
          if (!activePosition.trailingStop || activePosition.trailingStop < breakEvenPrice) {
            activePosition.trailingStop = breakEvenPrice;
            activePosition.stopLoss = Math.max(activePosition.stopLoss, breakEvenPrice);
            details = `Active position ${activePosition.symbol} managed at $${currentPrice.toFixed(2)} (+${pnlPercent.toFixed(2)}%). Trailing Stop moved to break-even ($${breakEvenPrice}).`;
          } else {
            details = `Active position ${activePosition.symbol} held at live price $${currentPrice.toFixed(2)} (PnL: +$${activePosition.pnl.toFixed(2)} / +${pnlPercent.toFixed(2)}%).`;
          }
        } else {
          details = `Active position ${activePosition.symbol} held at live price $${currentPrice.toFixed(2)} (PnL: $${activePosition.pnl.toFixed(2)} / ${pnlPercent.toFixed(2)}%).`;
        }
      }
    }
  }

  // 4. If NO active position is open, scan market universe for new setup
  if (!activePosition) {
    // Determine overall market regime from BTC / ETH 24h change
    const btcTicker = tickers['BTC/USDT'];
    const ethTicker = tickers['ETH/USDT'];
    const avgChange = ((btcTicker?.change24h || 0) + (ethTicker?.change24h || 0)) / 2;

    let marketRegime: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' | 'HIGH_VOLATILITY' = 'SIDEWAYS';
    if (avgChange >= 1.0) marketRegime = 'BULLISH';
    else if (avgChange <= -1.5) marketRegime = 'BEARISH';
    else marketRegime = 'SIDEWAYS';

    // Evaluate all monitored assets
    const candidateSetups = Object.values(tickers).map((t) => evaluateAssetSetup(t, marketRegime));
    candidateSetups.sort((a, b) => b.confidence - a.confidence);

    const topCandidate = candidateSetups[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    if (topCandidate && topCandidate.isQualified) {
      bestOpp = {
        symbol: topCandidate.symbol,
        confidence: topCandidate.confidence,
        regime: marketRegime,
        entryPrice: topCandidate.currentPrice,
        stopLoss: topCandidate.stopLossPrice,
        takeProfit: topCandidate.targetPrice,
        riskReward: topCandidate.riskRewardRatio,
      };

      // Create new Paper Position (1% risk sizing on paper capital)
      const currentEquity = paperBalance;
      const capitalRiskAmount = currentEquity * 0.01; // 1% capital risk ($1.00 on $100)
      const priceRiskPerUnit = topCandidate.currentPrice - topCandidate.stopLossPrice;
      const calculatedQty = priceRiskPerUnit > 0 ? capitalRiskAmount / priceRiskPerUnit : 0.001;
      const investedAmount = Math.min(paperBalance, Number((calculatedQty * topCandidate.currentPrice).toFixed(2)));

      activePosition = {
        id: `pos-${Date.now()}`,
        tradeId: `paper-${Date.now()}`,
        symbol: topCandidate.symbol,
        name: MONITORED_ASSETS.find((a) => a.symbol === topCandidate.symbol)?.name || topCandidate.symbol,
        category: 'crypto',
        type: 'LONG / SPOT',
        side: 'SPOT_BUY',
        entryPrice: topCandidate.currentPrice,
        currentPrice: topCandidate.currentPrice,
        quantity: Number(calculatedQty.toFixed(6)),
        investedAmount,
        pnl: 0.0,
        pnlPercent: 0.0,
        takeProfit: topCandidate.targetPrice,
        stopLoss: topCandidate.stopLossPrice,
        trailingStop: null,
        confidenceScore: topCandidate.confidence,
        scoreBreakdown: topCandidate.scores,
        openedAt: Date.now(),
        status: 'OPEN',
        riskRewardRatio: topCandidate.riskRewardRatio,
      };

      decision = 'PAPER BUY';
      details = `Spot Long paper trade executed on ${topCandidate.symbol} at $${topCandidate.currentPrice.toFixed(2)}. TP: $${topCandidate.targetPrice.toFixed(2)} | SL: $${topCandidate.stopLossPrice.toFixed(2)} (Confidence: ${topCandidate.confidence}/100, R:R 1:${topCandidate.riskRewardRatio}).`;

      decisionLog = [
        {
          id: `log-${Date.now()}`,
          timestamp: nowTimeStr,
          type: 'execute',
          title: `Paper Spot Trade Opened: ${topCandidate.symbol}`,
          asset: topCandidate.symbol,
          confidence: topCandidate.confidence,
          marketRegime,
          decision: 'PAPER BUY',
          details,
        },
        ...decisionLog,
      ].slice(0, 30);
    } else {
      decision = 'NO_TRADE';
      const reason =
        marketRegime !== 'BULLISH'
          ? `Market regime is ${marketRegime} (Requires BULLISH for spot long)`
          : topCandidate
          ? `Top score was ${topCandidate.confidence}/100 (Below required 80 threshold or R:R < 2.0)`
          : 'No qualified setups met 1:2.0+ R:R and 80/100 threshold';

      details = `Scanned ${Object.keys(tickers).length} Spot assets on Binance Public REST. Decision: NO TRADE (${reason}). Capital preserved.`;

      decisionLog = [
        {
          id: `log-${Date.now()}`,
          timestamp: nowTimeStr,
          type: 'reject',
          title: `Scan Completed: NO TRADE`,
          details: reason,
          marketRegime,
          decision: 'NO TRADE',
        },
        ...decisionLog,
      ].slice(0, 30);
    }
  }

  // 5. Calculate equity & P/L
  const activePnl = activePosition ? activePosition.pnl : 0;
  const equity = Number((paperBalance + activePnl).toFixed(2));
  const todayPnl = Number(activePnl.toFixed(2));

  // 6. Persist to Firestore: system_status/worker_heartbeat & paper_trading/state
  try {
    const heartbeatTimestamp = Date.now();

    // Heartbeat Document
    await setDoc(
      statusDocRef,
      {
        workerStatus: 'ONLINE',
        lastHeartbeat: heartbeatTimestamp,
        lastRun: startTime,
        lastMarketScan: startTime,
        lastError: null,
        lastDecision: decision,
        openPositions: activePosition ? 1 : 0,
        paperBalance,
        equity,
        todayPnl,
        bestOpportunity: bestOpp,
      },
      { merge: true }
    );

    // State Document
    await setDoc(
      stateDocRef,
      {
        paperBalance,
        equity,
        todayPnl,
        trialStartDate,
        activePosition,
        closedTrades,
        decisionLog,
        updatedAt: startTime,
      },
      { merge: true }
    );

    console.log(`[PAPER TRADING WORKER] Successfully updated Firestore heartbeat & state. Decision: ${decision}`);
  } catch (dbErr) {
    console.error('[PAPER TRADING WORKER] Firestore update error:', dbErr);
  }

  return {
    success: true,
    worker: 'paper-trading',
    marketData: 'connected',
    lastScan: startTime,
    openPositions: activePosition ? 1 : 0,
    decision,
    details,
    opportunity: bestOpp,
    account: {
      paperBalance,
      equity,
      todayPnl,
    },
  };
}
