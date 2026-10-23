import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import {
  getBotToken,
  setBotToken,
  registerWebhook,
  sendWelcomeMessage,
  VERCEL_DOMAIN,
} from "./lib/telegramBot";
import { verifyTelegramInitData } from "./server/telegramAuth";
import { claimDailyLoginServer, checkAndGrantReferralDepositReward } from "./server/taskService";
import { searchUserByGiftIdServer, grantGiftMiningServer } from "./server/giftMiningService";
import { verifyWorkerSecret, executePaperTradingCycle } from "./server/tradingWorkerService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./src/lib/firebase";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS Middleware for API requests
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json());

  // Serve static assets (images, banners)
  app.use("/assets", express.static(path.join(process.cwd(), "src/assets")));

  // API Health Check
  app.get("/api/health", (req, res) => {
    const host = req.get("host") || VERCEL_DOMAIN;
    const protocol = req.protocol || "https";
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      success: true,
      service: "SMS Vault API",
      status: "ok",
      botConfigured: Boolean(getBotToken() || process.env.TELEGRAM_BOT_TOKEN),
      timestamp: new Date().toISOString(),
    });
  });

  // GET & POST /api/worker/run - 24/7 Spot Paper Trading Automated Engine Worker
  const handleWorkerRun = async (req: express.Request, res: express.Response) => {
    try {
      // 1. Verify Authorization
      const authCheck = verifyWorkerSecret(req);
      if (!authCheck.authorized) {
        console.warn(`[WORKER RUN AUTH REJECTED] ${authCheck.reason}`);
        return res.status(401).json({
          success: false,
          error: "UNAUTHORIZED",
          message: authCheck.reason || "Unauthorized. Invalid or missing worker secret.",
        });
      }

      // 2. Execute one cycle of Paper Trading Engine
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
  };

  app.get("/api/worker/run", handleWorkerRun);
  app.post("/api/worker/run", handleWorkerRun);

  // POST /api/auth/telegram - Telegram WebApp Cryptographic Authentication
  app.post("/api/auth/telegram", (req, res) => {
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

      console.log(`[AUTH REQUEST] Verifying Telegram initData (length=${initData.length})`);
      const verification = verifyTelegramInitData(initData, botToken);

      if (!verification.valid || !verification.user) {
        console.error(`[AUTH ERROR] Verification rejected: ${verification.serverLog || verification.error}`);
        return res.status(401).json({
          success: false,
          error: "UNAUTHORIZED",
          message: "Telegram verification failed. Please reopen the Mini App from Telegram.",
        });
      }

      // Successfully verified
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
      console.error("[AUTH ERROR] Backend request failed: Unexpected server exception in /api/auth/telegram:", err);
      return res.status(500).json({
        success: false,
        error: "SERVER_ERROR",
        message: "Telegram authentication failed. Please try again.",
      });
    }
  });

  // Daily Login Task Endpoint
  app.post("/api/tasks/claim-daily-login", async (req, res) => {
    try {
      const { userId } = req.body || {};
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
      }
      const result = await claimDailyLoginServer(userId);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.json(result);
    } catch (err: any) {
      console.error("Error claiming daily login on server:", err);
      return res.status(500).json({ success: false, message: err.message || "Server error" });
    }
  });

  // Referral Deposit Task Check Endpoint
  app.post("/api/tasks/referral-deposit-status", async (req, res) => {
    try {
      const { userId } = req.body || {};
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required." });
      }
      const result = await checkAndGrantReferralDepositReward(userId);
      return res.json(result);
    } catch (err: any) {
      console.error("Error checking referral deposit status:", err);
      return res.status(500).json({ success: false, message: err.message || "Server error" });
    }
  });

  // Admin Search User by Gift ID Endpoint (GET /api/admin/gift-mining/user?giftId=...)
  app.get("/api/admin/gift-mining/user", async (req, res) => {
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
        error: "SERVER_ERROR",
        message: err.message || "Server error processing gift ID search"
      });
    }
  });

  // Admin Search User by Gift ID Endpoint (Legacy POST)
  app.post("/api/admin/search-gift-id", async (req, res) => {
    try {
      const { giftId } = req.body || {};
      if (!giftId) {
        return res.status(400).json({ success: false, message: "Gift ID is required." });
      }
      const result = await searchUserByGiftIdServer(giftId);
      return res.json(result);
    } catch (err: any) {
      console.error("Error searching gift ID:", err);
      return res.status(500).json({ success: false, message: err.message || "Server error" });
    }
  });

  // Admin Grant Gift Mining Endpoint (POST /api/admin/gift-mining/grant)
  app.post("/api/admin/gift-mining/grant", async (req, res) => {
    try {
      const { giftId, giftValue, durationHours, rewardRate, hashRate, giftPackage, adminUsername } = req.body || {};
      if (!giftId) {
        return res.status(400).json({ success: false, message: "Gift ID is required." });
      }
      const result = await grantGiftMiningServer({
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
      return res.json(result);
    } catch (err: any) {
      console.error("Error in POST /api/admin/gift-mining/grant:", err);
      return res.status(500).json({ success: false, message: err.message || "Server error" });
    }
  });

  // Admin Grant Gift Mining Endpoint (Legacy POST /api/admin/grant-gift)
  app.post("/api/admin/grant-gift", async (req, res) => {
    try {
      const { giftId, giftValue, durationHours, rewardRate, hashRate, giftPackage, adminUsername } = req.body || {};
      if (!giftId) {
        return res.status(400).json({ success: false, message: "Gift ID is required." });
      }
      const result = await grantGiftMiningServer({
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
      return res.json(result);
    } catch (err: any) {
      console.error("Error granting gift mining:", err);
      return res.status(500).json({ success: false, message: err.message || "Server error" });
    }
  });

  // Admin Gift History Endpoint
  app.get("/api/admin/gift-history", async (req, res) => {
    try {
      const giftsSnap = await getDocs(collection(db, "gift_history"));
      const list: any[] = [];
      giftsSnap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return res.json({ success: true, giftHistory: list });
    } catch (err: any) {
      console.error("Error fetching gift history:", err);
      return res.status(500).json({ success: false, message: err.message || "Server error" });
    }
  });

  // Set/Update Bot Token Endpoint
  app.post("/api/telegram/config", async (req, res) => {
    const { botToken } = req.body || {};
    if (!botToken || typeof botToken !== "string") {
      return res.status(400).json({ error: "Missing or invalid botToken" });
    }

    const cleanToken = botToken.trim();
    setBotToken(cleanToken);

    try {
      // Test the token with Telegram
      const testRes = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
      const testData = await testRes.json();

      if (!testData.ok) {
        return res.status(400).json({
          error: "Invalid Telegram Bot Token according to Telegram API",
          telegramResponse: testData,
        });
      }

      // Automatically register Webhook with Telegram
      const regResult = await registerWebhook(cleanToken, req.get("host") || VERCEL_DOMAIN, req.protocol);

      return res.json({
        status: "ok",
        message: `Successfully connected to Telegram Bot @${testData.result.username}`,
        botInfo: testData.result,
        webhookRegistration: regResult,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // GET /api/telegram/webhook - Health check & Webhook auto-registration
  app.get("/api/telegram/webhook", async (req, res) => {
    const token = getBotToken();
    const host = req.get("host") || VERCEL_DOMAIN;
    const protocol = req.protocol || "https";

    let regResult = null;
    if (token) {
      regResult = await registerWebhook(token, host, protocol);
    }

    return res.status(200).json({
      status: "ok",
      service: "Aurex Telegram Bot Webhook Endpoint",
      webhookUrl: `${protocol}://${host}/api/telegram/webhook`,
      botConfigured: Boolean(token),
      registration: regResult,
      timestamp: new Date().toISOString(),
    });
  });

  // GET & POST /api/telegram/verify-membership - Check if user is member of official Telegram channel
  const handleVerifyMembership = async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.query.userId || req.body?.userId;
      const channel = (req.query.channel as string) || req.body?.channel || "@AurexOfficial";
      const token = getBotToken();

      if (!token) {
        return res.json({ success: true, verified: true, reason: "bot_token_not_configured" });
      }

      if (!userId) {
        return res.status(400).json({ success: false, error: "Missing userId" });
      }

      const tgUrl = `https://api.telegram.org/bot${token}/getChatMember?chat_id=${encodeURIComponent(
        channel
      )}&user_id=${encodeURIComponent(String(userId))}`;

      const response = await fetch(tgUrl);
      const data = await response.json();

      if (data.ok && ["creator", "administrator", "member", "restricted"].includes(data.result?.status)) {
        return res.json({ success: true, verified: true, status: data.result.status });
      }

      return res.json({
        success: true,
        verified: false,
        status: data.result?.status || "unknown",
        telegramResponse: data,
      });
    } catch (err: any) {
      console.warn("Error verifying Telegram membership:", err);
      return res.json({ success: true, verified: true, error: err.message });
    }
  };

  app.get("/api/telegram/verify-membership", handleVerifyMembership);
  app.post("/api/telegram/verify-membership", handleVerifyMembership);

  // POST /api/telegram/webhook - Telegram Bot Updates Handler
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const update = req.body;
      const message = update?.message;
      const chatId = message?.chat?.id;
      const text = message?.text || "";

      if (chatId && text.startsWith("/start")) {
        const token = getBotToken();
        if (token) {
          await sendWelcomeMessage(token, chatId, req.get("host"), req.protocol);
        }

        return res.json({
          status: "ok",
          event: "sent_start_welcome_message",
          chatId,
        });
      }

      return res.json({ status: "ignored", message: "Not a /start command" });
    } catch (error: any) {
      console.error("Error processing Telegram webhook:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Automatically register webhook on startup if token is available in environment
  const envBotToken = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  if (envBotToken) {
    registerWebhook(envBotToken, VERCEL_DOMAIN, "https").catch((err) =>
      console.warn("Auto webhook registration notice:", err)
    );
  }

  // API Catch-All: ALWAYS return JSON for any unhandled /api/* request (NEVER return HTML index.html)
  app.all("/api/*", (req, res) => {
    return res.status(404).json({
      success: false,
      error: "API_NOT_FOUND",
      message: `API route ${req.method} ${req.path} not found.`
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
