# Task 3: Implement Smart Contract Event Submission Functionality

## Overview
Task 3 implemented the core event submission mechanism for the Contested History Protocol. This enables users to submit historical events with supporting evidence to the blockchain, creating the foundation for the decentralized historical record system.

## What Was Implemented

### 1. submit_event Method (Subtask 3.1)
```rust
pub fn submit_event(
    &mut self,
    title: String,
    date: u64,
    description: String,
    evidence_sources: Vec<String>,
) -> Result<u64, Error>
```

**Purpose**: Creates and stores a new historical event on the blockchain with full validation and metadata tracking.

**Implementation Flow**:
1. **Validate Required Fields**: Ensures title, description, and evidence are not empty
2. **Generate Unique Event ID**: Calls `generate_event_id()` to create a sequential ID
3. **Capture Metadata**: Records submitter's account address and blockchain timestamp
4. **Create HistoricalEvent**: Initializes event with Disputed timeline and 0 consensus score
5. **Store in Multiple Mappings**:
   - `events` mapping: Primary storage by event ID
   - `timeline_events` mapping: Adds to Disputed timeline list
   - `user_events` mapping: Tracks events submitted by user
6. **Return Event ID**: Returns the unique identifier for the newly created event

**Validation Rules**:
- Title must not be empty → `Error::InvalidEventData`
- Description must not be empty → `Error::InvalidEventData`
- Evidence sources must contain at least one entry → `Error::InvalidEventData`

**Initial State**:
All new events start with:
- `timeline`: Timeline::Disputed (requires community voting to move)
- `consensus_score`: 0 (no votes yet)
- `support_votes`: 0
- `challenge_votes`: 0

### 2. generate_event_id Helper Method
```rust
fn generate_event_id(&mut self) -> u64 {
    self.event_count += 1;
    self.event_count
}
```

**Purpose**: Generates sequential, unique event IDs by incrementing a counter.

**Why Sequential IDs**: 
- Simple and predictable
- No collision risk
- Efficient storage (u64)
- Easy to iterate through all events

### 3. Comprehensive Unit Tests (Subtask 3.2)

#### Successful Submission Test
```rust
#[ink::test]
fn submit_event_works()
```
- Verifies event is created with correct data
- Confirms event ID is returned (starts at 1)
- Validates all fields are stored correctly
- Checks initial state (Disputed timeline, 0 consensus)

#### Validation Tests
```rust
#[ink::test]
fn submit_event_fails_with_empty_title()
```
- Empty title returns `Error::InvalidEventData`
- Event count remains 0 (no event created)

```rust
#[ink::test]
fn submit_event_fails_with_empty_description()
```
- Empty description returns `Error::InvalidEventData`
- Prevents events without proper context

```rust
#[ink::test]
fn submit_event_fails_with_no_evidence()
```
- Empty evidence vector returns `Error::InvalidEventData`
- Enforces evidence-based historical claims

#### Uniqueness Test
```rust
#[ink::test]
fn event_id_generation_is_unique()
```
- Submits two events
- Verifies IDs are sequential (1, 2)
- Confirms no ID collisions
- Validates event_count increments correctly

## Why This Matters for the Project

### Foundation for Decentralized History
Event submission is the entry point for all historical records in the protocol. Without this functionality, there would be no data for the community to vote on or organize into timelines.

### Evidence-Based Approach
By requiring at least one evidence source, the protocol enforces a standard of verifiable claims. This distinguishes it from opinion-based systems and maintains academic rigor.

### Multi-Mapping Storage Strategy
Storing events in three different mappings enables efficient queries:
- **events mapping**: Direct lookup by ID (O(1))
- **timeline_events mapping**: Filter by timeline without scanning all events
- **user_events mapping**: Track user contributions and reputation

### Immutable Record Creation
Once submitted, events are permanently stored on the blockchain with:
- Submitter attribution (accountability)
- Creation timestamp (temporal tracking)
- Evidence trail (verifiability)

## Requirements Fulfilled

This task directly implements these requirements from the spec:

- **Requirement 1.1**: WHEN a User connects a valid Wallet, THE System SHALL authenticate the User
- **Requirement 1.2**: WHEN an authenticated User submits a Historical Event with title, date, description, and at least one Evidence source, THE System SHALL create a Transaction to store the Historical Event on-chain
- **Requirement 1.3**: WHEN a Historical Event Transaction is confirmed, THE System SHALL assign the Historical Event to the Disputed Timeline with an initial Consensus Score of 0
- **Requirement 1.4**: IF a User attempts to submit a Historical Event without required fields, THEN THE System SHALL display a validation error message and prevent submission
- **Requirement 1.5**: THE System SHALL store each Historical Event with a unique identifier, timestamp, and submitter Wallet address

## Technical Decisions

### Why Start in Disputed Timeline?
New events begin in the Disputed timeline because:
- No community consensus exists yet
- Prevents immediate acceptance of unverified claims
- Requires community voting to reach Canonical status
- Maintains skeptical, evidence-based approach

### Why Require Evidence?
The protocol enforces evidence requirements to:
- Maintain academic standards
- Enable verification by other users
- Distinguish from opinion-based platforms
- Create audit trails for historical claims

### Storage Efficiency
Using `Mapping` instead of `Vec` for primary storage:
- O(1) lookup by event ID
- No need to iterate through all events
- Efficient for blockchain storage costs
- Scales better with large datasets

### Timestamp Capture
Recording `created_at` timestamp enables:
- Temporal analysis of submission patterns
- Audit trails for when claims were made
- Potential future features (trending events, recent submissions)

## Code Quality

### Error Handling
Proper use of Rust's `Result` type ensures:
- All error cases are handled explicitly
- Callers can respond appropriately to failures
- No silent failures or undefined behavior
- Type-safe error propagation

### Validation First
Validating inputs before any state changes:
- Prevents partial writes on validation failure
- Maintains contract state consistency
- Reduces wasted gas on invalid submissions
- Clear error messages for users

### Test Coverage
The test suite covers:
- Happy path (successful submission)
- All validation error cases
- Edge cases (empty strings, empty vectors)
- State consistency (event count, storage)
- Uniqueness guarantees (ID generation)

## Integration Points

Event submission integrates with:
- **Task 2 data structures**: Uses HistoricalEvent, Timeline, and storage mappings
- **Task 4 voting**: Creates events that can be voted on
- **Task 5 consensus**: Events start with 0 consensus, ready for calculation
- **Task 6 queries**: Events are stored in queryable mappings
- **Future frontend**: Will call this method via Polkadot.js API

## Test Results

All 7 tests passed successfully:
```
running 7 tests
test history_protocol::tests::new_works ... ok
test history_protocol::tests::submit_event_works ... ok
test history_protocol::tests::submit_event_fails_with_empty_title ... ok
test history_protocol::tests::submit_event_fails_with_empty_description ... ok
test history_protocol::tests::submit_event_fails_with_no_evidence ... ok
test history_protocol::tests::event_id_generation_is_unique ... ok
test history_protocol::tests::has_voted_returns_false_for_new_voter ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

## Lessons Learned

### ink! Storage Patterns
When modifying data retrieved from `Mapping`:
- Must explicitly call `.insert()` to save changes
- Mappings don't auto-track modifications
- Always retrieve, modify, then re-insert

### Validation Order Matters
Validate all inputs before making any state changes:
- Prevents inconsistent state on partial failures
- Reduces gas costs for invalid inputs
- Provides better error messages to users

### Multiple Storage Views
Storing the same data in multiple mappings (events, timeline_events, user_events) enables:
- Efficient queries from different perspectives
- No need for expensive iteration
- Better user experience (fast lookups)

### Sequential IDs vs UUIDs
Sequential IDs work well for blockchain because:
- Deterministic and predictable
- No randomness needed (which is hard on blockchain)
- Efficient storage (8 bytes)
- Easy to iterate if needed

## Next Steps

With event submission complete, the next tasks implemented:
- **Task 4**: Voting mechanism (already completed)
- **Task 5**: Consensus calculation and timeline movement (already completed)
- **Task 6**: Query functions to retrieve and filter events (already completed)
- **Task 7**: Contract deployment to local node
- **Task 8+**: Frontend implementation

## Example Usage

```rust
// Submit a historical event
let event_id = contract.submit_event(
    String::from("Moon Landing"),
    1969_07_20u64,
    String::from("Apollo 11 successfully landed on the moon"),
    vec![
        String::from("https://nasa.gov/apollo11"),
        String::from("https://archive.org/moon-landing")
    ]
)?;

// Event is now stored with:
// - Unique ID (e.g., 1)
// - Disputed timeline
// - 0 consensus score
// - Submitter's account address
// - Current blockchain timestamp
```

---

**Completed:** November 16, 2025
**Time Spent:** ~45 minutes
**Status:** ✅ All tests passing, ready for Task 4
