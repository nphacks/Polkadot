# Implementation Plan

- [x] 1. Set up project structure and development environment
  - Create root project directory with `frontend/` and `contract/` folders
  - Initialize contract folder with cargo-contract template
  - Initialize frontend folder with Vite + React + TypeScript
  - Install and configure local Substrate Contracts Node for development
  - _Requirements: All (foundational setup)_

- [x] 2. Implement ink! smart contract core data structures
  - [x] 2.1 Define HistoricalEvent struct with all required fields
    - Create struct with id, title, date, description, evidence_sources, submitter, timeline, consensus_score, vote counts, and timestamp
    - Implement scale encoding/decoding traits
    - _Requirements: 1.2, 1.3, 2.3_
  
  - [x] 2.2 Define Timeline enum and Vote struct
    - Create Timeline enum with Canonical, Disputed, Alternative variants
    - Create Vote struct with voter, event_id, support flag, and timestamp
    - _Requirements: 2.1, 3.2_
  
  - [x] 2.3 Define contract storage structure
    - Create HistoryProtocol storage with Mapping for events, votes, timeline_events, and user_events
    - Initialize event_count counter
    - _Requirements: 1.2, 2.2_

- [x] 3. Implement smart contract event submission functionality
  - [x] 3.1 Write submit_event method
    - Implement validation for required fields (title, date, description, evidence)
    - Generate unique event ID
    - Create HistoricalEvent with initial Disputed timeline and 0 consensus score
    - Store event in events mapping and timeline_events mapping
    - Track event in user_events mapping
    - Return event ID or error
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [x] 3.2 Write unit tests for event submission
    - Test successful event submission
    - Test validation errors for missing fields
    - Test event ID generation uniqueness
    - _Requirements: 1.2, 1.4_

- [x] 4. Implement smart contract voting functionality
  - [x] 4.1 Write vote method
    - Validate event exists
    - Check if user has already voted (prevent duplicates)
    - Record vote in votes mapping
    - Update event's support_votes or challenge_votes count
    - Call calculate_consensus_score
    - Call check_timeline_movement
    - Return success or error
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 4.2 Write has_voted helper method
    - Check if voter has existing vote for event_id
    - Return boolean result
    - _Requirements: 3.4, 3.5_
  
  - [x] 4.3 Write unit tests for voting
    - Test successful vote recording
    - Test duplicate vote prevention
    - Test vote on non-existent event
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 5. Implement consensus calculation and timeline movement
  - [x] 5.1 Write calculate_consensus_score method
    - Calculate percentage: (support_votes / total_votes) * 100
    - Handle edge case of zero votes
    - Update event's consensus_score field
    - Return calculated score
    - _Requirements: 3.3, 3.5, 4.5_
  
  - [x] 5.2 Write check_timeline_movement method
    - Get current consensus score
    - Check if score >= 75, move to Canonical timeline
    - Check if score <= 25, move to Alternative timeline
    - Update event's timeline field
    - Update timeline_events mappings
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 5.3 Write unit tests for consensus and timeline movement
    - Test consensus calculation with various vote ratios
    - Test timeline movement at threshold boundaries (75%, 25%)
    - Test events remaining in Disputed timeline (26-74%)
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 6. Implement smart contract query methods
  - [x] 6.1 Write get_event method
    - Retrieve event by ID from events mapping
    - Return Option<HistoricalEvent>
    - _Requirements: 2.3_
  
  - [x] 6.2 Write get_events_by_timeline method
    - Retrieve event IDs from timeline_events mapping for specified timeline
    - Fetch full event data for each ID
    - Return Vec<HistoricalEvent>
    - _Requirements: 2.1, 2.2_
  
  - [x] 6.3 Write get_user_events method
    - Retrieve event IDs from user_events mapping for specified user
    - Fetch full event data for each ID
    - Return Vec<HistoricalEvent>
    - _Requirements: 1.5_
  
  - [x] 6.4 Write unit tests for query methods
    - Test retrieving existing and non-existent events
    - Test filtering events by timeline
    - Test retrieving user's submitted events
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 7. Build and deploy smart contract
  - Compile contract with cargo-contract build
  - Deploy contract to local Substrate Contracts Node
  - Test contract methods using cargo-contract call
  - Record deployed contract address for frontend configuration
  - _Requirements: All contract requirements_

- [x] 8. Set up frontend project structure and dependencies
  - [x] 8.1 Install Polkadot.js dependencies
    - Install @polkadot/api, @polkadot/extension-dapp, @polkadot/api-contract
    - Configure TypeScript types for Polkadot.js
    - _Requirements: 5.1, 5.2_
  
  - [x] 8.2 Install UI dependencies
    - Install TailwindCSS and configure
    - Install date handling library (date-fns)
    - Install React Router for navigation
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 8.3 Create TypeScript type definitions
    - Define HistoricalEvent interface matching contract struct
    - Define WalletAccount, Vote, and ContractConfig interfaces
    - Create types file in src/types/
    - _Requirements: 1.2, 2.3, 5.1_

- [x] 9. Implement wallet connection functionality
  - [x] 9.1 Create WalletConnection component
    - Implement connect button that triggers Polkadot.js extension
    - Handle extension detection and account selection
    - Display connected account address
    - Implement disconnect functionality
    - Handle connection errors with user-friendly messages
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 9.2 Create wallet context provider
    - Create React context for wallet state (account, isConnected)
    - Provide wallet state to all components
    - Persist connection state in session storage
    - _Requirements: 5.1, 5.4_

- [x] 10. Implement contract interaction service
  - [x] 10.1 Create contract service module
    - Initialize Polkadot API connection to local node
    - Load contract ABI and create ContractPromise instance
    - Export contract instance for use in components
    - _Requirements: 1.2, 2.2, 3.1_
  
  - [x] 10.2 Create contract method wrappers
    - Write submitEvent wrapper function that calls contract.tx.submitEvent
    - Write vote wrapper function that calls contract.tx.vote
    - Write query wrappers for getEvent, getEventsByTimeline, hasVoted
    - Handle transaction signing and result callbacks
    - Implement error handling for all contract calls
    - _Requirements: 1.2, 2.2, 3.1, 3.2_

- [x] 11. Implement event submission UI
  - [x] 11.1 Create EventSubmission component
    - Build form with inputs for title, date, description
    - Implement dynamic evidence source fields (add/remove)
    - Add form validation for required fields
    - Display validation errors inline
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 11.2 Implement event submission logic
    - Call contract submitEvent method on form submit
    - Show loading state during transaction
    - Display success message with event ID on confirmation
    - Handle and display transaction errors
    - Clear form after successful submission
    - _Requirements: 1.2, 1.3_

- [x] 12. Implement timeline view UI
  - [x] 12.1 Create TimelineView component
    - Create tab navigation for three timeline types (Canonical, Disputed, Alternative)
    - Fetch events for selected timeline using contract query
    - Display events in a list with key information (title, date, consensus score)
    - Implement loading state while fetching
    - Handle empty state when no events exist
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 12.2 Implement event filtering
    - Add date range filter inputs
    - Filter displayed events by date range
    - Update URL params to persist filter state
    - _Requirements: 6.5_

- [x] 13. Implement event detail and voting UI
  - [x] 13.1 Create EventDetail component
    - Display full event information (title, date, description, evidence, submitter)
    - Show consensus score as percentage with visual indicator
    - Display vote counts (support vs challenge)
    - Show current timeline assignment
    - _Requirements: 2.3, 2.4, 2.5_
  
  - [x] 13.2 Implement voting functionality
    - Add Support and Challenge vote buttons
    - Disable buttons if user has already voted
    - Call contract vote method on button click
    - Show loading state during vote transaction
    - Update event display after successful vote
    - Display error messages for failed votes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 14. Implement timeline visualization
  - [x] 14.1 Create TimelineVisualization component
    - Render chronological timeline with date axis
    - Position events on timeline based on date
    - Use color coding for timeline types (green=Canonical, yellow=Disputed, red=Alternative)
    - Make event markers clickable to show details
    - Implement responsive design for mobile and desktop
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 14.2 Add timeline interactivity
    - Implement hover tooltips showing event preview
    - Add zoom/pan functionality for large date ranges
    - Integrate with date range filtering
    - _Requirements: 6.3, 6.5_

- [x] 15. Implement error handling and loading states
  - Create error boundary component for React errors
  - Add loading spinners for all async operations
  - Display user-friendly error messages for contract errors
  - Implement retry logic for failed network requests
  - Add toast notifications for success/error feedback
  - _Requirements: All (cross-cutting concern)_

- [x] 16. Add routing and navigation
  - Set up React Router with routes for home, timeline views, event details
  - Create navigation header with links to different timelines
  - Implement breadcrumb navigation
  - Add "Submit Event" button in header
  - _Requirements: 2.1, 2.2_

- [x] 17. Polish UI and add final touches
  - Style all components with TailwindCSS for consistent design
  - Add responsive design for mobile devices
  - Implement dark mode toggle
  - Add loading skeletons for better perceived performance
  - Create README with setup instructions
  - _Requirements: All (user experience)_

- [x] 18. Integration testing and bug fixes
  - Test complete flow: connect wallet → submit event → vote → verify timeline movement
  - Test with multiple accounts to verify voting restrictions
  - Test edge cases (exactly 75% consensus, exactly 25%)
  - Verify all error states display correctly
  - Test on different browsers
  - Fix any discovered bugs
  - _Requirements: All_
