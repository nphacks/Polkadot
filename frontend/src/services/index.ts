/**
 * Services Index
 * 
 * Exports all service functions for easy importing
 */

export {
  // API and Contract initialization
  initializeApi,
  initializeContract,
  getApi,
  getContract,
  disconnect,
  isConnected,
  
  // Contract method wrappers
  submitEvent,
  vote,
  getEvent,
  getEventsByTimeline,
  hasVoted,
  getUserEvents,
  
  // Types
  type TransactionResult,
} from './contractService';
