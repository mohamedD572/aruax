import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyWorkerSecret, executePaperTradingCycle } from "../../server/tradingWorkerService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Security Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Worker-Secret");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // 1. Verify Worker Request & Secret
    const authCheck = verifyWorkerSecret(req);
    if (!authCheck.authorized) {
      console.warn(`[WORKER RUN AUTH REJECTED] ${authCheck.reason}`);
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: authCheck.reason || "Unauthorized. Invalid or missing worker secret.",
      });
    }

    // 2. Execute Trading Engine Single Run Cycle
    console.log(`[API /api/worker/run] Starting automated paper trading execution cycle`);
    const result = await executePaperTradingCycle();

    if (!result.success) {
      return res.status(503).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[FATAL /api/worker/run] Unhandled worker exception:", error);
    return res.status(500).json({
      success: false,
      error: "ENGINE_ERROR",
      message: error?.message || "Internal server error running paper trading worker cycle.",
      timestamp: new Date().toISOString(),
    });
  }
}
