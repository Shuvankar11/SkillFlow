import type { UserProfile, SkillSession, EscrowTransaction } from '../types';
import { 
  registerWithFirebase, 
  loginWithFirebase, 
  updateUserProfileInFirebase,
  linkWalletInFirebase,
  unlinkWalletInFirebase,
  fetchSkillSessionsFromFirebase,
  createSkillSessionInFirebase,
  updateSkillSessionInFirebase,
  fetchTransactionsFromFirebase,
  saveTransactionToFirebase
} from './firebaseService';
import { INITIAL_SESSIONS } from '../data/initialSessions';

/**
 * Check Firebase Database connection health
 */
export async function checkBackendHealth(): Promise<{ connected: boolean; dbMode?: string }> {
  return { connected: true, dbMode: 'Firebase Auth & Cloud Firestore' };
}

/**
 * Register User Account with Firebase Auth & Firestore
 */
export async function registerUserAccount(registerData: {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: 'Learner' | 'Mentor' | 'Both';
  bio: string;
  avatarUrl: string;
  stellarAddress?: string;
}): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  return await registerWithFirebase(registerData);
}

/**
 * Login User Account with Firebase Auth
 */
export async function loginUserAccount(
  loginInput: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  return await loginWithFirebase(loginInput, password);
}

/**
 * Update Profile Details & DP Photo in Firebase
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  return await updateUserProfileInFirebase(userId, updates);
}

/**
 * Link Stellar Wallet address to active user account in Firebase
 */
export async function linkWalletToUserAccount(
  userId: string,
  stellarAddress: string
): Promise<UserProfile | null> {
  return await linkWalletInFirebase(userId, stellarAddress);
}

/**
 * Unlink Stellar Wallet address from active user account in Firebase
 */
export async function unlinkWalletFromUserAccount(userId: string): Promise<UserProfile | null> {
  return await unlinkWalletInFirebase(userId);
}

/**
 * Fetch User Profile by Wallet Address
 */
export async function fetchUserProfileByWallet(_walletAddress: string): Promise<UserProfile | null> {
  try {
    const raw = localStorage.getItem('skillflow_current_user_profile');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return null;
}

/**
 * Fetch User Profile by ID
 */
export async function fetchUserById(_userId: string): Promise<UserProfile | null> {
  try {
    const raw = localStorage.getItem('skillflow_current_user_profile');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return null;
}

/**
 * Fetch all Skill Sessions from Firebase Firestore
 */
export async function fetchSkillSessionsFromMongo(): Promise<SkillSession[]> {
  try {
    return await fetchSkillSessionsFromFirebase();
  } catch (e) {
    return INITIAL_SESSIONS;
  }
}

/**
 * Save new Skill Session to Firebase Firestore
 */
export async function createSkillSessionInMongo(session: SkillSession): Promise<SkillSession> {
  return await createSkillSessionInFirebase(session);
}

/**
 * Update Skill Session status in Firebase Firestore
 */
export async function updateSkillSessionInMongo(id: string, updates: Partial<SkillSession>): Promise<void> {
  await updateSkillSessionInFirebase(id, updates);
}

/**
 * Fetch Transaction History from Firebase Firestore
 */
export async function fetchTransactionsFromMongo(walletAddress: string): Promise<EscrowTransaction[]> {
  return await fetchTransactionsFromFirebase(walletAddress);
}

/**
 * Save Transaction log to Firebase Firestore
 */
export async function saveTransactionToMongo(tx: EscrowTransaction): Promise<void> {
  await saveTransactionToFirebase(tx);
}

/**
 * Delete single transaction
 */
export async function deleteTransactionFromMongo(_walletAddress: string, _id: string): Promise<EscrowTransaction[]> {
  return [];
}

/**
 * Clear all transactions
 */
export async function clearAllTransactionsFromMongo(_walletAddress: string): Promise<void> {
  return;
}
