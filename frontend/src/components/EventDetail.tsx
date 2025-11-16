import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvent, hasVoted, vote } from '../services/contractService';
import { useWallet } from '../hooks/useWallet';
import { useToastContext } from '../contexts/ToastContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import type { HistoricalEvent, Timeline } from '../types';

interface EventDetailProps {
  eventId: string;
  onClose?: () => void;
  onVoteSuccess?: () => void;
}

export function EventDetail({ eventId, onClose, onVoteSuccess }: EventDetailProps) {
  const { account } = useWallet();
  const toast = useToastContext();
  const navigate = useNavigate();
  const [event, setEvent] = useState<HistoricalEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (account && event) {
      checkVoteStatus();
    }
  }, [account, event]);

  const fetchEventDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const eventData = await getEvent(parseInt(eventId));
      
      if (eventData) {
        setEvent(eventData);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    if (!account || !event) return;

    try {
      const voted = await hasVoted(parseInt(eventId), account.address);
      setUserHasVoted(voted);
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  };

  const handleVote = async (support: boolean) => {
    if (!account) {
      setVoteError('Please connect your wallet to vote');
      return;
    }

    if (userHasVoted) {
      setVoteError('You have already voted on this event');
      return;
    }

    setIsVoting(true);
    setVoteError(null);
    setVoteSuccess(false);

    try {
      // Convert WalletAccount to InjectedAccountWithMeta format
      const injectedAccount = {
        address: account.address,
        meta: {
          name: account.meta.name,
          source: account.meta.source,
          genesisHash: account.meta.genesisHash,
        },
        type: account.type as any,
      };

      const result = await vote(injectedAccount, parseInt(eventId), support);

      if (result.success) {
        setVoteSuccess(true);
        setUserHasVoted(true);
        
        // Show success toast
        toast.success(
          `Vote submitted successfully! You ${support ? 'supported' : 'challenged'} this event.`,
          5000
        );
        
        // Refresh event data to show updated vote counts
        await fetchEventDetails();
        
        // Notify parent component
        onVoteSuccess?.();
        
        // Clear success message after 3 seconds
        setTimeout(() => setVoteSuccess(false), 3000);
      } else {
        const errorMsg = result.error || 'Failed to submit vote';
        setVoteError(errorMsg);
        toast.error(errorMsg, 7000);
      }
    } catch (err: any) {
      console.error('Vote error:', err);
      const errorMsg = err.message || 'Failed to submit vote. Please try again.';
      setVoteError(errorMsg);
      toast.error(errorMsg, 7000);
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatAddress = (address: string) => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  const getConsensusColor = (score: number) => {
    if (score >= 75) return 'bg-green-600';
    if (score <= 25) return 'bg-red-600';
    return 'bg-yellow-600';
  };

  if (isLoading) {
    const content = (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-8">
        <div className="py-12">
          <LoadingSpinner size="lg" message="Loading event details..." />
        </div>
      </div>
    );

    return onClose ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {content}
      </div>
    ) : content;
  }

  if (error || !event) {
    const content = (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-8">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Error</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <ErrorMessage
          message={error || 'Event not found'}
          onRetry={fetchEventDetails}
        />

        {onClose && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        )}
      </div>
    );

    return onClose ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {content}
      </div>
    ) : content;
  }

  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h2>
            <span 
              className={`px-3 py-1 rounded-full border font-medium text-xs ${getTimelineColor(event.timeline)}`}
              style={{ color: getTimelineTextColor(event.timeline) }}
            >
              {getTimelineLabel(event.timeline)} Timeline
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{formatDate(event.date)}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Consensus Score Section */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Consensus Score</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getConsensusColor(event.consensusScore)}`}
                    style={{ width: `${event.consensusScore}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {event.consensusScore}%
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-gray-700 dark:text-gray-300">Support Votes:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{event.supportVotes}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-gray-700 dark:text-gray-300">Challenge Votes:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{event.challengeVotes}</span>
              </div>
              
              <div className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Total:</span> {event.supportVotes + event.challengeVotes}
              </div>
            </div>

            {/* Timeline Movement Info */}
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {event.consensusScore >= 75 && '✓ This event has reached canonical status (≥75% support)'}
                {event.consensusScore <= 25 && '✗ This event is considered an alternative interpretation (≤25% support)'}
                {event.consensusScore > 25 && event.consensusScore < 75 && 
                  `This event is currently disputed. It needs ${75 - event.consensusScore}% more support to become canonical, or ${event.consensusScore - 25}% more challenges to become alternative.`
                }
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/timeline/${event.timeline}?tag=${encodeURIComponent(tag)}`);
                      onClose?.();
                    }}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-blue-200 dark:border-blue-800"
                    title={`View all ${tag} events`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Sources */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Evidence Sources</h3>
            {event.evidenceSources.length > 0 ? (
              <ul className="space-y-2">
                {event.evidenceSources.map((source, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    <a
                      href={source.startsWith('http') ? source : `https://${source}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline break-all"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No evidence sources provided</p>
            )}
          </div>

          {/* Submitter Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Submitted by:</span>
                <span className="ml-2 font-mono text-gray-900 dark:text-white">{formatAddress(event.submitter)}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Submitted on:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{formatDate(event.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Voting Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cast Your Vote</h3>
            
            {/* Success Message */}
            {voteSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-green-800">Vote submitted successfully!</h4>
                    <p className="text-sm text-green-700 mt-1">Your vote has been recorded on-chain.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {voteError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Vote failed</h4>
                    <p className="text-sm text-red-700 mt-1">{voteError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Voting Buttons */}
            {!account ? (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-800">
                  Please connect your wallet to vote on this event.
                </p>
              </div>
            ) : userHasVoted ? (
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You have already voted on this event. Each account can only vote once.
                </p>
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => handleVote(true)}
                  disabled={isVoting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isVoting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Support This Event</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleVote(false)}
                  disabled={isVoting}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isVoting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>Challenge This Event</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Your vote will be recorded on-chain and cannot be changed. Vote responsibly.
            </p>
          </div>
        </div>

      {/* Footer */}
      {onClose && (
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );

  return onClose ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      {content}
    </div>
  ) : content;
}
