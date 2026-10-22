import type { VercelRequest, VercelResponse } from "@vercel/node";
import { claimDailyLoginServer } from "../../server/taskService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, error: "MISSING_USER_ID", message: "User ID is required." });
    }
    const result = await claimDailyLoginServer(userId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("Error claiming daily login:", err);
    return res.status(500).json({ success: false, error: "INTERNAL_SERVER_ERROR", message: err.message || "Server error" });
  }
}
