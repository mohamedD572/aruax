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
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
];

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    appName: 'Aurex Mini App',
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
    balance: 'Wallet Balance',
    dailyYield: 'Daily Yield',
    activeInvestments: 'Active Mining Rigs',
    unclaimedProfit: 'Unclaimed Mining Profit',
    claimProfit: 'Claim Mining Profit',
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
  ar: {
    appName: 'Aurex Mini App',
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
    balance: 'Wallet Balance',
    dailyYield: 'Daily Yield',
    activeInvestments: 'Active Mining Rigs',
    unclaimedProfit: 'Unclaimed Mining Profit',
    claimProfit: 'Claim Mining Profit',
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
  es: {
    appName: 'Aurex Mini App',
    home: 'Inicio',
    invest: 'Invertir',
    copyTrading: 'Copy Trade',
    wallet: 'Billetera',
    tasks: 'Tareas',
    referral: 'Referidos',
    profile: 'Perfil',
    deposit: 'Depositar',
    withdraw: 'Retirar',
    history: 'Historial',
    balance: 'Saldo de Billetera',
    dailyYield: 'Rendimiento Diario',
    activeInvestments: 'Planes Activos',
    unclaimedProfit: 'Ganancia Sin Reclamar',
    claimProfit: 'Reclamar Ganancia',
    referralEarnings: 'Ganancias por Referidos',
    copyNow: 'Copiar Trader',
    minAmount: 'Monto Mínimo de Copia',
    dailyPercent: 'Tasa Diaria',
    winRate: 'Tasa de Victoria',
    copiers: 'Copiadores',
    activePositions: 'Copia de Operaciones Activas',
    stopCopying: 'Cerrar Posición',
    depositorsOnly: 'Solo Amigos Depositantes',
    milestones: 'Metas de Referidos Depositantes',
    claimReward: 'Reclamar Recompensa',
    claimed: 'Reclamado',
    dailyCheckin: 'Registro Diario',
    convertCoins: 'Convertir Monedas',
    selectLanguage: 'Seleccionar Idioma',
    officialTasks: 'Tareas Sociales Oficiales',
    telegramChannel: 'Canal Oficial de Telegram',
    facebookPage: 'Página Oficial de Facebook',
    youtubeChannel: 'Canal Oficial de YouTube',
    twitterPage: 'Página Oficial de Twitter (X)',
    startTask: 'Iniciar Tarea',
    completed: 'Completado',
  },
  ru: {
    appName: 'Aurex Mini App',
    home: 'Главная',
    invest: 'Инвестиции',
    copyTrading: 'Копитрейдинг',
    wallet: 'Кошелек',
    tasks: 'Задания',
    referral: 'Рефералы',
    profile: 'Профиль',
    deposit: 'Депозит',
    withdraw: 'Вывод',
    history: 'История',
    balance: 'Баланс кошелька',
    dailyYield: 'Ежедневный доход',
    activeInvestments: 'Активные планы',
    unclaimedProfit: 'Нереализованная прибыль',
    claimProfit: 'Забрать прибыль',
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
    convertCoins: 'Конвертировать монеты',
    selectLanguage: 'Выберите язык',
    officialTasks: 'Официальные задания',
    telegramChannel: 'Официальный Telegram канал',
    facebookPage: 'Официальная страница Facebook',
    youtubeChannel: 'Официальный YouTube канал',
    twitterPage: 'Официальный Twitter (X)',
    startTask: 'Начать',
    completed: 'Выполнено',
  },
  tr: {
    appName: 'Aurex Mini App',
    home: 'Ana Sayfa',
    invest: 'Yatırım',
    copyTrading: 'Kopyala Ticaret',
    wallet: 'Cüzdan',
    tasks: 'Görevler',
    referral: 'Referanslar',
    profile: 'Profil',
    deposit: 'Yatır',
    withdraw: 'Çek',
    history: 'Geçmiş',
    balance: 'Cüzdan Bakiyesi',
    dailyYield: 'Günlük Getiri',
    activeInvestments: 'Aktif Planlar',
    unclaimedProfit: 'Talep Edilmemiş Kar',
    claimProfit: 'Karı Talep Et',
    referralEarnings: 'Referans Kazancı',
    copyNow: 'Tüccarı Kopyala',
    minAmount: 'Min Kopyalama Tutarı',
    dailyPercent: 'Günlük Oran',
    winRate: 'Kazanma Oranı',
    copiers: 'Kopyalayanlar',
    activePositions: 'Aktif Pozisyonlar',
    stopCopying: 'Pozisyonu Kapat',
    depositorsOnly: 'Sadece Para Yatran Referanslar',
    milestones: 'Mevduat Referans Hedefleri',
    claimReward: 'Ödülü Al',
    claimed: 'Alındı',
    dailyCheckin: 'Günlük Giriş',
    convertCoins: 'Coin Çevir',
    selectLanguage: 'Dil Seçin',
    officialTasks: 'Resmi Sosyal Görevler',
    telegramChannel: 'Resmi Telegram Kanalı',
    facebookPage: 'Resmi Facebook Sayfası',
    youtubeChannel: 'Resmi YouTube Kanalı',
    twitterPage: 'Resmi Twitter (X) Sayfası',
    startTask: 'Başlat',
    completed: 'Tamamlandı',
  },
};

export const getTranslation = (langCode: LanguageCode): Translations => {
  return TRANSLATIONS[langCode] || TRANSLATIONS.en;
};
