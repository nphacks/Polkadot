# Design Document - Contested History Protocol

## Overview

The Contested History Protocol is a decentralized application (dApp) that leverages the Polkadot ecosystem to create an immutable, community-driven historical record system. The application consists of a React-based frontend that interacts with a smart contract deployed on a Polkadot-compatible blockchain (using ink! smart contract framework or Substrate runtime).

For hackathon simplicity and rapid development, we will use:
- **Frontend**: React with Polkadot.js API
- **Smart Contract**: ink! smart contract (Rust-based) deployed on a testnet
- **Blockchain**: Contracts parachain testnet (Rococo) or local Substrate node with contracts pallet
- **Wallet Integration**: Polkadot.js extension

This approach allows you to learn blockchain fundamentals while building a working prototype quickly.

## Architecture

### Project Structure

```
contested-history-protocol/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API and contract interaction
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   ├── package.json
│   └── vite.config.ts
│
├── contract/                 # ink! smart contract
│   ├── lib.rs               # Main contract code
│   ├── Cargo.toml           # Rust dependencies
│   └── tests/               # Contract tests
│
└── README.md                 # Project documentation
```

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│                    [frontend/ folder]                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Timeline   │  │    Event     │  │    Wallet    │  │
│  │     View     │  │  Submission  │  │  Connection  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Polkadot.js API
                         │
┌────────────────────────▼────────────────────────────────┐
│              Polkadot.js Extension (Wallet)              │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Sign Transactions
                         │
┌────────────────────────▼────────────────────────────────┐
│         Substrate Node with Contracts Pallet            │
│  ┌───────────────────────────────────────────────────┐  │
│  │      ink! Smart Contract (History Protocol)       │  │
│  │              [contract/ folder]                   │  │
│  │                                                    │  │
│  │  - Event Storage                                  │  │
│  │  - Voting Logic                                   │  │
│  │  - Consensus Calculation                          │  │
│  │  - Timeline Management                            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Polkadot.js API (@polkadot/api, @polkadot/extension-dapp)
- TailwindCSS for styling
- React Timeline component for visualization
- Vite for build tooling

**Smart Contract:**
- ink! 4.x (Rust-based smart contract framework)
- cargo-contract for compilation and deployment

**Development Environment:**
- Substrate Contracts Node (local development)
- Contracts parachain testnet (Rococo) for deployment

## Components and Interfaces

### Frontend Components

#### 1. WalletConnection Component
**Purpose**: Manages Polkadot wallet connection and authentication

**State:**
- `connectedAccount`: Current connected wallet address
- `accounts`: Available accounts from extension
- `isConnected`: Boolean connection status

**Methods:**
- `connectWallet()`: Initiates wallet connection flow
- `disconnectWallet()`: Clears wallet connection
- `selectAccount(address)`: Switches between multiple accounts

**Interface with Backend:**
- Uses `@polkadot/extension-dapp` to interact with browser extension
- Provides account context to other components

#### 2. EventSubmission Component
**Purpose**: Form for submitting new historical events

**State:**
- `title`: Event title
- `date`: Event date
- `description`: Event description
- `evidenceSources`: Array of evidence URLs/references
- `isSubmitting`: Loading state during transaction

**Methods:**
- `handleSubmit()`: Validates and submits event to smart contract
- `addEvidenceSource()`: Adds evidence field
- `removeEvidenceSource(index)`: Removes evidence field

**Interface with Backend:**
- Calls smart contract `submit_event()` method
- Waits for transaction confirmation
- Handles transaction errors

#### 3. TimelineView Component
**Purpose**: Displays events organized by timeline type

**Props:**
- `timelineType`: 'canonical' | 'disputed' | 'alternative'

**State:**
- `events`: Array of historical events
- `selectedEvent`: Currently selected event for detail view
- `isLoading`: Loading state while fetching events

**Methods:**
- `fetchEvents()`: Retrieves events from smart contract
- `selectEvent(eventId)`: Opens event detail view
- `filterByDateRange(start, end)`: Filters events by date

**Interface with Backend:**
- Calls smart contract `get_events_by_timeline()` method
- Subscribes to event updates

#### 4. EventDetail Component
**Purpose**: Displays full details of a historical event

**Props:**
- `eventId`: Unique identifier of the event

**State:**
- `event`: Full event data
- `hasVoted`: Whether current user has voted
- `isVoting`: Loading state during vote transaction

**Methods:**
- `vote(support: boolean)`: Submits vote on event
- `fetchEventDetails()`: Retrieves full event data

**Interface with Backend:**
- Calls smart contract `get_event()` method
- Calls smart contract `vote()` method
- Calls smart contract `has_voted()` method

#### 5. TimelineVisualization Component
**Purpose**: Visual chronological representation of events

**Props:**
- `events`: Array of events to display
- `timelineType`: Type of timeline being displayed

**Methods:**
- `renderTimeline()`: Creates visual timeline with positioned events
- `handleEventClick(eventId)`: Handles event selection

**UI Features:**
- Color-coded events by timeline type
- Chronological positioning
- Interactive event markers
- Date range filtering

### Smart Contract Interface (ink!)

#### Data Structures

```rust
#[derive(scale::Encode, scale::Decode, Clone, SpreadLayout, PackedLayout)]
pub struct HistoricalEvent {
    id: u64,
    title: String,
    date: u64, // Unix timestamp
    description: String,
    evidence_sources: Vec<String>,
    submitter: AccountId,
    timeline: Timeline,
    consensus_score: u8, // 0-100
    support_votes: u32,
    challenge_votes: u32,
    created_at: u64,
}

#[derive(scale::Encode, scale::Decode, Clone, Copy, PartialEq)]
pub enum Timeline {
    Canonical,
    Disputed,
    Alternative,
}

#[derive(scale::Encode, scale::Decode, Clone, SpreadLayout, PackedLayout)]
pub struct Vote {
    voter: AccountId,
    event_id: u64,
    support: bool,
    timestamp: u64,
}
```

#### Contract Methods

**Public Methods:**

1. `submit_event(title: String, date: u64, description: String, evidence_sources: Vec<String>) -> Result<u64, Error>`
   - Creates new historical event
   - Assigns to Disputed timeline
   - Returns event ID

2. `vote(event_id: u64, support: bool) -> Result<(), Error>`
   - Records vote on event
   - Updates consensus score
   - Checks for timeline movement
   - Prevents duplicate voting

3. `get_event(event_id: u64) -> Option<HistoricalEvent>`
   - Retrieves event by ID

4. `get_events_by_timeline(timeline: Timeline) -> Vec<HistoricalEvent>`
   - Returns all events in specified timeline

5. `has_voted(event_id: u64, voter: AccountId) -> bool`
   - Checks if user has voted on event

6. `get_user_events(user: AccountId) -> Vec<HistoricalEvent>`
   - Returns events submitted by user

**Internal Methods:**

1. `calculate_consensus_score(event_id: u64) -> u8`
   - Calculates consensus percentage based on votes
   - Formula: (support_votes / total_votes) * 100

2. `check_timeline_movement(event_id: u64)`
   - Evaluates if event should move timelines
   - Moves to Canonical if score >= 75
   - Moves to Alternative if score <= 25

3. `generate_event_id() -> u64`
   - Creates unique event identifier

## Data Models

### Frontend Data Models

```typescript
interface HistoricalEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  evidenceSources: string[];
  submitter: string;
  timeline: 'canonical' | 'disputed' | 'alternative';
  consensusScore: number;
  supportVotes: number;
  challengeVotes: number;
  createdAt: Date;
}

interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
  };
}

interface Vote {
  eventId: string;
  support: boolean;
  voter: string;
  timestamp: Date;
}

interface ContractConfig {
  address: string;
  abi: any;
}
```

### Smart Contract Storage

```rust
#[ink(storage)]
pub struct HistoryProtocol {
    events: Mapping<u64, HistoricalEvent>,
    event_count: u64,
    votes: Mapping<(u64, AccountId), Vote>,
    timeline_events: Mapping<Timeline, Vec<u64>>,
    user_events: Mapping<AccountId, Vec<u64>>,
}
```

## Error Handling

### Frontend Error Handling

**Wallet Connection Errors:**
- Extension not installed → Display installation instructions
- User rejects connection → Show retry option
- No accounts available → Prompt to create account

**Transaction Errors:**
- Insufficient balance → Display balance requirement
- Transaction rejected → Allow retry
- Network timeout → Retry with exponential backoff
- Contract error → Display user-friendly error message

**Data Fetching Errors:**
- Network unavailable → Show offline message
- Contract not found → Display configuration error
- Invalid response → Log error and show fallback UI

### Smart Contract Error Handling

```rust
#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
pub enum Error {
    EventNotFound,
    AlreadyVoted,
    InvalidEventData,
    Unauthorized,
    InvalidTimeline,
}
```

**Error Scenarios:**
- Event not found → Return `Error::EventNotFound`
- Duplicate vote → Return `Error::AlreadyVoted`
- Missing required fields → Return `Error::InvalidEventData`
- Invalid timeline value → Return `Error::InvalidTimeline`

## Testing Strategy

### Smart Contract Testing

**Unit Tests (ink! test framework):**
1. Test event submission with valid data
2. Test event submission with invalid data
3. Test voting mechanism and duplicate vote prevention
4. Test consensus score calculation
5. Test timeline movement logic
6. Test event retrieval by ID and timeline
7. Test user event history

**Integration Tests:**
1. Test full event lifecycle (submit → vote → move timeline)
2. Test multiple users voting on same event
3. Test edge cases (exactly 75% consensus, exactly 25%)

### Frontend Testing

**Component Tests (React Testing Library):**
1. WalletConnection component connection flow
2. EventSubmission form validation
3. TimelineView event display and filtering
4. EventDetail voting interaction
5. TimelineVisualization rendering

**Integration Tests:**
1. End-to-end event submission flow
2. Voting and consensus update flow
3. Timeline switching and filtering

**Manual Testing Checklist:**
1. Connect wallet with Polkadot.js extension
2. Submit event and verify on-chain storage
3. Vote on event and verify consensus update
4. Verify timeline movement at thresholds
5. Test with multiple accounts
6. Verify visual timeline display

### Testing Environment

- Local Substrate Contracts Node for development
- Mock data for frontend component testing
- Testnet deployment for final integration testing

## Implementation Notes

### Polkadot.js API Integration

```typescript
// Initialize API connection
const wsProvider = new WsProvider('ws://127.0.0.1:9944');
const api = await ApiPromise.create({ provider: wsProvider });

// Load contract
const contract = new ContractPromise(api, contractAbi, contractAddress);

// Submit event
const { gasRequired, storageDeposit, result } = await contract.query.submitEvent(
  account.address,
  { gasLimit: -1 },
  title,
  date,
  description,
  evidenceSources
);

// Send transaction
await contract.tx.submitEvent(
  { gasLimit: gasRequired },
  title,
  date,
  description,
  evidenceSources
).signAndSend(account, (result) => {
  // Handle transaction result
});
```

### Consensus Algorithm

Simple majority-based consensus:
- Consensus Score = (support_votes / (support_votes + challenge_votes)) * 100
- Minimum vote threshold: 10 votes before timeline movement
- Timeline movement triggers:
  - Score >= 75 → Canonical
  - Score <= 25 → Alternative
  - 26-74 → Disputed

### Timeline Movement Logic

Events are evaluated for timeline movement after each vote:
1. Calculate new consensus score
2. Check if minimum vote threshold met (10 votes)
3. If threshold met, check score against boundaries
4. Move event to appropriate timeline
5. Emit event for frontend to update UI

### Deployment Strategy

**Development:**
1. Run local Substrate Contracts Node
2. Compile ink! contract with cargo-contract
3. Deploy contract to local node
4. Run React frontend with Vite dev server

**Testnet Deployment:**
1. Deploy contract to Contracts parachain on Rococo
2. Update frontend contract address configuration
3. Deploy frontend to Vercel/Netlify
4. Test with real testnet tokens

### Future Enhancements (Post-Hackathon)

- Evidence verification system with IPFS integration
- Reputation system for contributors
- Token staking on votes for skin-in-the-game
- Cross-chain event references
- Advanced timeline branching (multiple alternative timelines)
- Event relationships and dependencies
- Rich media evidence (images, videos via IPFS)
