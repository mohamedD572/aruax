import { TradingRulesConfig } from '../types/trading';

export class StrategyService {
  private rules: TradingRulesConfig = {
    spotOnly: true,
    onePositionOnly: true,
    maxRiskPerTradePercent: 1.0,
    minConfidence: 80,
    minRiskReward: '1 : 2.0',
    stopLossType: 'Dynamic ATR-based',
    takeProfitType: 'Dynamic Multi-target',
    trailingStopEnabled: true,
    newsProtectionEnabled: true,
    marketRegimeFilterEnabled: true,
  };

  public getTradingRules(): TradingRulesConfig {
    return this.rules;
  }
}

export const strategyService = new StrategyService();
