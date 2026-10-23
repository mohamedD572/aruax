import { LanguageCode } from '../types';

export interface Translations {
  appName: string;
  home: string;
  invest: string;
  copyTrading: string;
  wallet: string;
  tasks: string;
  referral: string;
  profile: string;
  deposit: string;
  withdraw: string;
  history: string;
  balance: string;
  dailyYield: string;
  activeInvestments: string;
  unclaimedProfit: string;
  claimProfit: string;
  referralEarnings: string;
  copyNow: string;
  minAmount: string;
  dailyPercent: string;
  winRate: string;
  copiers: string;
  activePositions: string;
  stopCopying: string;
  depositorsOnly: string;
  milestones: string;
  claimReward: string;
  claimed: string;
  dailyCheckin: string;
  convertCoins: string;
  selectLanguage: string;
  officialTasks: string;
  telegramChannel: string;
  facebookPage: string;
  youtubeChannel: string;
  twitterPage: string;
  startTask: string;
  completed: string;
}

export const LANGUAGES: { code: LanguageCode; name: string; nativeName: string; flag: string }[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  ar: {
    appName: 'منصة Aurex الرقمية',
    home: 'الرئيسية',
    invest: 'تعدين السحاب',
    copyTrading: 'نسخ التداول',
    wallet: 'المحفظة',
    tasks: 'المهام',
    referral: 'الإحالات',
    profile: 'الملف الشخصي',
    deposit: 'إيداع',
    withdraw: 'سحب',
    history: 'السجل',
    balance: 'رصيد المحفظة',
    dailyYield: 'العائد اليومي',
    activeInvestments: 'أجهزة التعدين النشطة',
    unclaimedProfit: 'أرباح غير مستلمة',
    claimProfit: 'حصاد الأرباح',
    referralEarnings: 'أرباح الإحالات',
    copyNow: 'نسخ المتداول',
    minAmount: 'الحد الأدنى للمبلغ',
    dailyPercent: 'نسبة العائد اليومي',
    winRate: 'نسبة النجاح',
    copiers: 'المتابعون',
    activePositions: 'الصفقات الجارية',
    stopCopying: 'إغلاق الصفقة',
    depositorsOnly: 'المودعون فقط',
    milestones: 'مكافآت الإحالات المودعة',
    claimReward: 'استلام المكافأة',
    claimed: 'تم الاستلام',
    dailyCheckin: 'تسجيل الدخول اليومي',
    convertCoins: 'تحويل عملات Aurex',
    selectLanguage: 'اختر اللغة',
    officialTasks: 'المهام الرسمية',
    telegramChannel: 'قناة تيليجرام الرسمية',
    facebookPage: 'صفحة فيسبوك الرسمية',
    youtubeChannel: 'قناة يوتيوب الرسمية',
    twitterPage: 'صفحة تويتر (X)',
    startTask: 'بدء المهمة',
    completed: 'مكتملة',
  },
  en: {
    appName: 'Aurex Platform',
    home: 'Home',
    invest: 'Cloud Mining',
    copyTrading: 'Copy Trade',
    wallet: 'Wallet',
    tasks: 'Tasks',
    referral: 'Referrals',
    profile: 'Profile',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    history: 'History',
    balance: 'Available Balance',
    dailyYield: 'Daily Yield',
    activeInvestments: 'Active Mining Rigs',
    unclaimedProfit: 'Unclaimed Mining Profit',
    claimProfit: 'Harvest Profits',
    referralEarnings: 'Referral Earnings',
    copyNow: 'Copy Trader',
    minAmount: 'Min Copy Amount',
    dailyPercent: 'Daily Yield Rate',
    winRate: 'Win Rate',
    copiers: 'Copiers',
    activePositions: 'Active Copy Trades',
    stopCopying: 'Close Position',
    depositorsOnly: 'Depositing Friends Only',
    milestones: 'Deposit Referral Milestones',
    claimReward: 'Claim Reward',
    claimed: 'Claimed',
    dailyCheckin: 'Daily Check-in',
    convertCoins: 'Convert Aurex Coins',
    selectLanguage: 'Select Language',
    officialTasks: 'Official Social Tasks',
    telegramChannel: 'Official Telegram Channel',
    facebookPage: 'Official Facebook Page',
    youtubeChannel: 'Official YouTube Channel',
    twitterPage: 'Official Twitter (X) Page',
    startTask: 'Start Task',
    completed: 'Completed',
  },
  fr: {
    appName: 'Plateforme Aurex',
    home: 'Accueil',
    invest: 'Minage Cloud',
    copyTrading: 'Copy Trading',
    wallet: 'Portefeuille',
    tasks: 'Missions',
    referral: 'Parrainage',
    profile: 'Profil',
    deposit: 'Dépôt',
    withdraw: 'Retrait',
    history: 'Historique',
    balance: 'Solde Disponible',
    dailyYield: 'Rendement Quotidien',
    activeInvestments: 'Rigs de Minage Actifs',
    unclaimedProfit: 'Profits Non Réclamés',
    claimProfit: 'Récolter les Profits',
    referralEarnings: 'Gains de Parrainage',
    copyNow: 'Copier Trader',
    minAmount: 'Montant Minimum',
    dailyPercent: 'Taux Journalier',
    winRate: 'Taux de Victoire',
    copiers: 'Copieurs',
    activePositions: 'Positions Actives',
    stopCopying: 'Fermer la Position',
    depositorsOnly: 'Amis Déposants Uniquement',
    milestones: 'Paliers de Parrainage',
    claimReward: 'Réclamer Récompense',
    claimed: 'Réclamé',
    dailyCheckin: 'Connexion Quotidienne',
    convertCoins: 'Convertir Aurex Coins',
    selectLanguage: 'Choisir la Langue',
    officialTasks: 'Tâches Officielles',
    telegramChannel: 'Canal Telegram Officiel',
    facebookPage: 'Page Facebook Officielle',
    youtubeChannel: 'Chaîne YouTube Officielle',
    twitterPage: 'Page Twitter (X) Officielle',
    startTask: 'Démarrer',
    completed: 'Terminé',
  },
  es: {
    appName: 'Plataforma Aurex',
    home: 'Inicio',
    invest: 'Minería en la Nube',
    copyTrading: 'Copy Trade',
    wallet: 'Billetera',
    tasks: 'Tareas',
    referral: 'Referidos',
    profile: 'Perfil',
    deposit: 'Depositar',
    withdraw: 'Retirar',
    history: 'Historial',
    balance: 'Saldo Disponible',
    dailyYield: 'Rendimiento Diario',
    activeInvestments: 'Rigs Activos',
    unclaimedProfit: 'Ganancia Sin Reclamar',
    claimProfit: 'Cosechar Ganancias',
    referralEarnings: 'Ganancias por Referidos',
    copyNow: 'Copiar Trader',
    minAmount: 'Monto Mínimo',
    dailyPercent: 'Tasa Diaria',
    winRate: 'Tasa de Victoria',
    copiers: 'Copiadores',
    activePositions: 'Operaciones Activas',
    stopCopying: 'Cerrar Posición',
    depositorsOnly: 'Solo Amigos Depositantes',
    milestones: 'Metas de Referidos Depositantes',
    claimReward: 'Reclamar Recompensa',
    claimed: 'Reclamado',
    dailyCheckin: 'Registro Diario',
    convertCoins: 'Convertir Monedas Aurex',
    selectLanguage: 'Seleccionar Idioma',
    officialTasks: 'Tareas Sociales Oficiales',
    telegramChannel: 'Canal Oficial de Telegram',
    facebookPage: 'Página Oficial de Facebook',
    youtubeChannel: 'Canal Oficial de YouTube',
    twitterPage: 'Página Oficial de Twitter (X)',
    startTask: 'Iniciar Tarea',
    completed: 'Completado',
  },
  tr: {
    appName: 'Aurex Platformu',
    home: 'Ana Sayfa',
    invest: 'Bulut Madenciliği',
    copyTrading: 'Kopya Ticaret',
    wallet: 'Cüzdan',
    tasks: 'Görevler',
    referral: 'Referanslar',
    profile: 'Profil',
    deposit: 'Para Yatır',
    withdraw: 'Para Çek',
    history: 'İşlem Geçmişi',
    balance: 'Kullanılabilir Bakiye',
    dailyYield: 'Günlük Getiri',
    activeInvestments: 'Aktif Madencilik Cihazları',
    unclaimedProfit: 'Talep Edilmemiş Kar',
    claimProfit: 'Karı Hasat Et',
    referralEarnings: 'Referans Geliri',
    copyNow: 'Yatırımcıyı Kopyala',
    minAmount: 'Min. Kopyalama Tutarı',
    dailyPercent: 'Günlük Oran',
    winRate: 'Kazanma Oranı',
    copiers: 'Kopyalayanlar',
    activePositions: 'Aktif Pozisyonlar',
    stopCopying: 'Pozisyonu Kapat',
    depositorsOnly: 'Yalnızca Yatırım Yapan Arkadaşlar',
    milestones: 'Yatırımcı Referans Hedefleri',
    claimReward: 'Ödülü Al',
    claimed: 'Alındı',
    dailyCheckin: 'Günlük Giriş',
    convertCoins: 'Aurex Coin Çevir',
    selectLanguage: 'Dil Seçin',
    officialTasks: 'Resmi Sosyal Görevler',
    telegramChannel: 'Resmi Telegram Kanalı',
    facebookPage: 'Resmi Facebook Sayfası',
    youtubeChannel: 'Resmi YouTube Kanalı',
    twitterPage: 'Resmi Twitter (X) Sayfası',
    startTask: 'Başlat',
    completed: 'Tamamlandı',
  },
  ru: {
    appName: 'Платформа Aurex',
    home: 'Главная',
    invest: 'Облачный майнинг',
    copyTrading: 'Копитрейдинг',
    wallet: 'Кошелек',
    tasks: 'Задания',
    referral: 'Рефералы',
    profile: 'Профиль',
    deposit: 'Депозит',
    withdraw: 'Вывод',
    history: 'История',
    balance: 'Доступный баланс',
    dailyYield: 'Ежедневный доход',
    activeInvestments: 'Активные риги майнинга',
    unclaimedProfit: 'Несобранная прибыль',
    claimProfit: 'Собрать прибыль',
    referralEarnings: 'Реферальный доход',
    copyNow: 'Копировать трейдера',
    minAmount: 'Мин. сумма копирования',
    dailyPercent: 'Ежедневный %',
    winRate: 'Процент побед',
    copiers: 'Копирующие',
    activePositions: 'Активные сделки',
    stopCopying: 'Закрыть позицию',
    depositorsOnly: 'Только внесшие депозит',
    milestones: 'Награды за депозиты рефералов',
    claimReward: 'Забрать награду',
    claimed: 'Получено',
    dailyCheckin: 'Ежедневный чек-ин',
    convertCoins: 'Конвертировать Aurex',
    selectLanguage: 'Выберите язык',
    officialTasks: 'Официальные задания',
    telegramChannel: 'Официальный Telegram канал',
    facebookPage: 'Официальная страница Facebook',
    youtubeChannel: 'Официальный YouTube канал',
    twitterPage: 'Официальный Twitter (X)',
    startTask: 'Начать',
    completed: 'Выполнено',
  },
};

export const getTranslation = (langCode: LanguageCode): Translations => {
  return TRANSLATIONS[langCode] || TRANSLATIONS.ar || TRANSLATIONS.en;
};

export const applyLanguageDirection = (langCode: LanguageCode) => {
  const isRtl = langCode === 'ar';
  document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', langCode);
};
