# Design Document - HistoryDAO Enhancements

## Overview

This document outlines the technical design for enhancing the HistoryDAO application with rebranding, event tagging, dark blue theming, and improved wallet UX.

## Architecture Changes

### Component Updates

```
Changes Required:
├── Smart Contract (contract/lib.rs)
│   └── Add tags field to HistoricalEvent struct
│   └── Update submit_event method signature
│   └── Add get_events_by_tag query method
│
├── Frontend Components
│   ├── EventSubmission.tsx - Add tag selector
│   ├── EventDetail.tsx - Display tags
│   ├── TimelineView.tsx - Add tag filtering
│   ├── WalletConnection.tsx - Add account authorization info
│   └── Header.tsx - Update branding
│
├── Styling (Tailwind Config)
│   └── Add dark blue color palette
│
└── Configuration Files
    ├── package.json - Update project name
    ├── README.md - Update branding
    └── Documentation files - Update references
```

## Components and Interfaces

### 1. Smart Contract Changes

#### Updated HistoricalEvent Struct

```rust
pub struct HistoricalEvent {
    pub id: u64,
    pub title: String,
    pub date: u64,
    pub description: String,
    pub evidence_sources: Vec<String>,
    pub tags: Vec<String>,  // NEW FIELD
    pub submitter: AccountId,
    pub timeline: Timeline,
    pub consensus_score: u8,
    pub support_votes: u32,
    pub challenge_votes: u32,
    pub created_at: u64,
}
```

#### Updated submit_event Method

```rust
#[ink(message)]
pub fn submit_event(
    &mut self,
    title: String,
    date: u64,
    description: String,
    evidence_sources: Vec<String>,
    tags: Vec<String>,  // NEW PARAMETER
) -> Result<u64, Error>
```

#### New Query Method

```rust
#[ink(message)]
pub fn get_events_by_tag(&self, tag: String) -> Vec<HistoricalEvent> {
    // Iterate through all events and filter by tag
    // Return events that contain the specified tag
}
```

#### Optional: Tag Index Storage (for performance)

```rust
#[ink(storage)]
pub struct HistoryProtocol {
    events: Mapping<u64, HistoricalEvent>,
    event_count: u64,
    votes: Mapping<(u64, AccountId), Vote>,
    timeline_events: Mapping<Timeline, Vec<u64>>,
    user_events: Mapping<AccountId, Vec<u64>>,
    tag_events: Mapping<String, Vec<u64>>,  // NEW: Index events by tag
}
```

### 2. Frontend Type Updates

#### TypeScript Interface

```typescript
interface HistoricalEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  evidenceSources: string[];
  tags: string[];  // NEW FIELD
  submitter: string;
  timeline: 'canonical' | 'disputed' | 'alternative';
  consensusScore: number;
  supportVotes: number;
  challengeVotes: number;
  createdAt: Date;
}

// Predefined tag options
const TAG_OPTIONS = [
  'Science',
  'Technology',
  'Politics',
  'Culture',
  'Economics',
  'Military',
  'Space',
  'Medicine',
  'Environment',
  'Social',
] as const;

type EventTag = typeof TAG_OPTIONS[number];
```

### 3. EventSubmission Component Enhancement

#### Tag Selector UI

```typescript
// Multi-select tag component
const [selectedTags, setSelectedTags] = useState<string[]>([]);

const toggleTag = (tag: string) => {
  setSelectedTags(prev => 
    prev.includes(tag) 
      ? prev.filter(t => t !== tag)
      : [...prev, tag]
  );
};

// UI: Display tags as clickable chips
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Categories (select all that apply)
  </label>
  <div className="flex flex-wrap gap-2">
    {TAG_OPTIONS.map(tag => (
      <button
        key={tag}
        type="button"
        onClick={() => toggleTag(tag)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          selectedTags.includes(tag)
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {tag}
      </button>
    ))}
  </div>
</div>
```

### 4. EventDetail Component Enhancement

#### Tag Display

```typescript
// Display tags as colored badges
<div className="flex flex-wrap gap-2 mt-4">
  <span className="text-sm font-medium text-gray-700">Categories:</span>
  {event.tags.map(tag => (
    <span
      key={tag}
      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
    >
      {tag}
    </span>
  ))}
</div>
```

### 5. TimelineView Component Enhancement

#### Tag Filter UI

```typescript
const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);

// Filter events by selected tags
const filteredEvents = events.filter(event => {
  if (selectedFilterTags.length === 0) return true;
  return selectedFilterTags.some(tag => event.tags.includes(tag));
});

// UI: Tag filter dropdown or chips
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Filter by Category
  </label>
  <div className="flex flex-wrap gap-2">
    {TAG_OPTIONS.map(tag => (
      <button
        key={tag}
        onClick={() => toggleFilterTag(tag)}
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          selectedFilterTags.includes(tag)
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        {tag}
      </button>
    ))}
  </div>
</div>
```

### 6. WalletConnection Component Enhancement

#### Account Authorization Info Message

```typescript
// Show info message when only 1 account is connected
{isConnected && accounts.length === 1 && (
  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <div className="flex items-start gap-2">
      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /* info icon */>
        {/* SVG path */}
      </svg>
      <div className="text-sm text-blue-800">
        <p className="font-medium mb-1">Want to use multiple accounts?</p>
        <p>
          Open your Polkadot.js extension and authorize additional accounts 
          for this site to enable account switching.
        </p>
      </div>
    </div>
  </div>
)}
```

### 7. Color Theme Design

#### Tailwind Config Updates

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Timeline colors (keep existing)
        canonical: '#10b981',
        disputed: '#f59e0b',
        alternative: '#ef4444',
        
        // New primary blue palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

#### Component Color Updates

Replace generic blue classes with primary palette:
- `bg-blue-600` → `bg-primary-600`
- `text-blue-800` → `text-primary-800`
- `border-blue-200` → `border-primary-200`

Dark mode backgrounds:
- Light mode: `bg-gray-50` → `bg-primary-50`
- Dark mode: `dark:bg-gray-900` → `dark:bg-slate-900`

### 8. Branding Updates

#### Files to Update

1. **package.json**
```json
{
  "name": "historydao",
  "description": "HistoryDAO - Decentralized Historical Record System"
}
```

2. **index.html**
```html
<title>HistoryDAO - Decentralized History</title>
```

3. **Header Component**
```typescript
<h1 className="text-2xl font-bold text-primary-900 dark:text-white">
  HistoryDAO
</h1>
```

4. **WalletContext.tsx**
```typescript
const extensions = await web3Enable('HistoryDAO');
```

5. **README.md**
- Replace all instances of "Contested History Protocol" with "HistoryDAO"
- Update project description

6. **Documentation files**
- Update all .md files in docs/ folder
- Update spec files in .kiro/specs/

## Data Models

### Updated Event Submission Flow

```typescript
// Frontend submission
const submitEvent = async (eventData: {
  title: string;
  date: Date;
  description: string;
  evidenceSources: string[];
  tags: string[];  // NEW
}) => {
  const dateTimestamp = Math.floor(eventData.date.getTime() / 1000);
  
  await contract.tx.submitEvent(
    { gasLimit: gasRequired },
    eventData.title,
    dateTimestamp,
    eventData.description,
    eventData.evidenceSources,
    eventData.tags  // NEW PARAMETER
  ).signAndSend(account, callback);
};
```

## Error Handling

### Tag Validation

```rust
// In submit_event method
if tags.is_empty() {
    return Err(Error::InvalidEventData);
}

// Limit number of tags
if tags.len() > 5 {
    return Err(Error::InvalidEventData);
}
```

### Frontend Validation

```typescript
// Require at least one tag
if (selectedTags.length === 0) {
  setError('Please select at least one category');
  return;
}

// Limit to 5 tags
if (selectedTags.length > 5) {
  setError('Maximum 5 categories allowed');
  return;
}
```

## Testing Strategy

### Contract Testing

1. Test event submission with tags
2. Test tag validation (empty, too many)
3. Test get_events_by_tag query
4. Test existing functionality still works with new field

### Frontend Testing

1. Test tag selection in submission form
2. Test tag display in event details
3. Test tag filtering in timeline view
4. Test account authorization info message display
5. Test color theme in light and dark modes
6. Verify all branding updates

### Migration Testing

Since this requires contract redeployment:
1. Deploy new contract to local node
2. Update frontend contract address
3. Test full flow with new contract
4. Verify backward compatibility isn't needed (fresh deployment)

## Implementation Notes

### Contract Redeployment Required

⚠️ **Important**: Adding the `tags` field requires recompiling and redeploying the smart contract. All existing events will be lost.

**Steps:**
1. Update contract code
2. Compile: `cargo contract build`
3. Deploy new contract to local node
4. Update contract address in frontend config
5. Test with fresh data

### Tag Storage Optimization

For MVP, iterate through all events to filter by tag. For production:
- Add `tag_events: Mapping<String, Vec<u64>>` to index events by tag
- Update `submit_event` to populate tag index
- Use index in `get_events_by_tag` for O(1) lookup

### Color Theme Migration

Use CSS variables for easy theme switching:
```css
:root {
  --color-primary: #2563eb;
  --color-primary-dark: #1e40af;
}

.dark {
  --color-primary: #60a5fa;
  --color-primary-dark: #3b82f6;
}
```

## Future Enhancements

- Custom tag creation by users
- Tag popularity/trending
- Tag-based event recommendations
- Multi-tag AND/OR filtering logic
- Tag autocomplete in search


## Unified Timeline View Design

### Overview

Add a new "All Events" timeline view that displays events from all three timeline types (Canonical, Disputed, Alternative) in a single chronological visualization. This provides users with a comprehensive view of all historical events while maintaining visual distinction through color coding.

### Component Architecture

#### Timeline Navigation Enhancement

```typescript
// Add "All Events" option to timeline navigation
type TimelineViewType = 'all' | 'canonical' | 'disputed' | 'alternative';

interface TimelineNavigationProps {
  activeView: TimelineViewType;
  onViewChange: (view: TimelineViewType) => void;
}

// Navigation tabs
const TIMELINE_VIEWS = [
  { id: 'all', label: 'All Events', icon: '📚' },
  { id: 'canonical', label: 'Canonical', icon: '✓', color: 'green' },
  { id: 'disputed', label: 'Disputed', icon: '?', color: 'yellow' },
  { id: 'alternative', label: 'Alternative', icon: '⚠', color: 'red' },
] as const;
```

#### TimelineView Component Updates

```typescript
// Enhanced TimelineView to support unified view
interface TimelineViewProps {
  timelineType: TimelineViewType; // Updated to include 'all'
}

const TimelineView: React.FC<TimelineViewProps> = ({ timelineType }) => {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch events based on view type
  const fetchEvents = async () => {
    if (timelineType === 'all') {
      // Fetch all events from all timelines
      const allEvents = await contractService.getAllEvents();
      setEvents(allEvents);
    } else {
      // Fetch events for specific timeline
      const timelineEvents = await contractService.getEventsByTimeline(timelineType);
      setEvents(timelineEvents);
    }
  };

  // Apply tag filters
  const filteredEvents = useMemo(() => {
    if (selectedTags.length === 0) return events;
    return events.filter(event => 
      selectedTags.some(tag => event.tags.includes(tag))
    );
  }, [events, selectedTags]);

  return (
    <div>
      {/* Timeline Type Tabs */}
      <TimelineNavigation 
        activeView={timelineType} 
        onViewChange={handleViewChange} 
      />
      
      {/* Tag Filters (works for all views) */}
      <TagFilter 
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
      />
      
      {/* Timeline Visualization */}
      <TimelineVisualization 
        events={filteredEvents}
        showTimelineLabels={timelineType === 'all'} // Show labels only in unified view
      />
    </div>
  );
};
```

### Frontend Data Aggregation (No Contract Changes Required)

Instead of adding a new contract method, we fetch events from all three existing timelines and merge them in the frontend:

```typescript
// contractService.ts - No contract changes needed!
export const getAllEvents = async (): Promise<HistoricalEvent[]> => {
  // Fetch events from all three timelines
  const [canonical, disputed, alternative] = await Promise.all([
    getEventsByTimeline('canonical'),
    getEventsByTimeline('disputed'),
    getEventsByTimeline('alternative'),
  ]);
  
  // Merge all events into single array
  const allEvents = [...canonical, ...disputed, ...alternative];
  
  // Sort chronologically by date
  allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return allEvents;
};
```

**Benefits of this approach:**
- No contract redeployment needed
- No gas cost for new contract method
- Leverages existing contract queries
- Simple frontend-only implementation
- Easy to maintain and test

### Visual Design

#### Unified Timeline Layout

```
┌─────────────────────────────────────────────────────────┐
│  [All Events] [Canonical] [Disputed] [Alternative]      │
├─────────────────────────────────────────────────────────┤
│  Filter by Tags: [Science] [Space] [Politics] ...       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ●─── 1957: Sputnik Launch [Canonical] 🟢              │
│  │                                                       │
│  ●─── 1961: Gagarin First in Space [Canonical] 🟢      │
│  │                                                       │
│  ●─── 1961: Gagarin Landing Details [Disputed] 🟡      │
│  │                                                       │
│  ●─── 1969: Apollo 11 Moon Landing [Canonical] 🟢      │
│  │                                                       │
│  ●─── 1969: Moon Landing Hoax Theory [Alternative] 🔴  │
│  │                                                       │
│  ●─── 1970: Apollo 13 Safe Return [Canonical] 🟢       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### Color Coding Strategy

- **Canonical events**: Green dot (🟢) + green badge
- **Disputed events**: Yellow dot (🟡) + yellow badge  
- **Alternative events**: Red dot (🔴) + red badge
- All events maintain their timeline badge in the card
- Vertical timeline line remains neutral gray

### Performance Considerations

```typescript
// Optional: Add caching to avoid redundant queries
let cachedEvents: {
  canonical: HistoricalEvent[];
  disputed: HistoricalEvent[];
  alternative: HistoricalEvent[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 30000; // 30 seconds

export const getAllEvents = async (useCache = true): Promise<HistoricalEvent[]> => {
  const now = Date.now();
  
  // Use cache if available and fresh
  if (useCache && cachedEvents && (now - cachedEvents.timestamp) < CACHE_DURATION) {
    const allEvents = [
      ...cachedEvents.canonical,
      ...cachedEvents.disputed,
      ...cachedEvents.alternative
    ];
    return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  // Fetch fresh data
  const [canonical, disputed, alternative] = await Promise.all([
    getEventsByTimeline('canonical'),
    getEventsByTimeline('disputed'),
    getEventsByTimeline('alternative'),
  ]);
  
  // Update cache
  cachedEvents = { canonical, disputed, alternative, timestamp: now };
  
  // Merge and sort
  const allEvents = [...canonical, ...disputed, ...alternative];
  return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
};
```

### Routing Updates

```typescript
// App.tsx or Router configuration
const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/timeline/all', element: <TimelineView timelineType="all" /> },
  { path: '/timeline/canonical', element: <TimelineView timelineType="canonical" /> },
  { path: '/timeline/disputed', element: <TimelineView timelineType="disputed" /> },
  { path: '/timeline/alternative', element: <TimelineView timelineType="alternative" /> },
  { path: '/submit', element: <SubmitEventPage /> },
  { path: '/event/:id', element: <EventDetailPage /> },
];
```

### User Experience Flow

1. **Default View**: Homepage shows "All Events" unified timeline by default
2. **Navigation**: Users can switch between "All Events" and specific timelines via tabs
3. **Filtering**: Tag filters work consistently across all views
4. **Visual Clarity**: Color-coded dots and badges make timeline type immediately visible
5. **Consistency**: Same timeline visualization component used for all views

### Implementation Notes

#### Performance Considerations

- **Caching**: Cache all events to avoid repeated contract calls when switching views
- **Pagination**: Consider implementing pagination if event count grows large
- **Lazy Loading**: Load events on-demand as user scrolls

#### State Management

```typescript
// Use React Context or state management for timeline data
interface TimelineContextType {
  allEvents: HistoricalEvent[];
  canonicalEvents: HistoricalEvent[];
  disputedEvents: HistoricalEvent[];
  alternativeEvents: HistoricalEvent[];
  refreshEvents: () => Promise<void>;
}
```

### Testing Strategy

- Test navigation between all four timeline views
- Verify tag filtering works in unified "All Events" view
- Confirm color coding is correct for each timeline type
- Test with mixed events (some canonical, some disputed, some alternative)
- Verify chronological ordering in unified view
- Test empty states for each view type

### Benefits of Unified Timeline

1. **Complete Picture**: Users see all historical events in context
2. **Comparison**: Easy to compare canonical vs disputed vs alternative interpretations
3. **Discovery**: Users can discover events they might miss in separate views
4. **Flexibility**: Maintains separate views for focused exploration
5. **Visual Clarity**: Color coding makes consensus levels immediately apparent
