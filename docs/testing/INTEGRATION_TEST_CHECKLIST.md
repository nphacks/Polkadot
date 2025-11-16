# Integration Testing Checklist

This document provides a comprehensive checklist for manually testing the Contested History Protocol application. Follow these tests to verify all functionality works correctly.

## Prerequisites

Before starting tests:
- [ ] Substrate Contracts Node is running (`substrate-contracts-node --dev --tmp`)
- [ ] Contract is deployed and address is configured in `frontend/src/config/contract.ts`
- [ ] Frontend development server is running (`npm run dev` in frontend directory)
- [ ] Polkadot.js extension is installed in browser
- [ ] At least 3 test accounts are available (Alice, Bob, Charlie recommended)

## Test 1: Wallet Connection Flow

### Test 1.1: Connect Wallet
- [ ] Open application in browser (http://localhost:5173)
- [ ] Click "Connect Wallet" button in header
- [ ] Verify Polkadot.js extension popup appears
- [ ] Select an account (e.g., Alice)
- [ ] Authorize the connection
- [ ] **Expected**: Wallet address appears in header
- [ ] **Expected**: "Connect Wallet" button changes to show connected address
- [ ] **Expected**: No error messages displayed

### Test 1.2: Wallet Connection Persistence
- [ ] Refresh the page
- [ ] **Expected**: Wallet remains connected
- [ ] **Expected**: Same account address is displayed

### Test 1.3: Disconnect Wallet
- [ ] Click on connected wallet address
- [ ] Click "Disconnect" button
- [ ] **Expected**: Wallet disconnects
- [ ] **Expected**: "Connect Wallet" button reappears
- [ ] **Expected**: Protected features are disabled

### Test 1.4: Extension Not Installed (Optional)
- [ ] Disable Polkadot.js extension
- [ ] Refresh page
- [ ] Click "Connect Wallet"
- [ ] **Expected**: Error message about extension not found
- [ ] **Expected**: Link or instructions to install extension

## Test 2: Submit Historical Event

### Test 2.1: Navigate to Submit Page
- [ ] Connect wallet (if not connected)
- [ ] Click "Submit Event" in navigation
- [ ] **Expected**: Submit event form is displayed
- [ ] **Expected**: All form fields are visible (Title, Date, Description, Evidence)

### Test 2.2: Form Validation
- [ ] Try to submit empty form
- [ ] **Expected**: Validation errors appear for required fields
- [ ] Fill in Title only
- [ ] Try to submit
- [ ] **Expected**: Validation errors for other required fields
- [ ] **Expected**: Form does not submit

### Test 2.3: Submit Valid Event
- [ ] Fill in all required fields:
  - Title: "Moon Landing"
  - Date: 1969
  - Description: "Apollo 11 successfully landed on the moon"
  - Evidence: "https://nasa.gov/apollo11"
- [ ] Click "Add Evidence Source" button
- [ ] Add second evidence: "https://archive.org/moon-landing"
- [ ] Click "Submit Event" button
- [ ] **Expected**: Loading spinner appears
- [ ] **Expected**: Polkadot.js extension popup for transaction signing
- [ ] Sign the transaction
- [ ] **Expected**: Success toast notification appears
- [ ] **Expected**: Event ID is displayed in success message
- [ ] **Expected**: Form is cleared after submission

### Test 2.4: Submit Multiple Events
- [ ] Submit another event with different data:
  - Title: "First Computer"
  - Date: 1946
  - Description: "ENIAC, the first general-purpose computer"
  - Evidence: "https://example.com/eniac"
- [ ] **Expected**: Event submits successfully
- [ ] **Expected**: Different event ID is returned

## Test 3: View Timeline

### Test 3.1: Navigate to Timeline
- [ ] Click "Timeline" in navigation
- [ ] **Expected**: Timeline page loads
- [ ] **Expected**: Three timeline tabs are visible (Canonical, Disputed, Alternative)
- [ ] **Expected**: Disputed timeline is selected by default

### Test 3.2: View Disputed Timeline
- [ ] Click "Disputed" tab (if not already selected)
- [ ] **Expected**: List of events appears
- [ ] **Expected**: Recently submitted events are visible
- [ ] **Expected**: Each event shows: Title, Date, Consensus Score
- [ ] **Expected**: Loading skeleton appears while fetching

### Test 3.3: View Event Details
- [ ] Click on an event in the list
- [ ] **Expected**: Event detail page opens
- [ ] **Expected**: Full event information is displayed:
  - Title
  - Date
  - Description
  - Evidence sources (clickable links)
  - Submitter address
  - Consensus score
  - Vote counts (Support/Challenge)
  - Current timeline

### Test 3.4: View Other Timelines
- [ ] Click "Canonical" tab
- [ ] **Expected**: Canonical timeline events are displayed (may be empty initially)
- [ ] Click "Alternative" tab
- [ ] **Expected**: Alternative timeline events are displayed (may be empty initially)

## Test 4: Voting Functionality

### Test 4.1: Vote to Support
- [ ] Navigate to an event in Disputed timeline
- [ ] Click on the event to view details
- [ ] **Expected**: "Support" and "Challenge" buttons are visible
- [ ] **Expected**: Buttons are enabled (not disabled)
- [ ] Click "Support" button
- [ ] **Expected**: Polkadot.js extension popup for transaction signing
- [ ] Sign the transaction
- [ ] **Expected**: Loading spinner on button during transaction
- [ ] **Expected**: Success toast notification
- [ ] **Expected**: Vote buttons become disabled
- [ ] **Expected**: Message "You have already voted on this event" appears
- [ ] **Expected**: Consensus score updates
- [ ] **Expected**: Support vote count increases by 1

### Test 4.2: Duplicate Vote Prevention
- [ ] Try to click "Support" or "Challenge" button again
- [ ] **Expected**: Buttons remain disabled
- [ ] **Expected**: No transaction is initiated
- [ ] **Expected**: Message indicates already voted

### Test 4.3: Vote from Different Account
- [ ] Disconnect current wallet
- [ ] Connect with different account (e.g., Bob)
- [ ] Navigate to the same event
- [ ] **Expected**: Vote buttons are enabled
- [ ] Click "Challenge" button
- [ ] Sign the transaction
- [ ] **Expected**: Vote is recorded successfully
- [ ] **Expected**: Challenge vote count increases by 1
- [ ] **Expected**: Consensus score updates accordingly

### Test 4.4: Multiple Votes from Different Accounts
- [ ] Connect with third account (e.g., Charlie)
- [ ] Vote on the same event (Support)
- [ ] **Expected**: Vote is recorded
- [ ] Switch back to first account (Alice)
- [ ] View the event
- [ ] **Expected**: Vote counts reflect all votes
- [ ] **Expected**: Consensus score is calculated correctly
  - Formula: (Support Votes / Total Votes) × 100

## Test 5: Timeline Movement - Canonical (≥75%)

### Test 5.1: Create Event for Canonical Test
- [ ] Connect with Alice
- [ ] Submit new event: "Canonical Timeline Test"
- [ ] Note the event ID

### Test 5.2: Vote to Reach 75% Consensus
- [ ] Vote with Alice: Support
- [ ] Vote with Bob: Support
- [ ] Vote with Charlie: Support
- [ ] Vote with Dave (4th account): Challenge
- [ ] **Expected**: After 4 votes, consensus = 75% (3 support, 1 challenge)

### Test 5.3: Verify Timeline Movement
- [ ] Refresh the event detail page
- [ ] **Expected**: Event timeline shows "Canonical"
- [ ] Navigate to Canonical timeline tab
- [ ] **Expected**: Event appears in Canonical timeline list
- [ ] Navigate to Disputed timeline tab
- [ ] **Expected**: Event no longer appears in Disputed timeline

## Test 6: Timeline Movement - Alternative (≤25%)

### Test 6.1: Create Event for Alternative Test
- [ ] Submit new event: "Alternative Timeline Test"
- [ ] Note the event ID

### Test 6.2: Vote to Reach 25% Consensus
- [ ] Vote with Alice: Support
- [ ] Vote with Bob: Challenge
- [ ] Vote with Charlie: Challenge
- [ ] Vote with Dave: Challenge
- [ ] **Expected**: After 4 votes, consensus = 25% (1 support, 3 challenge)

### Test 6.3: Verify Timeline Movement
- [ ] Refresh the event detail page
- [ ] **Expected**: Event timeline shows "Alternative"
- [ ] Navigate to Alternative timeline tab
- [ ] **Expected**: Event appears in Alternative timeline list
- [ ] Navigate to Disputed timeline tab
- [ ] **Expected**: Event no longer appears in Disputed timeline

## Test 7: Timeline Movement - Disputed (26-74%)

### Test 7.1: Create Event for Disputed Test
- [ ] Submit new event: "Disputed Timeline Test"

### Test 7.2: Vote to Stay in Disputed Range
- [ ] Vote with Alice: Support
- [ ] Vote with Bob: Support
- [ ] Vote with Charlie: Challenge
- [ ] **Expected**: After 3 votes, consensus = 66.67% (2 support, 1 challenge)
- [ ] **Expected**: 26% < 66.67% < 74%, so stays in Disputed

### Test 7.3: Verify Remains in Disputed
- [ ] Refresh the event detail page
- [ ] **Expected**: Event timeline shows "Disputed"
- [ ] Navigate to Disputed timeline tab
- [ ] **Expected**: Event still appears in Disputed timeline

## Test 8: Date Filtering

### Test 8.1: Apply Date Range Filter
- [ ] Navigate to any timeline view
- [ ] Click "Show Filters" button
- [ ] **Expected**: Filter panel expands
- [ ] Set "Start Date": 1900
- [ ] Set "End Date": 2000
- [ ] **Expected**: Events are filtered in real-time
- [ ] **Expected**: Only events within date range are shown

### Test 8.2: Clear Filters
- [ ] Click "Clear Filters" button
- [ ] **Expected**: All events are shown again
- [ ] **Expected**: Filter inputs are cleared

## Test 9: Timeline Visualization

### Test 9.1: View Visual Timeline
- [ ] Navigate to timeline page
- [ ] Scroll to timeline visualization section
- [ ] **Expected**: Visual timeline with date axis is displayed
- [ ] **Expected**: Events are positioned chronologically
- [ ] **Expected**: Events are color-coded by timeline:
  - Green: Canonical
  - Yellow: Disputed
  - Red: Alternative

### Test 9.2: Interact with Timeline
- [ ] Hover over an event marker
- [ ] **Expected**: Tooltip with event preview appears
- [ ] Click on an event marker
- [ ] **Expected**: Event detail page opens

## Test 10: Error Handling

### Test 10.1: Network Error
- [ ] Stop the substrate-contracts-node
- [ ] Try to submit an event
- [ ] **Expected**: Error message about network connection
- [ ] **Expected**: Retry option is available
- [ ] Restart substrate-contracts-node
- [ ] Click retry
- [ ] **Expected**: Operation succeeds

### Test 10.2: Transaction Rejection
- [ ] Try to submit an event
- [ ] Reject the transaction in Polkadot.js extension
- [ ] **Expected**: Error toast notification
- [ ] **Expected**: Message indicates transaction was rejected
- [ ] **Expected**: Form remains filled (data not lost)

### Test 10.3: Insufficient Balance
- [ ] Use an account with no balance
- [ ] Try to submit an event
- [ ] **Expected**: Error message about insufficient balance
- [ ] **Expected**: Helpful message suggesting how to get tokens

## Test 11: Dark Mode

### Test 11.1: Toggle Dark Mode
- [ ] Click dark mode toggle (moon/sun icon) in header
- [ ] **Expected**: Theme switches to dark mode
- [ ] **Expected**: All components are readable in dark mode
- [ ] **Expected**: Colors are appropriate for dark theme

### Test 11.2: Dark Mode Persistence
- [ ] Refresh the page
- [ ] **Expected**: Dark mode preference is maintained

## Test 12: Responsive Design

### Test 12.1: Mobile View
- [ ] Resize browser to mobile width (< 768px)
- [ ] **Expected**: Navigation collapses to hamburger menu
- [ ] **Expected**: All content is readable and accessible
- [ ] **Expected**: Forms are usable on mobile
- [ ] **Expected**: Timeline visualization adapts to mobile

### Test 12.2: Tablet View
- [ ] Resize browser to tablet width (768px - 1024px)
- [ ] **Expected**: Layout adapts appropriately
- [ ] **Expected**: All features remain accessible

## Test 13: Browser Compatibility

### Test 13.1: Chrome/Chromium
- [ ] Test all core flows in Chrome
- [ ] **Expected**: All features work correctly

### Test 13.2: Firefox
- [ ] Test all core flows in Firefox
- [ ] **Expected**: All features work correctly
- [ ] **Expected**: Polkadot.js extension works

### Test 13.3: Safari (if on macOS)
- [ ] Test all core flows in Safari
- [ ] **Expected**: All features work correctly

## Test 14: Edge Cases

### Test 14.1: Exactly 75% Consensus
- [ ] Create event and get exactly 3 support, 1 challenge votes
- [ ] **Expected**: Event moves to Canonical timeline
- [ ] **Expected**: Consensus score shows 75%

### Test 14.2: Exactly 25% Consensus
- [ ] Create event and get exactly 1 support, 3 challenge votes
- [ ] **Expected**: Event moves to Alternative timeline
- [ ] **Expected**: Consensus score shows 25%

### Test 14.3: Single Vote
- [ ] Create event and cast only 1 vote
- [ ] **Expected**: Consensus score is either 100% or 0%
- [ ] **Expected**: Event may move to Canonical or Alternative immediately

### Test 14.4: Very Long Event Data
- [ ] Submit event with very long title (100+ characters)
- [ ] Submit event with very long description (1000+ characters)
- [ ] Submit event with many evidence sources (10+)
- [ ] **Expected**: All data is stored and displayed correctly
- [ ] **Expected**: UI handles long content gracefully

### Test 14.5: Special Characters
- [ ] Submit event with special characters in title: "Test & Event <>"
- [ ] **Expected**: Special characters are handled correctly
- [ ] **Expected**: No XSS vulnerabilities

## Test 15: Performance

### Test 15.1: Loading States
- [ ] Observe loading states during all async operations
- [ ] **Expected**: Loading spinners or skeletons appear
- [ ] **Expected**: No blank screens during loading
- [ ] **Expected**: Loading states are removed when data loads

### Test 15.2: Multiple Events
- [ ] Submit 10+ events
- [ ] Navigate to timeline view
- [ ] **Expected**: All events load and display
- [ ] **Expected**: Page remains responsive
- [ ] **Expected**: Scrolling is smooth

## Bug Tracking

Document any bugs found during testing:

| Test # | Description | Severity | Status |
|--------|-------------|----------|--------|
|        |             |          |        |

## Test Summary

- **Total Tests**: 15 categories, 50+ individual test cases
- **Tests Passed**: ___
- **Tests Failed**: ___
- **Bugs Found**: ___
- **Critical Issues**: ___

## Sign-off

- **Tester Name**: _______________
- **Date**: _______________
- **Overall Status**: [ ] Pass [ ] Fail [ ] Pass with Issues
- **Notes**: 

---

## Automated Test Results

The automated integration test script (`contract/integration-test.js`) can be run to verify contract functionality:

```bash
node contract/integration-test.js
```

This tests:
- Event submission
- Voting mechanism
- Duplicate vote prevention
- Consensus calculation
- Timeline movement (75%, 25% thresholds)
- Query methods (by timeline, by user)

**Note**: The automated test may fail if the contract already has events from previous runs. For clean testing, restart the substrate node with `--tmp` flag to start with fresh state.
