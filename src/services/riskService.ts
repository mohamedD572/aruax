import { Position } from '../types/trading';

export interface PositionRiskCalculation {
  maxRiskAmount: number;
  recommendedUnits: number;
  investedCapital: number;
  riskPercent: number;
  stopDistance: number;
  stopDistancePercent: number;
  takeProfitDistance: number;
  riskRewardRatio: number;
  isValid: boolean;
  validationError?: string;
}

export class RiskService {
  private readonly MAX_RISK_PERCENT = 0.01; // 1% max risk per trade
  private readonly MIN_CONFIDENCE_THRESHOLD = 80;
  private readonly MIN_RISK_REWARD_RATIO = 2.0;

  /**
   * Calculate position sizing based on 1% risk limit and available paper balance
   */
  public calculatePositionRisk(
    currentEquity: number,
    availableBalance: number,
    entryPrice: number,
    stopLossPrice: number,
    takeProfitPrice: number
  ): PositionRiskCalculation {
    // 1. Safety check on balance
    if (currentEquity <= 0 || availableBalance <= 0) {
      return {
        maxRiskAmount: 0,
        recommendedUnits: 0,
        investedCapital: 0,
        riskPercent: 0,
        stopDistance: 0,
        stopDistancePercent: 0,
        takeProfitDistance: 0,
        riskRewardRatio: 0,
        isValid: false,
        validationError: 'Insufficient account equity or balance.',
      };
    }

    // 2. Risk Amount = 1% of total equity (e.g. $1.00 on $100)
    const maxRiskAmount = Math.max(0.1, currentEquity * this.MAX_RISK_PERCENT);

    // 3. Stop and Target Distances
    const stopDistance = Math.abs(entryPrice - stopLossPrice);
    const takeProfitDistance = Math.abs(takeProfitPrice - entryPrice);

    if (stopDistance <= 0) {
      return {
        maxRiskAmount,
        recommendedUnits: 0,
        investedCapital: 0,
        riskPercent: 1.0,
        stopDistance: 0,
        stopDistancePercent: 0,
        takeProfitDistance,
        riskRewardRatio: 0,
        isValid: false,
        validationError: 'Stop loss distance cannot be zero.',
      };
    }

    const stopDistancePercent = (stopDistance / entryPrice) * 100;
    const riskRewardRatio = takeProfitDistance / stopDistance;

    // 4. Units sizing from risk amount: Units = Risk / StopDistance
    let recommendedUnits = maxRiskAmount / stopDistance;
    let investedCapital = recommendedUnits * entryPrice;

    // 5. Cap by available balance (Pure spot, zero leverage, never allow negative cash)
    if (investedCapital > availableBalance) {
      investedCapital = availableBalance * 0.95; // Use at most 95% of available cash
      recommendedUnits = investedCapital / entryPrice;
    }

    // 6. Validate minimum trade constraints
    let isValid = true;
    let validationError: string | undefined;

    if (riskRewardRatio < this.MIN_RISK_REWARD_RATIO) {
      isValid = false;
      validationError = `Risk/Reward ratio (${riskRewardRatio.toFixed(1)}) is below minimum requirement of 1:2.0.`;
    } else if (investedCapital <= 0 || recommendedUnits <= 0) {
      isValid = false;
      validationError = 'Calculated position size is zero or invalid.';
    }

    return {
      maxRiskAmount,
      recommendedUnits,
      investedCapital,
      riskPercent: 1.0,
      stopDistance,
      stopDistancePercent,
      takeProfitDistance,
      riskRewardRatio,
      isValid,
      validationError,
    };
  }

  /**
   * Validate if a new paper trade can be opened
   */
  public canOpenNewPosition(
    activePosition: Position | null,
    confidence: number,
    riskRewardRatio: number
  ): { canOpen: boolean; reason?: string } {
    // 1. Strictly ONE active position allowed at any time
    if (activePosition !== null && activePosition.status === 'OPEN') {
      return {
        canOpen: false,
        reason: `An active position is already open in ${activePosition.symbol}. Maximum concurrent positions is 1.`,
      };
    }

    // 2. Minimum Confidence Score check
    if (confidence < this.MIN_CONFIDENCE_THRESHOLD) {
      return {
        canOpen: false,
        reason: `Confidence score (${confidence}/100) is below minimum threshold of ${this.MIN_CONFIDENCE_THRESHOLD}/100.`,
      };
    }

    // 3. Minimum Risk/Reward Ratio check
    if (riskRewardRatio < this.MIN_RISK_REWARD_RATIO) {
      return {
        canOpen: false,
        reason: `Risk/Reward ratio (${riskRewardRatio.toFixed(1)}) is below required 1:2.0 threshold.`,
      };
    }

    return { canOpen: true };
  }
}

export const riskService = new RiskService();
