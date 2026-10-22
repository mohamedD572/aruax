import { WELCOME_MESSAGES } from "../api/telegram/webhook";

export const VERCEL_DOMAIN = "25dyas.vercel.app";

let storedBotToken = process.env.TELEGRAM_BOT_TOKEN || "";

export function getBotToken(): string {
  return (process.env.TELEGRAM_BOT_TOKEN || storedBotToken || "").trim();
}

export function setBotToken(token: string): void {
  if (token) {
    storedBotToken = token.trim();
  }
}

export async function registerWebhook(botToken: string, host?: string, protocol = "https") {
  const token = botToken || getBotToken();
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is not configured");
    return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" };
  }

  const targetHost = host && !host.includes("localhost") ? host : VERCEL_DOMAIN;
  const webhookUrl = targetHost.startsWith("http")
    ? `${targetHost}/api/telegram/webhook`
    : `${protocol}://${targetHost}/api/telegram/webhook`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
        drop_pending_updates: false,
      }),
    });
    const data = await res.json();
    return { ok: Boolean(data?.ok), data, webhookUrl };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err), webhookUrl };
  }
}

export async function sendWelcomeMessage(
  botToken: string,
  chatId: number | string,
  reqHost?: string,
  reqProtocol?: string
) {
  const token = botToken || getBotToken();
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is not configured");
    return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" };
  }

  const host = reqHost && !reqHost.includes("localhost") ? reqHost : VERCEL_DOMAIN;
  const protocol = reqProtocol || "https";
  const baseUrl = `${protocol}://${host}`;
  const miniAppUrl = process.env.MINI_APP_URL || baseUrl;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: "🚀 OPEN AUREX",
          web_app: { url: miniAppUrl },
        },
      ],
    ],
  };

  const bannerNum = Math.floor(Math.random() * 15) + 1;
  const bannerImageUrl = `${baseUrl}/banners/banner${bannerNum}.jpg`;

  const msgIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
  const captionText = WELCOME_MESSAGES[msgIndex];

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: bannerImageUrl,
        caption: captionText,
        reply_markup: inlineKeyboard,
      }),
    });
    const data = await res.json();
    if (data?.ok) {
      return data;
    }
  } catch (err) {
    console.error(`[Telegram Bot] sendPhoto URL exception:`, err);
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: captionText,
        reply_markup: inlineKeyboard,
      }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[Telegram Bot] Fallback sendMessage exception:`, err);
    return { ok: false, error: "Failed to send welcome message" };
  }
}
