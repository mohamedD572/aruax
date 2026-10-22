import type { VercelRequest, VercelResponse } from "@vercel/node";
import { grantGiftMiningServer } from "../../../server/giftMiningService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "METHOD_NOT_ALLOWED",
      message: "Only POST requests allowed"
    });
  }

  try {
    const { userId, giftId, giftValue, durationHours, rewardRate, hashRate, giftPackage, adminUsername } = req.body || {};
    if (!userId && !giftId) {
      return res.status(400).json({ success: false, error: "MISSING_GIFT_ID", message: "User ID or Gift ID is required." });
    }
    const result = await grantGiftMiningServer({
      userId,
      giftId,
      giftValue,
      durationHours,
      rewardRate,
      hashRate,
      giftPackage,
      adminUsername,
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("Error in POST /api/admin/gift-mining/grant:", err);
    return res.status(500).json({ success: false, error: "INTERNAL_SERVER_ERROR", message: err.message || "Server error" });
  }
}
