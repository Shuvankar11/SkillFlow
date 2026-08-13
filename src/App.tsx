import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { WalletDashboard } from './components/WalletDashboard';
import { SessionGrid } from './components/SessionGrid';
import { CreateSessionModal } from './components/CreateSessionModal';
import { AcceptEscrowModal } from './components/AcceptEscrowModal';
import { FaucetModal } from './components/FaucetModal';
import { BadgePreviewModal } from './components/BadgePreviewModal';
import { TransactionHistoryDrawer } from './components/TransactionHistoryDrawer';
import { AuthModal } from './components/AuthModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ToastContainer } from './components/Toast';
import { ParticleBackground } from './components/ParticleBackground';
import { LiveTicker } from './components/LiveTicker';
import type { ToastMessage } from './components/Toast';
import type { SkillSession, WalletState, EscrowTransaction, UserProfile } from './types';
import { INITIAL_SESSIONS } from './data/initialSessions';
import { 
  checkFreighterInstalled, 
  connectFreighterWallet, 
  fetchAccountXlmBalance 
} from './services/stellarService';
import { 
  getWalletHistory, 
  addWalletHistoryItem,
  deleteHistoryItem,
  clearAllWalletHistory
} from './services/historyStorage';
import { 
  getCurrentUserProfile, 
  logoutUserProfile 
} from './services/userService';
import { 
  checkBackendHealth,
  fetchSkillSessionsFromMongo,
  createSkillSessionInMongo,
  updateSkillSessionInMongo,
  fetchTransactionsFromMongo,
  saveTransactionToMongo,
  deleteTransactionFromMongo,
  clearAllTransactionsFromMongo,
  linkWalletToUserAccount,
  unlinkWalletFromUserAccount
} from './services/apiService';
import { AlertTriangle, Database, ExternalLink } from 'lucide-react';

export function App() {
  // Logged-In User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getCurrentUserProfile());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Wallet State
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: '',
    xlmLiveBalance: '0.00 XLM',
    mstBalance: '0.0 MST',
    network: 'TESTNET',
    isFreighterAvailable: false,
  });

  // Sessions State
  const [sessions, setSessions] = useState<SkillSession[]>(INITIAL_SESSIONS);
  
  // Per-Wallet Escrow & Payment History
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);

  // Modal Visibility States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [acceptingSession, setAcceptingSession] = useState<SkillSession | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isFaucetModalOpen, setIsFaucetModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isMissingFreighterModalOpen, setIsMissingFreighterModalOpen] = useState(false);

  // Loading States & Toasts
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load: Check Freighter, backend health, load sessions
  useEffect(() => {
    checkFreighterInstalled().then((installed) => {
      setWallet((prev) => ({ ...prev, isFreighterAvailable: installed }));
    });

    checkBackendHealth().then(async () => {
      const dbSessions = await fetchSkillSessionsFromMongo();
      setSessions(dbSessions);
    });
  }, []);

  // Sync linked wallet balance if user has a linked wallet address
  useEffect(() => {
    if (userProfile?.stellarAddress && !wallet.isConnected) {
      fetchAccountXlmBalance(userProfile.stellarAddress).then((liveBal) => {
        setWallet({
          isConnected: true,
          address: userProfile.stellarAddress,
          xlmLiveBalance: liveBal,
          mstBalance: '0.0 MST',
          network: 'TESTNET',
          isFreighterAvailable: wallet.isFreighterAvailable,
        });

        fetchTransactionsFromMongo(userProfile.stellarAddress).then((mongoTxList) => {
          const userHistory = mongoTxList.length > 0 ? mongoTxList : getWalletHistory(userProfile.stellarAddress);
          setTransactions(userHistory);
        });
      });
    }
  }, [userProfile?.stellarAddress]);

  // Balance Refresh logic
  const refreshBalance = useCallback(async (targetAddr?: string) => {
    const addrToQuery = targetAddr || wallet.address;
    if (!addrToQuery) return;

    setIsRefreshingBalance(true);
    try {
      const liveBal = await fetchAccountXlmBalance(addrToQuery);
      setWallet((prev) => ({
        ...prev,
        xlmLiveBalance: liveBal,
      }));
    } catch (e) {
      console.warn("Failed balance refresh:", e);
    } finally {
      setIsRefreshingBalance(false);
    }
  }, [wallet.address]);

  // Connect Freighter Wallet Handler & Link to User Account
  const handleConnectWallet = async () => {
    // If not logged in, prompt user to log in or create an account first
    if (!userProfile) {
      setAuthModalInitialMode('login');
      setIsAuthModalOpen(true);
      addToast('warning', 'Please Log In or Create an Account first! You can then link any wallet to your account.');
      return;
    }

    const isInstalled = await checkFreighterInstalled();
    if (!isInstalled) {
      setIsMissingFreighterModalOpen(true);
      addToast('warning', 'Freighter Wallet extension is not detected in your browser.');
      return;
    }

    try {
      const { address, network } = await connectFreighterWallet();
      const liveBal = await fetchAccountXlmBalance(address);

      // Link wallet to logged in user account in Firebase
      const updatedProfile = await linkWalletToUserAccount(userProfile.id, address);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }

      setWallet({
        isConnected: true,
        address,
        xlmLiveBalance: liveBal,
        mstBalance: '0.0 MST',
        network: network || 'TESTNET',
        isFreighterAvailable: true,
      });

      // Fetch transaction history for this connected wallet
      const mongoTxList = await fetchTransactionsFromMongo(address);
      const userHistory = mongoTxList.length > 0 ? mongoTxList : getWalletHistory(address);
      setTransactions(userHistory);

      addToast('success', `Stellar Wallet (${address.slice(0, 4)}...${address.slice(-4)}) linked to @${userProfile.username}!`);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      addToast('error', error.message || 'Failed to connect Freighter wallet.');
    }
  };

  // Demo Mode Connection Helper (for instant testing)
  const handleDemoConnect = async () => {
    if (!userProfile) {
      setIsMissingFreighterModalOpen(false);
      setAuthModalInitialMode('login');
      setIsAuthModalOpen(true);
      addToast('warning', 'Please Log In or Create an Account first!');
      return;
    }

    const demoAddr = 'GA7Q3Z8X9K2P4M6W1V5T9L0N3E7C4B2A8D9F0E1C';
    const liveBal = await fetchAccountXlmBalance(demoAddr);

    setIsMissingFreighterModalOpen(false);

    // Link demo wallet to logged in user profile
    const updatedProfile = await linkWalletToUserAccount(userProfile.id, demoAddr);
    if (updatedProfile) {
      setUserProfile(updatedProfile);
    }

    setWallet({
      isConnected: true,
      address: demoAddr,
      xlmLiveBalance: liveBal,
      mstBalance: '0.0 MST',
      network: 'TESTNET (Demo)',
      isFreighterAvailable: false,
    });

    const mongoTxList = await fetchTransactionsFromMongo(demoAddr);
    const demoHistory = mongoTxList.length > 0 ? mongoTxList : getWalletHistory(demoAddr);
    setTransactions(demoHistory);

    addToast('success', `Demo Wallet linked to account ${userProfile.fullName}!`);
  };

  // Unlink Wallet from Account
  const handleUnlinkWallet = async () => {
    if (userProfile?.id) {
      const updatedProfile = await unlinkWalletFromUserAccount(userProfile.id);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
    }

    setWallet({
      isConnected: false,
      address: '',
      xlmLiveBalance: '0.00 XLM',
      mstBalance: '0.0 MST',
      network: 'TESTNET',
      isFreighterAvailable: wallet.isFreighterAvailable,
    });
    setTransactions([]);
    addToast('info', 'Wallet unlinked from your account.');
  };

  // Account Logged In / Registered Handler
  const handleProfileCreatedOrLoggedIn = (profile: UserProfile) => {
    setUserProfile(profile);
    addToast('success', `Welcome, ${profile.fullName}! You are logged into your SkillFlow account.`);
  };

  // Logout Account
  const handleLogoutAccount = () => {
    logoutUserProfile();
    setUserProfile(null);
    setWallet({
      isConnected: false,
      address: '',
      xlmLiveBalance: '0.00 XLM',
      mstBalance: '0.0 MST',
      network: 'TESTNET',
      isFreighterAvailable: wallet.isFreighterAvailable,
    });
    setTransactions([]);
    addToast('info', 'Logged out of account.');
  };

  // Delete single history item
  const handleDeleteHistoryItem = async (id: string) => {
    const targetAddress = wallet.address || 'demo';
    const updatedMongo = await deleteTransactionFromMongo(targetAddress, id);
    const updated = updatedMongo.length > 0 ? updatedMongo : deleteHistoryItem(targetAddress, id);
    setTransactions(updated);
    addToast('info', 'Transaction deleted from payment history.');
  };

  // Clear all history
  const handleClearAllHistory = async () => {
    const targetAddress = wallet.address || 'demo';
    await clearAllTransactionsFromMongo(targetAddress);
    clearAllWalletHistory(targetAddress);
    setTransactions([]);
    addToast('info', 'All payment history cleared successfully.');
  };

  // Post Session Handler
  const handleCreateSession = async (newSessionData: Omit<SkillSession, 'id' | 'createdAt' | 'status'>) => {
    if (!userProfile) {
      setAuthModalInitialMode('login');
      setIsAuthModalOpen(true);
      addToast('warning', 'Please log in to your account to post a skill session!');
      return;
    }

    const newSession: SkillSession = {
      ...newSessionData,
      id: `sf-${Date.now()}`,
      creatorName: userProfile.fullName,
      creatorAvatar: userProfile.avatarUrl,
      creatorAddress: wallet.address || userProfile.stellarAddress || 'UNLINKED_WALLET',
      createdAt: new Date().toISOString(),
      status: 'OPEN',
    };

    await createSkillSessionInMongo(newSession);
    setSessions((prev) => [newSession, ...prev]);

    if (wallet.address) {
      const mentorHistoryItem: EscrowTransaction = {
        id: `tx-offer-${Date.now()}`,
        sessionId: newSession.id,
        sessionTitle: newSession.title,
        category: newSession.category,
        amountXlm: newSession.feeXlm,
        txHash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
        explorerUrl: `https://stellar.expert/explorer/testnet`,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'PAYMENT_SUCCESSFUL',
        userRole: 'MENTOR',
        senderAddress: wallet.address,
        recipientAddress: 'ESCROW_VAULT',
        payerName: userProfile.fullName,
        durationMinutes: newSession.durationMinutes,
      };

      await saveTransactionToMongo(mentorHistoryItem);
      const updatedHistory = addWalletHistoryItem(wallet.address, mentorHistoryItem);
      setTransactions(updatedHistory);
    }

    addToast('success', `Skill Session "${newSession.title}" saved in Firebase & published by ${userProfile.fullName}!`);
  };

  // Accept Session Trigger
  const handleOpenAcceptModal = (session: SkillSession) => {
    if (!userProfile) {
      setAuthModalInitialMode('login');
      setIsAuthModalOpen(true);
      addToast('warning', 'Please log in to your account first.');
      return;
    }
    if (!wallet.isConnected) {
      addToast('warning', 'Please connect a Stellar wallet to your account to escrow XLM for this session.');
      handleConnectWallet();
      return;
    }
    setAcceptingSession(session);
    setIsAcceptModalOpen(true);
  };

  // Escrow Lock & Payment Success Handler
  const handleConfirmEscrowSuccess = async (updatedSession: SkillSession, escrowTx: EscrowTransaction) => {
    const updatedTx: EscrowTransaction = {
      ...escrowTx,
      payerName: userProfile?.fullName || 'Stellar Learner',
    };

    await updateSkillSessionInMongo(updatedSession.id, {
      status: 'IN_ESCROW',
      escrowTxHash: updatedTx.txHash,
      acceptedByAddress: wallet.address,
      acceptedByName: userProfile?.fullName,
    });

    setSessions((prev) =>
      prev.map((s) =>
        s.id === updatedSession.id
          ? { 
              ...s, 
              status: 'IN_ESCROW', 
              escrowTxHash: updatedTx.txHash, 
              acceptedByAddress: wallet.address,
              acceptedByName: userProfile?.fullName
            }
          : s
      )
    );

    await saveTransactionToMongo(updatedTx);

    if (wallet.address) {
      const updatedHistory = addWalletHistoryItem(wallet.address, updatedTx);
      setTransactions(updatedHistory);
    } else {
      setTransactions((prev) => [updatedTx, ...prev]);
    }

    refreshBalance();
    addToast('success', `Payment Successful! ${updatedTx.amountXlm} XLM locked into SkillFlow Vault & saved to Firebase!`);
  };

  const totalEscrowXlm = transactions.reduce((acc, tx) => acc + tx.amountXlm, 0);

  return (
    <div className="min-h-screen bg-cyber-mesh relative flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Dynamic Cosmic Particle Background Canvas */}
      <ParticleBackground />

      {/* Top Live Protocol Telemetry Ticker */}
      <LiveTicker />

      {/* Firebase Cloud Telemetry Banner */}
      <div className="bg-[#040814] border-b border-cyan-500/20 px-4 py-1.5 text-[11px] font-tech text-slate-300 flex items-center justify-between z-40">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">🔥</span>
            <span className="font-bold text-white">Firebase Cloud Engine:</span>
            <span className="text-emerald-400 font-mono font-bold">
              CONNECTED (Auth + Cloud Firestore 24/7)
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>Email/Password Auth + Independent Web3 Wallet Linking</span>
            <span>•</span>
            <span className="text-cyan-300 font-mono">Firebase SDK Live</span>
          </div>
        </div>
      </div>

      {/* AntiGravity Header Navbar */}
      <Navbar
        wallet={wallet}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleUnlinkWallet}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenFaucetModal={() => setIsFaucetModalOpen(true)}
        onOpenHistoryDrawer={() => setIsHistoryDrawerOpen(true)}
        onOpenBadgesModal={() => setIsBadgesModalOpen(true)}
        historyCount={transactions.length}
        userProfile={userProfile}
        onOpenAuthModal={() => {
          setAuthModalInitialMode(userProfile ? 'signup' : 'login');
          setIsAuthModalOpen(true);
        }}
        onOpenEditProfileModal={() => setIsEditProfileModalOpen(true)}
        onLogoutProfile={handleLogoutAccount}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 relative z-10">
        
        {/* AntiGravity Hero Control Center */}
        <WalletDashboard
          wallet={wallet}
          onRefreshBalance={() => refreshBalance()}
          onOpenFaucetModal={() => setIsFaucetModalOpen(true)}
          totalActiveSessions={sessions.filter((s) => s.status === 'OPEN').length}
          totalEscrowXlm={totalEscrowXlm}
          isRefreshing={isRefreshingBalance}
        />

        {/* Dynamic Skill Session Marketplace */}
        <SessionGrid
          sessions={sessions}
          onAcceptSession={handleOpenAcceptModal}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          connectedAddress={wallet.address}
        />

      </main>

      {/* High-End Enterprise Protocol Footer */}
      <footer className="border-t border-cyan-500/15 bg-[#03050c]/95 backdrop-blur-2xl py-8 text-slate-400 text-xs mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white font-tech text-sm">SkillFlow Protocol + Firebase Cloud</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-tech">Decentralized Verifiable Mentorship & Smart Escrow Vault</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-tech text-slate-400">
            <a href="https://horizon-testnet.stellar.org" target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition-colors">
              Stellar Horizon RPC
            </a>
            <span>•</span>
            <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition-colors">
              Freighter Wallet
            </a>
            <span>•</span>
            <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="hover:text-cyan-300 transition-colors">
              Stellar Expert Explorer
            </a>
          </div>

        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      
      {/* Account Registration & Login Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onProfileCreated={handleProfileCreatedOrLoggedIn}
        initialMode={authModalInitialMode}
      />

      {/* Edit Profile & Change DP Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdated={(updatedUser) => {
          setUserProfile(updatedUser);
          addToast('success', 'Profile DP & details updated successfully in Firebase!');
        }}
      />

      {/* Post Session Modal */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitSession={handleCreateSession}
        connectedAddress={wallet.address}
      />

      {/* Escrow Confirmation & Receipt Modal */}
      <AcceptEscrowModal
        session={acceptingSession}
        isOpen={isAcceptModalOpen}
        onClose={() => {
          setIsAcceptModalOpen(false);
          setAcceptingSession(null);
        }}
        onConfirmEscrowSuccess={handleConfirmEscrowSuccess}
        connectedAddress={wallet.address}
      />

      {/* Testnet Friendbot Faucet Modal */}
      <FaucetModal
        isOpen={isFaucetModalOpen}
        onClose={() => setIsFaucetModalOpen(false)}
        connectedAddress={wallet.address}
        onFundingSuccess={() => refreshBalance()}
      />

      {/* Verifiable Credentials Showcase Modal */}
      <BadgePreviewModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
      />

      {/* Transaction & Skill History Drawer */}
      <TransactionHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        transactions={transactions}
        connectedAddress={wallet.address}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearAllHistory={handleClearAllHistory}
      />

      {/* Missing Freighter Extension Fallback Modal */}
      {isMissingFreighterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05070f]/85 backdrop-blur-xl">
          <div className="w-full max-w-md bg-[#090e1a] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-white font-tech">Freighter Extension Required</h3>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Freighter is the official wallet extension for interacting with Stellar Testnet. Install it to sign transactions securely.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase font-tech flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
              >
                <span>Install Freighter Extension</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleDemoConnect}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-bold text-xs font-tech"
              >
                Or Link Demo Wallet (GA7Q...0E1C)
              </button>

              <button
                onClick={() => setIsMissingFreighterModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-300 pt-1 font-tech"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cyber Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}

export default App;
