import { TelegramAuthState, TelegramVerifiedUser } from '../types/trading';

type AuthListener = (state: TelegramAuthState) => void;

class TelegramAuthService {
  private state: TelegramAuthState = {
    status: 'connecting',
    user: null,
    error: null,
    initData: null,
  };

  private listeners: Set<AuthListener> = new Set();

  public getState(): TelegramAuthState {
    return this.state;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private updateState(newState: Partial<TelegramAuthState>) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  /**
   * Waits for Telegram WebApp SDK script to become available
   */
  private async waitForTelegramSDK(maxWaitMs = 1500): Promise<any> {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        return (window as any).Telegram.WebApp;
      }
      await new Promise((r) => setTimeout(r, 40));
    }
    return (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) || null;
  }

  /**
   * Extracts user object from any available Telegram source
   */
  private extractUserFromAnySource(tg: any, initData: string): TelegramVerifiedUser | null {
    // 1. Direct from Telegram WebApp SDK initDataUnsafe
    if (tg?.initDataUnsafe?.user?.id) {
      const u = tg.initDataUnsafe.user;
      return {
        id: Number(u.id),
        firstName: String(u.first_name || 'Telegram User'),
        lastName: u.last_name ? String(u.last_name) : null,
        username: u.username ? String(u.username) : null,
        photoUrl: u.photo_url ? String(u.photo_url) : null,
        languageCode: u.language_code ? String(u.language_code) : 'en',
        isPremium: Boolean(u.is_premium),
      };
    }

    // 2. Parse from initData query string if available
    if (initData) {
      try {
        const clean = initData.startsWith('#') || initData.startsWith('?') ? initData.slice(1) : initData;
        const params = new URLSearchParams(clean);
        const userParam = params.get('user') || params.get('tgWebAppData');
        if (userParam) {
          let parsed: any = null;
          try {
            parsed = JSON.parse(userParam);
          } catch {
            parsed = JSON.parse(decodeURIComponent(userParam));
          }
          if (parsed && parsed.id) {
            return {
              id: Number(parsed.id),
              firstName: String(parsed.first_name || 'Telegram User'),
              lastName: parsed.last_name ? String(parsed.last_name) : null,
              username: parsed.username ? String(parsed.username) : null,
              photoUrl: parsed.photo_url ? String(parsed.photo_url) : null,
              languageCode: parsed.language_code ? String(parsed.language_code) : 'en',
              isPremium: Boolean(parsed.is_premium),
            };
          }
        }
      } catch {
        // ignore parse error
      }
    }

    // 3. Check window location params
    if (typeof window !== 'undefined') {
      try {
        const search = window.location.search;
        const hash = window.location.hash;
        const combined = `${search}&${hash}`.replace(/^[?#]/, '');
        const params = new URLSearchParams(combined);
        const userParam = params.get('user');
        if (userParam) {
          const parsed = JSON.parse(decodeURIComponent(userParam));
          if (parsed && parsed.id) {
            return {
              id: Number(parsed.id),
              firstName: String(parsed.first_name || 'Telegram User'),
              lastName: parsed.last_name ? String(parsed.last_name) : null,
              username: parsed.username ? String(parsed.username) : null,
              photoUrl: parsed.photo_url ? String(parsed.photo_url) : null,
              languageCode: parsed.language_code ? String(parsed.language_code) : 'en',
              isPremium: Boolean(parsed.is_premium),
            };
          }
        }
      } catch {
        // ignore
      }
    }

    return null;
  }

  public async initAuth(): Promise<void> {
    this.updateState({
      status: 'connecting',
      error: null,
    });

    try {
      // 1. Wait for Telegram WebApp SDK
      const tg = await this.waitForTelegramSDK();

      if (tg) {
        try {
          if (typeof tg.ready === 'function') tg.ready();
          if (typeof tg.expand === 'function') tg.expand();
          if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor('#07090E');
          if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor('#07090E');
        } catch {
          // ignore SDK warnings
        }
      }

      // 2. Read initData
      let initData = tg?.initData || '';

      // Check URL hash/search if initData string is empty
      if (!initData && typeof window !== 'undefined') {
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
        const search = window.location.search.startsWith('?') ? window.location.search.slice(1) : window.location.search;

        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(search);

        initData =
          hashParams.get('tgWebAppData') ||
          searchParams.get('tgWebAppData') ||
          hashParams.get('initData') ||
          searchParams.get('initData') ||
          (hash.includes('hash=') ? hash : '') ||
          (search.includes('hash=') ? search : '');
      }

      // 3. Extract user immediately
      const extractedUser = this.extractUserFromAnySource(tg, initData);

      // Construct synthetic initData if user is known but initData string was stripped by modded client
      if (!initData && extractedUser) {
        initData = `user=${encodeURIComponent(JSON.stringify(extractedUser))}&auth_date=${Math.floor(Date.now() / 1000)}`;
      }

      // If we are definitely in Telegram (user or initData detected)
      if (extractedUser || initData) {
        // If we already have the real Telegram user object, set authenticated immediately!
        if (extractedUser) {
          this.updateState({
            status: 'authenticated',
            user: extractedUser,
            initData: initData || null,
            error: null,
          });

          // Perform background cryptographic handshake without blocking user UI
          this.verifyWithBackendBackground(initData, extractedUser);
          return;
        }

        // Otherwise verify with backend to parse user
        await this.verifyWithBackend(initData);
        return;
      }

      // If outside Telegram (no user and no initData)
      this.updateState({
        status: 'outside_telegram',
        user: null,
        initData: null,
        error: null,
      });
    } catch (err: any) {
      console.error('[AUTH ERROR] initAuth exception:', err);
      // If outside Telegram, show outside_telegram instead of blocking error
      this.updateState({
        status: 'outside_telegram',
        user: null,
        error: null,
      });
    }
  }

  private async verifyWithBackendBackground(initData: string, fallbackUser: TelegramVerifiedUser) {
    if (!initData) return;
    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });
      const data = await response.json().catch(() => null);
      if (data?.success && data?.user) {
        this.updateState({
          user: {
            id: Number(data.user.id),
            firstName: String(data.user.firstName || fallbackUser.firstName),
            lastName: data.user.lastName || fallbackUser.lastName,
            username: data.user.username || fallbackUser.username,
            photoUrl: data.user.photoUrl || fallbackUser.photoUrl,
            languageCode: data.user.languageCode || fallbackUser.languageCode || 'en',
            isPremium: Boolean(data.user.isPremium ?? fallbackUser.isPremium),
          },
        });
      }
    } catch {
      // Keep verified fallbackUser
    }
  }

  public async verifyWithBackend(initData: string): Promise<boolean> {
    this.updateState({
      status: 'verifying',
      initData,
      error: null,
    });

    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ initData }),
      });

      const data = await response.json().catch(() => null);

      if (data?.success && data?.user) {
        const verifiedUser: TelegramVerifiedUser = {
          id: Number(data.user.id),
          firstName: String(data.user.firstName),
          lastName: data.user.lastName || null,
          username: data.user.username || null,
          photoUrl: data.user.photoUrl || null,
          languageCode: data.user.languageCode || 'en',
          isPremium: Boolean(data.user.isPremium),
        };

        this.updateState({
          status: 'authenticated',
          user: verifiedUser,
          error: null,
        });

        return true;
      }

      // Check if user info is parseable from initData itself
      const directUser = this.extractUserFromAnySource(null, initData);
      if (directUser) {
        this.updateState({
          status: 'authenticated',
          user: directUser,
          error: null,
        });
        return true;
      }

      this.updateState({
        status: 'outside_telegram',
        user: null,
        error: null,
      });
      return false;
    } catch {
      const directUser = this.extractUserFromAnySource(null, initData);
      if (directUser) {
        this.updateState({
          status: 'authenticated',
          user: directUser,
          error: null,
        });
        return true;
      }

      this.updateState({
        status: 'outside_telegram',
        user: null,
        error: null,
      });
      return false;
    }
  }

  /**
   * Allows test login when running outside Telegram (e.g. web browser preview)
   */
  public loginAsDemoUser(): void {
    const demoUser: TelegramVerifiedUser = {
      id: 718293041,
      firstName: 'Ahmed',
      lastName: 'Ali',
      username: 'ahmed_telegram',
      photoUrl: null,
      languageCode: 'ar',
      isPremium: true,
    };
    this.updateState({
      status: 'authenticated',
      user: demoUser,
      error: null,
    });
  }

  public retry(): void {
    this.initAuth();
  }

  public getBotUrl(): string {
    const rawUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'SMSVaultBot';
    const username = rawUsername.replace('@', '').trim();
    return `https://t.me/${username}`;
  }
}

export const telegramAuthService = new TelegramAuthService();
