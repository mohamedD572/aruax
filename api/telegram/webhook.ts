import type { VercelRequest, VercelResponse } from "@vercel/node";

export const VERCEL_DOMAIN = "25dyas.vercel.app";

function getBotToken(): string {
  return (process.env.TELEGRAM_BOT_TOKEN || "").trim();
}

export const WELCOME_MESSAGES: string[] = [
  // Message 1: Platform Overview & Institutional Yield
  `⚡ Welcome to AUREX Institutional Yield Terminal!

Aurex is the world's premier institutional crypto yield acceleration engine, combining automated cloud hashrate optimization with high-frequency quantitative arbitrage algorithms. By bridging decentralized liquidity pools with proprietary enterprise-grade mining infrastructure, Aurex offers unparalleled capital efficiency and stable growth for global digital asset investors.

📊 PLATFORM SNAPSHOT:
• Daily Dividend Payouts: Up to 10% direct to your balance
• Core Contract Duration: 25 Days accelerated compounding cycles
• Capital Protection: Multi-signature cold storage vault protection
• Real-time Analytics: Instant tracking inside our Telegram Mini App

Our automated smart-routing protocol continuously monitors cross-chain DEX liquidity spreads and mining difficulty parameters to ensure your capital produces optimal daily risk-adjusted returns without requiring complex manual trading strategies.

Tap "🚀 OPEN AUREX" below to launch your personal trading dashboard and begin your financial growth journey today!`,

  // Message 2: 25-Day Investment System
  `📈 Welcome to the AUREX 25-Day Accelerated Yield Vault!

At Aurex, we have revolutionized digital asset accumulation through our disciplined 25-Day Fixed Term Investment Protocol. Designed for investors who value consistency, speed, and algorithmic transparency, every cycle runs on automated smart contract logic that executes daily profit distributions directly to your account.

💎 KEY VAULT HIGHLIGHTS:
• Daily Earnings Rate: Up to 10% daily yield accrual
• Automated Maturity: Full principal and accrued yield distribution at Day 25
• Instant Settlement: Withdraw your daily profits 24 hours a day, 7 days a week
• Zero Lockup Friction: Seamless reinvestment options upon term completion

Whether you are starting with moderate allocations or deploying institutional capital, Aurex provides the exact financial tools required to multiply your crypto assets securely and systematically.

Tap "🚀 OPEN AUREX" below to select your 25-day allocation plan and activate daily USDT yields!`,

  // Message 3: High-Frequency Mining & Neural Rig Switching
  `🤖 Welcome to AUREX AI-Powered Cloud Hashrate Engine!

Experience the pinnacle of next-generation digital asset mining. Aurex replaces traditional static mining hardware with an intelligent, self-optimizing neural network that dynamically allocates computational hashrate across the most profitable proof-of-work and proof-of-stake verification nodes in real time.

⚡ NEURAL MINING FEATURES:
• Smart Hashrate Switching: Zero idle time, maximizing block rewards continuously
• Up to 10% Daily Accrued USDT Dividends: Derived directly from active network validation
• Sustainable Infrastructure: Hydro-cooled and green-energy powered data centers worldwide
• Real-Time Metrics: Live hash rate statistics and payout streams in your Mini App

By eliminating hardware maintenance, electricity overhead, and hardware degradation risk, Aurex allows you to enjoy pure mining yield delivered directly into your digital wallet every single day.

Tap "🚀 OPEN AUREX" below to connect your node to the neural cluster and start earning instantly!`,

  // Message 4: Telegram Mini App & Web3 Integration
  `🚀 Welcome to the AUREX Telegram Mini App & Web3 Portal!

Aurex brings institutional-grade asset management directly into your Telegram workspace. Powered by cutting-edge Web3 WebApp technology, our seamless platform allows you to manage investments, monitor real-time charts, deposit funds, and execute withdrawals without ever leaving your chat interface.

🌐 MINI APP CAPABILITIES:
• Native Telegram Integration: One-tap instant authentication with biometrics
• Live Portfolio Engine: Real-time visual tracking of daily ROI and earnings growth
• Gasless Interface: Optimized Web3 wallet connectivity across major chains
• Immediate Notifications: Live push alerts for every deposit, payout, and referral reward

Enjoy zero latency, elegant dark-gold luxury design, and complete financial control in the palm of your hand. Aurex sets the standard for user-centric decentralized finance interfaces.

Tap "🚀 OPEN AUREX" below to experience the ultimate Telegram Web3 investment terminal now!`,

  // Message 5: Multi-Layer Security & Cold Vault Architecture
  `🛡️ Welcome to AUREX Enterprise Security & Asset Safeguards!

Security is the cornerstone of the Aurex financial ecosystem. We utilize multi-layered institutional defense mechanisms designed to protect investor principal and earnings against all potential attack vectors, market volatility, and operational threats.

🔒 SECURITY SPECIFICATIONS:
• Multi-Signature Cold Vaults: Over 95% of total platform reserves held offline
• Real-Time On-Chain Auditing: Fully transparent smart contract validation
• Automated Threat Detection: AI anomaly monitoring active 24/7/365
• Regulatory & Encryption Standards: End-to-end SSL/TLS and biometric passkey controls

Our zero-trust architecture ensures that your funds remain under strict cryptographic lock, enabling you to build wealth with total peace of mind while enjoying high-yield daily distributions.

Tap "🚀 OPEN AUREX" below to explore our verified security infrastructure and invest with complete confidence!`,

  // Message 6: Instant USDT Deposits & Multi-Chain Wallet Support
  `💳 Welcome to AUREX Multi-Chain Deposit & Liquidity Gateway!

Capital deployment at Aurex is engineered to be instantaneous, smooth, and universal. We support multi-chain USDT funding across major blockchain networks, including TRC-20, BEP-20, and ERC-20, allowing you to deposit and initiate yield cycles within seconds.

✨ DEPOSIT BENEFITS:
• Multi-Chain Versatility: Choose your preferred network for ultra-low gas fees
• Instant Automated Credit: Deposits reflect immediately upon block confirmation
• Low Minimum Thresholds: Accessible for all tiers of global digital investors
• 24/7 Automated Processing: Seamless funding anytime without manual delay

Our automated payment gateway continuously checks block confirmations to ensure your funds are put to work immediately, maximizing your daily earning timeline from minute one.

Tap "🚀 OPEN AUREX" below to select your network and fund your account in under 60 seconds!`,

  // Message 7: Instant Profit Settlements & Automated Daily Withdrawals
  `💸 Welcome to AUREX Instant Earnings & Fast Withdrawal Terminal!

At Aurex, we believe true financial empowerment means having instant, unrestricted access to your earned profits. Our automated liquidity engine processes withdrawal requests around the clock with zero hidden fees and zero unnecessary verification delays.

⚡ WITHDRAWAL HIGHLIGHTS:
• Daily Automated Settlements: Collect accrued returns every 24 hours
• Instant Wallet Transfer: Direct execution straight to your personal crypto wallet
• Flexible Withdrawal Limits: Low minimums to accommodate all investor profiles
• Full Audit Trail: Complete transaction hash transparency on public block explorers

Take full ownership of your financial growth. Enjoy the freedom to cash out your daily dividends or roll them into new 25-day compounding cycles whenever you choose.

Tap "🚀 OPEN AUREX" below to view your current claimable balance and experience instant payouts!`,

  // Message 8: 3-Tier Multiplier Affiliate & Referral Reward System
  `👥 Welcome to the AUREX 3-Tier Partner Commission Network!

Multiply your income beyond daily investment returns with our lucrative 3-Tier Partner Program. Aurex rewards community leaders, influencers, and investor networks with instant commission payouts for introducing active capital to our institutional platform.

🌐 COMMISSION STRUCTURE:
• Tier 1 Direct Referrals: Earn direct high-percentage commissions on all deposits
• Tier 2 Secondary Partners: Earn passive overrides from your extended network
• Tier 3 Network Multiplier: Gain ongoing passive residual income across 3 levels
• Instant Commission Crediting: Referral rewards are immediately withdrawable in USDT

Share your exclusive referral link generated inside the Mini App, build your global investment team, and establish a powerful secondary stream of daily passive crypto income.

Tap "🚀 OPEN AUREX" below to copy your referral link and start building your partner network today!`,

  // Message 9: VIP Elite Investor Tiers & Bespoke Yield Customization
  `👑 Welcome to AUREX VIP Wealth Command & Private Banking!

Designed exclusively for high-capital investors, institutional asset managers, and VIP partners, the Aurex VIP Privilege Program unlocks elevated yield rates, custom terms, and dedicated private account management tailored to your specific financial goals.

💎 VIP PRIVILEGES:
• Premium Yield Multipliers: Receive boosted daily percentages up to 10% Daily
• Priority Rig Allocation: Dedicated private server hashrate and DEX liquidity pools
• Personal Concierge: 24/7 direct access to senior wealth advisors
• Exclusive VIP Bonuses: Private Airdrops, zero platform fees, and bespoke contracts

Elevate your portfolio management to elite status with customized risk mitigation and priority withdrawal queueing engineered for institutional volume.

Tap "🚀 OPEN AUREX" below to check your account tier and apply for VIP Private Status!`,

  // Message 10: Global Community & 24/7 Institutional Support Network
  `🌍 Welcome to the AUREX Global Community & Support Center!

Join tens of thousands of satisfied digital asset investors worldwide who rely on Aurex for consistent daily income. Our global community spans over 120 countries, supported by dedicated financial experts and multilingual support specialists available 24 hours a day.

💬 COMMUNITY ADVANTAGES:
• 24/7 Live Support: Instant assistance directly inside Telegram and the Mini App
• Transparent Communication: Regular platform updates, audited reports, and news
• Global Investor Chat: Connect, share strategies, and learn from experienced traders
• Educational Hub: Guides on optimizing your 25-day compounding strategy

We are committed to providing an exceptional investor experience rooted in trust, transparency, and continuous technical innovation.

Tap "🚀 OPEN AUREX" below to join our community channels and connect with our support team!`,

  // Message 11: Ultra-Luxury Interface & Real-Time Portfolio Analytics
  `📊 Welcome to the AUREX Advanced Portfolio Command Interface!

Step into a refined financial workspace designed for modern digital asset investors. Aurex combines high-density financial analytics, live charting controls, and crisp dark-gold aesthetics into a responsive UI built for speed, clarity, and precision.

🎨 INTERFACE FEATURES:
• Live Profit Ticker: Real-time visual counter tracking your second-by-second yield
• Comprehensive History: Detailed logs for all deposits, yield payouts, and transfers
• One-Tap Reinvestment: Seamlessly compound earnings into active 25-day cycles
• Cross-Device Optimization: High performance across iOS, Android, and Desktop

Experience visual elegance combined with mathematical transparency. Aurex provides all the data points you need to make informed, highly profitable investment decisions effortless.

Tap "🚀 OPEN AUREX" below to launch your personal portfolio analytics suite!`,

  // Message 12: Gasless Web3 Transactions & Automated Smart Contracts
  `⚙️ Welcome to AUREX Automated Smart Contract Infrastructure!

Aurex operates on autonomous, tamper-proof smart contract architecture that eliminates human error, administrative delay, and operational friction. Every 25-day term contract is immutably executed on-chain, ensuring guaranteed dividend disbursements as programmed.

⚡ SMART CONTRACT BENEFITS:
• Immutable Logic: Terms cannot be altered or retroactively modified
• Automated Distribution: Dividends calculated and distributed by code precision
• Gas-Optimized Execution: Micro-gas fees routed automatically for maximum net returns
• Transparent Verification: Open ledger accountability for every single transaction

By leveraging decentralized ledger automation, Aurex guarantees that your capital works continuously according to strict mathematical rules with zero trust requirements.

Tap "🚀 OPEN AUREX" below to inspect active smart contract pools and start earning!`,

  // Message 13: Platform Roadmap, Quantum Arbitrage & Future Protocol Upgrades
  `🔮 Welcome to AUREX Future Vision & Quantum Protocol Roadmap!

Aurex is built for long-term sustainability and industry dominance. Our ongoing development roadmap includes quantum-resistant cryptographic security, cross-chain yield aggregators, and decentralized AI trading bots designed to maintain industry-leading returns for years to come.

🚀 UPCOMING MILESTONES:
• AI Quantum Arbitrage: Sub-millisecond trade execution across emerging DEX protocols
• Aurex Native Utility Token: Future staking rewards and governance privileges
• Institutional Liquidity Vaults: Expanded 50-day and 100-day term options
• Multi-Fiat Gateway: Direct credit card and bank wire USDT purchasing

Partner with a platform that actively innovates to stay ahead of market trends, ensuring your capital remains at the forefront of crypto wealth generation.

Tap "🚀 OPEN AUREX" below to view our platform roadmap and participate in future upgrades!`,

  // Message 14: Financial Freedom Engine & Risk-Adjusted Returns
  `💡 Welcome to AUREX Financial Freedom & Income Engine!

Empower your financial future with automated daily yield. Aurex was created with a clear mission: to make high-yield crypto returns safe, predictable, and accessible to everyone, regardless of technical trading background or capital size.

✨ INCOME ENGINE FEATURES:
• Stress-Tested Strategies: Built to generate profits in both bull and bear markets
• Daily Cashflow Creation: Predictable income streams to achieve your life goals
• Flexible Capital Reinvestment: Accelerate wealth accumulation through daily compounding
• User-Centric Design: Simple 3-step setup to start earning within minutes

Transform your digital holdings into an active asset generator that works for you every single day while you focus on living your life on your own terms.

Tap "🚀 OPEN AUREX" below to activate your income engine and take control of your financial future!`,

  // Message 15: Professional Asset Management & Decentralized Yield Infrastructure
  `🏆 Welcome to AUREX Premier Asset Management & Wealth Hub!

Aurex stands at the intersection of elite traditional finance and decentralized blockchain technology. Our team of quantitative analysts, blockchain developers, and cybersecurity veterans have crafted an all-in-one financial hub built to maximize investor ROI safely.

💼 PLATFORM HIGHLIGHTS:
• Proven 25-Day Model: Structured capital growth with up to 10% daily yield payouts
• Enterprise Infrastructure: High-availability servers with 99.99% operational uptime
• Full Financial Control: Instant deposit crediting, live stats, and 24/7 withdrawals
• Global Access: Open to investors worldwide with zero geo-fencing barriers

Join the future of wealth management today. Allocate your funds into high-efficiency liquidity vaults and watch your capital grow daily with complete peace of mind.

Tap "🚀 OPEN AUREX" below to open your account and claim your welcome dividend allocation!`
];

async function registerWebhook(botToken: string, host?: string, protocol = "https") {
  const targetHost = host && !host.includes("localhost") ? host : VERCEL_DOMAIN;
  const webhookUrl = targetHost.startsWith("http")
    ? `${targetHost}/api/telegram/webhook`
    : `${protocol}://${targetHost}/api/telegram/webhook`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
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

async function sendWelcomeMessage(
  botToken: string,
  chatId: number | string,
  reqHost?: string,
  reqProtocol?: string
) {
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

  // Randomly select one of the 15 banners
  const bannerNum = Math.floor(Math.random() * 15) + 1;
  const bannerImageUrl = `${baseUrl}/banners/banner${bannerNum}.jpg`;

  // Randomly select one of the 15 welcome messages
  const msgIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
  const captionText = WELCOME_MESSAGES[msgIndex];

  console.log(`[Telegram Bot] Sending Banner #${bannerNum} and Message #${msgIndex + 1} to chat ${chatId}`);

  let photoSent = false;

  // 1. Send banner FIRST using sendPhoto()
  try {
    const photoRes = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: bannerImageUrl,
        caption: `⚡ AUREX - High-Yield Investment Platform (Banner #${bannerNum})`,
      }),
    });
    const photoData = await photoRes.json();
    console.log(`[Telegram Bot] sendPhoto result:`, photoData);
    if (photoData?.ok) photoSent = true;
  } catch (err) {
    console.error("[Telegram Bot] sendPhoto exception:", err);
  }

  // 2. Send welcome text message + 🚀 OPEN AUREX button
  try {
    const msgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: captionText,
        reply_markup: inlineKeyboard,
      }),
    });
    const msgData = await msgRes.json();
    console.log(`[Telegram Bot] sendMessage result:`, msgData);
    return { ok: true, photoSent, messageResult: msgData };
  } catch (err) {
    console.error("[Telegram Bot] sendMessage exception:", err);
    return { ok: photoSent, error: "Failed to send message" };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const host = (req.headers?.host || VERCEL_DOMAIN) as string;
    const protocol = (req.headers?.["x-forwarded-proto"] as string) || "https";

    if (req.method === "GET") {
      const token = getBotToken();
      let regResult = null;

      if (token) {
        try {
          regResult = await registerWebhook(token, host, protocol);
        } catch (e: any) {
          regResult = { ok: false, error: e?.message || String(e) };
        }
      }

      return res.status(200).json({
        status: "ok",
        service: "Aurex Telegram Bot Webhook Endpoint (Vercel Serverless)",
        webhookUrl: `${protocol}://${host}/api/telegram/webhook`,
        botConfigured: Boolean(token),
        registration: regResult,
        timestamp: new Date().toISOString(),
      });
    }

    if (req.method === "POST") {
      let update = req.body;
      if (typeof update === "string") {
        try {
          update = JSON.parse(update);
        } catch {
          // ignore parse error
        }
      }

      const message = update?.message;
      const chatId = message?.chat?.id;
      const text = message?.text || "";

      if (chatId && text.startsWith("/start")) {
        const token = getBotToken();
        const sendResult = await sendWelcomeMessage(token, chatId, host, protocol);

        return res.status(200).json({
          status: "ok",
          event: "sent_start_welcome_message",
          chatId,
          result: sendResult,
        });
      }

      return res.status(200).json({
        status: "ignored",
        message: "Update received, but text is not a /start command",
      });
    }

    return res.status(200).json({ status: "ok" });
  } catch (error: any) {
    console.error("Fatal error in Vercel Telegram webhook handler:", error);
    return res.status(200).json({
      status: "error",
      message: error?.message || "Internal handler error",
    });
  }
}
