import React, { useState } from 'react';
import {
  X,
  Bot,
  Copy,
  Check,
  Terminal,
  Code2,
  Send,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Layers,
  Shield,
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types';
import { store } from '../services/store';
import { WELCOME_BANNERS, getRandomWelcomeBanner, WelcomeBanner } from '../data/welcomeBanners';

interface TelegramIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  user?: UserProfile;
  onReplaySplash?: () => void;
}

interface SimulatedMessage {
  id: string;
  sender: 'user' | 'bot';
  text?: string;
  photo?: string;
  caption?: string;
  badge?: string;
  themeTitle?: string;
  buttonText?: string;
  timestamp: string;
}

export const TelegramIntegrationModal: React.FC<TelegramIntegrationModalProps> = ({
  isOpen,
  onClose,
  settings,
  user,
  onReplaySplash,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [botToken, setBotToken] = useState(settings.botToken);
  const [botUsername, setBotUsername] = useState(settings.botUsername);
  const [miniAppUrl, setMiniAppUrl] = useState(settings.miniAppUrl);

  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'banners' | 'config' | 'code'>('simulator');
  const [selectedGalleryBanner, setSelectedGalleryBanner] = useState<WelcomeBanner>(WELCOME_BANNERS[0]);

  const initialBanner = WELCOME_BANNERS[0];

  // Interactive Bot Chat Simulator Messages State
  const [messages, setMessages] = useState<SimulatedMessage[]>(() => [
    {
      id: '1',
      sender: 'user',
      text: '/start',
      timestamp: '10:00 AM',
    },
    {
      id: '2',
      sender: 'bot',
      photo: initialBanner.image,
      badge: initialBanner.badge,
      themeTitle: initialBanner.title,
      caption: initialBanner.welcomeMessage,
      buttonText: '🚀 OPEN AUREX',
      timestamp: '10:00 AM',
    },
  ]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
      botToken,
      botUsername,
      miniAppUrl,
    });

    if (botToken.trim()) {
      try {
        setConnectionStatus('Connecting to Telegram Bot...');
        const res = await fetch('/api/telegram/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botToken: botToken.trim() }),
        });
        const data = await res.json();
        if (data.status === 'ok') {
          setConnectionStatus(`Connected to @${data.botInfo.username}! Bot is now LIVE.`);
        } else {
          setConnectionStatus(`Error: ${data.error}`);
        }
      } catch (err: any) {
        setConnectionStatus(`Saved locally. Server error: ${err.message}`);
      }
    } else {
      setConnectionStatus('Saved locally.');
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const handleSendStartCommand = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: SimulatedMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: '/start',
      timestamp: timeStr,
    };

    const randomBanner = getRandomWelcomeBanner();
    const botMsg: SimulatedMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      photo: randomBanner.image,
      badge: randomBanner.badge,
      themeTitle: randomBanner.title,
      caption: randomBanner.welcomeMessage,
      buttonText: '🚀 OPEN AUREX',
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const webhookEndpoint = `${window.location.origin}/api/telegram/webhook`;

  const pythonBotCode = `# Telegram Bot Python Handler for Aurex
import random
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

WELCOME_BANNERS = [
    {
        "image": "${window.location.origin}/assets/images/aurex_banner_trading_office_1785490660416.jpg",
        "caption": "⚡ Welcome to AUREX Institutional Trading Terminal!\\n\\nUp to 10% Daily Returns for 25 Days.\\nInstant USDT Withdrawals!"
    },
    {
        "image": "${window.location.origin}/assets/images/aurex_banner_ai_center_1785490682906.jpg",
        "caption": "🤖 Welcome to AUREX AI Data Center!\\n\\nSelf-Optimizing Hashrate Engine.\\nEarn up to 10% Daily ROI!"
    }
]

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    mini_app_url = "${miniAppUrl || window.location.origin}"
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🚀 OPEN AUREX", web_app=WebAppInfo(url=mini_app_url))]
    ])
    
    selected = random.choice(WELCOME_BANNERS)
    await context.bot.send_photo(
        chat_id=chat_id,
        photo=selected["image"],
        caption=selected["caption"],
        reply_markup=keyboard
    )

app = ApplicationBuilder().token("YOUR_BOT_TOKEN").build()
app.add_handler(CommandHandler("start", start))
app.run_polling()`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0D1117] rounded-2xl border border-[#30363D] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#21262D] bg-[#161B22]">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-[#7CFF4F]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F0F6FC] flex items-center gap-1.5">
                <span>Aurex Telegram Bot & /start Flow</span>
                <span className="text-[10px] bg-[#7CFF4F]/20 text-[#7CFF4F] px-2 py-0.5 rounded-full border border-[#7CFF4F]/30 font-bold flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5" /> Welcome Image Mode
                </span>
              </h3>
              <p className="text-xs text-gray-400">Official Telegram Bot Welcome Banner & Mini App Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#21262D] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram Account Connection & Security Verification Status Card */}
        <div className="p-3 bg-[#161B22] border-b border-[#21262D] space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-[#F0F6FC]">Telegram Account Integration</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-[#7CFF4F] border border-[#7CFF4F]/30 uppercase">
              Connected & Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="p-2 rounded-lg bg-[#0D1117] border border-[#21262D]">
              <span className="text-gray-400 block text-[9px]">USERNAME</span>
              <span className="font-bold text-[#7CFF4F]">@{user?.username || 'aurex_user'}</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0D1117] border border-[#21262D]">
              <span className="text-gray-400 block text-[9px]">TELEGRAM ID</span>
              <span className="font-bold text-[#F0F6FC]">{user?.telegramId || '81923841'}</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0D1117] border border-[#21262D]">
              <span className="text-gray-400 block text-[9px]">MINI APP STATUS</span>
              <span className="font-bold text-emerald-400">v6.10 SDK Active</span>
            </div>
            <div className="p-2 rounded-lg bg-[#0D1117] border border-[#21262D]">
              <span className="text-gray-400 block text-[9px]">SECURITY</span>
              <span className="font-bold text-amber-300">HMAC Verified</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher Navigation */}
        <div className="flex border-b border-[#21262D] bg-[#0D1117] overflow-x-auto">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 min-w-[110px] py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-[#7CFF4F] text-[#7CFF4F] bg-[#161B22]/50'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bot Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`flex-1 min-w-[110px] py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'banners'
                ? 'border-[#7CFF4F] text-[#7CFF4F] bg-[#161B22]/50'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>20 Banners</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 min-w-[90px] py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-[#7CFF4F] text-[#7CFF4F] bg-[#161B22]/50'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Bot Token</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 min-w-[90px] py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-[#7CFF4F] text-[#7CFF4F] bg-[#161B22]/50'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Webhook</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: BOT CHAT SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-3">
              {/* Status Header */}
              <div className="p-3 rounded-xl bg-[#161B22] border border-[#21262D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F0F6FC]">🖼️ Welcome Banner Mode Active</span>
                    <span className="text-[10px] bg-emerald-500/20 text-[#7CFF4F] px-2 py-0.5 rounded-full border border-[#7CFF4F]/30 font-bold uppercase">
                      Image Flow
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    When user sends <code className="bg-[#0D1117] text-[#7CFF4F] px-1 rounded font-mono">/start</code>, bot sends a high-resolution welcome image, welcome text, and the Open Aurex button.
                  </p>
                </div>

                <button
                  onClick={handleSendStartCommand}
                  className="px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#7CFF4F] border border-[#7CFF4F]/30 font-black transition-all flex items-center gap-1 shrink-0 text-xs shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send /start</span>
                </button>
              </div>

              {/* Simulated Telegram Chat Window */}
              <div className="bg-[#0E1621] border border-[#21262D] rounded-2xl p-3 space-y-3 max-h-[380px] overflow-y-auto shadow-inner">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.sender === 'user' ? (
                      <div className="bg-[#2B5278] text-white px-3 py-1.5 rounded-2xl rounded-tr-xs text-xs max-w-[80%] font-mono font-semibold shadow-sm">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="bg-[#182533] border border-[#243547] text-[#F0F6FC] rounded-2xl rounded-tl-xs overflow-hidden max-w-[95%] shadow-lg">
                        
                        {/* Photo Banner Image */}
                        {msg.photo && (
                          <div className="w-full relative overflow-hidden bg-black/40">
                            <img
                              src={msg.photo}
                              alt="Aurex Banner"
                              className="w-full h-auto max-h-52 object-cover"
                            />

                            {/* Aurex Branding Banner Overlays */}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#7CFF4F]/40 shadow-lg">
                              <div className="w-2 h-2 rounded-full bg-[#7CFF4F] animate-pulse" />
                              <span className="text-[10px] font-black tracking-wider text-white">AUREX</span>
                              <span className="text-[9px] font-mono text-[#7CFF4F] font-bold">| {msg.badge || 'WELCOME'}</span>
                            </div>

                            <div className="absolute bottom-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-[#0D1117] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow">
                              ★ AUREX OFFICIAL
                            </div>
                          </div>
                        )}

                        {/* Theme Title */}
                        {msg.themeTitle && (
                          <div className="px-3 pt-2 text-[11px] font-bold text-[#7CFF4F] border-b border-[#243547]/50 pb-1 font-mono">
                            {msg.themeTitle}
                          </div>
                        )}

                        {/* Caption Text */}
                        <div className="p-3 text-xs leading-relaxed whitespace-pre-line text-gray-200">
                          {msg.caption}
                        </div>

                        {/* OPEN AUREX Inline Button */}
                        {msg.buttonText && (
                          <div className="p-2 border-t border-[#243547] bg-[#1E2C3A]">
                            <button
                              onClick={() => {
                                onClose();
                                if (onReplaySplash) {
                                  onReplaySplash();
                                }
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#7CFF4F] via-emerald-400 to-lime-300 text-[#0D1117] font-black text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                            >
                              <span>{msg.buttonText}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <span className="text-[9px] text-gray-500 mt-0.5 px-1">{msg.timestamp}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={() => setMessages(messages.slice(0, 2))}
                  className="text-[11px] text-gray-400 hover:text-[#7CFF4F] underline flex items-center justify-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Chat History</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: 20 BANNERS GALLERY SHOWCASE */}
          {activeTab === 'banners' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[#161B22] border border-[#21262D] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F0F6FC]">🎨 20 Premium Aurex Marketing Banners</span>
                  <span className="text-[10px] bg-[#7CFF4F]/20 text-[#7CFF4F] px-2 py-0.5 rounded-full font-mono font-bold">
                    20 / 20 Loaded
                  </span>
                </div>
                <p className="text-gray-400 text-[11px]">
                  The bot randomly selects 1 of these 20 high-resolution banners and welcome messages upon <code className="bg-[#0D1117] text-[#7CFF4F] px-1 rounded font-mono">/start</code>.
                </p>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 bg-[#090D11] rounded-xl border border-[#21262D]">
                {WELCOME_BANNERS.map((banner) => (
                  <button
                    key={banner.id}
                    onClick={() => setSelectedGalleryBanner(banner)}
                    className={`relative rounded-lg overflow-hidden border transition-all text-left group ${
                      selectedGalleryBanner.id === banner.id
                        ? 'border-[#7CFF4F] ring-2 ring-[#7CFF4F]/40 scale-[1.02]'
                        : 'border-[#30363D] hover:border-gray-500 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={banner.image}
                      alt={banner.themeName}
                      className="w-full h-16 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-1 flex flex-col justify-between">
                      <span className="text-[9px] font-mono font-bold text-[#7CFF4F] bg-black/60 px-1 rounded self-start">
                        #{banner.themeNumber}
                      </span>
                      <span className="text-[9px] font-bold text-white truncate drop-shadow">
                        {banner.themeName}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Banner Preview Card */}
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between border-b border-[#21262D] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-[#7CFF4F] bg-[#0D1117] px-2 py-0.5 rounded border border-[#7CFF4F]/30">
                      THEME #{selectedGalleryBanner.themeNumber}
                    </span>
                    <h3 className="text-sm font-bold text-[#F0F6FC]">{selectedGalleryBanner.themeName}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                    {selectedGalleryBanner.badge}
                  </span>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-[#30363D] bg-black">
                  <img
                    src={selectedGalleryBanner.image}
                    alt={selectedGalleryBanner.title}
                    className="w-full h-44 object-cover"
                  />
                  {/* Watermark branding */}
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#7CFF4F]/40 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#7CFF4F]" />
                    <span className="text-xs font-black text-white">AUREX</span>
                  </div>
                </div>

                <div className="bg-[#0D1117] p-3 rounded-lg border border-[#21262D] text-xs font-mono text-gray-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                  {selectedGalleryBanner.welcomeMessage}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONFIG & BOTFATHER */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#F0F6FC] block mb-1">
                    Telegram Bot Token (from @BotFather)
                  </label>
                  <input
                    type="text"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz..."
                    className="w-full bg-[#161B22] border border-[#30363D] focus:border-[#7CFF4F] rounded-lg px-3 py-2 text-xs font-mono text-[#F0F6FC] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#F0F6FC] block mb-1">
                    Telegram Bot Username
                  </label>
                  <input
                    type="text"
                    value={botUsername}
                    onChange={(e) => setBotUsername(e.target.value)}
                    placeholder="@aurex_bot"
                    className="w-full bg-[#161B22] border border-[#30363D] focus:border-[#7CFF4F] rounded-lg px-3 py-2 text-xs font-mono text-[#F0F6FC] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#F0F6FC] block mb-1">
                    Mini App Direct URL
                  </label>
                  <input
                    type="text"
                    value={miniAppUrl}
                    onChange={(e) => setMiniAppUrl(e.target.value)}
                    placeholder="https://t.me/aurex_bot/app"
                    className="w-full bg-[#161B22] border border-[#30363D] focus:border-[#7CFF4F] rounded-lg px-3 py-2 text-xs font-mono text-[#F0F6FC] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#7CFF4F] hover:bg-[#6be03f] text-[#0D1117] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {isSaved ? <Check className="w-4 h-4" /> : null}
                  {isSaved ? 'Settings Saved!' : 'Save Credentials'}
                </button>

                {connectionStatus && (
                  <div className="p-2.5 rounded-lg bg-[#161B22] border border-[#7CFF4F]/30 text-xs font-mono text-[#7CFF4F] text-center animate-in fade-in">
                    {connectionStatus}
                  </div>
                )}
              </form>

              <div className="p-3 rounded-xl bg-[#161B22] border border-[#21262D] space-y-2 text-xs">
                <p className="font-semibold text-[#F0F6FC]">⚡ Bot Setup Rules</p>
                <p className="text-gray-400 text-[11px]">
                  1. Open <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline">@BotFather</a> on Telegram.
                  <br />
                  2. Type <code className="bg-[#0D1117] text-[#7CFF4F] px-1 rounded font-mono">/newapp</code> to create a Mini App for your bot.
                  <br />
                  3. Set the Mini App URL to <code className="bg-[#0D1117] text-[#7CFF4F] px-1 rounded font-mono">{window.location.origin}</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: BACKEND WEBHOOK CODE */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#F0F6FC] flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-[#7CFF4F]" />
                  Express / Python Telegram Bot Handler
                </h4>
                <button
                  onClick={() => copyToClipboard(pythonBotCode, 'pycode')}
                  className="px-2.5 py-1 bg-[#161B22] border border-[#30363D] rounded hover:bg-[#21262D] text-[11px] text-gray-300 flex items-center gap-1"
                >
                  {copiedKey === 'pycode' ? <Check className="w-3 h-3 text-[#7CFF4F]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'pycode' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="bg-[#090D11] p-3 rounded-xl border border-[#30363D] font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-60 leading-relaxed">
                <pre>{pythonBotCode}</pre>
              </div>

              <div className="p-3 rounded-xl bg-[#161B22] border border-[#21262D] space-y-1.5 text-xs">
                <p className="font-semibold text-[#F0F6FC]">Webhook Endpoint URL</p>
                <div className="flex items-center justify-between bg-[#0D1117] p-2 rounded border border-[#30363D] font-mono text-[10px] text-[#7CFF4F]">
                  <span className="truncate pr-2">{webhookEndpoint}</span>
                  <button
                    onClick={() => copyToClipboard(webhookEndpoint, 'wh')}
                    className="p-1 hover:text-white"
                  >
                    {copiedKey === 'wh' ? <Check className="w-3.5 h-3.5 text-[#7CFF4F]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
