import React, { useState } from 'react';
import { AppSettings } from '../types';
import { TelegramService } from '../services/telegram';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ShieldCheck, 
  Users, 
  Clock, 
  Send, 
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface FAQPageProps {
  settings: AppSettings;
  onBack?: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface FAQItem {
  id: string;
  category: 'invest' | 'deposit' | 'withdraw' | 'referral' | 'security';
  question: string;
  answer: string;
  highlights?: string[];
  actionLabel?: string;
  actionTab?: string;
}

export const FAQPage: React.FC<FAQPageProps> = ({ settings, onBack, onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const faqItems: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'invest',
      question: 'How do the Copy Trading Lockup Plans work?',
      answer: 'Our Pro Copy Trading feature allows you to mirror professional traders with guaranteed lockup tiers ranging from 1 day up to 30 days. You choose a master trader, select a duration plan, and allocate your desired USDT amount.',
      highlights: [
        '1 Day Plan: Earn ~4% - 12% ROI (Minimum $100 USDT)',
        '3 - 7 Days Plans: Earn ~10% - 38% ROI',
        '14 - 30 Days Plans: Earn up to +130% ROI',
        'Principal + profits are returned to your balance upon plan maturity'
      ],
      actionLabel: 'Explore Copy Traders',
      actionTab: 'copy'
    },
    {
      id: 'faq-2',
      category: 'invest',
      question: 'When can I claim my profits or close my position?',
      answer: 'Daily yields accrue automatically every 24 hours. You can claim accumulated daily profits to your wallet balance anytime. Once the lockup period expires, your full principal plus total return becomes fully available for withdrawal or reinvestment.',
      highlights: [
        'Daily profits calculated automatically in real-time',
        'Manual claim button available in your active positions dashboard',
        'Early position termination releases accrued profit immediately'
      ]
    },
    {
      id: 'faq-3',
      category: 'deposit',
      question: 'Which deposit methods and networks are supported?',
      answer: 'We support instant crypto deposits via popular blockchain networks as well as local payment methods. All deposits are verified and processed securely.',
      highlights: [
        'USDT (TRC-20) — Fast & low network fees',
        'USDT (BEP-20) — Binance Smart Chain instant deposits',
        'TON (Toncoin) & Telegram Wallet payments',
        'Bank Cards & Local Cash vouchers (via admin review)'
      ],
      actionLabel: 'Make a Deposit',
      actionTab: 'deposit'
    },
    {
      id: 'faq-4',
      category: 'deposit',
      question: 'How long does a deposit take to reflect in my balance?',
      answer: 'Automated USDT and TON crypto deposits reflect in your account within 1 to 5 network confirmations (typically 1–3 minutes). Manual bank transfer or gift voucher deposits are reviewed by our financial team within 5 to 15 minutes.',
      highlights: [
        'Crypto TRC20/BEP20: 1 - 3 minutes average',
        'Always double-check the exact wallet address & TXID before submitting'
      ]
    },
    {
      id: 'faq-5',
      category: 'withdraw',
      question: 'What is the minimum withdrawal amount and processing time?',
      answer: 'You can withdraw funds from your available wallet balance to any supported external crypto wallet address at any time.',
      highlights: [
        `Minimum Withdrawal: $${settings.minWithdrawal.toFixed(2)} USDT`,
        'Processing Time: 15 minutes to 2 hours (automated anti-fraud check)',
        `Withdrawal Fee: ${settings.withdrawalFeePercent}% network processing fee`,
        'Supported payout methods: TRC20, BEP20, TON Wallet'
      ],
      actionLabel: 'Go to Withdrawals',
      actionTab: 'withdraw'
    },
    {
      id: 'faq-6',
      category: 'withdraw',
      question: 'Why is my withdrawal pending or delayed?',
      answer: 'Withdrawals are monitored by our automated security system to ensure account safety. If your transaction exceeds 2 hours, it may be undergoing manual compliance review for unusual IP activity or pending blockchain congestion.',
      highlights: [
        'Verify your receiving wallet address matches the selected network',
        'Contact Telegram Support if status remains pending for over 4 hours'
      ]
    },
    {
      id: 'faq-7',
      category: 'referral',
      question: 'How does the Referral & Milestone Commission system work?',
      answer: 'You earn high commission payouts when your invited friends join and deposit. Additionally, you unlock cash bonus milestones as your active depositor network grows.',
      highlights: [
        '10% direct commission on all deposits made by your invited friends',
        'Cash bonus milestones up to $1,000 for reaching depositor targets',
        'Referrals must complete at least $15+ USDT initial deposit to count as active'
      ],
      actionLabel: 'View Referral Program',
      actionTab: 'referral'
    },
    {
      id: 'faq-8',
      category: 'security',
      question: 'Is my account and invested capital safe?',
      answer: 'Yes. All user accounts are linked directly to unique Telegram ID authentication credentials with encrypted server-side transaction logging and multi-sig cold storage protection.',
      highlights: [
        'Server-authoritative balance protection against client-side tampering',
        '24/7 dedicated Telegram Support agent assistance',
        'Automated real-time ledger auditing for all deposits and payouts'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'invest', label: 'Invest & Copying', icon: TrendingUp },
    { id: 'deposit', label: 'Deposits', icon: Wallet },
    { id: 'withdraw', label: 'Withdrawals', icon: ArrowUpRight },
    { id: 'referral', label: 'Referrals', icon: Users },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  const filteredItems = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSupportClick = () => {
    TelegramService.hapticImpact('medium');
    const supportUrl = `https://t.me/${settings.supportUsername.replace('@', '')}`;
    TelegramService.openUrl(supportUrl);
  };

  const toggleAccordion = (id: string) => {
    TelegramService.hapticImpact('light');
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#161B22] via-[#0D1117] to-[#161B22] border border-[#7CFF4F]/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-[#0D1117] border border-[#30363D] text-[#8B949E] hover:text-white transition-all mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="p-2 rounded-xl bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">Help & FAQ Center</h1>
              <p className="text-[11px] text-[#8B949E]">Instant answers to common questions</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#7CFF4F]/10 text-[#7CFF4F] border border-[#7CFF4F]/30">
            24/7 Knowledge Base
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mt-2">
          <Search className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, deposits, payouts..."
            className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#7CFF4F] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8B949E] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B949E] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  TelegramService.hapticImpact('light');
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#7CFF4F] text-[#0D1117] shadow-md shadow-[#7CFF4F]/20'
                    : 'bg-[#0D1117] text-[#8B949E] hover:text-white border border-[#30363D]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-[#161B22] border border-[#21262D] rounded-2xl p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-[#8B949E] mx-auto" />
            <p className="text-sm font-bold text-white">No matching questions found</p>
            <p className="text-xs text-[#8B949E]">Try searching with a different term or reach out to support directly.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`bg-[#161B22] border transition-all rounded-2xl overflow-hidden ${
                  isExpanded ? 'border-[#7CFF4F]/50 shadow-lg shadow-[#7CFF4F]/5' : 'border-[#21262D] hover:border-[#30363D]'
                }`}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-white"
                >
                  <span className="flex-1">{item.question}</span>
                  <div className={`p-1.5 rounded-lg transition-transform ${isExpanded ? 'bg-[#7CFF4F]/10 text-[#7CFF4F]' : 'bg-[#0D1117] text-[#8B949E]'}`}>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Answer Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#21262D]/60 space-y-3 text-xs text-[#8B949E]">
                    <p className="leading-relaxed text-slate-200">{item.answer}</p>

                    {item.highlights && item.highlights.length > 0 && (
                      <div className="bg-[#0D1117] border border-[#21262D] rounded-xl p-3 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7CFF4F] flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Key Details
                        </p>
                        {item.highlights.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-[#F0F6FC]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#7CFF4F] shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.actionLabel && item.actionTab && onNavigateTab && (
                      <button
                        onClick={() => {
                          TelegramService.hapticImpact('medium');
                          onNavigateTab(item.actionTab!);
                        }}
                        className="mt-1 px-3.5 py-2 rounded-xl bg-[#7CFF4F]/10 hover:bg-[#7CFF4F]/20 border border-[#7CFF4F]/30 text-[#7CFF4F] font-extrabold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Support Action Footer Card */}
      <div className="bg-gradient-to-r from-[#161B22] to-[#1C2128] border border-[#30363D] rounded-3xl p-5 text-center space-y-3 shadow-lg">
        <div className="w-10 h-10 rounded-2xl bg-[#7CFF4F]/10 border border-[#7CFF4F]/30 text-[#7CFF4F] flex items-center justify-center mx-auto">
          <Send className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white">Still have questions?</h3>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Our 24/7 support team on Telegram is ready to assist you.
          </p>
        </div>
        <button
          onClick={handleSupportClick}
          className="w-full py-3 rounded-xl bg-[#7CFF4F] hover:bg-[#6be640] text-[#0D1117] font-black text-xs transition-all shadow-lg shadow-[#7CFF4F]/20 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4 fill-current" />
          <span>Contact Official Telegram Support ({settings.supportUsername})</span>
        </button>
      </div>
    </div>
  );
};
