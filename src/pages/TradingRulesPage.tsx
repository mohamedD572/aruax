import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Shield,
  CheckCircle2,
  Lock,
  Zap,
  Sliders,
  Scale,
  Activity,
  Newspaper,
  Compass,
} from 'lucide-react';
import { strategyService } from '../services/strategyService';
import { languageService } from '../services/languageService';

export const TradingRulesPage: React.FC = () => {
  const [lang, setLang] = useState(languageService.getLanguage());

  useEffect(() => {
    const unsub = languageService.subscribe((newLang) => {
      setLang(newLang);
    });
    return () => unsub();
  }, []);

  const isAr = lang === 'ar';

  const ruleCards = [
    {
      title: isAr ? 'التداول الفوري فقط (Spot Only)' : 'Spot Only Execution',
      value: isAr ? 'مُفعّل' : 'Enabled',
      status: isAr ? 'صارم' : 'STRICT',
      desc: isAr
        ? 'بدون رافعة مالية، بدون خطر تصفية الحساب، وبدون رسوم تمويل الهامش. جميع الصفقات التجريبية تنفذ فقط في أصول السوق الفورية.'
        : 'No futures leverage, no liquidation risk, and no margin interest penalties. All paper trades execute purely in spot assets.',
      icon: Shield,
    },
    {
      title: isAr ? 'صفقة واحدة نشطة في نفس الوقت' : 'One Active Position Concurrency',
      value: isAr ? 'صفقة واحدة كحد أقصى' : '1 Max Trade',
      status: isAr ? 'مُطبق بدقة' : 'ENFORCED',
      desc: isAr
        ? 'لا يقوم الذكاء الاصطناعي بتشتيت رأس المال. تتم إدارة صفقة واحدة فقط عالية الاحتمالية بدقة فائقة في وقت واحد.'
        : 'The AI never over-leverages or splits focus. Exactly one high-conviction trade is managed at any given time.',
      icon: Lock,
    },
    {
      title: isAr ? 'الحد الأقصى للمخاطرة لكل صفقة' : 'Maximum Risk Per Trade',
      value: isAr ? '1.0% (1$ على كل 100$)' : '1.0% ($1.00 on $100)',
      status: isAr ? 'حماية رأس المال' : 'CAPITAL PRESERVATION',
      desc: isAr
        ? 'يتم تحجيم كل صفقة بحيث لا تتجاوز الخسارة المحتملة 1% من قيمة المحفظة مهما كانت تقلبات السوق.'
        : 'Position sizing is strictly capped to risk at most 1% of total portfolio value per setup regardless of market volatility.',
      icon: Scale,
    },
    {
      title: isAr ? 'الحد الأدنى لثقة الذكاء الاصطناعي' : 'Minimum AI Confidence Score',
      value: isAr ? '80 / 100' : '80 / 100',
      status: isAr ? 'حد أدنى' : 'THRESHOLD',
      desc: isAr
        ? 'يتم استبعاد أي فرصة استثمارية تقل نسبة ثقتها عن 80/100 تلقائياً لضمان الدخول في الفرص المؤكدة فقط.'
        : 'Candidates with confidence below 80/100 are automatically rejected. Only Tier-1 high-probability opportunities qualify.',
      icon: Zap,
    },
    {
      title: isAr ? 'نسبة العائد إلى المخاطرة (R:R)' : 'Minimum Risk / Reward Ratio',
      value: isAr ? '1 : 2.0 كحد أدنى' : '1 : 2.0 Minimum',
      status: isAr ? 'تفوق إحصائي' : 'MATHEMATICAL EDGE',
      desc: isAr
        ? 'يجب أن يتيح كل إعداد تداول إمكانية ربح تعادل ضعف مسافة وقف الخسارة على الأقل قبل فتح الصفقة.'
        : 'Every trade setup must demonstrate at least double the profit potential relative to the stop loss distance.',
      icon: Activity,
    },
    {
      title: isAr ? 'وقف خسارة ديناميكي (ATR)' : 'Dynamic Stop Loss',
      value: isAr ? 'مبني على متوسط المدى الحقيقي' : 'ATR-Based Volatility Adjusted',
      status: isAr ? 'نشط' : 'ACTIVE',
      desc: isAr
        ? 'يتم احتساب مستويات وقف الخسارة استناداً لمؤشر ATR وهياكل الدعم الحقيقية بدلاً من نسب مئوية عشوائية.'
        : 'Stop losses are calculated based on Average True Range (ATR) support structures rather than arbitrary fixed percentages.',
      icon: Sliders,
    },
    {
      title: isAr ? 'أهداف جني أرباح فيبوناتشي' : 'Dynamic Multi-Target Take Profit',
      value: isAr ? 'مستويات السيولة ومقاومة فيبوناتشي' : 'Fibonacci Resistance Pivot',
      status: isAr ? 'نشط' : 'ACTIVE',
      desc: isAr
        ? 'يتم تعيين أهداف الأرباح رياضياً عند مستويات تجمع السيولة ومناطق المقاومة الفنية في سجل الأوامر.'
        : 'Targets are mathematically mapped to major liquidity pools and orderbook resistance zones.',
      icon: CheckCircle2,
    },
    {
      title: isAr ? 'وقف الخسارة المتحرك (Trailing Stop)' : 'Trailing Stop Protection',
      value: isAr ? 'تأمين وحجز الأرباح تلقائياً' : 'Enabled (Locks In Profits)',
      status: isAr ? 'نشط' : 'ACTIVE',
      desc: isAr
        ? 'عندما تحقق الصفقة +1.0% ربح، يتحرك وقف الخسارة تلقائياً للأعلى لحماية المكاسب وجعل الصفقة خالية من المخاطر.'
        : 'Once a trade reaches +1.0% profit, the stop loss automatically trails upward to protect gains and ensure risk-free runs.',
      icon: Shield,
    },
    {
      title: isAr ? 'فلتر الأخبار والمؤشرات الاقتصادية' : 'News Sentiment Protection',
      value: isAr ? 'فلتر CPI / FOMC نشط' : 'CPI / FOMC Filter ON',
      status: isAr ? 'مُفعّل' : 'ENABLED',
      desc: isAr
        ? 'يتم إيقاف فتح صفقات جديدة قبل وبعد صدور الأخبار الاقتصادية الكبرى بـ 30 دقيقة لتجنب التقلبات الفجائية.'
        : 'High-impact macroeconomic announcements trigger a trading pause 30 minutes before and after release to avoid fakeout slippage.',
      icon: Newspaper,
    },
    {
      title: isAr ? 'فلتر اتجاه السوق العام (Regime)' : 'Market Regime Filter',
      value: isAr ? 'توافق الاتجاه الصاعد (EMA 50/200)' : 'Bullish & Trend Confluence',
      status: isAr ? 'نشط' : 'ACTIVE',
      desc: isAr
        ? 'يتم الدخول في الصفقات فقط بما يتوافق مع الاتجاه الرئيسي للإطار الزمني الأكبر (4 ساعات واليومي).'
        : 'Trades are only entered in the direction of the dominant higher-timeframe trend (4H & Daily EMA 50/200).',
      icon: Compass,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            {languageService.t('rulesTitle')}
          </h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            {isAr ? 'سياسة الخوارزميات' : 'ALGORITHMIC POLICY'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {languageService.t('rulesSubtitle')}
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {ruleCards.map((rule, idx) => {
          const Icon = rule.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#090D15] border border-slate-800/80 hover:border-emerald-500/30 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-100 font-mono">
                      {rule.title}
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-400 font-mono">
                      {rule.value}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {rule.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans pl-10">
                {rule.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
