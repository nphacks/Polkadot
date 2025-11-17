/**
 * Smart Contract Configuration
 * 
 * This file contains the configuration for connecting to the deployed
 * history_protocol smart contract.
 */

export const CONTRACT_CONFIG = {
  // Contract address on local development node
  address: '5E1FvPudm4Lhb54HBE4Hhei6JpfH5b6bEoBVPhcTHzeLfG2q',
  
  // RPC endpoint for local Substrate Contracts Node
  rpcEndpoint: 'ws://127.0.0.1:9944',
  
  // Network information
  network: 'local-dev',
  chainName: 'Development',
  
  // Deployment information
  deployedAt: '2025-11-16T19:41:29.093Z',
  deployer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
} as const;

// Contract metadata will be imported from the compiled contract
// The metadata file is located at: contract/target/ink/history_protocol.json
export const CONTRACT_METADATA_PATH = '../../../contract/target/ink/history_protocol.json';
