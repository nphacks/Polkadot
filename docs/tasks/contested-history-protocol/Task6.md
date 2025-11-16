# Task 6: Smart Contract Query Methods

## Overview
Task 6 implemented the query interface for the Contested History Protocol smart contract, enabling users and frontend applications to retrieve historical events from the blockchain. These read-only methods provide essential data access functionality without modifying contract state.

## What Was Implemented

### 1. get_event Method
**Purpose**: Retrieve a single historical event by its unique ID.

**Implementation**:
- Takes an event ID as input
- Returns `Option<HistoricalEvent>` - Some if found, None if not found
- Directly queries the events mapping for efficient lookup

**Use Case**: Viewing detailed information about a specific historical event.

### 2. get_events_by_timeline Method
**Purpose**: Retrieve all events within a specific timeline category.

**Implementation**:
- Takes a Timeline enum (Canonical, Disputed, or Alternative) as input
- Returns `Vec<HistoricalEvent>` containing all events in that timeline
- Fetches event IDs from timeline_events mapping, then retrieves full event data

**Use Case**: Displaying events grouped by their consensus status - showing which events are widely accepted (Canonical), under debate (Disputed), or rejected (Alternative).

### 3. get_user_events Method
**Purpose**: Retrieve all events submitted by a specific user.

**Implementation**:
- Takes an AccountId as input
- Returns `Vec<HistoricalEvent>` containing all events submitted by that user
- Fetches event IDs from user_events mapping, then retrieves full event data

**Use Case**: User profile pages showing contribution history, or filtering events by submitter.

## Testing
Comprehensive unit tests were added covering:
- Retrieving existing events vs non-existent events
- Filtering events across all three timeline types
- Retrieving user-specific events with multiple users
- Handling empty states (no events, new users)
- Timeline transitions (events moving between timelines after voting)

**Test Results**: All 22 tests pass successfully.

## Project Impact

### Enables Frontend Integration
These query methods are essential for the frontend application to:
- Display event lists and details to users
- Filter and organize events by timeline
- Show user contribution history
- Build the user interface for browsing historical events

### Completes Core Contract Functionality
With these query methods, the smart contract now has:
- ✅ Event submission (Task 2)
- ✅ Voting mechanism (Task 4)
- ✅ Consensus calculation (Task 5)
- ✅ Data retrieval (Task 6)

### Requirements Satisfied
- **Requirement 2.1**: Users can view events in different timelines
- **Requirement 2.2**: System categorizes events by consensus level
- **Requirement 2.3**: Users can access individual event details
- **Requirement 1.5**: Users can track their submitted events

## Technical Details

### Storage Access Pattern
All query methods follow a consistent pattern:
1. Retrieve event IDs from index mappings (timeline_events or user_events)
2. Iterate through IDs and fetch full event data from events mapping
3. Return collected events as a vector

### Gas Efficiency
- Methods are read-only (`#[ink(message)]` without `&mut self`)
- No state modifications means lower gas costs for queries
- Direct mapping lookups provide O(1) access time

## Next Steps
With query methods complete, the next tasks involve:
- Frontend integration to consume these contract methods
- Building UI components to display events
- Implementing user interaction flows for voting and submission
