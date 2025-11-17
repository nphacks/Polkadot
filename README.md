# HistoryDAO

A decentralized application built on Polkadot that lets communities collaboratively record history. Submit historical events, vote on their accuracy, and watch as consensus automatically sorts them into three timelines: widely accepted facts, ongoing debates, and alternative theories.

## 🌟 Features

- **Three-Timeline System**: Events automatically categorize based on community consensus
  - **Canonical** (≥75% support): Widely accepted historical facts
  - **Disputed** (26-74% support): Events under active debate
  - **Alternative** (≤25% support): Fringe theories and alternative interpretations
- **Community Voting**: Vote to support or challenge any historical event
- **Event Tagging**: Organize events by categories (Science, Politics, Space, Culture, etc.)
- **Unified Timeline View**: See all events together or filter by timeline type
- **Evidence-Based**: All events require supporting sources
- **Immutable Records**: Everything stored permanently on-chain
- **Wallet Integration**: Secure authentication via Polkadot.js extension
- **Dark Mode**: Full theme support with professional blue color scheme

## 🏗️ Tech Stack

**Smart Contract:** ink! 4.x (Rust) on Substrate Contracts Node  
**Frontend:** React + TypeScript + Vite + TailwindCSS  
**Blockchain:** Polkadot.js API + Polkadot.js Extension

## 🚀 Quick Start

For experienced developers who want to get running fast:

```bash
# 1. Install Rust + cargo-contract + substrate-contracts-node
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown
rustup component add rust-src
cargo install cargo-contract --version 3.2.0 --force
cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git --force

# 2. Clone and install dependencies
git clone <your-repo-url>
cd historydao
cd frontend && npm install
cd ../contract && npm install  # Optional, for testing
cd ..

# 3. Start blockchain (Terminal 1)
substrate-contracts-node --dev --tmp

# 4. Build and deploy contract (Terminal 2)
cd contract
cargo contract build
cargo contract instantiate --constructor new --suri //Alice --skip-confirm -x
# Copy the contract address from output

# 5. (Optional) Seed test events
node seed-events.js
# Adds 17 Space Race events for immediate testing

# 6. Configure frontend
# Update frontend/src/config/contract.ts with your contract address

# 7. Start frontend (Terminal 3)
cd frontend
npm run dev
# Visit http://localhost:5173
```

## � Detailed Setup Guide

First time with blockchain or Polkadot? Follow these step-by-step instructions.

### Prerequisites

You'll need to install these tools before starting:

#### 1. Install Rust and Cargo

Rust is required for building the smart contract.

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow prompts and select default installation
# Restart your terminal or run:
source $HOME/.cargo/env

# Add WebAssembly target (required for smart contracts)
rustup target add wasm32-unknown-unknown
rustup component add rust-src

# Verify installation
rustc --version
cargo --version
```

#### 2. Install cargo-contract

This tool compiles and deploys ink! smart contracts.

```bash
cargo install cargo-contract --version 3.2.0 --force

# Verify installation (should show 3.2.0)
cargo contract --version
```

#### 3. Install Substrate Contracts Node

This provides a local blockchain for development.

```bash
cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git --force

# This takes 10-15 minutes to compile
```

#### 4. Install Node.js

You need Node.js v18 or higher.

```bash
# Check your version
node --version

# If you need to install/update, visit: https://nodejs.org/
```

#### 5. Install Polkadot.js Browser Extension

- Visit [polkadot.js.org/extension](https://polkadot.js.org/extension/)
- Install the extension for your browser
- Create or import an account
- You'll use this to connect your wallet to the app

### Installation Steps

#### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd historydao
```

#### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

#### Step 3: Install Contract Testing Dependencies (Optional)

Only needed if you want to run test scripts:

```bash
cd ../contract
npm install
```

#### Step 4: Build the Smart Contract

```bash
cd contract
cargo contract build
```

This compiles the contract and creates files in `target/ink/`.

### Running the Application

You'll need three terminal windows open:

#### Terminal 1: Start the Blockchain

```bash
substrate-contracts-node --dev --tmp
```

Keep this running. You should see blocks being produced. The node runs on `ws://127.0.0.1:9944`.

#### Terminal 2: Deploy the Contract

```bash
cd contract
cargo contract instantiate --constructor new --suri //Alice --skip-confirm -x
```

**Important:** Copy the contract address from the output. It looks like:
```
Contract 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
```

**Optional but Recommended:** Seed the blockchain with 17 test events from the Space Race era:

```bash
node seed-events.js
```

This automatically adds historical events (Sputnik, Gagarin, Apollo 11, etc.) so you can immediately test voting and timeline features without manually creating events.

#### Terminal 3: Configure and Start Frontend

1. Update the contract address in `frontend/src/config/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
```

2. Start the development server:

```bash
cd frontend
npm run dev
```

3. Open your browser to `http://localhost:5173`

### First-Time Usage

1. **Connect Your Wallet**
   - Click "Connect Wallet" in the top right
   - Select your Polkadot.js account
   - Authorize the connection

2. **Submit Your First Event**
   - Click "Submit Event"
   - Fill in: title, date, description, evidence sources, and tags
   - Submit and confirm the transaction
   - Your event appears in the Disputed timeline

3. **Vote on Events**
   - Browse any timeline
   - Click an event to view details
   - Vote "Support" or "Challenge"
   - Watch the consensus score update

## 📖 How to Use HistoryDAO

### Submitting Events

1. Connect your wallet
2. Click "Submit Event" in navigation
3. Fill in the form:
   - **Title**: Short name for the event
   - **Date**: When it occurred
   - **Description**: Detailed information
   - **Evidence**: URLs or references to sources
   - **Tags**: Select 1-5 categories (Science, Politics, Space, etc.)
4. Submit and confirm transaction
5. Event appears in Disputed timeline

### Voting on Events

1. Browse events in any timeline
2. Click an event to see full details
3. Review evidence and description
4. Click "Support" (agree it happened) or "Challenge" (disagree)
5. Confirm transaction
6. Consensus score updates automatically

### Understanding Timelines

Events move automatically based on votes:

- **Canonical Timeline**: ≥75% support (green) - Widely accepted facts
- **Disputed Timeline**: 26-74% support (yellow) - Under debate
- **Alternative Timeline**: ≤25% support (red) - Fringe theories

### Filtering and Navigation

- **All Events**: See everything together in chronological order
- **Individual Timelines**: Filter by Canonical, Disputed, or Alternative
- **Tag Filters**: Click tags to filter by category
- **Timeline Visualization**: Interactive chronological view with color-coded events

## 🧪 Testing

### Smart Contract Tests

Install contract dependencies first:

```bash
cd contract
npm install
```

Run basic tests:

```bash
node test-contract.js
```

Run comprehensive integration tests:

```bash
cd ..
node contract/integration-test.js
```

Run Rust unit tests:

```bash
cd contract
cargo test
```

### Manual Testing

See `docs/testing/INTEGRATION_TEST_CHECKLIST.md` for comprehensive manual testing guide covering:
- Wallet connection
- Event submission
- Voting functionality
- Timeline movement
- Edge cases
- Browser compatibility

## 🔧 Configuration

### Contract Configuration

Edit `frontend/src/config/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = 'your-contract-address';
export const WS_PROVIDER = 'ws://127.0.0.1:9944'; // Local
// or
export const WS_PROVIDER = 'wss://rococo-contracts-rpc.polkadot.io'; // Testnet
```

### Environment Variables

Create `.env` in frontend directory:

```env
VITE_CONTRACT_ADDRESS=your-contract-address
VITE_WS_PROVIDER=ws://127.0.0.1:9944
```

## 📦 Building for Production

### Build Frontend

```bash
cd frontend
npm run build
```

Output is in `frontend/dist/` - deploy to any static hosting (Vercel, Netlify, GitHub Pages).

### Deploy Contract to Testnet

1. Get testnet tokens from a faucet
2. Deploy:

```bash
cargo contract instantiate \
  --constructor new \
  --suri "your-seed-phrase" \
  --url wss://rococo-contracts-rpc.polkadot.io
```

## 🐛 Troubleshooting

### "Extension not found" error

- Install Polkadot.js extension
- Refresh page after installation
- Check extension is enabled for the site

### "Insufficient balance" error

- For local dev: Use pre-funded accounts (Alice, Bob, Charlie)
- For testnet: Get tokens from a faucet

### "Contract not found" error

- Verify contract address in `config/contract.ts`
- Ensure contract is deployed to correct network
- Check blockchain node is running

### Build errors

- Update Node.js to v18+: `node --version`
- Update Rust: `rustup update`
- Clear caches: `npm clean-install` or `cargo clean`

### Wallet won't connect multiple accounts

- Open Polkadot.js extension
- Go to settings (gear icon)
- Authorize additional accounts for this site
- Refresh the page

## 📁 Project Structure

```
historydao/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # Wallet, Toast, Theme contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # Contract interaction
│   │   ├── types/           # TypeScript types
│   │   └── config/          # Configuration
│   └── package.json
│
├── contract/                 # ink! smart contract
│   ├── lib.rs               # Contract code
│   ├── Cargo.toml           # Rust dependencies
│   └── tests/               # Contract tests
│
├── docs/                     # Documentation
│   ├── tasks/               # Implementation guides
│   ├── testing/             # Test plans and results
│   └── implementation-reports/
│
└── README.md                 # This file
```

## 🤝 Contributing

Contributions welcome! 

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📚 Resources

- [Polkadot.js Documentation](https://polkadot.js.org/docs/)
- [ink! Documentation](https://use.ink/)
- [Substrate Documentation](https://docs.substrate.io/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🎯 Roadmap

- [ ] Prevent duplicate voting (one vote per wallet per event)
- [ ] Expert weighting system (verified experts get higher vote weight)
- [ ] Rich media evidence (images, audio, video via IPFS)
- [ ] Reputation system for contributors
- [ ] Cross-chain deployment to Polkadot parachains
- [ ] Event relationships (link related events)
- [ ] Multi-language support
- [ ] DAO governance for platform rules

## 📝 License

MIT License - see LICENSE file for details.

---

Built with ❤️ using Polkadot, ink!, and React
