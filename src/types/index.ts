export type SessionType = 'OFFER' | 'REQUEST';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type SessionStatus = 'OPEN' | 'IN_ESCROW' | 'COMPLETED';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'Learner' | 'Mentor' | 'Both';
  bio: string;
  avatarUrl: string;
  stellarAddress: string;
  createdAt: string;
}

export interface SkillSession {
  id: string;
  type: SessionType;
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  feeXlm: number;
  creatorAddress: string;
  creatorName: string;
  creatorAvatar: string;
  level: SkillLevel;
  tags: string[];
  status: SessionStatus;
  createdAt: string;
  escrowTxHash?: string;
  acceptedByAddress?: string;
  acceptedByName?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string;
  xlmLiveBalance: string;
  mstBalance: string;
  network: string;
  isFreighterAvailable: boolean;
  error?: string;
}

export interface EscrowTransaction {
  id: string;
  sessionId: string;
  sessionTitle: string;
  category?: string;
  amountXlm: number;
  txHash: string;
  explorerUrl: string;
  timestamp: string;
  formattedDate?: string;
  status: 'PAYMENT_SUCCESSFUL' | 'LOCKED_IN_ESCROW' | 'RELEASED' | 'REFUNDED';
  userRole?: 'LEARNER' | 'MENTOR';
  senderAddress: string;
  recipientAddress: string;
  counterpartyName?: string;
  counterpartyAvatar?: string;
  durationMinutes?: number;
  payerName?: string;
}

export type FilterType = 'ALL' | 'OFFER' | 'REQUEST';
