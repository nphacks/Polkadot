/**
 * Integration Test Suite for Contested History Protocol
 * 
 * Tests the complete flow:
 * 1. Connect wallet
 * 2. Submit event
 * 3. Vote on event
 * 4. Verify timeline movement
 * 5. Test with multiple accounts
 * 6. Test edge cases (75%, 25% consensus)
 */

const { ApiPromise, WsProvider } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');
const { Keyring } = require('@polkadot/keyring');
const fs = require('fs');
const path = require('path');

// Configuration
const WS_ENDPOINT = 'ws://127.0.0.1:9944';
const CONTRACT_ADDRESS = '5DSAaWnn4Urzu4d64HPrhUgsAYij4N8riTTpuiu9oZYc8TiH';

// Test accounts
const TEST_ACCOUNTS = {
  alice: '//Alice',
  bob: '//Bob',
  charlie: '//Charlie',
  dave: '//Dave',
  eve: '//Eve',
  ferdie: '//Ferdie',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logTest(testName) {
  log(`\n▶ ${testName}`, 'blue');
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message) {
  log(`  ✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`  ⚠ ${message}`, 'yellow');
}

// Helper to wait for transaction
async function sendTransaction(api, contract, method, account, ...args) {
  return new Promise(async (resolve, reject) => {
    try {
      // Use a high gas limit for transactions
      const gasLimit = api.registry.createType('WeightV2', {
        refTime: 100000000000,
        proofSize: 100000
      });
      
      const unsub = await contract.tx[method](
        { 
          gasLimit,
          storageDepositLimit: null
        },
        ...args
      ).signAndSend(account, (result) => {
        if (result.status.isInBlock) {
          log(`    Transaction included in block`, 'yellow');
        } else if (result.status.isFinalized) {
          unsub();
          
          // Check for any errors in the events
          const failedEvent = result.events.find(({ event }) =>
            api.events.system.ExtrinsicFailed.is(event)
          );
          
          if (failedEvent) {
            const { event } = failedEvent;
            const [dispatchError] = event.data;
            let errorInfo = 'Transaction failed';
            
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              errorInfo = `${decoded.section}.${decoded.name}: ${decoded.docs}`;
            }
            
            reject(new Error(errorInfo));
          } else {
            logSuccess(`Transaction finalized in block ${result.status.asFinalized}`);
            resolve(result);
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Helper to query contract
async function queryContract(contract, method, caller, ...args) {
  const { gasRequired, storageDeposit, result, output } = await contract.query[method](
    caller.address,
    { gasLimit: -1 },
    ...args
  );
  
  if (result.isOk) {
    return output.toHuman();
  } else {
    throw new Error(`Query failed: ${result.asErr}`);
  }
}

async function main() {
  logSection('🚀 Starting Integration Tests');
  
  let api, contract, keyring, accounts;
  let testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };
  
  try {
    // Initialize API
    logTest('Initializing Polkadot API');
    const wsProvider = new WsProvider(WS_ENDPOINT);
    api = await ApiPromise.create({ provider: wsProvider });
    logSuccess(`Connected to ${await api.rpc.system.chain()}`);
    
    // Load contract metadata
    logTest('Loading contract metadata');
    const metadataPath = path.join(__dirname, 'target/ink/history_protocol.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error('Contract metadata not found. Run: cargo contract build');
    }
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    logSuccess('Contract metadata loaded');
    
    // Initialize contract
    contract = new ContractPromise(api, metadata, CONTRACT_ADDRESS);
    logSuccess(`Contract initialized at ${CONTRACT_ADDRESS}`);
    
    // Initialize keyring and accounts
    logTest('Setting up test accounts');
    keyring = new Keyring({ type: 'sr25519' });
    accounts = {
      alice: keyring.addFromUri(TEST_ACCOUNTS.alice),
      bob: keyring.addFromUri(TEST_ACCOUNTS.bob),
      charlie: keyring.addFromUri(TEST_ACCOUNTS.charlie),
      dave: keyring.addFromUri(TEST_ACCOUNTS.dave),
      eve: keyring.addFromUri(TEST_ACCOUNTS.eve),
      ferdie: keyring.addFromUri(TEST_ACCOUNTS.ferdie),
    };
    logSuccess(`${Object.keys(accounts).length} test accounts ready`);
    
    // Test 1: Submit Event
    logSection('📝 Test 1: Submit Historical Event');
    logTest('Submitting event from Alice');
    
    const eventTitle = 'Test Event - Integration Test';
    const eventDate = 2024; // Year format like in the test script
    const eventDescription = 'This is a test event for integration testing';
    const evidenceSources = ['https://example.com/evidence1', 'https://example.com/evidence2'];
    
    try {
      await sendTransaction(
        api,
        contract,
        'submitEvent',
        accounts.alice,
        eventTitle,
        eventDate,
        eventDescription,
        evidenceSources
      );
      logSuccess('Event submitted successfully');
      testResults.passed++;
    } catch (error) {
      logError(`Failed to submit event: ${error.message}`);
      testResults.failed++;
      throw error;
    }
    
    // Query the event
    logTest('Querying submitted event');
    try {
      const eventId = 1; // First event (contract starts from 1)
      const event = await queryContract(contract, 'getEvent', accounts.alice, eventId);
      
      if (event && event.Ok) {
        logSuccess('Event retrieved successfully');
        log(`    Title: ${event.Ok.title}`, 'yellow');
        log(`    Timeline: ${event.Ok.timeline}`, 'yellow');
        log(`    Consensus Score: ${event.Ok.consensusScore}`, 'yellow');
        testResults.passed++;
      } else {
        logError('Event not found');
        testResults.failed++;
      }
    } catch (error) {
      logError(`Failed to query event: ${error.message}`);
      testResults.failed++;
    }
    
    // Test 2: Single Vote
    logSection('🗳️  Test 2: Vote on Event');
    logTest('Bob voting to support the event');
    
    try {
      await sendTransaction(
        api,
        contract,
        'vote',
        accounts.bob,
        1, // event ID
        true // support
      );
      logSuccess('Vote recorded successfully');
      testResults.passed++;
    } catch (error) {
      logError(`Failed to vote: ${error.message}`);
      testResults.failed++;
    }
    
    // Check if vote was recorded
    logTest('Verifying vote was recorded');
    try {
      const hasVoted = await queryContract(contract, 'hasVoted', accounts.bob, 1, accounts.bob.address);
      if (hasVoted === true || hasVoted === 'true') {
        logSuccess('Vote verification successful');
        testResults.passed++;
      } else {
        logError('Vote not recorded');
        testResults.failed++;
      }
    } catch (error) {
      logError(`Failed to verify vote: ${error.message}`);
      testResults.failed++;
    }
    
    // Test 3: Duplicate Vote Prevention
    logSection('🚫 Test 3: Duplicate Vote Prevention');
    logTest('Bob attempting to vote again (should fail)');
    
    try {
      await sendTransaction(
        api,
        contract,
        'vote',
        accounts.bob,
        1,
        false // challenge this time
      );
      logError('Duplicate vote was allowed (should have been prevented)');
      testResults.failed++;
    } catch (error) {
      logSuccess('Duplicate vote correctly prevented');
      testResults.passed++;
    }
    
    // Test 4: Multiple Accounts Voting
    logSection('👥 Test 4: Multiple Accounts Voting');
    
    const voters = [
      { account: accounts.charlie, support: true, name: 'Charlie' },
      { account: accounts.dave, support: true, name: 'Dave' },
      { account: accounts.eve, support: false, name: 'Eve' },
    ];
    
    for (const voter of voters) {
      logTest(`${voter.name} voting (${voter.support ? 'Support' : 'Challenge'})`);
      try {
        await sendTransaction(
          api,
          contract,
          'vote',
          voter.account,
          1,
          voter.support
        );
        logSuccess(`${voter.name}'s vote recorded`);
        testResults.passed++;
      } catch (error) {
        logError(`${voter.name}'s vote failed: ${error.message}`);
        testResults.failed++;
      }
    }
    
    // Check consensus score after multiple votes
    logTest('Checking consensus score after multiple votes');
    try {
      const event = await queryContract(contract, 'getEvent', accounts.alice, 1);
      if (event && event.Ok) {
        const score = parseInt(event.Ok.consensusScore);
        const supportVotes = parseInt(event.Ok.supportVotes);
        const challengeVotes = parseInt(event.Ok.challengeVotes);
        const totalVotes = supportVotes + challengeVotes;
        
        logSuccess(`Consensus score: ${score}%`);
        log(`    Support votes: ${supportVotes}`, 'yellow');
        log(`    Challenge votes: ${challengeVotes}`, 'yellow');
        log(`    Total votes: ${totalVotes}`, 'yellow');
        
        // Verify calculation
        const expectedScore = Math.floor((supportVotes / totalVotes) * 100);
        if (score === expectedScore) {
          logSuccess('Consensus calculation is correct');
          testResults.passed++;
        } else {
          logError(`Consensus calculation mismatch. Expected: ${expectedScore}, Got: ${score}`);
          testResults.failed++;
        }
      }
    } catch (error) {
      logError(`Failed to check consensus: ${error.message}`);
      testResults.failed++;
    }
    
    // Test 5: Timeline Movement - Canonical (75% threshold)
    logSection('📊 Test 5: Timeline Movement to Canonical (≥75%)');
    logTest('Submitting new event for canonical timeline test');
    
    try {
      await sendTransaction(
        api,
        contract,
        'submitEvent',
        accounts.alice,
        'Canonical Timeline Test Event',
        2025,
        'Testing 75% threshold for canonical timeline',
        ['https://example.com/evidence']
      );
      logSuccess('Test event submitted');
      testResults.passed++;
    } catch (error) {
      logError(`Failed to submit event: ${error.message}`);
      testResults.failed++;
    }
    
    // Vote with 3 support, 1 challenge = 75% exactly
    logTest('Voting to reach exactly 75% consensus');
    const canonicalVoters = [
      { account: accounts.bob, support: true },
      { account: accounts.charlie, support: true },
      { account: accounts.dave, support: true },
      { account: accounts.eve, support: false },
    ];
    
    for (const voter of canonicalVoters) {
      try {
        await sendTransaction(api, contract, 'vote', voter.account, 2, voter.support);
      } catch (error) {
        logError(`Vote failed: ${error.message}`);
      }
    }
    
    // Check if moved to canonical
    logTest('Verifying timeline movement to Canonical');
    try {
      const event = await queryContract(contract, 'getEvent', accounts.alice, 2);
      if (event && event.Ok) {
        const timeline = event.Ok.timeline;
        const score = parseInt(event.Ok.consensusScore);
        
        log(`    Timeline: ${timeline}`, 'yellow');
        log(`    Consensus: ${score}%`, 'yellow');
        
        if (timeline === 'Canonical' && score >= 75) {
          logSuccess('Event correctly moved to Canonical timeline');
          testResults.passed++;
        } else if (score >= 75 && timeline !== 'Canonical') {
          logError(`Event has ${score}% consensus but is in ${timeline} timeline`);
          testResults.failed++;
        } else {
          logWarning(`Event at ${score}% consensus, in ${timeline} timeline`);
          testResults.warnings++;
        }
      }
    } catch (error) {
      logError(`Failed to verify timeline: ${error.message}`);
      testResults.failed++;
    }
    
    // Test 6: Timeline Movement - Alternative (25% threshold)
    logSection('📉 Test 6: Timeline Movement to Alternative (≤25%)');
    logTest('Submitting new event for alternative timeline test');
    
    try {
      await sendTransaction(
        api,
        contract,
        'submitEvent',
        accounts.alice,
        'Alternative Timeline Test Event',
        2023,
        'Testing 25% threshold for alternative timeline',
        ['https://example.com/evidence']
      );
      logSuccess('Test event submitted');
      testResults.passed++;
    } catch (error) {
      logError(`Failed to submit event: ${error.message}`);
      testResults.failed++;
    }
    
    // Vote with 1 support, 3 challenge = 25% exactly
    logTest('Voting to reach exactly 25% consensus');
    const alternativeVoters = [
      { account: accounts.bob, support: true },
      { account: accounts.charlie, support: false },
      { account: accounts.dave, support: false },
      { account: accounts.eve, support: false },
    ];
    
    for (const voter of alternativeVoters) {
      try {
        await sendTransaction(api, contract, 'vote', voter.account, 3, voter.support);
      } catch (error) {
        logError(`Vote failed: ${error.message}`);
      }
    }
    
    // Check if moved to alternative
    logTest('Verifying timeline movement to Alternative');
    try {
      const event = await queryContract(contract, 'getEvent', accounts.alice, 3);
      if (event && event.Ok) {
        const timeline = event.Ok.timeline;
        const score = parseInt(event.Ok.consensusScore);
        
        log(`    Timeline: ${timeline}`, 'yellow');
        log(`    Consensus: ${score}%`, 'yellow');
        
        if (timeline === 'Alternative' && score <= 25) {
          logSuccess('Event correctly moved to Alternative timeline');
          testResults.passed++;
        } else if (score <= 25 && timeline !== 'Alternative') {
          logError(`Event has ${score}% consensus but is in ${timeline} timeline`);
          testResults.failed++;
        } else {
          logWarning(`Event at ${score}% consensus, in ${timeline} timeline`);
          testResults.warnings++;
        }
      }
    } catch (error) {
      logError(`Failed to verify timeline: ${error.message}`);
      testResults.failed++;
    }
    
    // Test 7: Query Events by Timeline
    logSection('🔍 Test 7: Query Events by Timeline');
    
    const timelines = ['Canonical', 'Disputed', 'Alternative'];
    for (const timeline of timelines) {
      logTest(`Querying ${timeline} timeline`);
      try {
        const events = await queryContract(contract, 'getEventsByTimeline', accounts.alice, timeline);
        if (events) {
          const eventCount = Array.isArray(events) ? events.length : (events.Ok ? events.Ok.length : 0);
          logSuccess(`Found ${eventCount} event(s) in ${timeline} timeline`);
          testResults.passed++;
        }
      } catch (error) {
        logError(`Failed to query ${timeline} timeline: ${error.message}`);
        testResults.failed++;
      }
    }
    
    // Test 8: Query User Events
    logSection('👤 Test 8: Query User Events');
    logTest('Querying events submitted by Alice');
    
    try {
      const userEvents = await queryContract(contract, 'getUserEvents', accounts.alice, accounts.alice.address);
      if (userEvents) {
        const eventCount = Array.isArray(userEvents) ? userEvents.length : (userEvents.Ok ? userEvents.Ok.length : 0);
        logSuccess(`Alice has submitted ${eventCount} event(s)`);
        testResults.passed++;
      }
    } catch (error) {
      logError(`Failed to query user events: ${error.message}`);
      testResults.failed++;
    }
    
  } catch (error) {
    logError(`\nCritical error: ${error.message}`);
    console.error(error);
    testResults.failed++;
  } finally {
    // Cleanup
    if (api) {
      await api.disconnect();
    }
    
    // Print summary
    logSection('📊 Test Summary');
    log(`Total Passed: ${testResults.passed}`, 'green');
    log(`Total Failed: ${testResults.failed}`, 'red');
    log(`Total Warnings: ${testResults.warnings}`, 'yellow');
    
    const total = testResults.passed + testResults.failed;
    const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
    
    console.log('\n' + '='.repeat(60));
    if (testResults.failed === 0) {
      log(`✅ All tests passed! (${successRate}% success rate)`, 'green');
    } else {
      log(`❌ Some tests failed (${successRate}% success rate)`, 'red');
    }
    console.log('='.repeat(60) + '\n');
    
    process.exit(testResults.failed > 0 ? 1 : 0);
  }
}

// Run tests
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
