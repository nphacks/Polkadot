# Task 2: Add Event Tagging to Smart Contract

## Overview

Extended the smart contract to support categorical tagging of historical events, enabling better organization and filtering. This required modifying the core HistoricalEvent data structure, updating the submission method, and adding query capabilities for tag-based filtering.

## What Was Implemented

- Added `tags: Vec<String>` field to HistoricalEvent struct with proper encoding/decoding traits
- Updated submit_event method to accept tags parameter with validation (minimum 1 tag, maximum 5 tags)
- Implemented get_events_by_tag query method to filter events by tag
- Added unit tests for tag submission, validation, and querying
- Recompiled and redeployed smart contract to local Substrate Contracts Node with new contract address

## Key Technical Decisions

- **Vector Storage**: Used `Vec<String>` for flexible tag storage rather than fixed-size arrays, allowing variable numbers of tags per event
- **Validation at Contract Level**: Enforced tag limits (1-5 tags) in the smart contract to ensure data integrity at the source
- **Linear Search for MVP**: Implemented get_events_by_tag using iteration rather than indexed storage for simplicity; can be optimized later with tag-to-event mappings
- **Redeployment Strategy**: Since no production data existed, opted for clean redeployment rather than migration logic
- **Predefined Categories**: While contract accepts any string tags, frontend enforces predefined categories for consistency

## Requirements Fulfilled

- Requirement 2.1: Allow users to add tags when submitting events
- Requirement 2.2: Support predefined tag categories
- Requirement 2.3: Store tags with event data
- Requirement 2.5: Enable filtering events by tags

## Files Created/Modified

- contract/lib.rs
- contract/Cargo.toml
- frontend/src/config/contract.ts (updated contract address)
