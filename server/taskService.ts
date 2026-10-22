import { doc, getDoc, updateDoc, setDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

export const DAILY_REWARDS_30 = [
  3, 3, 3, 3, 20,
  3, 3, 3, 3, 50,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 100,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 250
];

export async function claimDailyLoginServer(userId: string) {
  if (!userId) {
    return { success: false, message: "Missing user ID." };
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return { success: false, message: "User account not found in database." };
  }

  const data = userSnap.data();
  const lastLoginStr = data.lastLoginRewardTime || data.lastDailyLogin || data.lastDailyCheckin;
  const lastMs = lastLoginStr ? new Date(lastLoginStr).getTime() : 0;
  const nowMs = Date.now();
  const total24h = 24 * 60 * 60 * 1000;
  const total48h = 48 * 60 * 60 * 1000;

  // 1. Strict 24h server cooldown check
  if (lastMs > 0 && (nowMs - lastMs) < total24h) {
    const remainingMs = total24h - (nowMs - lastMs);
    const hrs = Math.floor(remainingMs / (3600 * 1000));
    const mins = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
    const secs = Math.floor((remainingMs % (60 * 1000)) / 1000);
    return {
      success: false,
      message: `Daily Login reward on cooldown. Next claim available in ${hrs}h ${mins}m ${secs}s.`,
      remainingMs,
      nextLoginRewardTime: new Date(lastMs + total24h).toISOString(),
    };
  }

  // 2. Determine streak
  let currentStreak = data.loginStreak || data.currentLoginDay || 0;
  // If missed the 24h window (> 48h since last claim), reset streak to 1
  if (lastMs > 0 && (nowMs - lastMs) > total48h) {
    currentStreak = 0;
  }

  const newStreak = (currentStreak % 30) + 1;
  const rewardAmount = DAILY_REWARDS_30[newStreak - 1] || 3;
  const isBonusDay = [5, 10, 20, 30].includes(newStreak);

  const nowIso = new Date(nowMs).toISOString();
  const nextIso = new Date(nowMs + total24h).toISOString();
  const currentCoins = data.coins ?? 0;
  const completedTaskIds: string[] = data.completedTaskIds || [];
  if (!completedTaskIds.includes('task-1')) {
    completedTaskIds.push('task-1');
  }

  // 3. Update Firestore user document
  await updateDoc(userRef, {
    coins: currentCoins + rewardAmount,
    lastLoginRewardTime: nowIso,
    lastDailyLogin: nowIso,
    lastDailyCheckin: nowIso,
    nextLoginRewardTime: nextIso,
    nextDailyLogin: nextIso,
    loginStreak: newStreak,
    currentLoginDay: newStreak,
    completedTaskIds,
  });

  // 4. Record exactly ONE transaction record in Firestore
  const uniqueRewardId = `daily_login_${userId}_${nowMs}`;
  await addDoc(collection(db, 'transactions'), {
    userId,
    type: 'Daily Login Reward',
    amount: rewardAmount,
    currency: 'AUR',
    status: 'Completed',
    description: `30-Day Login Reward (Day ${newStreak}/30 - +${rewardAmount} AUR)`,
    createdAt: nowIso,
    uniqueRewardId,
  });

  // 5. Add notification in Firestore
  await addDoc(collection(db, 'notifications'), {
    userId,
    title: isBonusDay ? '30-Day Bonus Milestone Claimed! 🌟' : 'Daily Login Reward Claimed! ⭐',
    message: `Day ${newStreak}/30 bonus (+${rewardAmount} AUR) credited to your AUR balance.`,
    type: 'task',
    read: false,
    createdAt: nowIso,
  });

  return {
    success: true,
    rewardAmount,
    streak: newStreak,
    currentLoginDay: newStreak,
    isBonusDay,
    lastLoginRewardTime: nowIso,
    nextLoginRewardTime: nextIso,
    newCoins: currentCoins + rewardAmount,
    message: `Day ${newStreak} Reward Claimed (+${rewardAmount} AUR)!`,
  };
}

export async function checkAndGrantReferralDepositReward(referrerIdOrCode: string) {
  if (!referrerIdOrCode) return { success: false, message: "Missing referrer parameter" };

  // 1. Find referrer user in Firestore
  let referrerDocId = referrerIdOrCode;
  let referrerData: any = null;

  const referrerRef = doc(db, 'users', referrerIdOrCode);
  const referrerSnap = await getDoc(referrerRef);

  if (referrerSnap.exists()) {
    referrerData = referrerSnap.data();
    referrerDocId = referrerSnap.id;
  } else {
    // Search by referral code
    const q = query(collection(db, 'users'), where('referralCode', '==', referrerIdOrCode));
    const qSnap = await getDocs(q);
    if (!qSnap.empty) {
      referrerDocId = qSnap.docs[0].id;
      referrerData = qSnap.docs[0].data();
    }
  }

  if (!referrerData) {
    return { success: false, message: "Referrer user not found" };
  }

  const referralCode = referrerData.referralCode || referrerDocId;

  // 2. Query all users referred by this referral code or ID
  const referredQ = query(collection(db, 'users'), where('referredBy', '==', referralCode));
  const referredSnap = await getDocs(referredQ);

  let newRewardsGranted = 0;
  let totalQualifyingReferrals = 0;

  for (const refDoc of referredSnap.docs) {
    const refUserId = refDoc.id;
    const refUserData = refDoc.data();

    // Check if this referred user has an APPROVED deposit >= 5 USDT
    const depQ = query(
      collection(db, 'deposits'),
      where('userId', '==', refUserId),
      where('status', '==', 'Approved')
    );
    const depSnap = await getDocs(depQ);

    const qualifyingDep = depSnap.docs.find((d) => (d.data().amount ?? 0) >= 5);

    if (qualifyingDep) {
      totalQualifyingReferrals++;
      const depData = qualifyingDep.data();

      // Check if reward was already granted for this referred user
      const rewardRef = doc(db, 'referral_rewards', `ref_dep_${refUserId}`);
      const rewardSnap = await getDoc(rewardRef);

      if (!rewardSnap.exists()) {
        const nowIso = new Date().toISOString();

        // Save reward idempotency record
        await setDoc(rewardRef, {
          referrerId: referrerDocId,
          referredUserId: refUserId,
          depositId: qualifyingDep.id,
          depositAmount: depData.amount,
          grantedAt: nowIso,
          rewardAmount: 50,
        });

        // Fetch latest referrer data to avoid race conditions
        const refUserDocRef = doc(db, 'users', referrerDocId);
        const latestRefSnap = await getDoc(refUserDocRef);
        const latestRefData = latestRefSnap.exists() ? latestRefSnap.data() : referrerData;
        const currentCoins = latestRefData.coins ?? 0;
        const currentDepCount = latestRefData.depositingReferralsCount ?? 0;

        await updateDoc(refUserDocRef, {
          coins: currentCoins + 50,
          depositingReferralsCount: Math.max(currentDepCount, totalQualifyingReferrals),
        });

        // Add transaction for referrer
        await addDoc(collection(db, 'transactions'), {
          userId: referrerDocId,
          type: 'Referral Deposit Reward',
          amount: 50,
          currency: 'AUR',
          status: 'Completed',
          description: `Referral Deposit Reward (+50 AUR for referred user @${refUserData.username || refUserData.firstName || refUserId})`,
          createdAt: nowIso,
          uniqueRewardId: `ref_dep_reward_${refUserId}`,
        });

        // Add notification for referrer
        await addDoc(collection(db, 'notifications'), {
          userId: referrerDocId,
          title: 'Referral Deposit Reward! 🎁',
          message: `You earned +50 AUR! Your referred user completed an approved deposit of $${depData.amount} USDT.`,
          type: 'task',
          read: false,
          createdAt: nowIso,
        });

        newRewardsGranted++;
      }
    }
  }

  return {
    success: true,
    totalQualifyingReferrals,
    newRewardsGranted,
    completed: totalQualifyingReferrals > 0,
  };
}
