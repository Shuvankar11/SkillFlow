# 🌌 SkillFlow - Decentralized Verifiable Mentorship & Skill Transfer Network

> **Empowering global developers through trustless peer-to-peer skill transfers, zero-risk Stellar testnet escrows, and verifiable proof receipts.**

---

## 📖 About SkillFlow

**SkillFlow** is a Web3 peer-to-peer mentorship and knowledge transfer platform built on the **Stellar Testnet**. It bridges the gap between skill seekers and expert mentors by combining interactive learning request feeds with cryptographic, zero-risk smart escrows on the Stellar blockchain.

### 💡 How SkillFlow Works

1. **User Authentication & Profile Setup:** Users log in or register an account with a custom avatar, bio, and role preferences (Learner, Mentor, or Both).
2. **Freighter Wallet Integration:** Connect your **Stellar Freighter Wallet** to authorize transactions on the Stellar Testnet safely.
3. **Session Discovery & Posting:** Browse available skill sessions or create new "Offer to Teach" / "Request to Learn" listings specifying skill category, duration, and XLM fee.
4. **Smart Escrow Locking:** When accepting a session, native XLM tokens are locked into a secure escrow vault on Stellar Testnet.
5. **Verifiable Proof Receipts:** Once confirmed, a 64-character transaction hash and verifiable receipt are generated with direct verification links on **Stellar Expert Explorer**.

---

## ✨ Core Architecture & Features

### 1. 👛 Freighter Wallet Integration
- **Stellar Testnet Protocol:** Built natively with `@stellar/freighter-api` targeting the Stellar Testnet.
- **One-Click Authorization:** Fast wallet connect & disconnect state management.
- **Public Key Presentation:** Clean navigation bar indicator displaying truncated public key (`GABC...3X9A`) with copy-to-clipboard functionality.

### 2. 📊 Real-Time Horizon Balance Sync
- **Live Horizon API Integration:** Queries `https://horizon-testnet.stellar.org/accounts/{publicKey}` for real-time XLM balances.
- **Dynamic Balance Cards:** Displays live XLM balance alongside testnet MST token indicators.
- **Friendbot Faucet Access:** Integrated modal connecting directly to Stellar Friendbot (`https://friendbot.stellar.org`) to fund testnet wallets with 10,000 XLM.

### 3. 🛡️ Smart Escrow Transaction Protocol
- **Stellar Testnet Transaction Assembly:** Assembles and submits payment transactions via `@stellar/stellar-sdk` and `@stellar/freighter-api`.
- **Live Visual Feedback:** Step-by-step progress indicator for signature validation, payload construction, and Horizon core broadcasting.
- **Audit & Explorer Link:** Generates transaction hash receipt with direct verification on **Stellar Expert Explorer** (`https://stellar.expert/explorer/testnet/tx/{txHash}`).

### 4. 👤 Account & Profile Management
- **User Account Service:** Mandatory account registration before wallet linking.
- **Custom Profile Avatars:** Allows users to choose custom profile picture URLs or select default avatars.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend Core:** React 19, TypeScript, Vite 8
- **Styling & Aesthetics:** Tailwind CSS v4, Vanilla Glassmorphism CSS, Framer Motion
- **Web3 Ecosystem:** `@stellar/freighter-api` (v6.0), `@stellar/stellar-sdk` (v16.2)
- **Icons & UI:** Lucide-React, Canvas Confetti

---

## 🚀 Local Setup & Installation Instructions

Follow these simple steps to run **SkillFlow** on your local machine:

### Prerequisites
1. **Node.js** (v18.0.0 or higher)
2. **NPM** or **Yarn** package manager
3. **Freighter Wallet** browser extension ([Download Freighter](https://www.freighter.app/)) set to **Testnet** network.

### 1. Clone the Repository
```bash
git clone https://github.com/Shuvankar11/SkillFlow.git
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

## 📷 Application Verification Screenshots

Below are the application screenshots demonstrating full functionality:

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
├── public/                  # Static assets & screenshots
│   └── screenshots/         # Submission verification images
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
├── LICENSE                  # Open-source MIT License
└── README.md
```

---

## 📜 License

This project is open-source software licensed under the [MIT License](LICENSE). Built for the Stellar Ecosystem.

