import type { VercelRequest, VercelResponse } from "@vercel/node";

const VERCEL_DOMAIN = "25dyas.vercel.app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const host = (req.headers?.host || VERCEL_DOMAIN) as string;
    const protocol = (req.headers?.["x-forwarded-proto"] as string) || "https";
    const envToken = process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.trim() : "";

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          // ignore
        }
      }

      const { botToken } = body || {};
      const tokenClean = (botToken || envToken || "").trim();

      if (!tokenClean) {
        console.error("TELEGRAM_BOT_TOKEN is not configured");
        return res.status(500).json({ error: "Telegram authentication is not configured" });
      }

      // Test token with Telegram API
      const testRes = await fetch(`https://api.telegram.org/bot${tokenClean}/getMe`);
      const testData = await testRes.json();

      if (!testData.ok) {
        return res.status(400).json({
          error: "Invalid Telegram Bot Token according to Telegram API",
          telegramResponse: testData,
        });
      }

      // Automatically register Webhook on Telegram to Vercel endpoint
      const targetHost = host && !host.includes("localhost") ? host : VERCEL_DOMAIN;
      const webhookUrl = `${protocol}://${targetHost}/api/telegram/webhook`;

      const regRes = await fetch(`https://api.telegram.org/bot${tokenClean}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
          drop_pending_updates: false,
        }),
      });
      const regData = await regRes.json();

      return res.status(200).json({
        status: "ok",
        message: `Successfully connected to Telegram Bot @${testData.result?.username}`,
        botInfo: testData.result,
        webhookRegistration: regData,
      });
    }

    return res.status(200).json({
      status: "ok",
      botTokenConfigured: Boolean(envToken),
      webhookUrl: `${protocol}://${host}/api/telegram/webhook`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
