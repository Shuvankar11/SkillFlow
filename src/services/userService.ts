import type { UserProfile } from '../types';

const USER_STORAGE_KEY = 'skillflow_current_user_profile';
const USERS_DB_KEY = 'skillflow_mongodb_users_collection';

export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
];

/**
 * Get active user profile
 */
export function getCurrentUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse current user profile:', e);
  }
  return null;
}

/**
 * Register or update user account profile
 */
export function saveUserProfile(profile: UserProfile): void {
  try {
    // Save as active profile
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));

    // Save into simulated MongoDB Users collection
    const dbRaw = localStorage.getItem(USERS_DB_KEY);
    let db: UserProfile[] = dbRaw ? JSON.parse(dbRaw) : [];
    const index = db.findIndex((u) => u.id === profile.id || u.stellarAddress === profile.stellarAddress);

    if (index >= 0) {
      db[index] = profile;
    } else {
      db.push(profile);
    }
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('Failed to save user profile:', e);
  }
}

/**
 * Create a new user profile document
 */
export function createUserProfile(data: {
  fullName: string;
  username: string;
  email: string;
  role: 'Learner' | 'Mentor' | 'Both';
  bio: string;
  avatarUrl: string;
  stellarAddress: string;
}): UserProfile {
  const profile: UserProfile = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    fullName: data.fullName.trim(),
    username: data.username.trim().startsWith('@') ? data.username.trim() : `@${data.username.trim()}`,
    email: data.email.trim(),
    role: data.role,
    bio: data.bio.trim() || 'SkillFlow Web3 Peer Mentorship Protocol Member',
    avatarUrl: data.avatarUrl || DEFAULT_AVATARS[0],
    stellarAddress: data.stellarAddress || '',
    createdAt: new Date().toISOString(),
  };

  saveUserProfile(profile);
  return profile;
}

/**
 * Log out user profile
 */
export function logoutUserProfile(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to logout user profile:', e);
  }
}
