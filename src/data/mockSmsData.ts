import { Country, Service, SMSOrder, Transaction, AppNotification } from '../types/sms';

export const MOCK_COUNTRIES: Country[] = [
  {
    id: 'eg',
    name: 'Egypt',
    nameAr: 'مصر',
    code: 'EG',
    flag: '🇪🇬',
    prefix: '+20',
    count: 340,
    startingPrice: 0.12,
    region: 'Middle East',
    isPopular: true,
  },
  {
    id: 'us',
    name: 'United States',
    nameAr: 'الولايات المتحدة',
    code: 'US',
    flag: '🇺🇸',
    prefix: '+1',
    count: 1420,
    startingPrice: 0.15,
    region: 'Americas',
    isPopular: true,
  },
  {
    id: 'gb',
    name: 'United Kingdom',
    nameAr: 'المملكة المتحدة',
    code: 'GB',
    flag: '🇬🇧',
    prefix: '+44',
    count: 890,
    startingPrice: 0.18,
    region: 'Europe',
    isPopular: true,
  },
  {
    id: 'de',
    name: 'Germany',
    nameAr: 'ألمانيا',
    code: 'DE',
    flag: '🇩🇪',
    prefix: '+49',
    count: 450,
    startingPrice: 0.22,
    region: 'Europe',
    isPopular: true,
  },
  {
    id: 'fr',
    name: 'France',
    nameAr: 'فرنسا',
    code: 'FR',
    flag: '🇫🇷',
    prefix: '+33',
    count: 510,
    startingPrice: 0.20,
    region: 'Europe',
    isPopular: true,
  },
  {
    id: 'ca',
    name: 'Canada',
    nameAr: 'كندا',
    code: 'CA',
    flag: '🇨🇦',
    prefix: '+1',
    count: 620,
    startingPrice: 0.16,
    region: 'Americas',
    isPopular: true,
  },
  {
    id: 'nl',
    name: 'Netherlands',
    nameAr: 'هولندا',
    code: 'NL',
    flag: '🇳🇱',
    prefix: '+31',
    count: 380,
    startingPrice: 0.24,
    region: 'Europe',
    isPopular: true,
  },
  {
    id: 'es',
    name: 'Spain',
    nameAr: 'إسبانيا',
    code: 'ES',
    flag: '🇪🇸',
    prefix: '+34',
    count: 410,
    startingPrice: 0.19,
    region: 'Europe',
    isPopular: true,
  },
  {
    id: 'it',
    name: 'Italy',
    nameAr: 'إيطاليا',
    code: 'IT',
    flag: '🇮🇹',
    prefix: '+39',
    count: 390,
    startingPrice: 0.21,
    region: 'Europe',
    isPopular: true,
  },
  {
    id: 'au',
    name: 'Australia',
    nameAr: 'أستراليا',
    code: 'AU',
    flag: '🇦🇺',
    prefix: '+61',
    count: 280,
    startingPrice: 0.25,
    region: 'Oceania',
    isPopular: true,
  },
  {
    id: 'sa',
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    code: 'SA',
    flag: '🇸🇦',
    prefix: '+966',
    count: 310,
    startingPrice: 0.28,
    region: 'Middle East',
  },
  {
    id: 'ae',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات',
    code: 'AE',
    flag: '🇦🇪',
    prefix: '+971',
    count: 260,
    startingPrice: 0.30,
    region: 'Middle East',
  },
  {
    id: 'tr',
    name: 'Turkey',
    nameAr: 'تركيا',
    code: 'TR',
    flag: '🇹🇷',
    prefix: '+90',
    count: 730,
    startingPrice: 0.13,
    region: 'Europe',
  },
  {
    id: 'br',
    name: 'Brazil',
    nameAr: 'البرازيل',
    code: 'BR',
    flag: '🇧🇷',
    prefix: '+55',
    count: 650,
    startingPrice: 0.14,
    region: 'Americas',
  },
  {
    id: 'in',
    name: 'India',
    nameAr: 'الهند',
    code: 'IN',
    flag: '🇮🇳',
    prefix: '+91',
    count: 1100,
    startingPrice: 0.10,
    region: 'Asia',
  },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    iconKey: 'Send',
    startingPrice: 0.15,
    availableCount: 840,
    category: 'Messenger',
    color: '#0088cc',
    description: 'Instant OTP SMS for Telegram accounts',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    iconKey: 'MessageSquare',
    startingPrice: 0.25,
    availableCount: 620,
    category: 'Messenger',
    color: '#25D366',
    description: 'Activation code for WhatsApp & WA Business',
  },
  {
    id: 'google',
    name: 'Google',
    iconKey: 'Globe',
    startingPrice: 0.18,
    availableCount: 950,
    category: 'Popular',
    color: '#4285F4',
    description: 'Gmail, YouTube, and Google Account verification',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    iconKey: 'Camera',
    startingPrice: 0.14,
    availableCount: 530,
    category: 'Social',
    color: '#E4405F',
    description: 'Instagram & Threads phone verification',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    iconKey: 'Play',
    startingPrice: 0.12,
    availableCount: 710,
    category: 'Social',
    color: '#EE1D52',
    description: 'TikTok creator & consumer account signup',
  },
  {
    id: 'discord',
    name: 'Discord',
    iconKey: 'Headphones',
    startingPrice: 0.15,
    availableCount: 460,
    category: 'Social',
    color: '#5865F2',
    description: 'Discord server & phone verification',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    iconKey: 'Users',
    startingPrice: 0.16,
    availableCount: 640,
    category: 'Social',
    color: '#1877F2',
    description: 'Facebook & Meta Account security codes',
  },
  {
    id: 'openai',
    name: 'OpenAI / ChatGPT',
    iconKey: 'Bot',
    startingPrice: 0.30,
    availableCount: 320,
    category: 'Tools',
    color: '#10A37F',
    description: 'ChatGPT, API key & Sora account onboarding',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    iconKey: 'Hash',
    startingPrice: 0.18,
    availableCount: 490,
    category: 'Social',
    color: '#1DA1F2',
    description: 'X / Twitter login and phone confirmation',
  },
  {
    id: 'other',
    name: 'Other Services',
    iconKey: 'Shield',
    startingPrice: 0.10,
    availableCount: 1250,
    category: 'Other',
    color: '#10B981',
    description: 'General virtual SMS for any unsupported app',
  },
];

export function calculatePrice(serviceId: string, countryId: string): number {
  const s = MOCK_SERVICES.find((x) => x.id === serviceId) || MOCK_SERVICES[0];
  const c = MOCK_COUNTRIES.find((x) => x.id === countryId) || MOCK_COUNTRIES[0];
  const base = s.startingPrice;
  const countryMultiplier = c.startingPrice / 0.15;
  const price = Math.round(base * countryMultiplier * 100) / 100;
  return Math.max(0.1, Number(price.toFixed(2)));
}

export function generateRandomPhoneNumber(country: Country): string {
  const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
  if (country.code === 'US' || country.code === 'CA') {
    const area = ['202', '312', '415', '646', '702', '917'][Math.floor(Math.random() * 6)];
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 7);
    return `+1 ${area} ${part1} ${part2}`;
  } else if (country.code === 'GB') {
    return `+44 7911 ${digits.slice(0, 6)}`;
  } else if (country.code === 'EG') {
    const p = ['010', '011', '012', '015'][Math.floor(Math.random() * 4)];
    return `+20 ${p} ${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
  } else if (country.code === 'DE') {
    return `+49 152 ${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
  }
  return `${country.prefix} ${digits.slice(0, 4)} ${digits.slice(4, 8)}`;
}

export function maskPhoneNumber(phone: string): string {
  const parts = phone.split(' ');
  if (parts.length >= 3) {
    return `${parts[0]} ${parts[1]} *** ${parts[parts.length - 1]}`;
  }
  return phone.replace(/(\d{3})\d{4}(\d{2,})/, '$1 **** $2');
}

export function generateMockSms(serviceName: string): { text: string; code: string; sender: string } {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const senders: Record<string, string> = {
    Telegram: 'Telegram',
    WhatsApp: 'WhatsApp',
    Google: 'Google-Verify',
    Instagram: 'Instagram',
    TikTok: 'TikTokCode',
    Discord: 'Discord',
    Facebook: 'Facebook',
    'OpenAI / ChatGPT': 'OpenAI',
    'X (Twitter)': 'X-Auth',
    'Other Services': 'SMS-Verify',
  };

  const sender = senders[serviceName] || 'AuthService';

  const templates = [
    `Your ${serviceName} verification code is: ${code}. Do not share this code with anyone.`,
    `${code} is your ${serviceName} security code. Valid for 10 minutes.`,
    `Use ${code} to verify your ${serviceName} account.`,
    `Your one-time passcode for ${serviceName} is ${code}. Please enter it to complete activation.`,
  ];

  const text = templates[Math.floor(Math.random() * templates.length)];
  return { text, code, sender };
}

export const INITIAL_RECENT_ORDERS: SMSOrder[] = [
  {
    id: 'SV-92481',
    serviceId: 'telegram',
    serviceName: 'Telegram',
    serviceIconKey: 'Send',
    countryId: 'us',
    countryName: 'United States',
    countryFlag: '🇺🇸',
    countryPrefix: '+1',
    phoneNumber: '+1 202 748 9102',
    maskedNumber: '+1 202 *** 9102',
    price: 0.15,
    status: 'COMPLETED',
    createdAt: Date.now() - 1000 * 60 * 18,
    expiresAt: Date.now() + 1000 * 60 * 2,
    sms: {
      id: 'sms-1',
      sender: 'Telegram',
      text: 'Your Telegram activation code is: 582914. Do not share this code.',
      code: '582914',
      receivedAt: Date.now() - 1000 * 60 * 16,
    },
  },
  {
    id: 'SV-88319',
    serviceId: 'whatsapp',
    serviceName: 'WhatsApp',
    serviceIconKey: 'MessageSquare',
    countryId: 'gb',
    countryName: 'United Kingdom',
    countryFlag: '🇬🇧',
    countryPrefix: '+44',
    phoneNumber: '+44 7911 849201',
    maskedNumber: '+44 7911 *** 9201',
    price: 0.22,
    status: 'COMPLETED',
    createdAt: Date.now() - 1000 * 60 * 95,
    expiresAt: Date.now() - 1000 * 60 * 75,
    sms: {
      id: 'sms-2',
      sender: 'WhatsApp',
      text: 'WhatsApp code: 491-038. You can also tap on the link to verify.',
      code: '491038',
      receivedAt: Date.now() - 1000 * 60 * 92,
    },
  },
  {
    id: 'SV-75210',
    serviceId: 'google',
    serviceName: 'Google',
    serviceIconKey: 'Globe',
    countryId: 'eg',
    countryName: 'Egypt',
    countryFlag: '🇪🇬',
    countryPrefix: '+20',
    phoneNumber: '+20 010 4921 8832',
    maskedNumber: '+20 010 *** 8832',
    price: 0.12,
    status: 'COMPLETED',
    createdAt: Date.now() - 1000 * 60 * 240,
    expiresAt: Date.now() - 1000 * 60 * 220,
    sms: {
      id: 'sms-3',
      sender: 'Google-Verify',
      text: 'G-749201 is your Google verification code.',
      code: '749201',
      receivedAt: Date.now() - 1000 * 60 * 238,
    },
  },
  {
    id: 'SV-61904',
    serviceId: 'tiktok',
    serviceName: 'TikTok',
    serviceIconKey: 'Play',
    countryId: 'de',
    countryName: 'Germany',
    countryFlag: '🇩🇪',
    countryPrefix: '+49',
    phoneNumber: '+49 152 9382 1049',
    maskedNumber: '+49 152 *** 1049',
    price: 0.18,
    status: 'COMPLETED',
    createdAt: Date.now() - 1000 * 60 * 600,
    expiresAt: Date.now() - 1000 * 60 * 580,
    sms: {
      id: 'sms-4',
      sender: 'TikTokCode',
      text: '[TikTok] 619284 is your verification code.',
      code: '619284',
      receivedAt: Date.now() - 1000 * 60 * 596,
    },
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-90482',
    type: 'DEPOSIT',
    amount: 15.0,
    title: 'Deposit USDT (TRC-20)',
    description: 'Added funds via Crypto TRC-20',
    status: 'COMPLETED',
    date: 'Today, 10:14 AM',
    timestamp: Date.now() - 1000 * 60 * 120,
    method: 'USDT (TRC-20)',
  },
  {
    id: 'TX-89104',
    type: 'PURCHASE',
    amount: -0.15,
    title: 'Telegram Number (US)',
    description: 'Order #SV-92481',
    status: 'COMPLETED',
    date: 'Today, 10:20 AM',
    timestamp: Date.now() - 1000 * 60 * 18,
    orderId: 'SV-92481',
  },
  {
    id: 'TX-87410',
    type: 'PURCHASE',
    amount: -0.22,
    title: 'WhatsApp Number (UK)',
    description: 'Order #SV-88319',
    status: 'COMPLETED',
    date: 'Yesterday, 4:15 PM',
    timestamp: Date.now() - 1000 * 60 * 95,
    orderId: 'SV-88319',
  },
  {
    id: 'TX-85219',
    type: 'REFUND',
    amount: 0.16,
    title: 'Order Refund',
    description: 'Refund for expired order #SV-60912',
    status: 'COMPLETED',
    date: 'Yesterday, 2:40 PM',
    timestamp: Date.now() - 1000 * 60 * 140,
    orderId: 'SV-60912',
  },
  {
    id: 'TX-81092',
    type: 'DEPOSIT',
    amount: 10.0,
    title: 'Credit Card Top-up',
    description: 'Instant Card deposit (Mock)',
    status: 'COMPLETED',
    date: 'Aug 16, 2026',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    method: 'Card',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'SMS Code Received',
    message: 'Telegram activation code 582914 arrived for +1 202 *** 9102',
    type: 'SMS',
    read: false,
    time: '18m ago',
    timestamp: Date.now() - 1000 * 60 * 18,
    orderId: 'SV-92481',
  },
  {
    id: 'notif-2',
    title: 'Wallet Funded',
    message: 'Successfully credited $15.00 USDT to your balance.',
    type: 'WALLET',
    read: true,
    time: '2h ago',
    timestamp: Date.now() - 1000 * 60 * 120,
  },
  {
    id: 'notif-3',
    title: 'System Operational',
    message: 'All SMS routes and instant activation channels are active.',
    type: 'SYSTEM',
    read: true,
    time: '1d ago',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
  },
];
