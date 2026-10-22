import { doc, getDoc, updateDoc, setDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import appletConfig from '../firebase-applet-config.json';
import { GiftMiningRecord, Investment, UserProfile } from '../src/types';

export async function searchUserByGiftIdServer(searchQuery: string) {
  const rawSearch = searchQuery || '';
  const normalizedGiftId = rawSearch.trim().toUpperCase();

  const projectId = appletConfig.projectId || 'days-aeb4a';
  const databaseId = appletConfig.firestoreDatabaseId || 'ai-studio-25daysinvestment-c94b66d0-72fc-49ae-8bd7-a86fd2c228b6';
  const collectionName = 'users';

  if (!normalizedGiftId) {
    return {
      success: false,
      error: 'MISSING_GIFT_ID',
      message: 'Gift ID is required.'
    };
  }

  try {
    const usersRef = collection(db, collectionName);
    let targetDoc: { id: string; data: any } | null = null;
    let matchingCount = 0;

    // 1. Exact query: collection(db, "users") where("giftId", "==", normalizedGiftId)
    const exactQuery = query(usersRef, where('giftId', '==', normalizedGiftId));
    const exactSnap = await getDocs(exactQuery);

    if (!exactSnap.empty) {
      matchingCount = exactSnap.docs.length;
      const matched = exactSnap.docs[0];
      targetDoc = { id: matched.id, data: matched.data() };
    } else {
      // 2. Scan users collection as fallback for missing/legacy format giftIds
      const allSnap = await getDocs(usersRef);
      for (const d of allSnap.docs) {
        const data = d.data();
        let userGid = data.giftId;

        // Derive missing giftId ONCE and permanently save to Firestore
        if (!userGid) {
          const rawId = (data.telegramId || data.uid || d.id).toString().replace(/[^A-Za-z0-9]/g, '').toUpperCase();
          const code = rawId.length >= 6 ? rawId.slice(-6) : rawId.padStart(6, '0');
          userGid = `AUR-${code}`;

          try {
            await updateDoc(doc(db, collectionName, d.id), { giftId: userGid });
            console.log(`[GIFT ID PERSISTED] Assigned missing Gift ID "${userGid}" to user document "${d.id}"`);
          } catch (e) {
            console.warn(`[GIFT ID PERSIST WARN] Failed to update user "${d.id}":`, e);
          }
        }

        const normalizedUserGid = (userGid || '').trim().toUpperCase();
        const userGidCode = normalizedUserGid.replace(/^AUR-/, '');
        const queryCode = normalizedGiftId.replace(/^AUR-/, '');
        const cleanUsername = (data.username || '').replace(/^@/, '').trim().toUpperCase();
        const cleanRefCode = (data.referralCode || '').trim().toUpperCase();
        const docIdUpper = d.id.trim().toUpperCase();

        if (
          normalizedUserGid === normalizedGiftId ||
          (userGidCode.length >= 4 && userGidCode === queryCode) ||
          docIdUpper === normalizedGiftId ||
          docIdUpper === queryCode ||
          (cleanUsername && cleanUsername === normalizedGiftId.replace(/^@/, '')) ||
          (cleanRefCode && cleanRefCode === normalizedGiftId)
        ) {
          targetDoc = { id: d.id, data: { ...data, giftId: userGid } };
          matchingCount = 1;

          // Make sure userGid is permanently saved to Firestore if it wasn't there
          if (!data.giftId) {
            await updateDoc(doc(db, collectionName, d.id), { giftId: userGid }).catch(() => {});
          }
          break;
        }
      }
    }

    if (!targetDoc) {
      // Server-side debug log requirement 9
      console.log(`[GIFT SEARCH SERVER LOG]`);
      console.log(`- normalized Gift ID: ${normalizedGiftId}`);
      console.log(`- Firebase project ID: ${projectId}`);
      console.log(`- Firebase database ID: ${databaseId}`);
      console.log(`- users collection: ${collectionName}`);
      console.log(`- number of matching documents: 0`);
      console.log(`- matched document ID: NONE`);

      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: `User not found matching Gift ID "${searchQuery}".`
      };
    }

    const docId = targetDoc.id;
    const docData = targetDoc.data;

    let storedGiftId = docData.giftId;
    if (!storedGiftId) {
      const rawId = (docData.telegramId || docData.uid || docId).toString().replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const code = rawId.length >= 6 ? rawId.slice(-6) : rawId.padStart(6, '0');
      storedGiftId = `AUR-${code}`;
      await updateDoc(doc(db, collectionName, docId), { giftId: storedGiftId }).catch(() => {});
    }

    // Server-side debug log requirement 9
    console.log(`[GIFT SEARCH SERVER LOG]`);
    console.log(`- normalized Gift ID: ${normalizedGiftId}`);
    console.log(`- Firebase project ID: ${projectId}`);
    console.log(`- Firebase database ID: ${databaseId}`);
    console.log(`- users collection: ${collectionName}`);
    console.log(`- number of matching documents: ${matchingCount}`);
    console.log(`- matched document ID: ${docId}`);

    const targetUser: UserProfile = {
      id: docId,
      ...docData,
      giftId: storedGiftId,
    };

    // Fetch user active investments & gift history
    const invRef = collection(db, 'investments');
    const invQuery = query(invRef, where('userId', '==', docId));
    const invSnap = await getDocs(invQuery);

    const userInvestments: Investment[] = [];
    invSnap.forEach((d) => {
      userInvestments.push({ id: d.id, ...d.data() } as Investment);
    });

    const activeRigs = userInvestments.filter((i) => i.status === 'Active');

    const giftsRef = collection(db, 'gift_history');
    const giftsQuery = query(giftsRef, where('userId', '==', docId));
    const giftsSnap = await getDocs(giftsQuery);

    const giftHistory: GiftMiningRecord[] = [];
    giftsSnap.forEach((d) => {
      giftHistory.push({ id: d.id, ...d.data() } as GiftMiningRecord);
    });

    giftHistory.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const activeGift = userInvestments.find((i) => i.isGift && i.status === 'Active');
    const previousGiftStatus = activeGift
      ? `ACTIVE (${activeGift.giftMiningId})`
      : giftHistory.length > 0
      ? `COMPLETED (${giftHistory[0].giftMiningId})`
      : 'No Previous Gifts';

    const formattedUsername = targetUser.username ? `@${targetUser.username.replace(/^@/, '')}` : `@${targetUser.firstName || 'user'}`;

    return {
      success: true,
      user: {
        ...targetUser,
        id: targetUser.id,
        giftId: storedGiftId,
        telegramId: targetUser.telegramId || targetUser.id,
        username: targetUser.username || '',
        firstName: targetUser.firstName || '',
        lastName: targetUser.lastName || '',
        status: targetUser.status || 'Active',
        balance: targetUser.balance ?? 0,
        coins: targetUser.coins ?? 0,
        totalInvested: targetUser.totalInvested ?? 0,
        createdAt: targetUser.createdAt || new Date().toISOString(),
      },
      debug: {
        searchId: rawSearch,
        normalizedId: normalizedGiftId,
        database: databaseId,
        collection: collectionName,
        matchedDocId: docId,
        storedGiftId: storedGiftId,
      },
      giftId: storedGiftId,
      username: formattedUsername,
      telegramUsername: formattedUsername,
      telegramId: targetUser.telegramId || targetUser.id,
      accountStatus: targetUser.status || 'Active',
      walletBalance: targetUser.balance ?? 0,
      activeMiningRigs: activeRigs.length,
      giftHistory: giftHistory,
      activeRigsCount: activeRigs.length,
      previousGiftStatus: previousGiftStatus,
    };
  } catch (err: any) {
    console.error(`[GIFT SEARCH ERROR] Exception searching user by Gift ID "${searchQuery}":`, err);
    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Error searching user by Gift ID.'
    };
  }
}

export interface GrantGiftPayload {
  userId?: string;
  giftId: string;
  giftValue?: number;
  durationHours?: number;
  rewardRate?: number;
  hashRate?: string;
  giftPackage?: string;
  adminUsername?: string;
}

export async function grantGiftMiningServer(payload: GrantGiftPayload) {
  const {
    userId,
    giftId,
    giftValue = 5,
    durationHours = 24,
    rewardRate = 5,
    hashRate = '100 MH/s',
    giftPackage = '🎁 AUREX GIFT MINING',
    adminUsername = 'Admin',
  } = payload;

  if (!userId && !giftId) {
    console.error('[GIFT GRANT FAILURE] User ID or Gift ID is required.');
    return { success: false, message: 'User ID or Gift ID is required.' };
  }

  console.log(`[GIFT GRANT] Granting gift to userId: "${userId}" / giftId: "${giftId}" with value $${giftValue} USDT for ${durationHours}h`);

  try {
    let targetUser: UserProfile | null = null;

    // Requirement 13: Use the matched Firestore document ID directly
    if (userId) {
      const userDocSnap = await getDoc(doc(db, 'users', userId));
      if (userDocSnap.exists()) {
        targetUser = { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
      }
    }

    if (!targetUser && giftId) {
      const searchRes = await searchUserByGiftIdServer(giftId);
      if (searchRes.success && searchRes.user) {
        targetUser = searchRes.user as UserProfile;
      }
    }

    if (!targetUser) {
      console.error(`[GIFT GRANT FAILURE] Target user document not found.`);
      return { success: false, message: 'Invalid Gift ID or User ID. User not found.' };
    }

    // Generate unique Gift Mining ID
    const randomCode = Math.random().toString(36).substring(2, 9).toUpperCase();
    const giftMiningId = `GIFT-${randomCode}`;

    // Timestamps
    const nowMs = Date.now();
    const startTime = new Date(nowMs).toISOString();
    const endTime = new Date(nowMs + durationHours * 3600 * 1000).toISOString();

    const expectedReturn = parseFloat((((giftValue * rewardRate) / 100) * (durationHours / 24)).toFixed(2));
    const dailyYieldUsdt = parseFloat(((giftValue * rewardRate) / 100).toFixed(2));

    // Create Investment Document
    const newInvestment: Omit<Investment, 'id'> = {
      userId: targetUser.id,
      planId: 'gift-mining-24h',
      planName: giftPackage,
      amount: Number(giftValue),
      dailyPercent: Number(rewardRate),
      dailyYieldUsdt: dailyYieldUsdt,
      totalExpectedReturn: expectedReturn > 0 ? expectedReturn : dailyYieldUsdt,
      daysElapsed: 0,
      durationDays: durationHours / 24,
      durationHours: Number(durationHours),
      startDate: startTime,
      investmentStartTime: startTime,
      lastAccrualDate: startTime,
      nextProfitTime: endTime,
      endTimeIso: endTime,
      claimedProfit: 0,
      unclaimedProfit: 0,
      status: 'Active',
      isGift: true,
      giftMiningId: giftMiningId,
      grantedByAdminId: adminUsername,
      rigModel: 'Aurex Promotional Gift Rig',
      hashRate: hashRate,
      powerUsage: '150W',
      efficiency: '100%',
    };

    const invDocRef = await addDoc(collection(db, 'investments'), newInvestment);

    // Create Gift History Record
    const giftRecord: GiftMiningRecord & Record<string, any> = {
      id: giftMiningId,
      giftId: targetUser.giftId || giftId,
      userId: targetUser.id,
      username: targetUser.username || targetUser.firstName || 'Aurex User',
      giftMiningId: giftMiningId,
      packageId: giftPackage,
      giftPackage: giftPackage,
      giftValue: Number(giftValue),
      duration: Number(durationHours),
      durationHours: Number(durationHours),
      rewardRate: Number(rewardRate),
      startTime: startTime,
      endTime: endTime,
      rewardEarned: 0,
      status: 'ACTIVE',
      grantedByAdmin: adminUsername,
      adminUsername: adminUsername,
      createdAt: startTime,
    };

    await setDoc(doc(db, 'gift_history', giftMiningId), giftRecord);

    // Send Notification to User
    await addDoc(collection(db, 'notifications'), {
      userId: targetUser.id,
      title: '🎁 Gift Mining Granted!',
      message: `Admin granted you a $${giftValue}.00 USDT Gift Mining Machine for ${durationHours} hours!`,
      type: 'investment',
      read: false,
      createdAt: startTime,
      investmentId: invDocRef.id,
    });

    console.log(`[GIFT GRANT] Gift GRANTED successfully: ${giftMiningId} to user ${targetUser.id} (${targetUser.giftId})`);

    return {
      success: true,
      message: `Gift Mining machine successfully granted to ${targetUser.username || targetUser.firstName} (${targetUser.giftId})!`,
      giftMiningId,
      investmentId: invDocRef.id,
      targetUser,
      giftRecord,
    };
  } catch (err: any) {
    console.error(`[GIFT GRANT FAILURE] Failed to grant gift to user:`, err);
    return { success: false, message: err.message || 'Server error while granting gift.' };
  }
}

