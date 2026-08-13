import type { EscrowTransaction } from '../types';

const STORAGE_PREFIX = 'skillflow_user_history_';

/**
 * Retrieve user session booking history for a specific wallet address.
 * Starts empty ([]) for new wallets so only actual payments appear.
 */
export function getWalletHistory(address: string): EscrowTransaction[] {
  if (!address || address.trim() === '') return [];

  const key = `${STORAGE_PREFIX}${address.trim().toLowerCase()}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse wallet history from localStorage:', e);
  }

  return [];
}

/**
 * Save history array for a given wallet address
 */
export function saveWalletHistory(address: string, history: EscrowTransaction[]): void {
  if (!address || address.trim() === '') return;
  const key = `${STORAGE_PREFIX}${address.trim().toLowerCase()}`;
  try {
    localStorage.setItem(key, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save wallet history to localStorage:', e);
  }
}

/**
 * Add a new booked session / escrow item to the specific wallet history
 */
export function addWalletHistoryItem(address: string, newItem: EscrowTransaction): EscrowTransaction[] {
  const current = getWalletHistory(address);
  // Avoid duplicate transaction IDs or hashes
  const exists = current.some((item) => item.id === newItem.id || item.txHash === newItem.txHash);
  if (exists) return current;

  const updated = [newItem, ...current];
  saveWalletHistory(address, updated);
  return updated;
}

/**
 * Delete a single history item by ID for a specific wallet
 */
export function deleteHistoryItem(address: string, itemId: string): EscrowTransaction[] {
  const current = getWalletHistory(address);
  const updated = current.filter((item) => item.id !== itemId);
  saveWalletHistory(address, updated);
  return updated;
}

/**
 * Clear all history items for a specific wallet
 */
export function clearAllWalletHistory(address: string): EscrowTransaction[] {
  if (!address || address.trim() === '') return [];
  const key = `${STORAGE_PREFIX}${address.trim().toLowerCase()}`;
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('Failed to clear history from localStorage:', e);
  }
  return [];
}
