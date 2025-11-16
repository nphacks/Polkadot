#!/usr/bin/env tsx
/**
 * Fund Account Script
 * 
 * Transfers tokens from Alice (pre-funded dev account) to a specified account
 * for testing purposes on the local development node.
 */

import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';

const RPC_ENDPOINT = 'ws://127.0.0.1:9944';
const TRANSFER_AMOUNT = '1000000000000000'; // 1,000,000 tokens (with 12 decimals)

async function fundAccount(recipientAddress: string) {
  console.log('🔗 Connecting to local node...');
  
  // Connect to the local node
  const wsProvider = new WsProvider(RPC_ENDPOINT);
  const api = await ApiPromise.create({ provider: wsProvider });
  
  console.log('✅ Connected to:', await api.rpc.system.chain());
  
  // Wait for crypto to be ready
  await cryptoWaitReady();
  
  // Create keyring and add Alice (pre-funded dev account)
  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');
  
  console.log('💰 Transferring funds from Alice to:', recipientAddress);
  console.log('   Amount:', TRANSFER_AMOUNT, 'units');
  
  // Get Alice's balance before transfer
  const { data: aliceBalanceBefore } = await api.query.system.account(alice.address);
  console.log('   Alice balance before:', aliceBalanceBefore.free.toString());
  
  // Create transfer transaction
  const transfer = api.tx.balances.transferKeepAlive(recipientAddress, TRANSFER_AMOUNT);
  
  // Sign and send transaction
  return new Promise((resolve, reject) => {
    transfer.signAndSend(alice, ({ status, events }) => {
      if (status.isInBlock) {
        console.log('📦 Transaction included in block:', status.asInBlock.toHex());
      }
      
      if (status.isFinalized) {
        console.log('✅ Transaction finalized in block:', status.asFinalized.toHex());
        
        // Check for errors
        events.forEach(({ event }) => {
          if (api.events.system.ExtrinsicFailed.is(event)) {
            const [dispatchError] = event.data;
            let errorInfo = dispatchError.toString();
            
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              errorInfo = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
            }
            
            console.error('❌ Transfer failed:', errorInfo);
            reject(new Error(errorInfo));
          }
        });
        
        // Get recipient balance after transfer
        api.query.system.account(recipientAddress).then(({ data: recipientBalance }) => {
          console.log('💵 Recipient balance after:', recipientBalance.free.toString());
          console.log('✅ Transfer successful!');
          api.disconnect();
          resolve(true);
        });
      }
    }).catch((error) => {
      console.error('❌ Transaction error:', error);
      api.disconnect();
      reject(error);
    });
  });
}

// Get recipient address from command line argument
const recipientAddress = process.argv[2];

if (!recipientAddress) {
  console.error('❌ Error: Please provide a recipient address');
  console.log('Usage: npm run fund-account <address>');
  console.log('Example: npm run fund-account 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty');
  process.exit(1);
}

// Run the transfer
fundAccount(recipientAddress)
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
