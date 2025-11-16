# Requirements Document

## Introduction

The Contested History Protocol is a decentralized application built on the Polkadot ecosystem that enables collaborative historical record-keeping with multiple narrative timelines. The system allows users to submit historical events, provide evidence, and participate in consensus-building around historical accuracy. Unlike traditional historical records controlled by single authorities, this protocol embraces the contested nature of historical interpretation while maintaining verifiable evidence chains on-chain.

## Glossary

- **System**: The Contested History Protocol decentralized application
- **User**: Any person interacting with the System through a Polkadot wallet
- **Historical Event**: A record of a past occurrence with associated metadata (date, description, sources)
- **Timeline**: A categorized collection of Historical Events (Canonical, Disputed, or Alternative)
- **Canonical Timeline**: The collection of Historical Events that have achieved high community consensus
- **Disputed Timeline**: The collection of Historical Events currently under active debate
- **Alternative Timeline**: The collection of Historical Events representing alternative interpretations
- **Evidence**: Supporting documentation or sources attached to a Historical Event
- **Consensus Score**: A numerical value (0-100) representing community agreement on a Historical Event
- **Wallet**: A Polkadot-compatible cryptocurrency wallet used for authentication
- **Transaction**: An on-chain operation that modifies the state of the System

## Requirements

### Requirement 1

**User Story:** As a historian, I want to submit historical events with supporting evidence, so that I can contribute to the decentralized historical record

#### Acceptance Criteria

1. WHEN a User connects a valid Wallet, THE System SHALL authenticate the User and display their account address
2. WHEN an authenticated User submits a Historical Event with title, date, description, and at least one Evidence source, THE System SHALL create a Transaction to store the Historical Event on-chain
3. WHEN a Historical Event Transaction is confirmed, THE System SHALL assign the Historical Event to the Disputed Timeline with an initial Consensus Score of 0
4. IF a User attempts to submit a Historical Event without required fields (title, date, description, or Evidence), THEN THE System SHALL display a validation error message and prevent submission
5. THE System SHALL store each Historical Event with a unique identifier, timestamp, and submitter Wallet address

### Requirement 2

**User Story:** As a user, I want to view historical events organized by timeline type, so that I can understand which events are accepted, disputed, or alternative interpretations

#### Acceptance Criteria

1. THE System SHALL display three distinct Timeline views: Canonical Timeline, Disputed Timeline, and Alternative Timeline
2. WHEN a User selects a Timeline view, THE System SHALL retrieve and display all Historical Events assigned to that Timeline in chronological order
3. WHEN a User selects a Historical Event, THE System SHALL display the event's title, date, description, Evidence sources, Consensus Score, and submitter address
4. THE System SHALL display the Consensus Score for each Historical Event as a percentage value
5. WHILE viewing a Historical Event, THE System SHALL display all associated Evidence sources as clickable links or references

### Requirement 3

**User Story:** As a community member, I want to vote on historical events to support or challenge their accuracy, so that the community can build consensus around historical truth

#### Acceptance Criteria

1. WHEN an authenticated User views a Historical Event in the Disputed Timeline, THE System SHALL display voting options (Support or Challenge)
2. WHEN a User submits a vote on a Historical Event, THE System SHALL create a Transaction to record the vote on-chain
3. WHEN a vote Transaction is confirmed, THE System SHALL update the Historical Event's Consensus Score based on the vote
4. THE System SHALL prevent a User from voting multiple times on the same Historical Event
5. IF a User attempts to vote on a Historical Event they have already voted on, THEN THE System SHALL display a message indicating they have already voted

### Requirement 4

**User Story:** As a user, I want events to automatically move between timelines based on consensus, so that the historical record reflects community agreement

#### Acceptance Criteria

1. WHEN a Historical Event in the Disputed Timeline reaches a Consensus Score of 75 or higher, THE System SHALL move the Historical Event to the Canonical Timeline
2. WHEN a Historical Event in the Disputed Timeline reaches a Consensus Score of 25 or lower, THE System SHALL move the Historical Event to the Alternative Timeline
3. WHILE a Historical Event has a Consensus Score between 26 and 74, THE System SHALL keep the Historical Event in the Disputed Timeline
4. WHEN a Historical Event moves between Timelines, THE System SHALL create a Transaction to record the timeline change on-chain
5. THE System SHALL recalculate Consensus Scores whenever a new vote is recorded

### Requirement 5

**User Story:** As a user, I want to connect my Polkadot wallet to interact with the system, so that my contributions are authenticated and attributed to me

#### Acceptance Criteria

1. WHEN a User clicks the wallet connection button, THE System SHALL prompt the User to select and authorize a Polkadot-compatible Wallet
2. WHEN a User authorizes wallet connection, THE System SHALL establish a connection and retrieve the User's account address
3. IF wallet connection fails or is rejected, THEN THE System SHALL display an error message and allow the User to retry
4. WHILE a User is connected, THE System SHALL display the User's account address in the interface
5. WHEN a User disconnects their Wallet, THE System SHALL clear the authentication state and disable authenticated features

### Requirement 6

**User Story:** As a user, I want to see a visual timeline representation of historical events, so that I can easily understand the chronological flow of history

#### Acceptance Criteria

1. THE System SHALL display Historical Events in a chronological timeline visualization with dates on a horizontal or vertical axis
2. WHEN a User views a Timeline, THE System SHALL position each Historical Event according to its date
3. WHEN a User hovers over or clicks a Historical Event in the timeline visualization, THE System SHALL display a preview or full details of the event
4. THE System SHALL use distinct visual indicators (colors or icons) to differentiate between Canonical, Disputed, and Alternative Timeline events
5. THE System SHALL allow Users to filter the timeline view by date range
