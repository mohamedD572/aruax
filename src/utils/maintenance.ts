export const getMaintenanceCost = (investedAmount: number): number => {
  if (!investedAmount || investedAmount <= 0) return 0.10;
  // 0.5% of the machine price, minimum $0.10 USDT
  const rawCost = Math.max(0.10, investedAmount * 0.005);
  return Math.round(rawCost * 100) / 100;
};
