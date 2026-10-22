export interface CryptoTicker {
  id: string;
  symbol: string;
  name: string;
  pair: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  marketCap: string;
  logoUrl: string;
  color: string;
  sparkline: number[];
  isAurex?: boolean;
}

const INITIAL_TICKERS: CryptoTicker[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    pair: 'BTC/USDT',
    price: 96480.50,
    change24h: 3.42,
    high24h: 97800.00,
    low24h: 94200.00,
    volume24h: '42.8B',
    marketCap: '1.89T',
    logoUrl: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    color: '#F7931A',
    sparkline: [94200, 94800, 95100, 94900, 95600, 96100, 96480.50],
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    pair: 'ETH/USDT',
    price: 3420.75,
    change24h: 2.18,
    high24h: 3480.00,
    low24h: 3340.00,
    volume24h: '21.4B',
    marketCap: '412B',
    logoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    color: '#627EEA',
    sparkline: [3340, 3370, 3390, 3360, 3400, 3415, 3420.75],
  },
  {
    id: 'aur',
    symbol: 'AUR',
    name: 'Aurex Token',
    pair: 'AUR/USDT',
    price: 0.0100,
    change24h: 2.85,
    high24h: 0.0108,
    low24h: 0.0098,
    volume24h: '3.45M',
    marketCap: '10.0M',
    logoUrl: 'AUREX_3D_LOGO',
    color: '#10B981',
    sparkline: [0.0098, 0.0099, 0.0101, 0.0100, 0.0104, 0.0106, 0.0108],
    isAurex: true,
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB',
    pair: 'BNB/USDT',
    price: 648.30,
    change24h: 1.75,
    high24h: 658.00,
    low24h: 635.00,
    volume24h: '1.8B',
    marketCap: '94B',
    logoUrl: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    color: '#F3BA2F',
    sparkline: [635, 638, 642, 640, 645, 647, 648.30],
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    pair: 'SOL/USDT',
    price: 194.20,
    change24h: 5.62,
    high24h: 198.50,
    low24h: 182.00,
    volume24h: '7.2B',
    marketCap: '91B',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    color: '#14F195',
    sparkline: [182, 185, 189, 187, 192, 193.5, 194.20],
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    pair: 'DOGE/USDT',
    price: 0.2640,
    change24h: -1.45,
    high24h: 0.2780,
    low24h: 0.2550,
    volume24h: '3.1B',
    marketCap: '38B',
    logoUrl: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    color: '#C2A633',
    sparkline: [0.278, 0.272, 0.268, 0.265, 0.262, 0.263, 0.264],
  },
  {
    id: 'trx',
    symbol: 'TRX',
    name: 'TRON',
    pair: 'TRX/USDT',
    price: 0.2315,
    change24h: 2.10,
    high24h: 0.2380,
    low24h: 0.2240,
    volume24h: '890M',
    marketCap: '20B',
    logoUrl: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
    color: '#EF0027',
    sparkline: [0.224, 0.226, 0.228, 0.229, 0.230, 0.231, 0.2315],
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'XRP',
    pair: 'XRP/USDT',
    price: 2.4500,
    change24h: 4.12,
    high24h: 2.5800,
    low24h: 2.3200,
    volume24h: '8.4B',
    marketCap: '140B',
    logoUrl: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    color: '#23292F',
    sparkline: [2.32, 2.36, 2.40, 2.38, 2.42, 2.44, 2.45],
  },
  {
    id: 'ton',
    symbol: 'TON',
    name: 'Toncoin',
    pair: 'TON/USDT',
    price: 5.8500,
    change24h: 3.80,
    high24h: 6.0500,
    low24h: 5.5500,
    volume24h: '410M',
    marketCap: '14.8B',
    logoUrl: 'https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png',
    color: '#0098EA',
    sparkline: [5.55, 5.62, 5.70, 5.68, 5.78, 5.82, 5.85],
  },
  {
    id: 'ada',
    symbol: 'ADA',
    name: 'Cardano',
    pair: 'ADA/USDT',
    price: 0.7850,
    change24h: -0.85,
    high24h: 0.8120,
    low24h: 0.7650,
    volume24h: '1.2B',
    marketCap: '28B',
    logoUrl: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    color: '#0033AD',
    sparkline: [0.812, 0.805, 0.795, 0.790, 0.782, 0.784, 0.785],
  },
  {
    id: 'avax',
    symbol: 'AVAX',
    name: 'Avalanche',
    pair: 'AVAX/USDT',
    price: 32.40,
    change24h: 3.15,
    high24h: 33.80,
    low24h: 31.10,
    volume24h: '640M',
    marketCap: '13.2B',
    logoUrl: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    color: '#E84142',
    sparkline: [31.1, 31.5, 31.9, 31.7, 32.1, 32.3, 32.4],
  },
  {
    id: 'link',
    symbol: 'LINK',
    name: 'Chainlink',
    pair: 'LINK/USDT',
    price: 18.20,
    change24h: 2.45,
    high24h: 18.90,
    low24h: 17.50,
    volume24h: '520M',
    marketCap: '10.8B',
    logoUrl: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    color: '#375BD2',
    sparkline: [17.5, 17.8, 18.0, 17.9, 18.1, 18.15, 18.20],
  },
  {
    id: 'shib',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    pair: 'SHIB/USDT',
    price: 0.0000245,
    change24h: 4.10,
    high24h: 0.0000258,
    low24h: 0.0000232,
    volume24h: '980M',
    marketCap: '14.4B',
    logoUrl: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    color: '#FFA409',
    sparkline: [0.0000232, 0.0000238, 0.0000241, 0.0000240, 0.0000243, 0.0000244, 0.0000245],
  },
];

const binanceSymbolMap: Record<string, string> = {
  btc: 'BTCUSDT',
  eth: 'ETHUSDT',
  bnb: 'BNBUSDT',
  sol: 'SOLUSDT',
  doge: 'DOGEUSDT',
  trx: 'TRXUSDT',
  xrp: 'XRPUSDT',
  ton: 'TONUSDT',
  ada: 'ADAUSDT',
  avax: 'AVAXUSDT',
  link: 'LINKUSDT',
  shib: 'SHIBUSDT',
};

class MarketService {
  private tickers: CryptoTicker[] = [...INITIAL_TICKERS];
  private listeners: ((tickers: CryptoTicker[]) => void)[] = [];
  private intervalId: any = null;

  constructor() {
    this.startLiveUpdates();
  }

  public getTickers(): CryptoTicker[] {
    return this.tickers;
  }

  public subscribe(listener: (tickers: CryptoTicker[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.tickers);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private startLiveUpdates() {
    this.fetchRealPrices();
    this.intervalId = setInterval(() => {
      this.updatePrices();
    }, 2500);
  }

  private async fetchRealPrices() {
    try {
      const symbols = Object.values(binanceSymbolMap);
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const priceMap: Record<string, { price: number; change: number; high: number; low: number; volume: string }> = {};
          data.forEach((item: any) => {
            const symbol = item.symbol;
            const price = parseFloat(item.lastPrice);
            const change = parseFloat(item.priceChangePercent);
            const high = parseFloat(item.highPrice);
            const low = parseFloat(item.lowPrice);
            const quoteVol = parseFloat(item.quoteVolume);
            let volStr = `${(quoteVol / 1e6).toFixed(1)}M`;
            if (quoteVol >= 1e9) volStr = `${(quoteVol / 1e9).toFixed(1)}B`;

            priceMap[symbol] = { price, change, high, low, volume: volStr };
          });

          this.tickers = this.tickers.map((t) => {
            if (t.isAurex) return t;
            const bSymbol = binanceSymbolMap[t.id];
            if (bSymbol && priceMap[bSymbol]) {
              const info = priceMap[bSymbol];
              const newSparkline = [...t.sparkline.slice(1), info.price];
              return {
                ...t,
                price: info.price,
                change24h: info.change,
                high24h: info.high,
                low24h: info.low,
                volume24h: info.volume,
                sparkline: newSparkline,
              };
            }
            return t;
          });
          this.notify();
        }
      }
    } catch {
      // Gracefully fall back to smooth realistic simulation
    }
  }

  private updatePrices() {
    this.tickers = this.tickers.map((t) => {
      if (t.isAurex) {
        // Aurex micro fluctuation around 0.0100 (range 0.0098 to 0.0103)
        const delta = (Math.random() - 0.48) * 0.00015;
        let newPrice = parseFloat((t.price + delta).toFixed(4));
        if (newPrice < 0.0097) newPrice = 0.0098;
        if (newPrice > 0.0105) newPrice = 0.0104;

        const changeDelta = (Math.random() - 0.49) * 0.1;
        const newChange = parseFloat((t.change24h + changeDelta).toFixed(2));
        const newSparkline = [...t.sparkline.slice(1), newPrice];

        return {
          ...t,
          price: newPrice,
          change24h: newChange,
          sparkline: newSparkline,
        };
      } else {
        // Slight realistic tick jitter
        const pctChange = (Math.random() - 0.49) * 0.003; // +/- 0.3%
        const newPrice = parseFloat((t.price * (1 + pctChange)).toFixed(t.price < 1 ? 4 : 2));
        const newSparkline = [...t.sparkline.slice(1), newPrice];

        return {
          ...t,
          price: newPrice,
          sparkline: newSparkline,
        };
      }
    });

    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l(this.tickers));
  }
}

export const marketService = new MarketService();
