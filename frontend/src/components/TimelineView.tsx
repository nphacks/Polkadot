import { useState, useEffect, useMemo } from 'react';
import { getEventsByTimeline, getAllEvents } from '../services/contractService';
import { EventDetail } from './EventDetail';
import { TimelineVisualization } from './TimelineVisualization';
import { ErrorMessage } from './ErrorMessage';
import { LoadingSkeleton } from './LoadingSkeleton';
import { useToastContext } from '../contexts/ToastContext';
import type { HistoricalEvent, Timeline, TimelineViewType } from '../types';
import { TAG_OPTIONS } from '../types';

interface TimelineViewProps {
  onEventSelect?: (event: HistoricalEvent) => void;
  initialTimeline?: TimelineViewType;
}

export function TimelineView({ onEventSelect, initialTimeline = 'all' }: TimelineViewProps) {
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState<TimelineViewType>(initialTimeline);
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);
  
  // Filter state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'visualization'>('list');

  // Initialize from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('timeline') as TimelineViewType;
    const urlStartDate = params.get('startDate');
    const urlEndDate = params.get('endDate');

    if (urlTab && ['all', 'canonical', 'disputed', 'alternative'].includes(urlTab)) {
      setActiveTab(urlTab);
    }
    if (urlStartDate) setStartDate(urlStartDate);
    if (urlEndDate) setEndDate(urlEndDate);
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('timeline', activeTab);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeTab, startDate, endDate]);

  // Fetch events when active tab changes
  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab]);

  const fetchEvents = async (timelineType: TimelineViewType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedEvents: HistoricalEvent[];
      
      if (timelineType === 'all') {
        // Fetch all events from all timelines
        fetchedEvents = await getAllEvents();
      } else {
        // Fetch events for specific timeline
        fetchedEvents = await getEventsByTimeline(timelineType as Timeline);
      }
      
      setEvents(fetchedEvents);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      const errorMsg = 'Failed to load events. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEvents(activeTab);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedFilterTags([]);
  };

  const toggleFilterTag = (tag: string) => {
    setSelectedFilterTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleEventClick = (event: HistoricalEvent) => {
    setSelectedEvent(event);
    onEventSelect?.(event);
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
  };

  const handleVoteSuccess = () => {
    // Refresh the events list after a successful vote
    fetchEvents(activeTab);
  };

  // Filter events by date range and tags
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by tags (OR logic - show events that match ANY selected tag)
    if (selectedFilterTags.length > 0) {
      filtered = filtered.filter((event) =>
        selectedFilterTags.some(tag => event.tags.includes(tag))
      );
    }

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter((event) => {
        const eventDate = event.date.getTime();
        
        if (startDate && endDate) {
          const start = new Date(startDate).getTime();
          const end = new Date(endDate).getTime();
          return eventDate >= start && eventDate <= end;
        } else if (startDate) {
          const start = new Date(startDate).getTime();
          return eventDate >= start;
        } else if (endDate) {
          const end = new Date(endDate).getTime();
          return eventDate <= end;
        }
        
        return true;
      });
    }

    return filtered;
  }, [events, startDate, endDate, selectedFilterTags]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getTimelineColor = (timeline: Timeline) => {
    const timelineLower = timeline?.toLowerCase();
    switch (timelineLower) {
      case 'canonical':
        return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700';
      case 'disputed':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
      case 'alternative':
        return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700';
    }
  };

  const getTimelineTextColor = (timeline: Timeline) => {
    const timelineLower = timeline?.toLowerCase();
    switch (timelineLower) {
      case 'canonical':
        return '#15803d'; // green-700
      case 'disputed':
        return '#a16207'; // yellow-700
      case 'alternative':
        return '#b91c1c'; // red-700
      default:
        return '#6b7280'; // gray-700
    }
  };

  const getTimelineLabel = (timeline: Timeline) => {
    return timeline.charAt(0).toUpperCase() + timeline.slice(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('all')}
            className={`
              flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'all'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-lg">📚</span>
              All Events
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('canonical')}
            className={`
              flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'canonical'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Canonical
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('disputed')}
            className={`
              flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'disputed'
                ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              Disputed
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('alternative')}
            className={`
              flex-1 py-4 px-6 text-center font-medium text-sm border-b-2 transition-colors
              ${activeTab === 'alternative'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Alternative
            </span>
          </button>
        </nav>
      </div>

      {/* Timeline Description and Filters */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {activeTab === 'all' ? 'All Events' : `${getTimelineLabel(activeTab)} Timeline`}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeTab === 'all' && 'View all historical events from all timelines in chronological order'}
              {activeTab === 'canonical' && 'Events with high community consensus (≥75% support)'}
              {activeTab === 'disputed' && 'Events currently under debate (26-74% support)'}
              {activeTab === 'alternative' && 'Alternative interpretations (≤25% support)'}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  List
                </span>
              </button>
              <button
                onClick={() => setViewMode('visualization')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  viewMode === 'visualization'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Timeline
                </span>
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-4">
            {/* Tag Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Category
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleFilterTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedFilterTags.includes(tag)
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedFilterTags.length > 0 && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {selectedFilterTags.length} {selectedFilterTags.length === 1 ? 'category' : 'categories'} selected
                </div>
              )}
            </div>

            {/* Date Range Filters */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                onClick={handleClearFilters}
                disabled={!startDate && !endDate && selectedFilterTags.length === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear All Filters
                {(startDate || endDate || selectedFilterTags.length > 0) && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                    {[startDate, endDate, ...selectedFilterTags].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Summary */}
            {(startDate || endDate || selectedFilterTags.length > 0) && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredEvents.length} of {events.length} events
                {selectedFilterTags.length > 0 && (
                  <span> matching {selectedFilterTags.join(', ')}</span>
                )}
                {startDate && ` from ${new Date(startDate).toLocaleDateString()}`}
                {endDate && ` to ${new Date(endDate).toLocaleDateString()}`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Loading State */}
        {isLoading && (
          <LoadingSkeleton variant="event" count={3} />
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorMessage
            title="Error loading events"
            message={error}
            onRetry={handleRefresh}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && events.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeTab === 'all' 
                ? 'There are no events in any timeline yet.'
                : `There are no events in the ${activeTab} timeline yet.`
              }
            </p>
            {(activeTab === 'disputed' || activeTab === 'all') && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Submit a new historical event to get started!
              </p>
            )}
          </div>
        )}

        {/* No Results After Filtering */}
        {!isLoading && !error && events.length > 0 && filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No events match your filters</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your date range to see more results.
            </p>
            <button
              onClick={handleClearFilters}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Timeline Visualization View */}
        {!isLoading && !error && filteredEvents.length > 0 && viewMode === 'visualization' && (
          <TimelineVisualization
            events={filteredEvents}
            onEventClick={handleEventClick}
            startDate={startDate}
            endDate={endDate}
          />
        )}

        {/* Events List View */}
        {!isLoading && !error && filteredEvents.length > 0 && viewMode === 'list' && (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(event.date)}
                    </p>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full border font-medium text-xs ${getTimelineColor(event.timeline)}`}
                    style={{ color: getTimelineTextColor(event.timeline) }}
                  >
                    {getTimelineLabel(event.timeline)}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                  {event.description}
                </p>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {event.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-medium border border-blue-200 dark:border-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Consensus:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
                            style={{ width: `${event.consensusScore}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {event.consensusScore}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {event.supportVotes}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {event.challengeVotes}
                      </span>
                    </div>
                  </div>

                  <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetail
          eventId={selectedEvent.id}
          onClose={handleCloseDetail}
          onVoteSuccess={handleVoteSuccess}
        />
      )}
    </div>
  );
}
