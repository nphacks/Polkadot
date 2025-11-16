# Requirements Document - HistoryDAO Enhancements

## Introduction

This specification covers enhancements to the HistoryDAO application including rebranding from "Contested History Protocol" to "HistoryDAO", adding event tagging functionality, implementing a dark blue color theme, improving wallet account selection UX, and adding a unified timeline view that displays all events together.

## Glossary

- **System**: The HistoryDAO decentralized application
- **User**: Any person interacting with the System through a Polkadot wallet
- **Tag**: A categorical label applied to Historical Events for organization and filtering
- **Wallet Extension**: The Polkadot.js browser extension used for wallet management
- **Account Authorization**: The process of allowing specific accounts in the Wallet Extension to connect to the System

## Requirements

### Requirement 1

**User Story:** As a project stakeholder, I want the application rebranded to "HistoryDAO", so that it has a memorable and professional name

#### Acceptance Criteria

1. THE System SHALL display "HistoryDAO" as the application name in the header and all user-facing text
2. THE System SHALL update the wallet connection prompt to use "HistoryDAO" as the application name
3. THE System SHALL update all documentation files to reference "HistoryDAO" instead of "Contested History Protocol"
4. THE System SHALL update the browser page title to "HistoryDAO"
5. THE System SHALL update the README and package.json files with the new name

### Requirement 2

**User Story:** As a user, I want to add multiple category tags to historical events, so that I can organize and filter events by topic

#### Acceptance Criteria

1. WHEN a User submits a Historical Event, THE System SHALL allow the User to add one or more Tag values from predefined categories
2. THE System SHALL support the following Tag categories: "Science", "Technology", "Politics", "Culture", "Economics", "Military", "Space", "Medicine", "Environment", "Social"
3. WHEN a Historical Event is stored, THE System SHALL include all associated Tags in the event data
4. WHEN a User views a Historical Event, THE System SHALL display all Tags associated with that event
5. THE System SHALL allow Users to filter events by selecting one or more Tags

### Requirement 3

**User Story:** As a user, I want a dark blue color theme, so that the application has a professional and visually appealing design

#### Acceptance Criteria

1. THE System SHALL use a dark blue color palette as the primary theme color
2. WHEN the System is in light mode, THE System SHALL use blue tones (blue-50 to blue-100) for backgrounds and blue-600 to blue-800 for primary elements
3. WHEN the System is in dark mode, THE System SHALL use dark blue tones (slate-800 to slate-900) for backgrounds and blue-400 to blue-500 for primary elements
4. THE System SHALL maintain the existing timeline color coding (green for Canonical, yellow for Disputed, red for Alternative)
5. THE System SHALL ensure all text has sufficient contrast against the new color scheme for accessibility

### Requirement 4

**User Story:** As a user with multiple wallet accounts, I want clear guidance on authorizing accounts in my extension, so that I can easily switch between accounts

#### Acceptance Criteria

1. WHEN a User connects their wallet and only one account is authorized, THE System SHALL display an informational message explaining how to authorize additional accounts
2. THE System SHALL display the information message near the wallet connection area
3. THE System SHALL include a link or instructions to open the Polkadot.js extension settings
4. WHEN a User has multiple accounts authorized, THE System SHALL display the "Switch" button without the informational message
5. THE System SHALL dismiss or hide the informational message once multiple accounts are detected

### Requirement 5

**User Story:** As a user, I want to view all historical events together in a unified timeline, so that I can see the complete historical picture across all consensus levels

#### Acceptance Criteria

1. THE System SHALL provide an "All Events" timeline view that displays events from all three timelines (Canonical, Disputed, and Alternative) together
2. WHEN a User selects the "All Events" view, THE System SHALL retrieve and display all Historical Events regardless of timeline type
3. THE System SHALL display events in the unified timeline with color-coded indicators showing their timeline type (green for Canonical, yellow for Disputed, red for Alternative)
4. THE System SHALL maintain the existing separate timeline views (Canonical, Disputed, Alternative) alongside the new unified view
5. THE System SHALL allow Users to apply tag filters to the unified timeline view
6. THE System SHALL display events in chronological order in the unified timeline
7. THE System SHALL provide navigation between the unified "All Events" view and individual timeline views
