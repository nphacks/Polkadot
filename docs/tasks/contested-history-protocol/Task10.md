# Task 10: Implement Contract Interaction Service

## Overview
Task 10 implemented the contract interaction service layer that provides a clean abstraction between the frontend UI and the blockchain smart contract. This service handles all Polkadot.js API interactions, transaction signing, and data queries.

## What Was Implemented

### 1. Contract Service Module (Subtask 10.1)

**API Connection Management**
- `initializeApi()` - Creates singleton WebSocket connection to Substrate node
- `getApi()` - Returns existing API instance
- `disconnect()` - Cleans up connection and resources
- `isConnected()` - Checks connection status

**Why Singleton Pattern**: Prevents multiple WebSocket connections, reduces memory usage, and ensures consistent state across all components.

**Contract Instance Management**
- `initializeContract()` - Creates ContractPromise instance with ABI and address
- `getContract()` - Returns existing contract instance

**Why Lazy Initialization**: Contract instance only created when needed, automatically loads metadata from compiled contract, uses centralized configuration.

### 2. Contract Method Wrappers (Subtask 10.2)

**Transaction Wrappers**
- `submitEvent()` - Submits new historical event to contract
  - Integrates with Polkadot.js wallet extension for signing
  - Monitors transaction lifecycle (InBlock → Finalized)
  - Decodes contract errors into readable messages
  - Returns TransactionResult with success/error status

- `vote()` - Records vote on historical event
  - Similar transaction handling as submitEvent
  - Specific error handling for voting scenarios (AlreadyVoted, EventNotFound)

**Why Separate Wrappers**: Each transaction type has different parameters and error scenarios, allowing UI to show specific loading states and error messages.

**Query Wrappers**
- `getEvent(eventId)` - Retrieves single event by ID
- `getEventsByTimeline(timeline)` - Retrieves all events in specified timeline
- `hasVoted(eventId, voterAddress)` - Checks if user already voted
- `getUserEvents(userAddress)` - Retrieves all events submitted by user

**Why Queries vs Transactions**: Queries are read-only, require no wallet signature, cost no gas, and return instantly. This separation prevents accidental state changes and makes the API intuitive.

**Data Transformation**
- `parseEventData()` - Converts raw contract output to typed HistoricalEvent
  - Removes commas from numeric strings ("1,000" → 1000)
  - Handles both camelCase and snake_case field names
  - Converts Unix timestamps to Date objects
  - Provides fallback values for optional fields

**Why Parse in Service**: Ensures consistent data format across all components, prevents parsing errors from crashing UI, enables type safety, follows DRY principle.

### 3. Service Exports

Created `frontend/src/services/index.ts` that exports all service functions and types from a single entry point.

**Why**: Enables clean imports (`import { submitEvent } from '@/services'`), centralizes service API, makes adding new services easier.

### 4. Type Definitions

**TransactionResult Interface**
```typescript
interface TransactionResult {
  success: boolean;
  data?: any;
  error?: string;
  blockHash?: string;
}
```

**Why**: Provides consistent return type for all transactions, makes success checking simple, includes user-friendly error messages.

## Why This Matters

**Separation of Concerns**: UI components focus on presentation while service layer handles complex blockchain interactions and data transformation.

**Reusability**: Service functions can be called from any component - event forms, timeline views, voting UI, user profiles.

**Error Handling**: Centralized error decoding translates cryptic blockchain errors into readable messages, with graceful degradation (returns null/empty arrays instead of throwing).

**Type Safety**: TypeScript ensures correct parameters, compile-time error detection, and IDE autocomplete support.

**Performance**: Singleton pattern prevents multiple connections, reduces network overhead, and optimizes resource usage.

## Requirements Fulfilled

- **Requirement 1.2**: Event submission infrastructure
- **Requirement 2.2**: Timeline query functionality  
- **Requirement 3.1**: Voting infrastructure
- **Requirement 3.2**: Vote tracking (hasVoted)
- **All Query Requirements**: Complete query interface for contract methods

## Technical Decisions

**Singleton vs React Context**: Chose singleton pattern for simplicity - one WebSocket connection, no provider wrapping needed, works across entire app.

**Promise-Based API**: Modern async/await syntax, cleaner error handling with try/catch, better TypeScript support than callbacks.

**Service Layer Parsing**: Parse data once in service rather than in each component - ensures consistency, isolates errors, enables type safety.

**Gas Limits**: Set high gas limit (300000000000n) to prevent out-of-gas errors, null storage deposit limit for automatic calculation.

**Error Decoding**: Use `registry.findMetaError()` to translate module errors into readable contract error names with documentation.

## Integration Points

- **Task 7**: Uses deployed contract address from deployment-info.json
- **Task 8**: Uses TypeScript types from types/index.ts  
- **Task 9**: Integrates with wallet context for account access
- **Task 11+**: Will be called by all UI components for contract interactions

## Files Created

- `frontend/src/services/contractService.ts` - Main service module (500+ lines)
- `frontend/src/services/index.ts` - Service exports

---

**Completed:** November 16, 2025  
**Time Spent:** ~3 hours  
**Status:** ✅ Complete and tested
