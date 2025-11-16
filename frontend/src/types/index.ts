/**
 * Type definitions for the Contested History Protocol
 * These types match the ink! smart contract data structures
 */

/**
 * Timeline categories for historical events
 */
export type Timeline = 'canonical' | 'disputed' | 'alternative';

/**
 * Timeline view types including unified "all" view
 */
export type TimelineViewType = 'all' | 'canonical' | 'disputed' | 'alternative';

/**
 * Timeline view configuration
 */
export interface TimelineViewConfig {
  id: TimelineViewType;
  label: string;
  icon: string;
  color?: string;
}

/**
 * Available timeline views
 */
export const TIMELINE_VIEWS: readonly TimelineViewConfig[] = [
  { id: 'all', label: 'All Events', icon: '📚' },
  { id: 'canonical', label: 'Canonical', icon: '✓', color: 'green' },
  { id: 'disputed', label: 'Disputed', icon: '?', color: 'yellow' },
  { id: 'alternative', label: 'Alternative', icon: '⚠', color: 'red' },
] as const;

/**
 * Represents a historical event stored on-chain
 * Matches the HistoricalEvent struct in the smart contract
 */
export interface HistoricalEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  evidenceSources: string[];
  tags: string[];
  submitter: string;
  timeline: Timeline;
  consensusScore: number;
  supportVotes: number;
  challengeVotes: number;
  createdAt: Date;
}

/**
 * Raw historical event data as returned from the contract
 * Uses primitive types before conversion to HistoricalEvent
 */
export interface RawHistoricalEvent {
  id: number;
  title: string;
  date: number; // Unix timestamp
  description: string;
  evidence_sources: string[];
  tags: string[];
  submitter: string;
  timeline: { canonical?: null; disputed?: null; alternative?: null };
  consensus_score: number;
  support_votes: number;
  challenge_votes: number;
  created_at: number; // Unix timestamp
}

/**
 * Represents a vote on a historical event
 * Matches the Vote struct in the smart contract
 */
export interface Vote {
  eventId: string;
  support: boolean;
  voter: string;
  timestamp: Date;
}

/**
 * Raw vote data as returned from the contract
 */
export interface RawVote {
  event_id: number;
  support: boolean;
  voter: string;
  timestamp: number; // Unix timestamp
}

/**
 * Wallet account information from Polkadot.js extension
 */
export interface WalletAccount {
  address: string;
  meta: {
    name?: string;
    source: string;
    genesisHash?: string;
  };
  type?: string;
}

/**
 * Contract configuration for connecting to the deployed smart contract
 */
export interface ContractConfig {
  address: string;
  abi: any; // Contract ABI metadata
}

/**
 * Contract error types matching the Error enum in the smart contract
 */
export enum ContractError {
  EventNotFound = 'EventNotFound',
  AlreadyVoted = 'AlreadyVoted',
  InvalidEventData = 'InvalidEventData',
}

/**
 * Predefined tag options for categorizing historical events
 */
export const TAG_OPTIONS = [
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

/**
 * Type for event tags
 */
export type EventTag = typeof TAG_OPTIONS[number];

/**
 * Form data for submitting a new historical event
 */
export interface EventSubmissionForm {
  title: string;
  date: Date;
  description: string;
  evidenceSources: string[];
  tags: string[];
}

/**
 * Filter options for timeline view
 */
export interface TimelineFilter {
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

/**
 * Transaction status for tracking on-chain operations
 */
export type TransactionStatus = 
  | 'idle'
  | 'preparing'
  | 'signing'
  | 'broadcasting'
  | 'inBlock'
  | 'finalized'
  | 'error';

/**
 * Transaction result information
 */
export interface TransactionResult {
  status: TransactionStatus;
  blockHash?: string;
  txHash?: string;
  error?: string;
}
