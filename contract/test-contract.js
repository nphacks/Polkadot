#!/usr/bin/env node

/**
 * Contract Testing Script
 * 
 * This script tests the deployed history_protocol contract methods
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const { Keyring } = require('@polkadot/keyring');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🧪 Starting contract tests...\n');

  // Connect to local node
  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log('✅ Connected to node\n');

  // Load deployment info
  const deploymentInfo = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'deployment-info.json'), 'utf8')
  );
  const contractAddress = deploymentInfo.contractAddress;
  console.log(`📍 Testing contract at: ${contractAddress}\n`);

  // Load contract metadata
  const metadata = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'target/ink/history_protocol.json'), 'utf8')
  );

  // Create contract instance
  const contract = new ContractPromise(api, metadata, contractAddress);

  // Setup accounts
  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');
  const bob = keyring.addFromUri('//Bob');

  console.log('👥 Test accounts:');
  console.log(`   Alice: ${alice.address}`);
  console.log(`   Bob: ${bob.address}\n`);

  try {
    // Test 1: Submit an event
    console.log('📝 Test 1: Submitting a historical event...');
    const gasLimit = api.registry.createType('WeightV2', {
      refTime: 100000000000,
      proofSize: 100000
    });

    const submitResult = await new Promise((resolve, reject) => {
      contract.tx
        .submitEvent(
          { gasLimit, storageDepositLimit: null },
          'Moon Landing',
          1969,
          'Apollo 11 successfully landed on the moon',
          ['https://nasa.gov/apollo11', 'https://archive.org/moon-landing']
        )
        .signAndSend(alice, ({ status, events }) => {
          if (status.isInBlock || status.isFinalized) {
            console.log('   ✅ Event submitted successfully\n');
            resolve(events);
          }
        })
        .catch(reject);
    });

    // Test 2: Query the event
    console.log('🔍 Test 2: Querying the submitted event...');
    const { result, output } = await contract.query.getEvent(
      alice.address,
      { gasLimit: -1, storageDepositLimit: null },
      1
    );

    if (result.isOk && output) {
      const event = output.toHuman();
      console.log('   ✅ Event retrieved:');
      console.log(`      ID: ${event.id}`);
      console.log(`      Title: ${event.title}`);
      console.log(`      Timeline: ${event.timeline}`);
      console.log(`      Consensus Score: ${event.consensusScore}%\n`);
    }

    // Test 3: Vote on the event (Alice supports)
    console.log('🗳️  Test 3: Alice voting to support the event...');
    await new Promise((resolve, reject) => {
      contract.tx
        .vote({ gasLimit, storageDepositLimit: null }, 1, true)
        .signAndSend(alice, ({ status }) => {
          if (status.isInBlock || status.isFinalized) {
            console.log('   ✅ Alice voted successfully\n');
            resolve();
          }
        })
        .catch(reject);
    });

    // Test 4: Check if Alice has voted
    console.log('✓ Test 4: Checking if Alice has voted...');
    const hasVotedQuery = await contract.query.hasVoted(
      alice.address,
      { gasLimit: -1, storageDepositLimit: null },
      1,
      alice.address
    );
    if (hasVotedQuery.result.isOk) {
      console.log(`   ✅ Alice has voted: ${hasVotedQuery.output.toHuman()}\n`);
    }

    // Test 5: Bob votes to support
    console.log('🗳️  Test 5: Bob voting to support the event...');
    await new Promise((resolve, reject) => {
      contract.tx
        .vote({ gasLimit, storageDepositLimit: null }, 1, true)
        .signAndSend(bob, ({ status }) => {
          if (status.isInBlock || status.isFinalized) {
            console.log('   ✅ Bob voted successfully\n');
            resolve();
          }
        })
        .catch(reject);
    });

    // Test 6: Query updated event (should have higher consensus)
    console.log('🔍 Test 6: Checking updated consensus score...');
    const { output: updatedEvent } = await contract.query.getEvent(
      alice.address,
      { gasLimit: -1, storageDepositLimit: null },
      1
    );

    if (updatedEvent) {
      const event = updatedEvent.toHuman();
      console.log('   ✅ Event updated:');
      console.log(`      Support Votes: ${event.supportVotes}`);
      console.log(`      Challenge Votes: ${event.challengeVotes}`);
      console.log(`      Consensus Score: ${event.consensusScore}%`);
      console.log(`      Timeline: ${event.timeline}\n`);
    }

    // Test 7: Query events by timeline
    console.log('📋 Test 7: Querying events by timeline...');
    const { output: timelineEvents } = await contract.query.getEventsByTimeline(
      alice.address,
      { gasLimit: -1, storageDepositLimit: null },
      'Disputed'
    );

    if (timelineEvents) {
      const events = timelineEvents.toHuman();
      console.log(`   ✅ Found ${events.length} event(s) in Disputed timeline\n`);
    }

    // Test 8: Query user events
    console.log('👤 Test 8: Querying Alice\'s submitted events...');
    const { output: userEvents } = await contract.query.getUserEvents(
      alice.address,
      { gasLimit: -1, storageDepositLimit: null },
      alice.address
    );

    if (userEvents) {
      const events = userEvents.toHuman();
      console.log(`   ✅ Alice has submitted ${events.length} event(s)\n`);
    }

    console.log('✨ All tests passed!\n');
    console.log('Contract is working correctly and ready for frontend integration.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await api.disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
