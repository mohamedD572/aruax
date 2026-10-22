import type { VercelRequest, VercelResponse } from "@vercel/node";
import { searchUserByGiftIdServer } from "../../../server/giftMiningService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const rawGiftId = (req.query.giftId as string) || "";
  const normalizedGiftId = rawGiftId.trim().toUpperCase();
  const startTime = new Date().toISOString();

  console.log(`[GIFT SEARCH]`);
  console.log(`giftId: ${rawGiftId}`);
  console.log(`normalizedGiftId: ${normalizedGiftId}`);
  console.log(`database: Firestore`);
  console.log(`collection: users`);
  console.log(`query started: ${startTime}`);

  try {
    if (!rawGiftId || !normalizedGiftId) {
      console.log(`query result: MISSING_INPUT`);
      console.log(`response status: 400`);
      return res.status(400).json({
        success: false,
        error: "MISSING_GIFT_ID",
        message: "Gift ID is required."
      });
    }

    const result = await searchUserByGiftIdServer(rawGiftId);

    if (!result.success) {
      console.log(`query result: NOT_FOUND`);
      console.log(`response status: 404`);
      return res.status(404).json({
        success: false,
        error: result.error || "USER_NOT_FOUND",
        message: result.message || "User not found"
      });
    }

    console.log(`query result: FOUND`);
    console.log(`response status: 200`);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("Error in GET /api/admin/gift-mining/user:", err);
    console.log(`query result: SERVER_ERROR`);
    console.log(`response status: 500`);
    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err.message || "Server error processing gift ID search"
    });
  }
}
