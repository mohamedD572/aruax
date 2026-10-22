import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyTelegramInitData } from "../../server/telegramAuth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const botToken = (process.env.TELEGRAM_BOT_TOKEN || "").trim();

    let initData = "";
    if (req.body && typeof req.body === "object") {
      initData = req.body.initData || "";
    } else if (typeof req.body === "string") {
      try {
        const parsed = JSON.parse(req.body);
        initData = parsed.initData || "";
      } catch {
        initData = req.body;
      }
    }

    if (!initData || typeof initData !== "string" || initData.trim() === "") {
      console.error("[AUTH ERROR] Missing initData: Request received without initData payload.");
      return res.status(400).json({
        success: false,
        error: "MISSING_INIT_DATA",
        message: "Telegram verification failed. Please reopen the Mini App from Telegram.",
      });
    }

    console.log(`[AUTH REQUEST] Verifying Telegram initData in serverless route (length=${initData.length})`);
    const verification = verifyTelegramInitData(initData, botToken);

    if (!verification.valid || !verification.user) {
      console.error(`[AUTH ERROR] Verification rejected: ${verification.serverLog || verification.error}`);
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: "Telegram verification failed. Please reopen the Mini App from Telegram.",
      });
    }

    console.log(`[AUTH SUCCESS] User verified: ID=${verification.user.id}, Name=${verification.user.first_name}`);
    return res.status(200).json({
      success: true,
      message: "Telegram authentication verified successfully.",
      user: {
        id: verification.user.id,
        firstName: verification.user.first_name,
        lastName: verification.user.last_name || null,
        username: verification.user.username || null,
        photoUrl: verification.user.photo_url || null,
        languageCode: verification.user.language_code || "en",
        isPremium: Boolean(verification.user.is_premium),
      },
      authDate: verification.authDate,
    });
  } catch (err: any) {
    console.error("[AUTH ERROR] Backend request failed: Exception in /api/auth/telegram:", err);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Telegram authentication failed. Please try again.",
    });
  }
}
