# Implementation Plan - HistoryDAO Enhancements

- [x] 1. Rebrand application to HistoryDAO
  - [x] 1.1 Update package.json with new name and description
    - Change name to "historydao"
    - Update description field
    - _Requirements: 1.1, 1.5_
  
  - [x] 1.2 Update browser page title and meta tags
    - Update title in index.html
    - Update meta description if present
    - _Requirements: 1.4_
  
  - [x] 1.3 Update Header component branding
    - Replace "Contested History Protocol" with "HistoryDAO" in Header.tsx
    - Update any logo or branding elements
    - _Requirements: 1.1_
  
  - [x] 1.4 Update wallet connection app name
    - Change web3Enable parameter from "Contested History Protocol" to "HistoryDAO" in WalletContext.tsx
    - _Requirements: 1.2_
  
  - [x] 1.5 Update README and documentation
    - Replace all instances of "Contested History Protocol" with "HistoryDAO" in README.md
    - Update QUICK_START.md and SETUP.md
    - Update docs/README.md
    - _Requirements: 1.3, 1.5_

- [x] 2. Add event tagging to smart contract
  - [x] 2.1 Update HistoricalEvent struct with tags field
    - Add `tags: Vec<String>` field to HistoricalEvent struct
    - Ensure proper encoding/decoding traits
    - _Requirements: 2.3_
  
  - [x] 2.2 Update submit_event method signature
    - Add `tags: Vec<String>` parameter to submit_event
    - Add validation: require at least 1 tag, maximum 5 tags
    - Store tags with event data
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 2.3 Add get_events_by_tag query method
    - Implement method to filter events by tag
    - Return Vec<HistoricalEvent> containing specified tag
    - _Requirements: 2.5_
  
  - [x] 2.4 Add unit tests for tag functionality
    - Test event submission with tags
    - Test tag validation (empty, too many)
    - Test get_events_by_tag query
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 2.5 Rebuild and redeploy smart contract
    - Compile contract with cargo contract build
    - Deploy to local Substrate Contracts Node
    - Record new contract address
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Update frontend types and contract service for tags
  - [x] 3.1 Update TypeScript interfaces
    - Add `tags: string[]` field to HistoricalEvent interface in types file
    - Create TAG_OPTIONS constant with predefined categories
    - Create EventTag type
    - _Requirements: 2.2, 2.3_
  
  - [x] 3.2 Update contract service methods
    - Update submitEvent wrapper to accept tags parameter
    - Add getEventsByTag wrapper method
    - Update contract address configuration with new deployed contract
    - _Requirements: 2.1, 2.3, 2.5_

- [x] 4. Implement tag selection in EventSubmission component
  - [x] 4.1 Create tag selector UI
    - Add multi-select tag chips/buttons for TAG_OPTIONS
    - Implement toggleTag function to add/remove tags
    - Style selected vs unselected tags
    - _Requirements: 2.1, 2.2_
  
  - [x] 4.2 Add tag validation
    - Require at least one tag before submission
    - Limit to maximum 5 tags
    - Display validation error messages
    - _Requirements: 2.1_
  
  - [x] 4.3 Update form submission logic
    - Include selectedTags in contract call
    - Pass tags to submitEvent contract method
    - _Requirements: 2.1, 2.3_

- [x] 5. Display tags in EventDetail component
  - [x] 5.1 Add tag display section
    - Show tags as colored badge chips
    - Style with blue theme colors
    - Position below event description or metadata
    - _Requirements: 2.4_
  
  - [x] 5.2 Make tags clickable for filtering (optional enhancement)
    - Add onClick handler to navigate to filtered timeline view
    - _Requirements: 2.5_

- [x] 6. Add tag filtering to TimelineView component
  - [x] 6.1 Create tag filter UI
    - Add filter section above event list
    - Display TAG_OPTIONS as filter chips
    - Implement multi-select filter logic
    - _Requirements: 2.5_
  
  - [x] 6.2 Implement filter logic
    - Filter displayed events by selected tags
    - Show events that match ANY selected tag (OR logic)
    - Update event list when filters change
    - _Requirements: 2.5_
  
  - [x] 6.3 Add clear filters button
    - Allow users to reset all tag filters
    - Show filter count when active
    - _Requirements: 2.5_

- [x] 7. Implement dark blue color theme
  - [x] 7.1 Update Tailwind configuration
    - Add primary color palette (blue-50 through blue-900)
    - Keep existing timeline colors (canonical, disputed, alternative)
    - Configure dark mode slate colors
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [x] 7.2 Update component color classes
    - Replace generic blue classes with primary palette in all components
    - Update Header component colors
    - Update WalletConnection component colors
    - Update EventSubmission form colors
    - Update TimelineView colors
    - Update EventDetail colors
    - Update button and link colors throughout app
    - _Requirements: 3.2, 3.3_
  
  - [x] 7.3 Verify dark mode colors
    - Test all components in dark mode
    - Ensure proper contrast for accessibility
    - Adjust dark mode specific colors if needed
    - _Requirements: 3.3, 3.5_
  
  - [x] 7.4 Update loading and error components
    - Apply new color scheme to LoadingSpinner
    - Apply new color scheme to ErrorMessage
    - Apply new color scheme to Toast notifications
    - _Requirements: 3.2, 3.3_

- [x] 8. Add account authorization info message to WalletConnection
  - [x] 8.1 Create info message component
    - Design info box with blue background and icon
    - Write clear instructional text about authorizing accounts
    - Style with new primary color theme
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 8.2 Implement conditional display logic
    - Show message only when accounts.length === 1
    - Hide message when accounts.length > 1
    - Position near wallet connection area
    - _Requirements: 4.1, 4.4, 4.5_
  
  - [x] 8.3 Add helpful link or instructions
    - Include guidance on opening Polkadot.js extension
    - Explain how to authorize accounts for the site
    - Make instructions clear and beginner-friendly
    - _Requirements: 4.3_

- [x] 9. Update test data plan with tags
  - Update TEST_DATA_PLAN.md to include appropriate tags for each historical event
  - Add tags to Space Race events (e.g., "Space", "Science", "Technology", "Politics")
  - Ensure tag distribution allows testing of filter functionality
  - _Requirements: 2.1, 2.2, 2.5_

- [-] 10. Add unified "All Events" timeline view
  - [x] 10.1 Update frontend types for unified timeline
    - Add 'all' to TimelineViewType union type
    - Update TIMELINE_VIEWS constant with "All Events" option
    - Add icon and styling for unified view tab
    - _Requirements: 5.1, 5.7_
  
  - [x] 10.2 Add getAllEvents helper in contract service
    - Create function that fetches events from all three timelines (canonical, disputed, alternative)
    - Merge the three arrays into single array
    - Sort merged array chronologically by date
    - Return combined HistoricalEvent array
    - _Requirements: 5.2, 5.6_
  
  - [x] 10.3 Update TimelineView component for unified view
    - Add logic to call getAllEvents when timelineType is 'all'
    - Maintain existing logic for specific timeline views
    - Ensure tag filtering works with unified view
    - Update component to handle 'all' timeline type
    - _Requirements: 5.2, 5.5, 5.6_
  
  - [x] 10.4 Add timeline navigation tabs
    - Create navigation component with 4 tabs: All Events, Canonical, Disputed, Alternative
    - Style active tab with blue theme
    - Add icons/indicators for each timeline type
    - Implement tab switching logic
    - Position tabs above timeline view
    - _Requirements: 5.1, 5.4, 5.7_
  
  - [x] 10.5 Update TimelineVisualization for unified view
    - Ensure color-coded dots display correctly for all timeline types
    - Show timeline badges on event cards in unified view
    - Maintain chronological ordering
    - Test with mixed timeline events
    - _Requirements: 5.3, 5.6_
  
  - [x] 10.6 Update routing for unified timeline
    - Add route for /timeline/all
    - Update HomePage to default to unified view or provide navigation
    - Ensure deep linking works for all timeline views
    - _Requirements: 5.7_
  
  - [ ] 10.7 Test unified timeline functionality
    - Submit events to different timelines
    - Verify all events appear in "All Events" view
    - Test tag filtering in unified view
    - Verify color coding is correct
    - Test navigation between views
    - Verify chronological sorting
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 11. Integration testing with new features
  - [ ] 11.1 Test complete event submission flow with tags
    - Submit event with multiple tags
    - Verify tags are stored and displayed correctly
    - Test tag validation (min/max limits)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 11.2 Test tag filtering functionality
    - Filter events by single tag
    - Filter events by multiple tags
    - Verify filter results are correct
    - Test clear filters functionality
    - _Requirements: 2.5_
  
  - [ ] 11.3 Test account authorization info message
    - Connect with single account and verify message appears
    - Authorize additional account in extension
    - Verify message disappears when multiple accounts available
    - Test Switch button functionality
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  
  - [ ] 11.4 Test color theme in both modes
    - Verify all components use new blue theme in light mode
    - Toggle to dark mode and verify dark blue theme
    - Check contrast and readability
    - Test timeline color coding still works (green/yellow/red)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 11.5 Verify branding updates
    - Check all visible text shows "HistoryDAO"
    - Verify browser tab title
    - Check wallet connection prompt
    - Review documentation
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ] 11.6 Test unified "All Events" timeline
    - Verify all events from all timelines appear in unified view
    - Test navigation between unified and separate timeline views
    - Verify color coding for different timeline types
    - Test tag filtering in unified view
    - Verify chronological ordering
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
