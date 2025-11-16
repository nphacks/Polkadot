import { useRef, useMemo } from 'react';
import type { HistoricalEvent, Timeline } from '../types';

interface TimelineVisualizationProps {
  events: HistoricalEvent[];
  onEventClick?: (event: HistoricalEvent) => void;
  startDate?: string;
  endDate?: string;
}

export function TimelineVisualization({ 
  events, 
  onEventClick
}: TimelineVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort events chronologically
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events]);



  // Get color for timeline type
  const getTimelineColor = (timeline: Timeline) => {
    switch (timeline) {
      case 'canonical':
        return {
          bg: 'bg-green-500',
          border: 'border-green-500',
          text: 'text-green-700 dark:text-green-300',
          hover: 'hover:bg-green-600'
        };
      case 'disputed':
        return {
          bg: 'bg-yellow-500',
          border: 'border-yellow-500',
          text: 'text-yellow-700 dark:text-yellow-300',
          hover: 'hover:bg-yellow-600'
        };
      case 'alternative':
        return {
          bg: 'bg-red-500',
          border: 'border-red-500',
          text: 'text-red-700 dark:text-red-300',
          hover: 'hover:bg-red-600'
        };
      default:
        return {
          bg: 'bg-gray-500',
          border: 'border-gray-500',
          text: 'text-gray-700 dark:text-gray-300',
          hover: 'hover:bg-gray-600'
        };
    }
  };

  const handleEventClick = (event: HistoricalEvent) => {
    onEventClick?.(event);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No events to display</h3>
        <p className="text-gray-600">Submit events to see them on the timeline</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Timeline Visualization
        </h3>
        <p className="text-sm text-gray-600">
          Chronological view of historical events. Click on any event to view details.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
          <span className="text-sm font-semibold" style={{ color: '#111827' }}>Canonical (≥75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
          <span className="text-sm font-semibold" style={{ color: '#111827' }}>Disputed (26-74%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-sm font-semibold" style={{ color: '#111827' }}>Alternative (≤25%)</span>
        </div>
      </div>

      {/* Timeline Container */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ minHeight: '400px' }}
      >


        {/* Vertical Timeline */}
        <div className="relative pl-12">
          {/* Vertical Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-300 dark:bg-gray-600"></div>

          {/* Events */}
          <div className="space-y-6">
            {sortedEvents.map((event) => {
              const colors = getTimelineColor(event.timeline);

              return (
                <div key={event.id} className="relative">
                  {/* Event Marker with Color */}
                  <button
                    onClick={() => handleEventClick(event)}
                    className={`
                      absolute left-0 top-3 w-5 h-5 rounded-full ${colors.bg}
                      border-3 border-white dark:border-gray-800 shadow-lg transform -translate-x-1/2
                      transition-all duration-200 cursor-pointer
                      hover:scale-125 hover:shadow-xl
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    `}
                    aria-label={`View ${event.title}`}
                  ></button>

                  {/* Event Card */}
                  <div
                    onClick={() => handleEventClick(event)}
                    className="ml-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(event.date)}
                        </p>
                      </div>
                      {/* Timeline Badge */}
                      <span 
                        className="ml-3 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm flex-shrink-0"
                        style={{
                          backgroundColor: 
                            event.timeline?.toLowerCase() === 'canonical' ? '#10b981' : 
                            event.timeline?.toLowerCase() === 'disputed' ? '#f59e0b' : 
                            event.timeline?.toLowerCase() === 'alternative' ? '#ef4444' : '#6b7280'
                        }}
                      >
                        {event.timeline ? event.timeline.charAt(0).toUpperCase() + event.timeline.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Consensus:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 dark:bg-blue-500 transition-all"
                              style={{ width: `${event.consensusScore}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white text-xs">
                            {event.consensusScore}%
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-xs">
                        {event.supportVotes + event.challengeVotes} votes
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


      </div>
    </div>
  );
}
