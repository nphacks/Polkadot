# Error Handling and Loading States Implementation

This document describes the comprehensive error handling and loading state system implemented for the Contested History Protocol frontend.

## Components Implemented

### 1. ErrorBoundary Component (`src/components/ErrorBoundary.tsx`)
- **Purpose**: Catches JavaScript errors anywhere in the React component tree
- **Features**:
  - Displays user-friendly error UI when errors occur
  - Shows detailed error information in development mode
  - Provides "Try Again" and "Reload Page" buttons
  - Includes helpful troubleshooting tips
  - Prevents entire app from crashing due to component errors

### 2. Toast Notification System

#### Toast Component (`src/components/Toast.tsx`)
- **Purpose**: Displays temporary notification messages
- **Features**:
  - Four types: success, error, info, warning
  - Auto-dismiss with configurable duration
  - Manual dismiss button
  - Animated slide-in from right
  - Color-coded by type with appropriate icons

#### ToastContainer Component (`src/components/ToastContainer.tsx`)
- **Purpose**: Container for managing multiple toast notifications
- **Features**:
  - Fixed position at top-right of screen
  - Stacks multiple toasts vertically
  - Accessible with ARIA attributes

#### useToast Hook (`src/hooks/useToast.ts`)
- **Purpose**: Provides toast notification functionality
- **Features**:
  - Manages toast state
  - Convenience methods: success(), error(), info(), warning()
  - dismissToast() and dismissAll() methods
  - Unique ID generation for each toast

#### ToastContext (`src/contexts/ToastContext.tsx`)
- **Purpose**: Provides toast functionality app-wide
- **Features**:
  - Context provider wraps entire app
  - useToastContext() hook for accessing toast methods
  - Renders ToastContainer automatically

### 3. LoadingSpinner Component (`src/components/LoadingSpinner.tsx`)
- **Purpose**: Displays animated loading indicator
- **Features**:
  - Four sizes: sm, md, lg, xl
  - Optional message text
  - Full-screen mode option
  - Accessible with ARIA attributes
  - Consistent styling with app theme

### 4. ErrorMessage Component (`src/components/ErrorMessage.tsx`)
- **Purpose**: Displays user-friendly error messages
- **Features**:
  - Customizable title and message
  - Optional retry button
  - Optional dismiss button
  - Consistent error styling
  - Icon for visual clarity

### 5. Retry Utility (`src/utils/retry.ts`)
- **Purpose**: Provides retry logic for failed async operations
- **Features**:
  - Exponential backoff strategy
  - Configurable max attempts
  - Configurable delay and backoff multiplier
  - onRetry callback for logging
  - Network error detection
  - retryOnNetworkError() for selective retrying

## Integration Points

### App.tsx
- Wrapped entire app with ErrorBoundary
- Wrapped app with ToastProvider
- Ensures error handling and notifications work throughout app

### ContractService.ts
- Added retry logic to API initialization
- Added retry logic to query methods (getEvent, getEventsByTimeline)
- Improved error messages with context
- Network error detection and handling

### EventSubmission Component
- Integrated toast notifications for success/error feedback
- Shows success toast when event submitted
- Shows error toast when submission fails
- Maintains existing inline error messages

### EventDetail Component
- Integrated toast notifications for vote success/error
- Uses LoadingSpinner for loading state
- Uses ErrorMessage with retry functionality
- Shows toast when vote succeeds or fails

### TimelineView Component
- Uses LoadingSpinner for loading state
- Uses ErrorMessage with retry functionality
- Shows toast when event fetching fails
- Retry button refetches events

### CSS Animations (`src/index.css`)
- Added slide-in-right animation for toasts
- Smooth 0.3s ease-out animation

## Usage Examples

### Using Toast Notifications
```typescript
import { useToastContext } from '../contexts/ToastContext';

function MyComponent() {
  const toast = useToastContext();
  
  // Success notification
  toast.success('Operation completed successfully!');
  
  // Error notification
  toast.error('Something went wrong', 7000); // 7 second duration
  
  // Info notification
  toast.info('Here is some information');
  
  // Warning notification
  toast.warning('Please be careful');
}
```

### Using LoadingSpinner
```typescript
import { LoadingSpinner } from './LoadingSpinner';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);
  
  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading data..." />;
  }
  
  // Or full-screen
  return <LoadingSpinner size="xl" message="Processing..." fullScreen />;
}
```

### Using ErrorMessage
```typescript
import { ErrorMessage } from './ErrorMessage';

function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  
  if (error) {
    return (
      <ErrorMessage
        title="Failed to load data"
        message={error}
        onRetry={handleRetry}
        onDismiss={() => setError(null)}
      />
    );
  }
}
```

### Using Retry Utility
```typescript
import { retry, retryOnNetworkError } from '../utils/retry';

// Retry any async operation
const data = await retry(
  async () => await fetchData(),
  {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error.message);
    }
  }
);

// Retry only on network errors
const data = await retryOnNetworkError(
  async () => await fetchData(),
  { maxAttempts: 3 }
);
```

## Error Handling Strategy

### 1. Component-Level Errors
- Caught by ErrorBoundary
- Displays fallback UI
- Provides recovery options
- Logs errors for debugging

### 2. Network Errors
- Automatic retry with exponential backoff
- User-friendly error messages
- Retry buttons for manual retry
- Toast notifications for feedback

### 3. Validation Errors
- Inline error messages in forms
- Prevents invalid submissions
- Clear error descriptions

### 4. Transaction Errors
- Toast notifications for immediate feedback
- Inline error messages for context
- Detailed error information from blockchain
- Retry options where appropriate

## Benefits

1. **Improved User Experience**
   - Clear feedback for all operations
   - Graceful error recovery
   - No app crashes from component errors
   - Consistent error presentation

2. **Better Reliability**
   - Automatic retry for transient failures
   - Network error handling
   - Exponential backoff prevents server overload

3. **Developer Experience**
   - Reusable error handling components
   - Consistent patterns throughout app
   - Easy to add error handling to new features
   - Detailed error logging in development

4. **Accessibility**
   - ARIA attributes for screen readers
   - Keyboard navigation support
   - Clear visual indicators
   - Semantic HTML

## Testing Recommendations

1. Test ErrorBoundary by throwing errors in components
2. Test toast notifications with various durations
3. Test retry logic with network failures
4. Test loading states with slow connections
5. Test error messages with different error types
6. Verify accessibility with screen readers
7. Test on different screen sizes

## Future Enhancements

1. Add error reporting service integration
2. Add offline detection and handling
3. Add request cancellation for aborted operations
4. Add progress indicators for long operations
5. Add error analytics and tracking
6. Add custom error pages for specific error types
7. Add error recovery suggestions based on error type
