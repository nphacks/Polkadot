#!/usr/bin/env node
/**
 * Quick script to check if contract exists at the address
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const fs = require('fs');
const path = require('path');

async function checkContract() {
  console.log('🔍 Checking contract deployment...\n');

  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider });

  console.log('✅ Connected to node');
  console.log('Chain:', (await api.rpc.system.chain()).toString());
  console.log('Node:', (await api.rpc.system.name()).toString());
  console.log();

  const contractAddress = '5E1FvPudm4Lhb54HBE4Hhei6JpfH5b6bEoBVPhcTHzeLfG2q';
  console.log('Checking contract at:', contractAddress);

  // Check if contract code exists
  const contractInfo = await api.query.contracts.contractInfoOf(contractAddress);
  
  if (contractInfo.isNone) {
    console.log('❌ No contract found at this address!');
    console.log('\nYou need to redeploy:');
    console.log('  cd contract');
    console.log('  cargo contract instantiate --constructor new --suri //Alice --skip-confirm');
  } else {
    console.log('✅ Contract exists!');
    console.log('Contract info:', contractInfo.toHuman());
  }

  await api.disconnect();
}

checkContract().catch(console.error);
