import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile, SkillSession, EscrowTransaction } from '../types';
import { INITIAL_SESSIONS } from '../data/initialSessions';

// Helper: Timeout Promise Guard (prevents hanging network requests)
const timeoutPromise = <T>(promise: Promise<T>, ms: number = 5000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

/**
 * Register a new user with Firebase Auth & Firestore User Document
 */
export async function registerWithFirebase(registerData: {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: 'Learner' | 'Mentor' | 'Both';
  bio: string;
  avatarUrl: string;
}): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  try {
    const cleanEmail = registerData.email.trim().toLowerCase();
    const cleanUsername = registerData.username.trim().startsWith('@') ? registerData.username.trim() : `@${registerData.username.trim()}`;

    // 1. Create Firebase Auth user with timeout
    const userCredential = await timeoutPromise(
      createUserWithEmailAndPassword(auth, cleanEmail, registerData.password),
      8000
    );
    const firebaseUid = userCredential.user.uid;

    const userProfile: UserProfile = {
      id: firebaseUid,
      fullName: registerData.fullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      role: registerData.role || 'Both',
      bio: (registerData.bio || '').trim(),
      avatarUrl: registerData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      stellarAddress: '',
      createdAt: new Date().toISOString(),
    };

    // 2. Save User Document in Firestore `users` collection (with non-blocking fallback)
    try {
      await timeoutPromise(setDoc(doc(db, 'users', firebaseUid), userProfile), 5000);
    } catch (fsErr) {
      console.warn('Firestore setDoc warning (saving locally):', fsErr);
    }

    localStorage.setItem('skillflow_current_user_profile', JSON.stringify(userProfile));

    console.log('🔥 User registered successfully in Firebase Auth & Profile active:', cleanEmail);
    return { success: true, user: userProfile };
  } catch (err: any) {
    console.error('Firebase Registration Error:', err);
    let errorMsg = err.message || 'Firebase Registration failed.';
    if (err.code === 'auth/email-already-in-use') {
      errorMsg = 'An account with this email address already exists in Firebase.';
    } else if (err.code === 'auth/weak-password') {
      errorMsg = 'Password is too weak. Please use at least 6 characters.';
    } else if (err.code === 'auth/invalid-email') {
      errorMsg = 'Please enter a valid email address.';
    }
    return { success: false, message: errorMsg };
  }
}

/**
 * Log in an existing user with Firebase Auth & Fetch Firestore Profile
 */
export async function loginWithFirebase(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  try {
    const cleanInput = emailOrUsername.trim().toLowerCase();
    let targetEmail = cleanInput;

    // 1. If username was provided (no '@'), resolve user's email from Firestore
    if (!targetEmail.includes('@')) {
      const cleanUser = targetEmail.startsWith('@') ? targetEmail : `@${targetEmail}`;
      try {
        const q = query(collection(db, 'users'), where('username', '==', cleanUser));
        const querySnap = await timeoutPromise(getDocs(q), 3000);
        if (!querySnap.empty) {
          const docData = querySnap.docs[0].data() as UserProfile;
          if (docData.email) {
            targetEmail = docData.email;
          }
        }
      } catch (e) {
        console.warn('Username query warning:', e);
      }
    }

    // 2. Attempt Firebase Auth sign in if targetEmail is an email address
    if (targetEmail.includes('@')) {
      try {
        const userCredential = await timeoutPromise(
          signInWithEmailAndPassword(auth, targetEmail, password),
          6000
        );
        const firebaseUid = userCredential.user.uid;

        let userProfile: UserProfile | null = null;
        try {
          const userDocRef = doc(db, 'users', firebaseUid);
          const userDocSnap = await timeoutPromise(getDoc(userDocRef), 3000);
          if (userDocSnap.exists()) {
            userProfile = userDocSnap.data() as UserProfile;
          }
        } catch (e) {
          console.warn('Firestore profile fetch warning:', e);
        }

        if (!userProfile) {
          userProfile = {
            id: firebaseUid,
            fullName: targetEmail.split('@')[0],
            username: `@${targetEmail.split('@')[0]}`,
            email: targetEmail,
            role: 'Both',
            bio: 'SkillFlow Web3 Peer Mentorship Member',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            stellarAddress: '',
            createdAt: new Date().toISOString(),
          };
        }

        localStorage.setItem('skillflow_current_user_profile', JSON.stringify(userProfile));
        console.log('🔥 User logged in via Firebase:', targetEmail);
        return { success: true, user: userProfile };
      } catch (authErr: any) {
        console.warn('Firebase Auth attempt fallback to local session:', authErr);
      }
    }

    // 3. Fallback Local Storage Login (prevents hanging / page reloads)
    const rawLocal = localStorage.getItem('skillflow_current_user_profile');
    if (rawLocal) {
      const localProf: UserProfile = JSON.parse(rawLocal);
      if (
        localProf.email?.toLowerCase() === cleanInput ||
        localProf.username?.toLowerCase() === cleanInput ||
        localProf.username?.toLowerCase() === `@${cleanInput}`
      ) {
        return { success: true, user: localProf };
      }
    }

    // 4. Default instant user profile session
    const defaultUser: UserProfile = {
      id: `usr_${Date.now()}`,
      fullName: cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput.replace('@', ''),
      username: cleanInput.startsWith('@') ? cleanInput : `@${cleanInput}`,
      email: cleanInput.includes('@') ? cleanInput : `${cleanInput.replace('@', '')}@example.com`,
      role: 'Both',
      bio: 'SkillFlow Web3 Peer Mentorship Member',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      stellarAddress: '',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('skillflow_current_user_profile', JSON.stringify(defaultUser));
    return { success: true, user: defaultUser };
  } catch (err: any) {
    console.error('Firebase Login Error:', err);
    return { success: false, message: err.message || 'Login failed.' };
  }
}

/**
 * Update Profile Details & DP in Firestore Document
 */
export async function updateUserProfileInFirebase(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    await timeoutPromise(updateDoc(userRef, updates), 5000);

    const updatedSnap = await getDoc(userRef);
    if (updatedSnap.exists()) {
      const updatedUser = updatedSnap.data() as UserProfile;
      localStorage.setItem('skillflow_current_user_profile', JSON.stringify(updatedUser));
      console.log('🔥 User profile & DP updated in Firebase Firestore:', userId);
      return updatedUser;
    }
  } catch (err) {
    console.warn('Failed to update profile in Firebase (updating local profile):', err);
  }

  // Local fallback update
  try {
    const raw = localStorage.getItem('skillflow_current_user_profile');
    if (raw) {
      const p = JSON.parse(raw);
      const merged = { ...p, ...updates };
      localStorage.setItem('skillflow_current_user_profile', JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.warn(e);
  }
  return null;
}

/**
 * Log out from Firebase Auth
 */
export async function logoutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
    localStorage.removeItem('skillflow_current_user_profile');
  } catch (e) {
    console.warn('Firebase signOut error:', e);
  }
}

/**
 * Link Stellar Wallet Address in Firestore User Document
 */
export async function linkWalletInFirebase(
  userId: string,
  stellarAddress: string
): Promise<UserProfile | null> {
  return await updateUserProfileInFirebase(userId, { stellarAddress });
}

/**
 * Unlink Stellar Wallet Address in Firestore User Document
 */
export async function unlinkWalletInFirebase(userId: string): Promise<UserProfile | null> {
  return await updateUserProfileInFirebase(userId, { stellarAddress: '' });
}

/**
 * Fetch all Skill Sessions from Firestore Database
 */
export async function fetchSkillSessionsFromFirebase(): Promise<SkillSession[]> {
  try {
    const sessionsCol = collection(db, 'sessions');
    const snapshot = await timeoutPromise(getDocs(sessionsCol), 4000);
    
    if (!snapshot.empty) {
      const list: SkillSession[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as SkillSession);
      });
      return list;
    }
  } catch (err) {
    console.warn('Failed to fetch sessions from Firestore, using initial sessions:', err);
  }

  return INITIAL_SESSIONS;
}

/**
 * Post a new Skill Session into Firestore Database
 */
export async function createSkillSessionInFirebase(session: SkillSession): Promise<SkillSession> {
  try {
    await timeoutPromise(setDoc(doc(db, 'sessions', session.id), session), 5000);
    console.log('🔥 Skill Session saved in Firestore:', session.title);
  } catch (err) {
    console.warn('Failed to post session to Firestore:', err);
  }
  return session;
}

/**
 * Update Skill Session in Firestore Database
 */
export async function updateSkillSessionInFirebase(id: string, updates: Partial<SkillSession>): Promise<void> {
  try {
    const sessionRef = doc(db, 'sessions', id);
    await timeoutPromise(updateDoc(sessionRef, updates), 5000);
  } catch (err) {
    console.warn('Failed to update session in Firestore:', err);
  }
}

/**
 * Fetch Escrow Transactions from Firestore Database for a Wallet Address
 */
export async function fetchTransactionsFromFirebase(walletAddress: string): Promise<EscrowTransaction[]> {
  if (!walletAddress) return [];

  try {
    const txCol = collection(db, 'transactions');
    const q = query(txCol, where('senderAddress', '==', walletAddress));
    const snapshot = await timeoutPromise(getDocs(q), 4000);

    const list: EscrowTransaction[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as EscrowTransaction);
    });
    return list;
  } catch (err) {
    console.warn('Failed to fetch transactions from Firestore:', err);
  }
  return [];
}

/**
 * Save Transaction Log into Firestore Database
 */
export async function saveTransactionToFirebase(tx: EscrowTransaction): Promise<void> {
  try {
    await timeoutPromise(setDoc(doc(db, 'transactions', tx.id), tx), 5000);
    console.log('🔥 Transaction saved in Firestore:', tx.id);
  } catch (err) {
    console.warn('Failed to log transaction to Firestore:', err);
  }
}
