import {
  Country,
  Service,
  SMSOrder,
  Transaction,
  UserWallet,
  AppNotification,
  SMSMessage,
} from '../types/sms';
import {
  MOCK_COUNTRIES,
  MOCK_SERVICES,
  INITIAL_RECENT_ORDERS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  calculatePrice,
  generateRandomPhoneNumber,
  maskPhoneNumber,
  generateMockSms,
} from '../data/mockSmsData';

const WALLET_KEY = 'sms_vault_wallet_v1';
const ORDERS_KEY = 'sms_vault_orders_v1';
const TRANSACTIONS_KEY = 'sms_vault_txs_v1';
const NOTIFICATIONS_KEY = 'sms_vault_notifs_v1';
const ACTIVE_ORDER_ID_KEY = 'sms_vault_active_order_id';

class SMSVaultStore {
  private wallet: UserWallet;
  private orders: SMSOrder[];
  private transactions: Transaction[];
  private notifications: AppNotification[];
  private activeOrderId: string | null = null;
  private listeners: Set<() => void> = new Set();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.wallet = this.loadWallet();
    this.orders = this.loadOrders();
    this.transactions = this.loadTransactions();
    this.notifications = this.loadNotifications();
    this.activeOrderId = localStorage.getItem(ACTIVE_ORDER_ID_KEY) || null;

    // Check if active order still exists and is waiting
    if (this.activeOrderId) {
      const ord = this.orders.find((o) => o.id === this.activeOrderId);
      if (ord && ord.status === 'WAITING_SMS') {
        this.scheduleMockSmsDelivery(ord.id, 5000);
      }
    }
  }

  private loadWallet(): UserWallet {
    try {
      const saved = localStorage.getItem(WALLET_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse wallet', e);
    }
    return {
      balance: 12.50,
      totalAdded: 25.00,
      totalSpent: 12.66,
      totalRefunded: 0.16,
      currency: 'USD',
    };
  }

  private loadOrders(): SMSOrder[] {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse orders', e);
    }
    return [...INITIAL_RECENT_ORDERS];
  }

  private loadTransactions(): Transaction[] {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse transactions', e);
    }
    return [...INITIAL_TRANSACTIONS];
  }

  private loadNotifications(): AppNotification[] {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse notifications', e);
    }
    return [...INITIAL_NOTIFICATIONS];
  }

  private save() {
    try {
      localStorage.setItem(WALLET_KEY, JSON.stringify(this.wallet));
      localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(this.transactions));
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
      if (this.activeOrderId) {
        localStorage.setItem(ACTIVE_ORDER_ID_KEY, this.activeOrderId);
      } else {
        localStorage.removeItem(ACTIVE_ORDER_ID_KEY);
      }
    } catch (e) {
      console.error('Failed to save SMS Vault store', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Getters
  public getWallet(): UserWallet {
    return { ...this.wallet };
  }

  public getOrders(): SMSOrder[] {
    return [...this.orders];
  }

  public getRecentOrders(limit = 4): SMSOrder[] {
    return [...this.orders].slice(0, limit);
  }

  public getActiveOrders(): SMSOrder[] {
    return this.orders.filter((o) => o.status === 'WAITING_SMS' || o.status === 'SMS_RECEIVED');
  }

  public getOrder(orderId: string): SMSOrder | undefined {
    return this.orders.find((o) => o.id === orderId);
  }

  public getActiveOrder(): SMSOrder | null {
    if (this.activeOrderId) {
      const found = this.orders.find((o) => o.id === this.activeOrderId);
      if (found) return found;
    }
    const active = this.orders.find((o) => o.status === 'WAITING_SMS' || o.status === 'SMS_RECEIVED');
    return active || null;
  }

  public setActiveOrderId(id: string | null) {
    this.activeOrderId = id;
    this.save();
  }

  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public getNotifications(): AppNotification[] {
    return [...this.notifications];
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.save();
  }

  public markAllNotificationsAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.save();
  }

  public clearAllNotifications() {
    this.notifications = [];
    this.save();
  }

  // Actions
  public addFunds(amount: number, method = 'USDT (TRC-20)'): { success: boolean; message: string } {
    if (amount <= 0) {
      return { success: false, message: 'Deposit amount must be greater than zero.' };
    }

    this.wallet.balance = Number((this.wallet.balance + amount).toFixed(2));
    this.wallet.totalAdded = Number((this.wallet.totalAdded + amount).toFixed(2));

    const tx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'DEPOSIT',
      amount: amount,
      title: `Deposit ${method}`,
      description: `Added $${amount.toFixed(2)} to balance via ${method}`,
      status: 'COMPLETED',
      date: 'Just now',
      timestamp: Date.now(),
      method: method,
    };

    this.transactions.unshift(tx);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Deposit Successful',
      message: `+$${amount.toFixed(2)} USDT credited to your balance via ${method}`,
      type: 'WALLET',
      read: false,
      time: 'Just now',
      timestamp: Date.now(),
    };

    this.notifications.unshift(notif);
    this.save();
    return { success: true, message: `Successfully added $${amount.toFixed(2)} to balance!` };
  }

  public buyNumber(countryId: string, serviceId: string): { success: boolean; order?: SMSOrder; error?: string } {
    const country = MOCK_COUNTRIES.find((c) => c.id === countryId);
    const service = MOCK_SERVICES.find((s) => s.id === serviceId);

    if (!country || !service) {
      return { success: false, error: 'Invalid country or service selected.' };
    }

    const price = calculatePrice(service.id, country.id);

    if (this.wallet.balance < price) {
      return {
        success: false,
        error: `Insufficient balance ($${this.wallet.balance.toFixed(2)}). Required: $${price.toFixed(2)}. Please add funds.`,
      };
    }

    // Deduct balance
    this.wallet.balance = Number((this.wallet.balance - price).toFixed(2));
    this.wallet.totalSpent = Number((this.wallet.totalSpent + price).toFixed(2));

    const orderId = `SV-${Math.floor(10000 + Math.random() * 90000)}`;
    const phoneNumber = generateRandomPhoneNumber(country);
    const maskedNumber = maskPhoneNumber(phoneNumber);
    const now = Date.now();

    const order: SMSOrder = {
      id: orderId,
      serviceId: service.id,
      serviceName: service.name,
      serviceIconKey: service.iconKey,
      countryId: country.id,
      countryName: country.name,
      countryFlag: country.flag,
      countryPrefix: country.prefix,
      phoneNumber,
      maskedNumber,
      price,
      status: 'WAITING_SMS',
      createdAt: now,
      expiresAt: now + 20 * 60 * 1000, // 20 minutes expiration
      sms: null,
    };

    this.orders.unshift(order);
    this.activeOrderId = order.id;

    // Add Purchase Transaction
    const tx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'PURCHASE',
      amount: -price,
      title: `${service.name} Number (${country.name})`,
      description: `Order #${orderId}`,
      status: 'COMPLETED',
      date: 'Just now',
      timestamp: now,
      orderId: orderId,
    };
    this.transactions.unshift(tx);

    // Add Notification
    const notif: AppNotification = {
      id: `notif-${now}`,
      title: 'Number Assigned',
      message: `${service.name} number (${phoneNumber}) ready for SMS reception.`,
      type: 'ORDER',
      read: false,
      time: 'Just now',
      timestamp: now,
      orderId: orderId,
    };
    this.notifications.unshift(notif);

    this.save();

    // Schedule auto simulated SMS arrival (5 seconds for realistic, snappy feel)
    this.scheduleMockSmsDelivery(order.id, 5000);

    return { success: true, order };
  }

  private scheduleMockSmsDelivery(orderId: string, delayMs = 5000) {
    if (this.timers.has(orderId)) {
      clearTimeout(this.timers.get(orderId)!);
    }

    const timer = setTimeout(() => {
      this.simulateIncomingSms(orderId);
      this.timers.delete(orderId);
    }, delayMs);

    this.timers.set(orderId, timer);
  }

  public simulateIncomingSms(orderId: string): boolean {
    const orderIndex = this.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return false;

    const order = this.orders[orderIndex];
    if (order.status !== 'WAITING_SMS') return false;

    const mockSms = generateMockSms(order.serviceName);
    const smsMessage: SMSMessage = {
      id: `sms-${Date.now()}`,
      sender: mockSms.sender,
      text: mockSms.text,
      code: mockSms.code,
      receivedAt: Date.now(),
    };

    const updatedOrder: SMSOrder = {
      ...order,
      status: 'SMS_RECEIVED',
      sms: smsMessage,
    };

    this.orders[orderIndex] = updatedOrder;

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'SMS Code Received! 📩',
      message: `${order.serviceName} code: ${mockSms.code} for ${order.phoneNumber}`,
      type: 'SMS',
      read: false,
      time: 'Just now',
      timestamp: Date.now(),
      orderId: order.id,
    };
    this.notifications.unshift(notif);

    this.save();
    return true;
  }

  public completeOrder(orderId: string): boolean {
    const orderIndex = this.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return false;

    const order = this.orders[orderIndex];
    this.orders[orderIndex] = {
      ...order,
      status: 'COMPLETED',
    };

    if (this.timers.has(orderId)) {
      clearTimeout(this.timers.get(orderId)!);
      this.timers.delete(orderId);
    }

    this.save();
    return true;
  }

  public cancelOrder(orderId: string): { success: boolean; message: string } {
    const orderIndex = this.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return { success: false, message: 'Order not found.' };
    }

    const order = this.orders[orderIndex];
    if (order.status !== 'WAITING_SMS') {
      return { success: false, message: 'Cannot cancel an order that has already received SMS or finished.' };
    }

    // Cancel timer if scheduled
    if (this.timers.has(orderId)) {
      clearTimeout(this.timers.get(orderId)!);
      this.timers.delete(orderId);
    }

    // Refund price
    const refundAmount = order.price;
    this.wallet.balance = Number((this.wallet.balance + refundAmount).toFixed(2));
    this.wallet.totalRefunded = Number((this.wallet.totalRefunded + refundAmount).toFixed(2));

    this.orders[orderIndex] = {
      ...order,
      status: 'CANCELLED',
      refundedAmount: refundAmount,
    };

    // Add Refund Transaction
    const tx: Transaction = {
      id: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'REFUND',
      amount: refundAmount,
      title: 'Order Cancelled & Refunded',
      description: `Full refund for order #${order.id} (${order.serviceName})`,
      status: 'COMPLETED',
      date: 'Just now',
      timestamp: Date.now(),
      orderId: order.id,
    };
    this.transactions.unshift(tx);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Order Cancelled & Refunded',
      message: `+$${refundAmount.toFixed(2)} refunded back to your wallet.`,
      type: 'WALLET',
      read: false,
      time: 'Just now',
      timestamp: Date.now(),
      orderId: order.id,
    };
    this.notifications.unshift(notif);

    this.save();
    return { success: true, message: `Order cancelled. $${refundAmount.toFixed(2)} has been refunded to your wallet.` };
  }

  public refreshSms(orderId: string): boolean {
    const order = this.getOrder(orderId);
    if (!order) return false;
    if (order.status === 'WAITING_SMS') {
      // Force deliver immediately
      return this.simulateIncomingSms(orderId);
    }
    return true;
  }

  public resetToDefaults() {
    this.wallet = {
      balance: 12.50,
      totalAdded: 25.00,
      totalSpent: 12.66,
      totalRefunded: 0.16,
      currency: 'USD',
    };
    this.orders = [...INITIAL_RECENT_ORDERS];
    this.transactions = [...INITIAL_TRANSACTIONS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.activeOrderId = null;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    this.save();
  }
}

export const smsVaultStore = new SMSVaultStore();
