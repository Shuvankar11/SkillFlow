# 🌌 SkillFlow - Decentralized Verifiable Mentorship & Skill Transfer Network

> **Level 1 - White Belt Submission** for Stellar Testnet Ecosystem Hackathon.

SkillFlow is an ultra-modern, Web3 peer-to-peer mentorship and skill exchange protocol built on the **Stellar Testnet**. It enables developers, designers, and mentors to schedule skill transfer sessions, lock payment into zero-risk smart escrows, and mint verifiable proof receipts upon completion.

---

## ✨ Key Features & Level 1 Requirements

### 1. 👛 Freighter Wallet Integration & Setup
- **Stellar Testnet Connection:** Full integration with the `@stellar/freighter-api` library targeting the Stellar Testnet.
- **Wallet Connect & Disconnect:** Seamless one-click wallet authorization and safe disconnect state management.
- **Truncated Public Key:** Clean navigation bar indicator displaying truncated Stellar public address (e.g., `GABC...3X9A`) with copy-to-clipboard functionality.

### 2. 📊 Real-Time Horizon Balance Handling
- **Stellar Horizon API Sync:** Fetches real-time XLM balances directly from `https://horizon-testnet.stellar.org/accounts/{publicKey}`.
- **Live Dashboard Card:** Clear visual presentation of native XLM live balances alongside testnet token badges.
- **Friendbot Faucet Integration:** Integrated 10,000 testnet XLM faucet modal connected directly to Stellar Friendbot (`https://friendbot.stellar.org`).

### 3. 🛡️ Smart Escrow Transaction Flow
- **Stellar Testnet Payment Execution:** Assembles and submits payment transactions via `@stellar/stellar-sdk` and `@stellar/freighter-api`.
- **Live Micro-loading Feedback:** Step-by-step progress indicator for signature validation, payload construction, and Horizon core broadcasting.
- **Instant Result & Receipt:** Displays 64-character transaction hash receipt, copy button, and direct link to **Stellar Expert Testnet Explorer** (`https://stellar.expert/explorer/testnet/tx/{txHash}`).

### 4. 👤 Account & Profile Management
- **MongoDB / Storage User Service:** Mandatory user account creation before wallet linking.
- **Custom Avatar & Bio:** Allows users to choose custom profile pictures or select high-res avatars.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend Core:** React 19, TypeScript, Vite 8
- **Styling & Aesthetics:** Tailwind CSS v4, Vanilla Glassmorphism CSS, Framer Motion
- **Web3 Ecosystem:** `@stellar/freighter-api` (v6.0), `@stellar/stellar-sdk` (v16.2)
- **Icons & Polish:** Lucide-React, Canvas Confetti

---

## 🚀 Local Setup & Installation Instructions

Follow these simple steps to run **SkillFlow** on your local machine:

### Prerequisites
1. Node.js (v18.0.0 or higher)
2. NPM or Yarn package manager
3. **Freighter Wallet** browser extension ([Download Freighter](https://www.freighter.app/)) set to **Testnet** network.

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd SkillFlow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## 📷 Submission Screenshots & Verification Proofs

Below are the required screenshots demonstrating full compliance with the White Belt Level 1 submission criteria:

### 1. 🔌 Wallet Connected State
> Displays Freighter wallet authorization state, truncated public address in navbar, and account profile status.

![Wallet Connected State](public/screenshots/wallet-connected.png)

---

### 2. 💰 XLM Balance Displayed
> Live XLM balance fetched directly from Stellar Horizon Testnet API rendered inside the main Wallet Dashboard card.

![Balance Displayed](public/screenshots/balance-displayed.png)

---

### 3. ⚡ Successful Testnet Transaction
> Transaction flow modal showing signature confirmation and XLM locking operation on Stellar Testnet.

![Successful Testnet Transaction](public/screenshots/testnet-transaction.png)

---

### 4. 🧾 Transaction Result Shown to User
> Final confirmation receipt modal displaying the generated transaction hash, copy tool, and link to Stellar Expert Explorer.

![Transaction Result](public/screenshots/transaction-result.png)

---

## 📁 Repository Structure

```
SkillFlow/
├── public/                  # Static assets & submission screenshots
├── src/
│   ├── components/          # Cyber-Cosmic UI components
│   │   ├── AcceptEscrowModal.tsx       # Transaction flow & feedback modal
│   │   ├── AuthModal.tsx               # Registration & user login
│   │   ├── CreateSessionModal.tsx      # Post skill offer/request
│   │   ├── FaucetModal.tsx             # Friendbot XLM testnet faucet
│   │   ├── Navbar.tsx                  # Wallet connection status bar
│   │   ├── SessionGrid.tsx             # Filterable mentorship feed
│   │   ├── TransactionHistoryDrawer.tsx # Payment audit trail log
│   │   └── WalletDashboard.tsx         # Real-time XLM balance display
│   ├── data/                # Initial mock sessions
│   ├── services/            # Web3 & database integration
│   │   ├── historyStorage.ts           # History persistent storage
│   │   ├── stellarService.ts           # Freighter API & Horizon SDK
│   │   └── userService.ts              # User account profiles
│   ├── types/               # TypeScript interfaces
│   ├── App.tsx              # Main Application orchestrator
│   ├── main.tsx             # React DOM entry point
│   └── index.css            # Cyber-Cosmic CSS Design Tokens
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📜 License & Compliance

Submitted for the **Stellar Testnet Ecosystem Hackathon (White Belt Level 1)**. Free for use under the MIT License.
