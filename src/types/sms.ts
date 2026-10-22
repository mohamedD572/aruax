export type OrderStatus =
  | 'PENDING'
  | 'WAITING_SMS'
  | 'SMS_RECEIVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXPIRED';

export interface Country {
  id: string;
  name: string;
  nameAr?: string;
  code: string;
  flag: string;
  prefix: string;
  count: number;
  startingPrice: number;
  region: 'Americas' | 'Europe' | 'Middle East' | 'Asia' | 'Africa' | 'Oceania';
  isPopular?: boolean;
}

export interface Service {
  id: string;
  name: string;
  iconKey: string;
  startingPrice: number;
  availableCount: number;
  category: 'Popular' | 'Social' | 'Messenger' | 'Tools' | 'Gaming' | 'Other';
  color: string;
  description?: string;
}

export interface SMSMessage {
  id: string;
  sender: string;
  text: string;
  code: string;
  receivedAt: number;
}

export interface SMSOrder {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceIconKey: string;
  countryId: string;
  countryName: string;
  countryFlag: string;
  countryPrefix: string;
  phoneNumber: string;
  maskedNumber: string;
  price: number;
  status: OrderStatus;
  createdAt: number;
  expiresAt: number;
  sms: SMSMessage | null;
  refundedAmount?: number;
}

export type TransactionType = 'DEPOSIT' | 'PURCHASE' | 'REFUND';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  title: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  date: string;
  timestamp: number;
  orderId?: string;
  method?: string;
}

export interface UserWallet {
  balance: number;
  totalAdded: number;
  totalSpent: number;
  totalRefunded: number;
  currency: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'SMS' | 'WALLET' | 'ORDER' | 'SYSTEM';
  read: boolean;
  time: string;
  timestamp: number;
  orderId?: string;
}

export type TabType = 'dashboard' | 'buy' | 'orders' | 'wallet' | 'profile';

export interface TelegramVerifiedUser {
  id: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  languageCode: string;
  isPremium?: boolean;
}

export type AuthStatus =
  | 'connecting'
  | 'verifying'
  | 'authenticated'
  | 'error'
  | 'outside_telegram';

export interface TelegramAuthState {
  status: AuthStatus;
  user: TelegramVerifiedUser | null;
  error: string | null;
  initData: string | null;
}
