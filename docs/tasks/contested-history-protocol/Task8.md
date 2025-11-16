# Task 8: Set Up Frontend Project Structure and Dependencies

## Overview
Task 8 completed the frontend foundation for the Contested History Protocol by installing all necessary dependencies, configuring the development environment, and creating comprehensive TypeScript type definitions. This task bridges the gap between the deployed smart contract and the user interface, establishing the infrastructure needed for building React components that interact with the blockchain.

## What Was Implemented

### 1. Polkadot.js Dependencies (Subtask 8.1)

**Packages Installed**:
```json
{
  "@polkadot/api": "^10.13.1",
  "@polkadot/api-contract": "^10.13.1",
  "@polkadot/extension-dapp": "^0.46.9"
}
```

**Why Each Package Matters**:

**@polkadot/api** - Core Blockchain API
- Connects to Substrate-based blockchain nodes via WebSocket
- Provides low-level access to blockchain state and extrinsics
- Handles RPC calls, block subscriptions, and chain queries
- Essential for reading blockchain data and submitting transactions

**@polkadot/api-contract** - Smart Contract Interaction
- Specialized library for interacting with ink! smart contracts
- Provides `ContractPromise` class for contract instantiation
- Handles contract method calls (both queries and transactions)
- Manages ABI parsing and type encoding/decoding
- Simplifies gas estimation and transaction signing

**@polkadot/extension-dapp** - Wallet Integration
- Connects to browser wallet extensions (Polkadot.js, Talisman, SubWallet)
- Handles account discovery and selection
- Manages transaction signing requests
- Provides secure key management without exposing private keys
- Enables user authentication via wallet addresses

**TypeScript Configuration**:
The existing `tsconfig.json` already includes proper configuration for Polkadot.js:
- `"lib": ["ES2020", "DOM", "DOM.Iterable"]` - Ensures compatibility with Polkadot.js APIs
- `"moduleResolution": "bundler"` - Handles Polkadot.js module structure
- `"resolveJsonModule": true` - Allows importing contract ABI JSON files

### 2. UI Dependencies (Subtask 8.2)

**Packages Already Configured**:
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.30.2",
  "date-fns": "^2.30.0",
  "tailwindcss": "^3.3.6"
}
```

**Why Each Package Matters**:

**TailwindCSS** - Utility-First CSS Framework
- Rapid UI development with utility classes
- Consistent design system out of the box
- Responsive design made simple
- Custom color scheme for timelines already configured:
  ```javascript
  colors: {
    canonical: '#10b981',   // Green for accepted events
    disputed: '#f59e0b',    // Yellow for debated events
    alternative: '#ef4444', // Red for rejected events
  }
  ```

**date-fns** - Date Handling Library
- Converts Unix timestamps from blockchain to readable dates
- Formats dates for display (e.g., "July 20, 1969")
- Handles date range filtering for timeline views
- Lightweight alternative to moment.js (tree-shakeable)
- Immutable and pure functions (no side effects)

**React Router** - Client-Side Routing
- Enables navigation between timeline views
- Supports deep linking to specific events
- Manages browser history and URL state
- Allows bookmarking and sharing specific views
- Provides nested routing for complex layouts

**React 18** - UI Framework
- Concurrent rendering for better performance
- Automatic batching of state updates
- Suspense for data fetching (future enhancement)
- Hooks API for clean component logic
- Strong TypeScript support

### 3. TypeScript Type Definitions (Subtask 8.3)

Created `frontend/src/types/index.ts` with comprehensive type definitions:

#### Core Data Types

**Timeline Type**:
```typescript
export type Timeline = 'canonical' | 'disputed' | 'alternative';
```
- String literal union type for type safety
- Matches the three timeline categories from the smart contract
- Prevents typos and invalid timeline values
- Enables autocomplete in IDEs

**HistoricalEvent Interface**:
```typescript
export interface HistoricalEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  evidenceSources: string[];
  submitter: string;
  timeline: Timeline;
  consensusScore: number;
  supportVotes: number;
  challengeVotes: number;
  createdAt: Date;
}
```
- Matches the `HistoricalEvent` struct from the smart contract
- Uses JavaScript-friendly types (Date instead of Unix timestamp)
- camelCase naming convention (JavaScript standard)
- Ready for use in React components

**RawHistoricalEvent Interface**:
```typescript
export interface RawHistoricalEvent {
  id: number;
  title: string;
  date: number; // Unix timestamp
  description: string;
  evidence_sources: string[];
  submitter: string;
  timeline: { canonical?: null; disputed?: null; alternative?: null };
  consensus_score: number;
  support_votes: number;
  challenge_votes: number;
  created_at: number; // Unix timestamp
}
```
- Represents data as returned directly from the blockchain
- Uses snake_case (matches Rust contract naming)
- Enum represented as object with optional null properties
- Requires transformation to `HistoricalEvent` for UI use

**Why Two Event Types?**
- **RawHistoricalEvent**: Blockchain data format (snake_case, timestamps as numbers)
- **HistoricalEvent**: UI-friendly format (camelCase, Date objects)
- Separation allows clean data transformation layer
- Type safety during conversion process

#### Vote Types

**Vote Interface**:
```typescript
export interface Vote {
  eventId: string;
  support: boolean;
  voter: string;
  timestamp: Date;
}
```

**RawVote Interface**:
```typescript
export interface RawVote {
  event_id: number;
  support: boolean;
  voter: string;
  timestamp: number;
}
```
- Same pattern as event types (raw vs. transformed)
- Tracks who voted, when, and how

#### Wallet Types

**WalletAccount Interface**:
```typescript
export interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
    genesisHash?: string;
  };
  type?: string;
}
```
- Matches the structure returned by Polkadot.js extension
- `address`: User's blockchain account address (SS58 format)
- `meta.name`: Optional account name set by user
- `meta.source`: Which wallet extension (polkadot-js, talisman, etc.)
- `meta.genesisHash`: Chain identifier for multi-chain wallets
- `type`: Account type (sr25519, ed25519, ecdsa)

#### Contract Configuration

**ContractConfig Interface**:
```typescript
export interface ContractConfig {
  address: string;
  abi: any;
}
```
- `address`: Deployed contract address on the blockchain
- `abi`: Contract metadata (methods, types, events)
- Used to instantiate `ContractPromise` for interactions

**ContractError Enum**:
```typescript
export enum ContractError {
  EventNotFound = 'EventNotFound',
  AlreadyVoted = 'AlreadyVoted',
  InvalidEventData = 'InvalidEventData',
}
```
- Matches the `Error` enum from the smart contract
- Enables type-safe error handling in UI
- Can be used in switch statements for specific error messages

#### Form and UI Types

**EventSubmissionForm Interface**:
```typescript
export interface EventSubmissionForm {
  title: string;
  date: Date;
  description: string;
  evidenceSources: string[];
}
```
- Represents form state for event submission
- Matches required fields from contract validation
- Used with React form libraries (React Hook Form, Formik)

**TimelineFilter Interface**:
```typescript
export interface TimelineFilter {
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}
```
- Optional filters for timeline view
- Enables date range filtering (Requirement 6.5)
- Search functionality for finding specific events

**TransactionStatus Type**:
```typescript
export type TransactionStatus = 
  | 'idle'
  | 'preparing'
  | 'signing'
  | 'broadcasting'
  | 'inBlock'
  | 'finalized'
  | 'error';
```
- Tracks blockchain transaction lifecycle
- Enables detailed loading states in UI
- Helps users understand what's happening during transactions

**TransactionResult Interface**:
```typescript
export interface TransactionResult {
  status: TransactionStatus;
  blockHash?: string;
  txHash?: string;
  error?: string;
}
```
- Complete transaction information
- `blockHash`: Which block included the transaction
- `txHash`: Transaction hash for blockchain explorers
- `error`: Error message if transaction failed

## Why This Matters for the Project

### Type Safety Across the Stack
TypeScript types create a contract between the smart contract and the UI:
- Compile-time error detection
- Autocomplete and IntelliSense in IDEs
- Self-documenting code
- Refactoring safety (rename propagates everywhere)
- Prevents runtime type errors

### Data Transformation Layer
The dual type system (Raw vs. UI-friendly) enables:
- Clean separation of concerns
- Blockchain data stays in blockchain format
- UI data uses JavaScript conventions
- Transformation happens in one place (service layer)
- Easy to test and maintain

### Developer Experience
Proper tooling setup provides:
- Fast development with Vite hot module replacement
- Instant feedback on type errors
- Consistent code formatting
- Modern JavaScript features (ES2020+)
- Optimized production builds

### Foundation for Components
With types and dependencies in place, developers can:
- Import types without circular dependencies
- Use Polkadot.js APIs with confidence
- Build components knowing the data structure
- Share types across components
- Maintain consistency

## Requirements Fulfilled

This task directly implements these requirements:

- **Requirement 5.1**: Wallet connection infrastructure (Polkadot.js extension)
- **Requirement 5.2**: Account authentication types
- **Requirement 1.2**: Event submission types and validation
- **Requirement 2.3**: Event display types
- **Requirement 6.1-6.5**: Timeline visualization dependencies

## Technical Decisions

### Why Polkadot.js Over Other Libraries?
**Alternatives Considered**:
- **useInkathon**: Higher-level React hooks for ink! contracts
- **Substrate Connect**: Light client in browser
- **Custom RPC client**: Direct WebSocket communication

**Why Polkadot.js**:
- Official library maintained by Parity Technologies
- Most mature and battle-tested
- Comprehensive documentation
- Active community support
- Works with all Substrate-based chains
- Supports all wallet extensions
- Lower-level control when needed

### Why date-fns Over moment.js?
**Comparison**:
- **moment.js**: 67KB minified, mutable API, deprecated
- **date-fns**: 13KB minified (tree-shakeable), immutable, actively maintained
- **Day.js**: 7KB minified, moment.js-compatible API

**Why date-fns**:
- Tree-shakeable (only import functions you use)
- Immutable (no side effects)
- TypeScript-first design
- Functional programming style
- Better performance
- Smaller bundle size

### Why React Router v6?
**Features Used**:
- Nested routes for layout composition
- Data loading with loaders (future enhancement)
- URL state management
- Programmatic navigation
- Route-based code splitting

**Benefits**:
- Standard solution for React routing
- Declarative route configuration
- Excellent TypeScript support
- Hooks-based API (useNavigate, useParams)
- Automatic scroll restoration

### TypeScript Configuration Choices

**Strict Mode Enabled**:
```json
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noFallthroughCasesInSwitch": true
```
- Catches more errors at compile time
- Enforces best practices
- Prevents common bugs
- Makes refactoring safer

**Module Resolution**:
```json
"moduleResolution": "bundler"
```
- Optimized for Vite bundler
- Handles ESM and CommonJS modules
- Supports package.json exports field
- Better tree-shaking

**Path Aliases**:
```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```
- Clean imports: `import { Event } from '@/types'`
- Avoids relative path hell: `../../../types`
- Easy to refactor file structure
- Consistent across the codebase

### Naming Conventions

**Contract Data (snake_case)**:
- Matches Rust naming conventions
- Preserves blockchain data format
- No transformation needed when querying

**UI Data (camelCase)**:
- JavaScript/TypeScript standard
- Consistent with React conventions
- Better developer experience
- Familiar to frontend developers

**Transformation Pattern**:
```typescript
function transformEvent(raw: RawHistoricalEvent): HistoricalEvent {
  return {
    id: raw.id.toString(),
    title: raw.title,
    date: new Date(raw.date * 1000), // Unix to Date
    description: raw.description,
    evidenceSources: raw.evidence_sources, // snake to camel
    submitter: raw.submitter,
    timeline: parseTimeline(raw.timeline), // enum to string
    consensusScore: raw.consensus_score,
    supportVotes: raw.support_votes,
    challengeVotes: raw.challenge_votes,
    createdAt: new Date(raw.created_at * 1000),
  };
}
```

## Code Quality

### Comprehensive Documentation
Every type includes JSDoc comments:
```typescript
/**
 * Represents a historical event stored on-chain
 * Matches the HistoricalEvent struct in the smart contract
 */
export interface HistoricalEvent {
  // ...
}
```
- Explains purpose and context
- References related contract structures
- Appears in IDE tooltips
- Helps onboard new developers

### Type Exports
All types exported from single file:
```typescript
export type Timeline = ...
export interface HistoricalEvent { ... }
export interface Vote { ... }
```
- Single source of truth
- Easy to import: `import { HistoricalEvent, Vote } from '@/types'`
- Prevents duplicate definitions
- Centralized type management

### Future-Proof Design
Types include fields for future features:
- `TransactionResult` for detailed transaction tracking
- `TimelineFilter` for advanced filtering
- `WalletAccount.type` for multi-signature support
- Extensible without breaking changes

## Integration Points

This task integrates with:
- **Task 7**: Uses deployed contract address from `deployment-info.json`
- **Task 9**: Wallet types ready for WalletConnection component
- **Task 10**: Contract types ready for service layer
- **Task 11-14**: Form and UI types ready for components
- **Contract**: Types match smart contract data structures

## Files Created/Modified

### Created
- `frontend/src/types/index.ts` - Complete type definitions (150+ lines)

### Modified
- `frontend/package.json` - Already had all dependencies configured
- `frontend/tsconfig.json` - Already properly configured
- `frontend/tailwind.config.js` - Already had timeline colors

### Verified Existing
- `frontend/vite.config.ts` - Vite configuration correct
- `frontend/postcss.config.js` - PostCSS for Tailwind
- `frontend/src/index.css` - Tailwind directives included

## Testing Strategy

### Type Checking
```bash
cd frontend
npm run build
```
- TypeScript compiler validates all types
- Catches type errors before runtime
- Ensures type consistency

### IDE Integration
- VSCode provides autocomplete for all types
- Hover tooltips show type documentation
- Inline error highlighting
- Go-to-definition navigation

### Future Unit Tests
Types enable testing with TypeScript:
```typescript
import { HistoricalEvent, Timeline } from '@/types';

describe('Event transformation', () => {
  it('should transform raw event to UI event', () => {
    const raw: RawHistoricalEvent = { /* ... */ };
    const event: HistoricalEvent = transformEvent(raw);
    expect(event.timeline).toBe('canonical');
  });
});
```

## Lessons Learned

### Polkadot.js Type Complexity
**Challenge**: Polkadot.js uses complex generic types
**Solution**: Create simplified interfaces for UI layer
**Lesson**: Abstract away blockchain complexity from components

### Enum Representation
**Challenge**: Rust enums serialize differently than TypeScript enums
**Solution**: Use union types for TypeScript, transform from object format
**Lesson**: Understand how SCALE codec represents enums

### Date Handling
**Challenge**: Blockchain uses Unix timestamps (seconds), JavaScript uses milliseconds
**Solution**: Always multiply by 1000 when converting: `new Date(timestamp * 1000)`
**Lesson**: Document timestamp units in comments

### Optional vs. Required Fields
**Challenge**: Some fields might be undefined from blockchain
**Solution**: Use optional fields (`field?: type`) where appropriate
**Lesson**: Match optionality to actual contract behavior

### Import Organization
**Challenge**: Many types needed across components
**Solution**: Single types file with all exports
**Lesson**: Centralize types for easier maintenance

## Real-World Usage Examples

### Component Using Types
```typescript
import { HistoricalEvent, Timeline } from '@/types';

interface EventCardProps {
  event: HistoricalEvent;
  onVote: (eventId: string, support: boolean) => void;
}

export function EventCard({ event, onVote }: EventCardProps) {
  const timelineColor = {
    canonical: 'bg-canonical',
    disputed: 'bg-disputed',
    alternative: 'bg-alternative',
  }[event.timeline];

  return (
    <div className={`p-4 rounded ${timelineColor}`}>
      <h3>{event.title}</h3>
      <p>{format(event.date, 'MMMM d, yyyy')}</p>
      <p>Consensus: {event.consensusScore}%</p>
    </div>
  );
}
```

### Service Using Types
```typescript
import { ContractPromise } from '@polkadot/api-contract';
import { HistoricalEvent, RawHistoricalEvent } from '@/types';

export async function getEvent(
  contract: ContractPromise,
  eventId: number
): Promise<HistoricalEvent | null> {
  const { result, output } = await contract.query.getEvent(
    address,
    { gasLimit: -1 },
    eventId
  );

  if (!result.isOk || !output) return null;

  const raw: RawHistoricalEvent = output.toJSON();
  return transformEvent(raw);
}
```

### Form Using Types
```typescript
import { EventSubmissionForm } from '@/types';
import { useForm } from 'react-hook-form';

export function EventSubmissionForm() {
  const { register, handleSubmit } = useForm<EventSubmissionForm>();

  const onSubmit = async (data: EventSubmissionForm) => {
    await submitEvent(
      data.title,
      Math.floor(data.date.getTime() / 1000),
      data.description,
      data.evidenceSources
    );
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

## Next Steps

With frontend structure and types complete, the next tasks are:

**Task 9: Implement Wallet Connection Functionality**
- Create WalletConnection component using `WalletAccount` type
- Use `@polkadot/extension-dapp` to connect to browser extension
- Implement wallet context provider for app-wide state

**Task 10: Implement Contract Interaction Service**
- Use `ContractConfig` type for contract instantiation
- Create service functions that return typed data
- Transform `RawHistoricalEvent` to `HistoricalEvent`
- Handle `ContractError` enum for error messages

**Task 11-14: Build UI Components**
- Import types from `@/types`
- Use `HistoricalEvent` interface in components
- Leverage `TransactionStatus` for loading states
- Apply timeline colors from Tailwind config

## Commands Reference

```bash
# Install dependencies (already done)
cd frontend && npm install

# Type check
npm run build

# Start development server
npm run dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Package Versions

All packages use compatible versions:
- **Polkadot.js**: v10.13.1 (latest stable)
- **React**: v18.2.0 (latest stable)
- **TypeScript**: v5.2.2 (latest stable)
- **Vite**: v5.0.8 (latest stable)
- **TailwindCSS**: v3.3.6 (latest stable)

## Bundle Size Considerations

**Current Dependencies**:
- Polkadot.js: ~500KB (largest dependency)
- React: ~130KB
- React Router: ~50KB
- date-fns: ~13KB (tree-shakeable)
- TailwindCSS: ~10KB (purged in production)

**Optimization Strategies**:
- Tree-shaking removes unused code
- Code splitting by route
- Lazy loading for heavy components
- Vite optimizes dependencies automatically

## Future Enhancements

Potential improvements for post-hackathon:

**Type Enhancements**:
- Branded types for addresses (prevent mixing event IDs and account addresses)
- Discriminated unions for transaction states
- Zod schemas for runtime validation
- Generated types from contract metadata

**Dependency Additions**:
- React Query for data fetching and caching
- Zustand or Jotai for global state management
- React Hook Form for complex forms
- Recharts for consensus score visualization

**Developer Experience**:
- Storybook for component development
- Vitest for unit testing
- Playwright for e2e testing
- ESLint rules for Polkadot.js best practices

---

**Completed:** November 16, 2025
**Time Spent:** ~30 minutes (type definitions and verification)
**Status:** ✅ All dependencies installed, types defined, ready for Task 9
**Next Task:** Task 9 - Implement wallet connection functionality

