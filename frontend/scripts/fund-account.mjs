#!/usr/bin/env node
/**
 * Fund Account Script
 * 
 * Transfers tokens from Alice (pre-funded dev account) to a specified account
 * for testing purposes on the local development node.
 * 
 * Usage: node scripts/fund-account.mjs <recipient-address>
 */

import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';

const RPC_ENDPOINT = 'ws://127.0.0.1:9944';
const TRANSFER_AMOUNT = '1000000000000000'; // 1,000,000 tokens (with 12 decimals)

async function fundAccount(recipientAddress) {
  console.log('🔗 Connecting to local node...');
  
  try {
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
    await new Promise((resolve, reject) => {
      transfer.signAndSend(alice, ({ status, events }) => {
        if (status.isInBlock) {
          console.log('📦 Transaction included in block:', status.asInBlock.toHex());
        }
        
        if (status.isFinalized) {
          console.log('✅ Transaction finalized in block:', status.asFinalized.toHex());
          
          // Check for errors
          let hasError = false;
          events.forEach(({ event }) => {
            if (api.events.system.ExtrinsicFailed.is(event)) {
              const [dispatchError] = event.data;
              let errorInfo = dispatchError.toString();
              
              if (dispatchError.isModule) {
                const decoded = api.registry.findMetaError(dispatchError.asModule);
                errorInfo = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
              }
              
              console.error('❌ Transfer failed:', errorInfo);
              hasError = true;
              reject(new Error(errorInfo));
            }
          });
          
          if (!hasError) {
            // Get recipient balance after transfer
            api.query.system.account(recipientAddress).then(({ data: recipientBalance }) => {
              console.log('💵 Recipient balance after:', recipientBalance.free.toString());
              console.log('✅ Transfer successful!');
              api.disconnect();
              resolve(true);
            });
          }
        }
      }).catch((error) => {
        console.error('❌ Transaction error:', error);
        api.disconnect();
        reject(error);
      });
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Get recipient address from command line argument
const recipientAddress = process.argv[2];

if (!recipientAddress) {
  console.error('❌ Error: Please provide a recipient address');
  console.log('\nUsage: node scripts/fund-account.mjs <address>');
  console.log('\nExample: node scripts/fund-account.mjs 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty');
  console.log('\nTo get your wallet address:');
  console.log('  1. Open the app in your browser');
  console.log('  2. Connect your wallet');
  console.log('  3. Copy the address shown in the header');
  process.exit(1);
}

// Run the transfer
fundAccount(recipientAddress)
  .then(() => {
    console.log('\n✅ Done! Your account is now funded.');
    console.log('You can now submit events and vote on the HistoryDAO app.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to fund account:', error.message);
    process.exit(1);
  });
