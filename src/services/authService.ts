import {
  signInAnonymously,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

export class AuthService {
  private isOutsideTelegram: boolean = false;

  getIsOutsideTelegram(): boolean {
    return this.isOutsideTelegram;
  }

  // Helper to extract Telegram user from WebApp SDK or environment parameters
  public getTelegramUserFromEnvironment(): any {
    const webApp = (window as any)?.Telegram?.WebApp;
    if (webApp?.initDataUnsafe?.user) {
      return webApp.initDataUnsafe.user;
    }

    if (webApp?.initData) {
      try {
        const urlParams = new URLSearchParams(webApp.initData);
        const userStr = urlParams.get('user');
        if (userStr) {
          return JSON.parse(userStr);
        }
      } catch (e) {
        console.warn('Failed to parse user from initData string:', e);
      }
    }

    try {
      const hashOrSearch = window.location.hash || window.location.search;
      if (hashOrSearch.includes('tgWebAppData=')) {
        const rawData = decodeURIComponent(hashOrSearch.split('tgWebAppData=')[1].split('&')[0]);
        const urlParams = new URLSearchParams(rawData);
        const userStr = urlParams.get('user');
        if (userStr) {
          return JSON.parse(userStr);
        }
      }
    } catch (e) {
      console.warn('Failed to parse user from URL params:', e);
    }

    return null;
  }

  // Initialize Auth & handle Telegram Mini App Auto-Login
  async initAuth(
    onUserLoaded: (user: UserProfile) => void,
    onStatusChange?: (status: { isOutside: boolean; error?: string }) => void
  ): Promise<UserProfile | null> {
    const webApp = (window as any)?.Telegram?.WebApp;
    
    if (webApp?.ready) {
      try {
        webApp.ready();
        webApp.expand?.();
      } catch (e) {
        console.warn('Telegram.WebApp.ready() notice:', e);
      }
    }

    const initData = webApp?.initData || '';
    const tgUser = this.getTelegramUserFromEnvironment();

    if (!tgUser || !tgUser.id) {
      this.isOutsideTelegram = true;
      console.warn('App opened outside Telegram Mini App. Authentication skipped.');
      if (onStatusChange) {
        onStatusChange({ isOutside: true, error: 'You are browsing outside Telegram' });
      }
      return null;
    }

    this.isOutsideTelegram = false;

    // Perform silent background Firebase Authentication for Firestore security rules
    try {
      if (auth && !auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (e: any) {
      console.warn('Firebase Auth anonymous login notice:', e?.message || e);
    }

    try {
      // Sync or retrieve Telegram user profile in Firestore
      const profile = await this.syncTelegramUserInFirestore(tgUser, initData);

      onUserLoaded(profile);
      if (onStatusChange) {
        onStatusChange({ isOutside: false });
      }
      return profile;
    } catch (err: any) {
      console.error('Error during Telegram auth sync:', err);
      try {
        const fallbackProfile = this.createLocalTelegramProfile(tgUser);
        onUserLoaded(fallbackProfile);
        if (onStatusChange) {
          onStatusChange({ isOutside: false });
        }
        return fallbackProfile;
      } catch (fallbackErr) {
        if (onStatusChange) {
          onStatusChange({
            isOutside: false,
            error: 'Unable to verify account. Please close and reopen the app inside Telegram.',
          });
        }
        return null;
      }
    }
  }

  // Create a clean UserProfile object directly from Telegram SDK user data
  public createLocalTelegramProfile(tgUser: any): UserProfile {
    const telegramIdNum = tgUser.id;
    const telegramIdStr = String(telegramIdNum);
    const tgDocId = `tg_${telegramIdNum}`;
    const nowIso = new Date().toISOString();

    return {
      id: tgDocId,
      telegramId: telegramIdNum,
      username: tgUser.username || `user_${telegramIdStr.slice(0, 6)}`,
      firstName: tgUser.first_name || '',
      lastName: tgUser.last_name || '',
      photoUrl: tgUser.photo_url || '',
      balance: 0,
      coins: 5,
      totalInvested: 0,
      totalEarned: 0,
      referralCode: `25D-${telegramIdStr.slice(-6).toUpperCase()}`,
      referredBy: '',
      referralCount: 0,
      depositingReferralsCount: 0,
      referralMilestonesClaimed: [],
      referralEarnings: 0,
      status: 'Active',
      isAdmin: false,
      createdAt: nowIso,
    };
  }

  // Sync Telegram user with Firestore
  async syncTelegramUserInFirestore(tgUser: any, _initData?: string): Promise<UserProfile> {
    const telegramIdNum = Number(tgUser.id);
    const telegramIdStr = String(telegramIdNum);
    const tgDocId = `tg_${telegramIdNum}`;

    // Ensure Firebase Auth is active for Firestore rules
    try {
      if (auth && !auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (authErr) {
      console.warn('Anonymous auth sign-in warning:', authErr);
    }

    // Check if doc exists at `users/tg_${telegramIdNum}` or `users/${telegramIdStr}`
    const docRefTg = doc(db, 'users', tgDocId);
    const docRefNum = doc(db, 'users', telegramIdStr);

    let snap: any = null;
    let targetDocRef = docRefTg;

    try {
      snap = await getDoc(docRefTg);
      if (!snap || !snap.exists()) {
        const snapNum = await getDoc(docRefNum);
        if (snapNum && snapNum.exists()) {
          snap = snapNum;
          targetDocRef = docRefNum;
        }
      }
    } catch (e) {
      console.warn('Firestore getDoc error:', e);
    }

    // Fallback query search by `telegramId` field
    if ((!snap || !snap.exists()) && db) {
      try {
        const q = query(collection(db, 'users'), where('telegramId', '==', telegramIdNum));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          snap = qSnap.docs[0];
          targetDocRef = doc(db, 'users', snap.id);
        }
      } catch (e) {
        console.warn('Firestore query by telegramId error:', e);
      }
    }

    const nowIso = new Date().toISOString();
    const urlParams = new URLSearchParams(window.location.search);
    const refFromUrl = urlParams.get('ref') || urlParams.get('start');

    const userUsername = (tgUser.username || '').replace(/^@/, '').trim().toLowerCase();
    const userFirstName = (tgUser.first_name || '').replace(/^@/, '').trim().toLowerCase();
    const isR5S7 = userUsername === 'r5_s7' || userFirstName === 'r5_s7';

    // If user exists in Firestore -> Update profile info and return existing profile
    if (snap && snap.exists && snap.exists()) {
      const existingData = snap.data();
      const cleanDocId = tgDocId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const code = cleanDocId.length >= 6 ? cleanDocId.slice(-6) : cleanDocId.padStart(6, '0');
      const userGiftId = existingData.giftId || `AUR-${code}`;

      const updatedFields: Record<string, any> = {
        lastLogin: nowIso,
        firstName: tgUser.first_name || existingData.firstName || '',
        lastName: tgUser.last_name || existingData.lastName || '',
        username: tgUser.username || existingData.username || `user_${telegramIdStr}`,
        giftId: userGiftId,
      };
      if (isR5S7 || existingData.isAdmin === true) {
        updatedFields.isAdmin = true;
      }
      if (tgUser.photo_url) {
        updatedFields.photo = tgUser.photo_url;
        updatedFields.photoUrl = tgUser.photo_url;
      }

      try {
        await updateDoc(targetDocRef, updatedFields);
      } catch (e) {
        console.warn('Firestore updateDoc notice:', e);
      }

      const mergedData = { ...existingData, ...updatedFields };
      return this.mapFirestoreToUserProfile(mergedData, targetDocRef.id);
    }

    // If user does NOT exist -> Create new clean user profile in Firestore
    const newDocRef = doc(db, 'users', tgDocId);
    const cleanDocId = tgDocId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const code = cleanDocId.length >= 6 ? cleanDocId.slice(-6) : cleanDocId.padStart(6, '0');
    const newGiftId = `AUR-${code}`;

    const newUserRecord = {
      uid: tgDocId,
      giftId: newGiftId,
      telegramId: telegramIdNum,
      username: tgUser.username || `user_${telegramIdStr.slice(0, 6)}`,
      firstName: tgUser.first_name || '',
      lastName: tgUser.last_name || '',
      photo: tgUser.photo_url || '',
      photoUrl: tgUser.photo_url || '',
      balance: 0,
      profit: 0,
      coins: 5,
      totalInvested: 0,
      totalEarned: 0,
      totalDeposits: 0,
      totalWithdraws: 0,
      activePlans: 0,
      completedPlans: 0,
      todayProfit: 0,
      referralCode: `25D-${telegramIdStr.slice(-6).toUpperCase()}`,
      referredBy: refFromUrl || '',
      referralCount: 0,
      depositingReferralsCount: 0,
      referralMilestonesClaimed: [],
      referralEarnings: 0,
      vipLevel: 1,
      status: 'Active',
      country: 'Global',
      language: 'en',
      isAdmin: isR5S7,
      createdAt: nowIso,
      lastLogin: nowIso,
    };

    try {
      await setDoc(newDocRef, newUserRecord);
      console.log('Successfully created user document in Firestore:', tgDocId);
    } catch (e) {
      console.error('Firestore setDoc error creating user:', e);
    }

    return this.mapFirestoreToUserProfile(newUserRecord, tgDocId);
  }

  // Authenticate user by numerical Telegram ID (for browser login widget or manual Telegram ID login)
  async loginWithTelegramId(telegramId: number, customFirstName?: string): Promise<UserProfile> {
    const isR5S7 = (customFirstName || '').replace(/^@/, '').trim().toLowerCase() === 'r5_s7';
    const tgUser = {
      id: telegramId,
      first_name: customFirstName || `TelegramUser_${telegramId}`,
      username: isR5S7 ? 'R5_S7' : `tg_user_${telegramId}`,
    };

    // Perform silent background Firebase Authentication
    try {
      if (auth && !auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (e: any) {
      console.warn('Firebase Auth anonymous login notice:', e?.message || e);
    }

    this.isOutsideTelegram = false;
    return await this.syncTelegramUserInFirestore(tgUser);
  }

  async logout() {
    await signOut(auth);
  }

  private mapFirestoreToUserProfile(data: any, uid: string): UserProfile {
    const cleanUsername = (data.username || '').replace(/^@/, '').trim().toLowerCase();
    const cleanFirstName = (data.firstName || '').replace(/^@/, '').trim().toLowerCase();
    const isAdmin = data.isAdmin === true || cleanUsername === 'r5_s7' || cleanFirstName === 'r5_s7';

    const cleanDocId = uid.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const code = cleanDocId.length >= 6 ? cleanDocId.slice(-6) : cleanDocId.padStart(6, '0');
    const fallbackGiftId = `AUR-${code}`;

    return {
      id: uid,
      giftId: data.giftId || fallbackGiftId,
      telegramId: data.telegramId || 0,
      username: data.username || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      photoUrl: data.photo || data.photoUrl || '',
      balance: data.balance ?? 0,
      coins: data.coins ?? 0,
      totalInvested: data.totalInvested ?? 0,
      totalEarned: data.totalEarned ?? 0,
      referralCode: data.referralCode || `25D-${uid.slice(-6)}`,
      referredBy: data.referredBy || '',
      referralCount: data.referralCount ?? 0,
      depositingReferralsCount: data.depositingReferralsCount ?? 0,
      referralMilestonesClaimed: data.referralMilestonesClaimed || [],
      referralEarnings: data.referralEarnings ?? 0,
      status: data.status || 'Active',
      isAdmin: isAdmin,
      createdAt: data.createdAt || new Date().toISOString(),
      lastDailyCheckin: data.lastDailyCheckin,
    };
  }
}

export const authService = new AuthService();
