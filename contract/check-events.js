#!/usr/bin/env node
/**
 * Check Events Script - Verify events are stored on blockchain
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const { Keyring } = require('@polkadot/keyring');
const fs = require('fs');
const path = require('path');

const CONTRACT_ADDRESS = '5E1FvPudm4Lhb54HBE4Hhei6JpfH5b6bEoBVPhcTHzeLfG2q';

async function checkEvents() {
  console.log('🔍 Checking events on blockchain...\n');

  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider });

  const contractPath = path.join(__dirname, 'target/ink/history_protocol.contract');
  const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const contract = new ContractPromise(api, contractData, CONTRACT_ADDRESS);

  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');

  // Query events from each timeline
  const timelines = ['canonical', 'disputed', 'alternative'];
  
  for (const timeline of timelines) {
    console.log(`\n📋 ${timeline.toUpperCase()} Timeline:`);
    
    const { result, output } = await contract.query.getEventsByTimeline(
      CONTRACT_ADDRESS,
      { gasLimit: api.registry.createType('WeightV2', { refTime: 100000000000n, proofSize: 1000000n }) },
      timeline
    );

    if (result.isOk) {
      const events = output ? output.toJSON() : [];
      console.log(`   Found ${events ? events.length : 0} events`);
      
      if (events && events.length > 0) {
        events.forEach((event, i) => {
          console.log(`   ${i + 1}. ${event.title} (Score: ${event.consensusScore}%)`);
        });
      }
    } else {
      console.log('   ❌ Query failed:', result.asErr);
    }
  }

  await api.disconnect();
}

checkEvents().catch(console.error);
