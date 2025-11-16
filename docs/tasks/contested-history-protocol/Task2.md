# Task 2: Implement ink! Smart Contract Core Data Structures

## Overview
Task 2 established the foundational data structures for the Contested History Protocol smart contract. These structures define how historical events, votes, and timelines are represented and stored on the blockchain.

## What Was Implemented

### 1. Timeline Enum (Subtask 2.2)
```rust
pub enum Timeline {
    Canonical,
    Disputed,
    Alternative,
}
```

**Purpose**: Categorizes historical events into three distinct timelines based on their consensus level:
- **Canonical**: Events with high consensus (≥70% support)
- **Disputed**: Events with moderate consensus (30-70% support)
- **Alternative**: Events with low consensus (<30% support)

**Technical Details**:
- Implements `scale::Encode` and `scale::Decode` for blockchain serialization
- Implements `StorageLayout` for ink! storage compatibility
- Copy-able and comparable for efficient operations

### 2. HistoricalEvent Struct (Subtask 2.1)
```rust
pub struct HistoricalEvent {
    pub id: u64,
    pub title: String,
    pub date: u64,
    pub description: String,
    pub evidence_sources: Vec<String>,
    pub submitter: AccountId,
    pub timeline: Timeline,
    pub consensus_score: u8,
    pub support_votes: u32,
    pub challenge_votes: u32,
    pub created_at: u64,
}
```

**Purpose**: Represents a complete historical event with all metadata needed for decentralized verification.

**Key Fields**:
- `id`: Unique identifier for the event
- `title` & `description`: Human-readable event information
- `date`: When the historical event occurred (Unix timestamp)
- `evidence_sources`: URLs or references to supporting evidence
- `submitter`: Account that submitted the event
- `timeline`: Current classification (Canonical/Disputed/Alternative)
- `consensus_score`: Percentage of support (0-100)
- `support_votes` & `challenge_votes`: Vote tallies
- `created_at`: When the event was submitted to the blockchain

### 3. Vote Struct (Subtask 2.2)
```rust
pub struct Vote {
    pub voter: AccountId,
    pub event_id: u64,
    pub support: bool,
    pub timestamp: u64,
}
```

**Purpose**: Records individual votes on historical events to prevent double-voting and enable vote tracking.

**Key Fields**:
- `voter`: Account that cast the vote
- `event_id`: Which event was voted on
- `support`: True for support, false for challenge
- `timestamp`: When the vote was cast

### 4. Contract Storage Structure (Subtask 2.3)
```rust
pub struct HistoryProtocol {
    events: Mapping<u64, HistoricalEvent>,
    event_count: u64,
    votes: Mapping<(u64, AccountId), Vote>,
    timeline_events: Mapping<Timeline, Vec<u64>>,
    user_events: Mapping<AccountId, Vec<u64>>,
}
```

**Purpose**: Defines how data is organized and stored on the blockchain.

**Storage Mappings**:
- `events`: Maps event IDs to full event data (primary storage)
- `event_count`: Counter for generating unique event IDs
- `votes`: Maps (event_id, voter) pairs to votes (prevents double-voting)
- `timeline_events`: Maps timelines to lists of event IDs (enables filtering by timeline)
- `user_events`: Maps users to their submitted events (enables user history queries)

## Why This Matters

### Blockchain Storage Optimization
The storage structure uses ink!'s `Mapping` type, which provides efficient key-value storage on the blockchain. This is crucial because blockchain storage is expensive, and proper data organization minimizes gas costs.

### Data Integrity
All structs implement SCALE encoding/decoding, which is Substrate's serialization format. This ensures:
- Consistent data representation across the network
- Efficient storage and transmission
- Type safety at the protocol level

### Query Efficiency
The multiple mapping structures enable efficient queries:
- Get all events in a specific timeline without scanning all events
- Get all events submitted by a user
- Check if a user has voted on an event in O(1) time

### Requirements Fulfillment
This task directly addresses requirements from the spec:
- **Requirement 1.2**: Event submission with metadata
- **Requirement 1.3**: Evidence source tracking
- **Requirement 2.1**: Timeline classification system
- **Requirement 2.2**: Vote tracking and storage
- **Requirement 2.3**: Consensus score calculation support
- **Requirement 3.2**: Vote recording infrastructure

## Technical Challenges Resolved

### StorageLayout Implementation
Initially, the contract failed to compile because `HistoricalEvent`, `Vote`, and `Timeline` didn't implement the `StorageLayout` trait required by ink! v4. This was resolved by adding:
```rust
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
)]
```

This conditional compilation ensures the trait is only derived when building for standard environments (not in no_std mode).

### Complex Type Storage
Storing complex types like `String` and `Vec<String>` in blockchain storage required proper trait implementations. The SCALE codec handles serialization, while StorageLayout enables ink! to understand the data structure.

## Next Steps

With the data structures in place, the next tasks will implement:
- **Task 3**: Event submission logic
- **Task 4**: Voting mechanism
- **Task 5**: Consensus calculation and timeline updates
- **Task 6**: Query functions to retrieve events and votes

## Verification

The implementation was verified by:
1. Running `cargo check` to ensure compilation
2. Running `cargo test` to verify the constructor works correctly
3. Confirming all required traits are properly implemented

All tests passed successfully, confirming the data structures are ready for use in subsequent tasks.
