import type { VercelRequest, VercelResponse } from "@vercel/node";

const VERCEL_DOMAIN = "25dyas.vercel.app";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const host = (req.headers?.host || VERCEL_DOMAIN) as string;
    const protocol = (req.headers?.["x-forwarded-proto"] as string) || "https";
    const isBotConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN.trim());

    return res.status(200).json({
      success: true,
      service: "SMS Vault API",
      status: "ok",
      botConfigured: isBotConfigured,
      webhookEndpoint: `${protocol}://${host}/api/telegram/webhook`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
      message: err?.message || String(err),
    });
  }
}
