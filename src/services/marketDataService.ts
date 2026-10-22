import {
  Candle,
  MarketAsset,
  MarketDataStatus,
  Timeframe,
} from '../types/trading';

export interface TickerData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  volumeNumeric: number;
  timestamp: number;
}

export interface IMarketDataProvider {
  name: string;
  fetchTicker(symbol: string): Promise<TickerData | null>;
  fetchCandles(symbol: string, timeframe: Timeframe, limit?: number): Promise<Candle[]>;
  fetchAllTickers(): Promise<Record<string, TickerData>>;
  isAvailable(): Promise<boolean>;
}

/**
 * Public Binance Spot REST Data Provider
 * Uses zero API keys. Connects directly to public Spot endpoints with timeout and fallback.
 */
export class BinanceSpotPublicProvider implements IMarketDataProvider {
  public name = 'Binance Spot Public REST (No Keys Required)';
  private baseUrl = 'https://api.binance.com/api/v3';

  // Map application symbols (e.g. 'BTC/USDT') to provider format ('BTCUSDT')
  private formatSymbol(symbol: string): string {
    return symbol.replace('/', '').toUpperCase();
  }

  // Map timeframe to Binance interval format
  private mapInterval(tf: Timeframe): string {
    switch (tf) {
      case '5m':
        return '5m';
      case '15m':
        return '15m';
      case '1h':
        return '1h';
      case '4h':
        return '4h';
      default:
        return '1h';
    }
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(`${this.baseUrl}/ping`, { signal: ctrl.signal });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  }

  public async fetchTicker(symbol: string): Promise<TickerData | null> {
    try {
      const pair = this.formatSymbol(symbol);
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 4500);

      const res = await fetch(`${this.baseUrl}/ticker/24hr?symbol=${pair}`, {
        signal: ctrl.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return null;
      const data = await res.json();

      const price = parseFloat(data.lastPrice);
      const change24h = parseFloat(data.priceChangePercent);
      const high24h = parseFloat(data.highPrice);
      const low24h = parseFloat(data.lowPrice);
      const quoteVolume = parseFloat(data.quoteVolume);

      let volumeFormatted = `$${(quoteVolume / 1e9).toFixed(1)}B`;
      if (quoteVolume < 1e9) {
        volumeFormatted = `$${(quoteVolume / 1e6).toFixed(1)}M`;
      }

      return {
        symbol,
        price,
        change24h,
        high24h,
        low24h,
        volume24h: volumeFormatted,
        volumeNumeric: quoteVolume,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.warn(`[MarketDataService] Error fetching ticker for ${symbol}:`, err);
      return null;
    }
  }

  public async fetchAllTickers(): Promise<Record<string, TickerData>> {
    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 5000);

      const res = await fetch(`${this.baseUrl}/ticker/24hr`, {
        signal: ctrl.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return {};
      const list: any[] = await res.json();
      const result: Record<string, TickerData> = {};

      for (const item of list) {
        if (!item.symbol.endsWith('USDT')) continue;
        const base = item.symbol.replace('USDT', '');
        const stdSymbol = `${base}/USDT`;

        const price = parseFloat(item.lastPrice);
        const change24h = parseFloat(item.priceChangePercent);
        const high24h = parseFloat(item.highPrice);
        const low24h = parseFloat(item.lowPrice);
        const quoteVolume = parseFloat(item.quoteVolume);

        let volumeFormatted = `$${(quoteVolume / 1e9).toFixed(1)}B`;
        if (quoteVolume < 1e9) {
          volumeFormatted = `$${(quoteVolume / 1e6).toFixed(1)}M`;
        }

        result[stdSymbol] = {
          symbol: stdSymbol,
          price,
          change24h,
          high24h,
          low24h,
          volume24h: volumeFormatted,
          volumeNumeric: quoteVolume,
          timestamp: Date.now(),
        };
      }

      return result;
    } catch (err) {
      console.warn('[MarketDataService] Error fetching all 24hr tickers:', err);
      return {};
    }
  }

  public async fetchCandles(
    symbol: string,
    timeframe: Timeframe,
    limit: number = 60
  ): Promise<Candle[]> {
    try {
      const pair = this.formatSymbol(symbol);
      const interval = this.mapInterval(timeframe);
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 5000);

      const url = `${this.baseUrl}/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        return this.generateSyntheticCandlesFromBase(symbol, timeframe, limit);
      }

      const rawKlines: any[] = await res.json();
      const candles: Candle[] = rawKlines.map((k) => ({
        timestamp: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));

      return candles;
    } catch (err) {
      console.warn(`[MarketDataService] Fallback to synthetic candles for ${symbol}:`, err);
      return this.generateSyntheticCandlesFromBase(symbol, timeframe, limit);
    }
  }

  // Resilient fallback candle generator if internet/CORS temporarily blocks klines endpoint
  private generateSyntheticCandlesFromBase(
    symbol: string,
    timeframe: Timeframe,
    limit: number
  ): Candle[] {
    const basePrice = symbol.includes('BTC')
      ? 65200
      : symbol.includes('ETH')
      ? 3480
      : symbol.includes('SOL')
      ? 154
      : symbol.includes('BNB')
      ? 585
      : symbol.includes('PAXG')
      ? 2640
      : 100;

    const candles: Candle[] = [];
    let current = basePrice * 0.96;
    const now = Date.now();
    const stepMs =
      timeframe === '5m'
        ? 300000
        : timeframe === '15m'
        ? 900000
        : timeframe === '1h'
        ? 3600000
        : 14400000;

    for (let i = limit; i >= 0; i--) {
      const t = now - i * stepMs;
      const variation = (Math.sin(i * 0.3) * 0.008 + (Math.random() - 0.48) * 0.006) * current;
      const open = current;
      const close = current + variation;
      const high = Math.max(open, close) + Math.random() * 0.003 * current;
      const low = Math.min(open, close) - Math.random() * 0.003 * current;
      const volume = (Math.random() * 50 + 20) * (current / 1000);
      current = close;

      candles.push({
        timestamp: t,
        open,
        high,
        low,
        close,
        volume,
      });
    }

    return candles;
  }
}

/**
 * Main Market Data Service
 * Manages provider instance, asset universe, caching, and health status.
 */
export class MarketDataService {
  private provider: IMarketDataProvider;
  private status: MarketDataStatus = 'ONLINE';
  private lastSyncTimestamp: number = Date.now();

  // Monitored Spot Asset Universe
  private assetUniverse: MarketAsset[] = [
    {
      symbol: 'BTC/USDT',
      name: 'Bitcoin Spot',
      category: 'crypto',
      price: 65190.2,
      change24h: 3.42,
      high24h: 65800.0,
      low24h: 63100.0,
      volume24h: '$28.4B',
      volumeNumeric: 28400000000,
      trend: 'BULLISH',
      momentumRsi: 64,
      volatility: 'MEDIUM',
      confidence: 86,
      aiSignal: 'STRONG BUY',
      sparkline: [63100, 63400, 63900, 64280, 64600, 64900, 65190],
      description: 'Primary spot asset showing institutional accumulation above key 4H EMA 50/200.',
      structure: 'Higher Highs & Higher Lows across 1H / 4H',
      newsHeadline: 'Spot ETF net inflows exceed +$420M in single trading session',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'ETH/USDT',
      name: 'Ethereum Spot',
      category: 'crypto',
      price: 3480.5,
      change24h: 2.15,
      high24h: 3540.0,
      low24h: 3390.0,
      volume24h: '$14.2B',
      volumeNumeric: 14200000000,
      trend: 'BULLISH',
      momentumRsi: 59,
      volatility: 'MEDIUM',
      confidence: 81,
      aiSignal: 'BUY',
      sparkline: [3390, 3410, 3435, 3450, 3440, 3470, 3480.5],
      description: 'Consolidation breakout above ascending triangle neckline with expanding buy volume.',
      structure: 'Bullish Flag formation with expanding buy volume',
      newsHeadline: 'Layer-2 daily transactions set new all-time record',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'SOL/USDT',
      name: 'Solana Spot',
      category: 'crypto',
      price: 154.8,
      change24h: 5.62,
      high24h: 158.0,
      low24h: 145.2,
      volume24h: '$5.8B',
      volumeNumeric: 5800000000,
      trend: 'BULLISH',
      momentumRsi: 68,
      volatility: 'HIGH',
      confidence: 79,
      aiSignal: 'WATCHLIST',
      sparkline: [145, 147, 150, 149, 152, 153.5, 154.8],
      description: 'Rapid decentralized ecosystem fee generation and validator stability.',
      structure: 'Approaching resistance zone at $158.00',
      newsHeadline: 'DEX daily volume surges past competing L1 chains',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'BNB/USDT',
      name: 'BNB Chain Spot',
      category: 'crypto',
      price: 585.2,
      change24h: 1.12,
      high24h: 592.0,
      low24h: 578.0,
      volume24h: '$1.4B',
      volumeNumeric: 1400000000,
      trend: 'NEUTRAL',
      momentumRsi: 52,
      volatility: 'LOW',
      confidence: 72,
      aiSignal: 'NEUTRAL',
      sparkline: [578, 580, 582, 581, 584, 583, 585.2],
      description: 'Range-bound accumulation near key quarterly pivot.',
      structure: 'Sideways channel with low volatility',
      newsHeadline: 'Quarterly token burn schedule announced',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'XRP/USDT',
      name: 'Ripple Spot',
      category: 'crypto',
      price: 0.584,
      change24h: -0.84,
      high24h: 0.598,
      low24h: 0.579,
      volume24h: '$1.1B',
      volumeNumeric: 1100000000,
      trend: 'NEUTRAL',
      momentumRsi: 48,
      volatility: 'MEDIUM',
      confidence: 68,
      aiSignal: 'WATCHLIST',
      sparkline: [0.592, 0.589, 0.585, 0.581, 0.586, 0.582, 0.584],
      description: 'Testing lower trendline support of symmetrical triangle.',
      structure: 'Compression pattern preceding volatility expansion',
      newsHeadline: 'Cross-border settlement corridors expand in APAC',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'ADA/USDT',
      name: 'Cardano Spot',
      category: 'crypto',
      price: 0.385,
      change24h: 1.45,
      high24h: 0.395,
      low24h: 0.376,
      volume24h: '$480M',
      volumeNumeric: 480000000,
      trend: 'NEUTRAL',
      momentumRsi: 51,
      volatility: 'LOW',
      confidence: 65,
      aiSignal: 'NEUTRAL',
      sparkline: [0.378, 0.38, 0.382, 0.381, 0.384, 0.383, 0.385],
      description: 'Slow consolidation around 200-day simple moving average.',
      structure: 'Horizontal base formation',
      newsHeadline: 'Governance upgrade milestone deployed on testnet',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'AVAX/USDT',
      name: 'Avalanche Spot',
      category: 'crypto',
      price: 28.6,
      change24h: 4.2,
      high24h: 29.4,
      low24h: 27.1,
      volume24h: '$650M',
      volumeNumeric: 650000000,
      trend: 'BULLISH',
      momentumRsi: 62,
      volatility: 'HIGH',
      confidence: 76,
      aiSignal: 'BUY',
      sparkline: [27.1, 27.4, 27.9, 28.1, 28.0, 28.4, 28.6],
      description: 'Subnet enterprise adoption partnership momentum.',
      structure: 'Higher low confirmed on 1H chart',
      newsHeadline: 'Institutional subnet tokenization framework launched',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'PAXG/USDT',
      name: 'Physical Gold Spot (PAXG)',
      category: 'metals',
      price: 2645.5,
      change24h: 0.45,
      high24h: 2655.0,
      low24h: 2632.0,
      volume24h: '$120M',
      volumeNumeric: 120000000,
      trend: 'BULLISH',
      momentumRsi: 58,
      volatility: 'LOW',
      confidence: 78,
      aiSignal: 'BUY',
      sparkline: [2632, 2636, 2640, 2639, 2642, 2644, 2645.5],
      description: 'Physical allocated spot gold backed 1:1 by fine troy ounce in London vaults.',
      structure: 'Multi-month structural uptrend',
      newsHeadline: 'Central banks allocate additional physical gold reserves',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'LINK/USDT',
      name: 'Chainlink Spot',
      category: 'crypto',
      price: 12.4,
      change24h: 3.1,
      high24h: 12.8,
      low24h: 11.9,
      volume24h: '$380M',
      volumeNumeric: 380000000,
      trend: 'BULLISH',
      momentumRsi: 60,
      volatility: 'MEDIUM',
      confidence: 77,
      aiSignal: 'BUY',
      sparkline: [11.9, 12.0, 12.2, 12.1, 12.3, 12.35, 12.4],
      description: 'Cross-chain interoperability protocol (CCIP) revenue growth.',
      structure: 'Breakout above horizontal consolidation',
      newsHeadline: 'Major financial consortium adopts CCIP for settlements',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'DOT/USDT',
      name: 'Polkadot Spot',
      category: 'crypto',
      price: 4.82,
      change24h: -1.2,
      high24h: 4.95,
      low24h: 4.75,
      volume24h: '$210M',
      volumeNumeric: 210000000,
      trend: 'BEARISH',
      momentumRsi: 42,
      volatility: 'MEDIUM',
      confidence: 54,
      aiSignal: 'AVOID',
      sparkline: [4.95, 4.91, 4.88, 4.85, 4.84, 4.83, 4.82],
      description: 'Below 4H EMA 200, lack of upward buying volume.',
      structure: 'Descending channel near local lows',
      newsHeadline: 'Ecosystem governance treasury referendum voting ends',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'NEAR/USDT',
      name: 'NEAR Protocol Spot',
      category: 'crypto',
      price: 5.12,
      change24h: 6.8,
      high24h: 5.25,
      low24h: 4.72,
      volume24h: '$520M',
      volumeNumeric: 520000000,
      trend: 'BULLISH',
      momentumRsi: 71,
      volatility: 'HIGH',
      confidence: 82,
      aiSignal: 'BUY',
      sparkline: [4.72, 4.8, 4.92, 4.98, 5.02, 5.08, 5.12],
      description: 'User-owned AI narrative and transaction scaling.',
      structure: 'Clear impulsive 4H wave breakout',
      newsHeadline: 'AI developer tools announced for ecosystem participants',
      lastUpdated: Date.now(),
    },
    {
      symbol: 'SUI/USDT',
      name: 'Sui Network Spot',
      category: 'crypto',
      price: 1.88,
      change24h: 4.5,
      high24h: 1.95,
      low24h: 1.76,
      volume24h: '$440M',
      volumeNumeric: 440000000,
      trend: 'BULLISH',
      momentumRsi: 65,
      volatility: 'HIGH',
      confidence: 79,
      aiSignal: 'BUY',
      sparkline: [1.76, 1.79, 1.82, 1.81, 1.85, 1.87, 1.88],
      description: 'High throughput Object-centric Move VM execution adoption.',
      structure: 'Higher low support bounce',
      newsHeadline: 'Total Value Locked (TVL) crosses new all-time high',
      lastUpdated: Date.now(),
    },
  ];

  constructor(provider?: IMarketDataProvider) {
    this.provider = provider || new BinanceSpotPublicProvider();
    // Non-blocking initial sync
    this.syncLiveTickers().catch((err) => {
      console.warn('[MarketDataService] Initial sync notice:', err);
    });
  }

  /**
   * Set or swap market data provider dynamically
   */
  public setProvider(newProvider: IMarketDataProvider): void {
    this.provider = newProvider;
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  public getStatus(): MarketDataStatus {
    const elapsed = Date.now() - this.lastSyncTimestamp;
    if (elapsed > 180000) {
      return 'STALE';
    }
    return this.status;
  }

  public isMarketDataFresh(): boolean {
    return this.getStatus() === 'ONLINE';
  }

  public async syncLiveTickers(): Promise<void> {
    try {
      const tickers = await this.provider.fetchAllTickers();
      const hasData = Object.keys(tickers).length > 0;

      if (!hasData) {
        // Test single fallback
        const single = await this.provider.fetchTicker('BTC/USDT');
        if (single) {
          this.status = 'ONLINE';
          this.lastSyncTimestamp = Date.now();
          this.updateAssetPrice('BTC/USDT', single);
          return;
        }

        // If offline for too long
        if (Date.now() - this.lastSyncTimestamp > 120000) {
          this.status = 'OFFLINE';
        }
        return;
      }

      this.status = 'ONLINE';
      this.lastSyncTimestamp = Date.now();

      // Update known assets
      this.assetUniverse.forEach((asset) => {
        const liveTicker = tickers[asset.symbol];
        if (liveTicker) {
          this.updateAssetPrice(asset.symbol, liveTicker);
        }
      });
    } catch (err) {
      console.warn('[MarketDataService] Sync error:', err);
      if (Date.now() - this.lastSyncTimestamp > 120000) {
        this.status = 'OFFLINE';
      }
    }
  }

  private updateAssetPrice(symbol: string, ticker: TickerData): void {
    const asset = this.assetUniverse.find((a) => a.symbol === symbol);
    if (!asset) return;

    asset.price = ticker.price;
    asset.change24h = ticker.change24h;
    asset.high24h = ticker.high24h;
    asset.low24h = ticker.low24h;
    asset.volume24h = ticker.volume24h;
    asset.volumeNumeric = ticker.volumeNumeric;
    asset.lastUpdated = ticker.timestamp;

    // Update sparkline
    if (asset.sparkline.length > 0) {
      asset.sparkline.shift();
      asset.sparkline.push(ticker.price);
    }
  }

  public async getCandlesForAsset(
    symbol: string,
    timeframe: Timeframe,
    limit: number = 60
  ): Promise<Candle[]> {
    return this.provider.fetchCandles(symbol, timeframe, limit);
  }

  public getAllAssets(): MarketAsset[] {
    return [...this.assetUniverse];
  }

  public getAssetBySymbol(symbol: string): MarketAsset | undefined {
    return this.assetUniverse.find(
      (a) => a.symbol.toLowerCase() === symbol.toLowerCase()
    );
  }

  public getLivePrice(symbol: string): number {
    const asset = this.getAssetBySymbol(symbol);
    return asset ? asset.price : 0;
  }

  public getLastSyncTime(): number {
    return this.lastSyncTimestamp;
  }
}

export const marketDataService = new MarketDataService();
