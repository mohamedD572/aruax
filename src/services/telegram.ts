import { TelegramUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          query_id?: string;
          user?: TelegramUser;
          receiver?: TelegramUser;
          start_param?: string;
          auth_date?: number;
          hash?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        sendData: (data: string) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
      };
    };
  }
}

export class TelegramService {
  static get isTelegramAvailable(): boolean {
    return Boolean(window.Telegram?.WebApp?.initData);
  }

  static get webApp() {
    return window.Telegram?.WebApp;
  }

  static get user(): TelegramUser | null {
    if (this.webApp?.initDataUnsafe?.user) {
      return this.webApp.initDataUnsafe.user;
    }
    return null;
  }

  static init() {
    if (this.webApp) {
      try {
        this.webApp.ready();
        this.webApp.expand();
        this.webApp.headerColor = '#0D1117';
        this.webApp.backgroundColor = '#0D1117';

        const updateViewport = () => {
          if (this.webApp?.viewportHeight) {
            document.documentElement.style.setProperty(
              '--tg-viewport-height',
              `${this.webApp.viewportHeight}px`
            );
          }
        };

        updateViewport();

        // Listen to viewport changes inside Telegram
        if (typeof (this.webApp as any).onEvent === 'function') {
          (this.webApp as any).onEvent('viewportChanged', updateViewport);
        }
      } catch (err) {
        console.log('Telegram WebApp init failed:', err);
      }
    }
  }

  static hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    try {
      this.webApp?.HapticFeedback?.impactOccurred(style);
    } catch {
      // Ignore if not in Telegram
    }
  }

  static hapticNotification(type: 'error' | 'success' | 'warning' = 'success') {
    try {
      this.webApp?.HapticFeedback?.notificationOccurred(type);
    } catch {
      // Ignore
    }
  }

  static hapticSelection() {
    try {
      this.webApp?.HapticFeedback?.selectionChanged();
    } catch {
      // Ignore
    }
  }

  static openUrl(url: string) {
    this.hapticImpact('light');
    if (url.startsWith('https://t.me/') && this.webApp?.openTelegramLink) {
      this.webApp.openTelegramLink(url);
    } else if (this.webApp?.openLink) {
      this.webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  static shareReferral(botUsername: string, refCode: string) {
    const cleanUsername = botUsername.replace('@', '');
    const referralUrl = `https://t.me/${cleanUsername}/app?startapp=${refCode}`;
    const shareText = encodeURIComponent(`🔥 Join me on Aurex! Earn up to 10% daily returns for 25 days on USDT investments. Check it out now:`);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${shareText}`;
    this.openUrl(shareUrl);
  }
}
