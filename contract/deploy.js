#!/usr/bin/env node

/**
 * Contract Deployment Script
 * 
 * This script deploys the history_protocol contract to a local Substrate Contracts Node
 * using the Polkadot.js API.
 * 
 * Prerequisites:
 * - Node.js installed
 * - Local Substrate Contracts Node running on ws://127.0.0.1:9944
 * - Contract built (history_protocol.contract file exists)
 * 
 * Usage:
 *   npm install @polkadot/api @polkadot/api-contract @polkadot/keyring
 *   node deploy.js
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { CodePromise, ContractPromise } = require('@polkadot/api-contract');
const { Keyring } = require('@polkadot/keyring');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Starting contract deployment...\n');

  // Connect to local node
  console.log('📡 Connecting to local Substrate Contracts Node...');
  const wsProvider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log('✅ Connected to node\n');

  // Load contract files
  const contractPath = path.join(__dirname, 'target/ink/history_protocol.contract');
  
  if (!fs.existsSync(contractPath)) {
    console.error('❌ Contract file not found. Please build the contract first:');
    console.error('   cd contract && cargo contract build --release');
    process.exit(1);
  }

  console.log('📄 Loading contract files...');
  const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const wasm = contractData.source.wasm;
  const metadata = contractData;
  console.log('✅ Contract files loaded\n');

  // Setup Alice account (deployer)
  console.log('🔑 Setting up deployer account (Alice)...');
  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');
  console.log(`✅ Deployer: ${alice.address}\n`);

  // Upload and instantiate contract
  console.log('📤 Uploading contract code...');
  const code = new CodePromise(api, metadata, wasm);

  // Estimate gas for instantiation
  console.log('⛽ Estimating gas...');
  const storageDepositLimit = null; // Use default
  
  try {
    // Deploy the contract
    console.log('🔨 Deploying contract...');
    const tx = code.tx.new({ storageDepositLimit, gasLimit: api.registry.createType('WeightV2', { refTime: 100000000000, proofSize: 100000 }) });
    
    const address = await new Promise((resolve, reject) => {
      tx.signAndSend(alice, ({ contract, status, events }) => {
        if (status.isInBlock || status.isFinalized) {
          console.log(`✅ Contract deployed in block: ${status.asInBlock || status.asFinalized}`);
          
          // Find the contract instantiation event
          events.forEach(({ event }) => {
            if (api.events.contracts.Instantiated.is(event)) {
              const [deployer, contractAddress] = event.data;
              console.log(`\n🎉 Contract successfully deployed!`);
              console.log(`📍 Contract Address: ${contractAddress.toString()}`);
              console.log(`👤 Deployed by: ${deployer.toString()}\n`);
              
              // Save contract address to file
              const deploymentInfo = {
                contractAddress: contractAddress.toString(),
                deployer: deployer.toString(),
                deployedAt: new Date().toISOString(),
                network: 'local-dev',
                rpcEndpoint: 'ws://127.0.0.1:9944'
              };
              
              fs.writeFileSync(
                path.join(__dirname, 'deployment-info.json'),
                JSON.stringify(deploymentInfo, null, 2)
              );
              console.log('💾 Deployment info saved to: contract/deployment-info.json\n');
              
              resolve(contractAddress.toString());
            }
          });
        }
      }).catch(reject);
    });

    console.log('✨ Deployment complete!\n');
    console.log('Next steps:');
    console.log('1. Update frontend configuration with contract address');
    console.log('2. Test contract methods using Polkadot.js Apps UI');
    console.log('3. Begin frontend development\n');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    await api.disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
