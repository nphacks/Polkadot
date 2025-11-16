/**
 * Contract Service Module
 * 
 * This module handles all interactions with the deployed history_protocol smart contract.
 * It initializes the Polkadot API connection and provides wrapper functions for contract methods.
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { CONTRACT_CONFIG } from '../config/contract';
// @ts-ignore - JSON import
import contractMetadata from '../contracts/history_protocol.json';
import type { HistoricalEvent, Timeline } from '../types';
import { retry, isNetworkError } from '../utils/retry';

// Singleton instances
let apiInstance: ApiPromise | null = null;
let contractInstance: ContractPromise | null = null;

/**
 * Initializes the Polkadot API connection to the local node
 * 
 * @returns Promise<ApiPromise> - The initialized API instance
 * @throws Error if connection fails
 */
export async function initializeApi(): Promise<ApiPromise> {
  if (apiInstance && apiInstance.isConnected) {
    return apiInstance;
  }

  try {
    // Retry connection with exponential backoff
    apiInstance = await retry(
      async () => {
        const wsProvider = new WsProvider(CONTRACT_CONFIG.rpcEndpoint);
        const api = await ApiPromise.create({ provider: wsProvider });
        
        // Verify connection is actually working
        await api.rpc.system.chain();
        
        return api;
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
        onRetry: (attempt, error) => {
          console.log(`Connection attempt ${attempt} failed, retrying...`, error.message);
        },
      }
    );
    
    console.log('✅ Connected to Substrate node:', CONTRACT_CONFIG.rpcEndpoint);
    console.log('Chain:', await apiInstance.rpc.system.chain());
    
    return apiInstance;
  } catch (error) {
    console.error('Failed to initialize Polkadot API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to connect to node at ${CONTRACT_CONFIG.rpcEndpoint}: ${errorMessage}`);
  }
}

/**
 * Gets the initialized API instance
 * 
 * @returns ApiPromise | null - The API instance or null if not initialized
 */
export function getApi(): ApiPromise | null {
  return apiInstance;
}

/**
 * Initializes the contract instance with ABI and address
 * 
 * @returns Promise<ContractPromise> - The initialized contract instance
 * @throws Error if API is not initialized or contract creation fails
 */
export async function initializeContract(): Promise<ContractPromise> {
  if (contractInstance) {
    return contractInstance;
  }

  const api = await initializeApi();
  
  try {
    contractInstance = new ContractPromise(
      api,
      contractMetadata,
      CONTRACT_CONFIG.address
    );
    
    console.log('✅ Contract instance created:', CONTRACT_CONFIG.address);
    
    return contractInstance;
  } catch (error) {
    console.error('Failed to initialize contract:', error);
    throw new Error('Failed to create contract instance');
  }
}

/**
 * Gets the initialized contract instance
 * 
 * @returns ContractPromise | null - The contract instance or null if not initialized
 */
export function getContract(): ContractPromise | null {
  return contractInstance;
}

/**
 * Disconnects from the Polkadot API
 */
export async function disconnect(): Promise<void> {
  if (apiInstance) {
    await apiInstance.disconnect();
    apiInstance = null;
    contractInstance = null;
    console.log('Disconnected from Substrate node');
  }
}

/**
 * Checks if the API is connected
 * 
 * @returns boolean - True if connected, false otherwise
 */
export function isConnected(): boolean {
  return apiInstance !== null && apiInstance.isConnected;
}

/**
 * Contract Method Wrappers
 * 
 * These functions provide a clean interface for interacting with the smart contract methods.
 */

import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { WeightV2 } from '@polkadot/types/interfaces';

// Gas limit for transactions (use -1 for automatic estimation in queries)
const GAS_LIMIT = 300000000000n;
const STORAGE_DEPOSIT_LIMIT = null; // null means use the required amount

/**
 * Result type for contract transactions
 */
export interface TransactionResult {
  success: boolean;
  data?: any;
  error?: string;
  blockHash?: string;
}

/**
 * Submits a new historical event to the contract
 * 
 * @param account - The account submitting the event
 * @param title - Event title
 * @param date - Unix timestamp of the event
 * @param description - Event description
 * @param evidenceSources - Array of evidence URLs/references
 * @param tags - Array of category tags for the event
 * @returns Promise<TransactionResult> - Result containing event ID or error
 */
export async function submitEvent(
  account: InjectedAccountWithMeta,
  title: string,
  date: number,
  description: string,
  evidenceSources: string[],
  tags: string[]
): Promise<TransactionResult> {
  try {
    const contract = await initializeContract();
    const { web3FromAddress } = await import('@polkadot/extension-dapp');
    const injector = await web3FromAddress(account.address);

    console.log('submitEvent params:', { title, date, description, evidenceSources, tags });
    console.log('date type:', typeof date, 'value:', date);

    const api = await initializeApi();
    const gasLimit = api.registry.createType('WeightV2', {
      refTime: GAS_LIMIT,
      proofSize: 1000000n
    }) as WeightV2;

    return new Promise((resolve, reject) => {
      contract.tx
        .submitEvent(
          { gasLimit, storageDepositLimit: STORAGE_DEPOSIT_LIMIT },
          title,
          date,
          description,
          evidenceSources,
          tags
        )
        .signAndSend(account.address, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            console.log('Transaction in block:', result.status.asInBlock.toHex());
          }

          if (result.status.isFinalized) {
            console.log('Transaction finalized:', result.status.asFinalized.toHex());

            if (result.dispatchError) {
              let errorMessage = 'Transaction failed';
              
              if (result.dispatchError.isModule) {
                const decoded = contract.api.registry.findMetaError(result.dispatchError.asModule);
                errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
              }
              
              resolve({
                success: false,
                error: errorMessage,
              });
            } else {
              // Extract event ID from contract events
              let eventId: string | undefined;
              
              if (result.events) {
                for (const record of result.events) {
                  if (contract.api.events.contracts.ContractEmitted.is(record.event)) {
                    const [, data] = record.event.data;
                    // Try to decode the event data to get the event ID
                    try {
                      const decoded = contract.abi.decodeEvent(data as any);
                      if (decoded.event.identifier === 'EventSubmitted') {
                        eventId = decoded.args[0]?.toString();
                      }
                    } catch (e) {
                      console.log('Could not decode event:', e);
                    }
                  }
                }
              }

              resolve({
                success: true,
                blockHash: result.status.asFinalized.toHex(),
                data: eventId ? { eventId } : undefined,
              });
            }
          }
        })
        .catch((error) => {
          console.error('Transaction error:', error);
          
          // Provide user-friendly error messages
          let errorMessage = error.message || 'Transaction failed';
          if (errorMessage.includes('Inability to pay some fees') || errorMessage.includes('balance too low')) {
            errorMessage = 'Insufficient funds to pay transaction fees. Please add funds to your wallet.';
          }
          
          reject({
            success: false,
            error: errorMessage,
          });
        });
    });
  } catch (error: any) {
    console.error('Submit event error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = error.message || 'Failed to submit event';
    if (errorMessage.includes('Inability to pay some fees') || errorMessage.includes('balance too low')) {
      errorMessage = 'Insufficient funds to pay transaction fees. Please add funds to your wallet.';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Votes on a historical event
 * 
 * @param account - The account voting
 * @param eventId - The ID of the event to vote on
 * @param support - true for support vote, false for challenge vote
 * @returns Promise<TransactionResult> - Result of the vote transaction
 */
export async function vote(
  account: InjectedAccountWithMeta,
  eventId: number,
  support: boolean
): Promise<TransactionResult> {
  try {
    const contract = await initializeContract();
    const api = await initializeApi();
    const { web3FromAddress } = await import('@polkadot/extension-dapp');
    const injector = await web3FromAddress(account.address);

    const gasLimit = api.registry.createType('WeightV2', {
      refTime: GAS_LIMIT,
      proofSize: 1000000n
    }) as WeightV2;

    return new Promise((resolve, reject) => {
      contract.tx
        .vote(
          { gasLimit, storageDepositLimit: STORAGE_DEPOSIT_LIMIT },
          eventId,
          support
        )
        .signAndSend(account.address, { signer: injector.signer }, (result) => {
          if (result.status.isInBlock) {
            console.log('Vote transaction in block:', result.status.asInBlock.toHex());
          }

          if (result.status.isFinalized) {
            console.log('Vote transaction finalized:', result.status.asFinalized.toHex());

            if (result.dispatchError) {
              let errorMessage = 'Vote failed';
              
              if (result.dispatchError.isModule) {
                const decoded = contract.api.registry.findMetaError(result.dispatchError.asModule);
                errorMessage = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
              }
              
              resolve({
                success: false,
                error: errorMessage,
              });
            } else {
              resolve({
                success: true,
                blockHash: result.status.asFinalized.toHex(),
              });
            }
          }
        })
        .catch((error) => {
          console.error('Vote transaction error:', error);
          
          // Provide user-friendly error messages
          let errorMessage = error.message || 'Vote transaction failed';
          if (errorMessage.includes('Inability to pay some fees') || errorMessage.includes('balance too low')) {
            errorMessage = 'Insufficient funds to pay transaction fees. Please add funds to your wallet.';
          }
          
          reject({
            success: false,
            error: errorMessage,
          });
        });
    });
  } catch (error: any) {
    console.error('Vote error:', error);
    
    // Provide user-friendly error messages
    let errorMessage = error.message || 'Failed to vote';
    if (errorMessage.includes('Inability to pay some fees') || errorMessage.includes('balance too low')) {
      errorMessage = 'Insufficient funds to pay transaction fees. Please add funds to your wallet.';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Retrieves a historical event by ID
 * 
 * @param eventId - The ID of the event to retrieve
 * @returns Promise<HistoricalEvent | null> - The event or null if not found
 */
export async function getEvent(eventId: number): Promise<HistoricalEvent | null> {
  try {
    return await retry(
      async () => {
        const contract = await initializeContract();
        const api = await initializeApi();

        // Query the contract (no gas cost for queries)
        const { result, output } = await contract.query.getEvent(
          CONTRACT_CONFIG.address,
          { gasLimit: api.registry.createType('WeightV2', { refTime: GAS_LIMIT, proofSize: 1000000n }) as WeightV2 },
          eventId
        );

        if (result.isOk && output) {
          const eventData = output.toHuman() as any;
          
          if (eventData && eventData.Ok) {
            return parseEventData(eventData.Ok);
          }
        }

        return null;
      },
      {
        maxAttempts: 2,
        delayMs: 500,
        onRetry: (attempt, error) => {
          if (isNetworkError(error)) {
            console.log(`Retrying getEvent (attempt ${attempt})...`);
          }
        },
      }
    );
  } catch (error) {
    console.error('Get event error:', error);
    throw error;
  }
}

/**
 * Retrieves all events in a specific timeline
 * 
 * @param timeline - The timeline to query ('Canonical', 'Disputed', or 'Alternative')
 * @returns Promise<HistoricalEvent[]> - Array of events in the timeline
 */
export async function getEventsByTimeline(timeline: Timeline): Promise<HistoricalEvent[]> {
  try {
    return await retry(
      async () => {
        const contract = await initializeContract();
        const api = await initializeApi();

        // Capitalize timeline for contract enum (e.g., 'disputed' -> 'Disputed')
        const capitalizedTimeline = timeline.charAt(0).toUpperCase() + timeline.slice(1);

        console.log('Querying timeline:', timeline, '-> capitalized:', capitalizedTimeline);

        // Query the contract
        const { result, output } = await contract.query.getEventsByTimeline(
          CONTRACT_CONFIG.address,
          { gasLimit: api.registry.createType('WeightV2', { refTime: GAS_LIMIT, proofSize: 1000000n }) as WeightV2 },
          capitalizedTimeline
        );

        console.log('Query result:', result.isOk, 'output:', output?.toHuman());

        if (result.isOk && output) {
          const eventsData = output.toHuman() as any;
          
          console.log('Events data:', eventsData);
          
          // Handle Result type wrapper (Ok/Err)
          const actualData = eventsData?.Ok || eventsData;
          
          if (Array.isArray(actualData)) {
            const parsed = actualData.map(parseEventData).filter((e): e is HistoricalEvent => e !== null);
            console.log('Parsed events:', parsed);
            return parsed;
          }
        }

        console.log('No events found, returning empty array');
        return [];
      },
      {
        maxAttempts: 2,
        delayMs: 500,
        onRetry: (attempt, error) => {
          if (isNetworkError(error)) {
            console.log(`Retrying getEventsByTimeline (attempt ${attempt})...`);
          }
        },
      }
    );
  } catch (error) {
    console.error('Get events by timeline error:', error);
    throw error;
  }
}

/**
 * Checks if a user has voted on a specific event
 * 
 * @param eventId - The ID of the event
 * @param voterAddress - The address of the voter
 * @returns Promise<boolean> - True if the user has voted, false otherwise
 */
export async function hasVoted(eventId: number, voterAddress: string): Promise<boolean> {
  try {
    const contract = await initializeContract();
    const api = await initializeApi();

    // Query the contract
    const { result, output } = await contract.query.hasVoted(
      CONTRACT_CONFIG.address,
      { gasLimit: api.registry.createType('WeightV2', { refTime: GAS_LIMIT, proofSize: 1000000n }) as WeightV2 },
      eventId,
      voterAddress
    );

    if (result.isOk && output) {
      return output.toHuman() === true;
    }

    return false;
  } catch (error) {
    console.error('Has voted error:', error);
    return false;
  }
}

/**
 * Retrieves all events submitted by a specific user
 * 
 * @param userAddress - The address of the user
 * @returns Promise<HistoricalEvent[]> - Array of events submitted by the user
 */
export async function getUserEvents(userAddress: string): Promise<HistoricalEvent[]> {
  try {
    const contract = await initializeContract();
    const api = await initializeApi();

    // Query the contract
    const { result, output } = await contract.query.getUserEvents(
      CONTRACT_CONFIG.address,
      { gasLimit: api.registry.createType('WeightV2', { refTime: GAS_LIMIT, proofSize: 1000000n }) as WeightV2 },
      userAddress
    );

    if (result.isOk && output) {
      const eventsData = output.toHuman() as any;
      
      if (Array.isArray(eventsData)) {
        return eventsData.map(parseEventData).filter((e): e is HistoricalEvent => e !== null);
      }
    }

    return [];
  } catch (error) {
    console.error('Get user events error:', error);
    return [];
  }
}

/**
 * Retrieves all events with a specific tag
 * 
 * @param tag - The tag to filter by
 * @returns Promise<HistoricalEvent[]> - Array of events with the specified tag
 */
export async function getEventsByTag(tag: string): Promise<HistoricalEvent[]> {
  try {
    return await retry(
      async () => {
        const contract = await initializeContract();
        const api = await initializeApi();

        // Query the contract
        const { result, output } = await contract.query.getEventsByTag(
          CONTRACT_CONFIG.address,
          { gasLimit: api.registry.createType('WeightV2', { refTime: GAS_LIMIT, proofSize: 1000000n }) as WeightV2 },
          tag
        );

        if (result.isOk && output) {
          const eventsData = output.toHuman() as any;
          
          if (Array.isArray(eventsData)) {
            return eventsData.map(parseEventData).filter((e): e is HistoricalEvent => e !== null);
          }
        }

        return [];
      },
      {
        maxAttempts: 2,
        delayMs: 500,
        onRetry: (attempt, error) => {
          if (isNetworkError(error)) {
            console.log(`Retrying getEventsByTag (attempt ${attempt})...`);
          }
        },
      }
    );
  } catch (error) {
    console.error('Get events by tag error:', error);
    throw error;
  }
}

/**
 * Retrieves all events from all three timelines (canonical, disputed, alternative)
 * and merges them into a single chronologically sorted array
 * 
 * @returns Promise<HistoricalEvent[]> - Array of all events sorted by date
 */
export async function getAllEvents(): Promise<HistoricalEvent[]> {
  try {
    return await retry(
      async () => {
        // Fetch events from all three timelines in parallel
        const [canonical, disputed, alternative] = await Promise.all([
          getEventsByTimeline('canonical'),
          getEventsByTimeline('disputed'),
          getEventsByTimeline('alternative'),
        ]);

        // Merge all events into single array
        const allEvents = [...canonical, ...disputed, ...alternative];

        // Sort chronologically by date
        allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

        console.log(`getAllEvents: Retrieved ${allEvents.length} total events (${canonical.length} canonical, ${disputed.length} disputed, ${alternative.length} alternative)`);

        return allEvents;
      },
      {
        maxAttempts: 2,
        delayMs: 500,
        onRetry: (attempt, error) => {
          if (isNetworkError(error)) {
            console.log(`Retrying getAllEvents (attempt ${attempt})...`);
          }
        },
      }
    );
  } catch (error) {
    console.error('Get all events error:', error);
    throw error;
  }
}

/**
 * Helper function to parse event data from contract response
 * 
 * @param eventData - Raw event data from contract
 * @returns HistoricalEvent | null - Parsed event or null if parsing fails
 */
function parseEventData(eventData: any): HistoricalEvent | null {
  try {
    console.log('Parsing event data:', eventData);
    
    // Remove commas from numeric strings
    const cleanNumber = (str: string) => parseInt(str.replace(/,/g, ''), 10);
    
    // Convert YYYYMMDD format to Date object
    const parseDateFromYYYYMMDD = (dateNum: number): Date => {
      const dateStr = dateNum.toString();
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Month is 0-indexed
      const day = parseInt(dateStr.substring(6, 8), 10);
      return new Date(year, month, day);
    };

    const parsed = {
      id: String(cleanNumber(eventData.id)),
      title: eventData.title,
      date: parseDateFromYYYYMMDD(cleanNumber(eventData.date)),
      description: eventData.description,
      evidenceSources: eventData.evidenceSources || eventData.evidence_sources || [],
      tags: eventData.tags || [],
      submitter: eventData.submitter,
      timeline: eventData.timeline as Timeline,
      consensusScore: cleanNumber(eventData.consensusScore || eventData.consensus_score || '0'),
      supportVotes: cleanNumber(eventData.supportVotes || eventData.support_votes || '0'),
      challengeVotes: cleanNumber(eventData.challengeVotes || eventData.challenge_votes || '0'),
      createdAt: new Date(cleanNumber(eventData.createdAt || eventData.created_at)),
    };
    
    console.log('Parsed event:', parsed);
    return parsed;
  } catch (error) {
    console.error('Error parsing event data:', error, eventData);
    return null;
  }
}
