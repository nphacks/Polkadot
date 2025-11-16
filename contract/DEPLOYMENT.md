# Contract Deployment Guide

## Contract Build Status

✅ **Contract successfully compiled!**

- **Contract artifacts location**: `contract/target/ink/`
- **Contract file**: `history_protocol.contract` (code + metadata)
- **WASM file**: `history_protocol.wasm` (contract code)
- **Metadata file**: `history_protocol.json` (contract metadata)
- **Original WASM size**: 38.9K
- **Optimized WASM size**: 11.7K

## Local Development Node

A local Substrate Contracts Node is running:
- **RPC endpoint**: `ws://127.0.0.1:9944`
- **Chain**: Development
- **Mode**: `--dev --tmp` (temporary chain, resets on restart)

## Deployment Options

### Option 1: Using Polkadot.js Apps UI (Recommended for Testing)

1. Open [Polkadot.js Apps](https://polkadot.js.org/apps/)
2. Connect to local node:
   - Click top-left network selector
   - Choose "Development" → "Local Node" (ws://127.0.0.1:9944)
3. Navigate to Developer → Contracts
4. Click "Upload & deploy code"
5. Upload the contract file: `contract/target/ink/history_protocol.contract`
6. Select the constructor: `new()`
7. Click "Deploy" and sign with Alice account

### Option 2: Using cargo-contract CLI

**Note**: There's a version incompatibility between cargo-contract 5.0.3 and ink! 4.3.

To resolve this, either:

**A. Downgrade cargo-contract to 3.2.0:**
```bash
cargo install cargo-contract --version 3.2.0 --force
```

**B. Upgrade ink! to 5.0.x (requires code changes):**
```bash
# Update Cargo.toml
ink = { version = "5.0", default-features = false }
```

Once resolved, deploy with:
```bash
cd contract
cargo contract instantiate --constructor new --suri //Alice --skip-confirm
```

### Option 3: Using Polkadot.js API (Programmatic)

See the frontend integration code for examples of deploying via the Polkadot.js API.

## Testing Contract Methods

Once deployed, you can test the contract methods:

### Using Polkadot.js Apps UI:

1. Go to Developer → Contracts
2. Click on your deployed contract
3. Test methods:
   - `submitEvent(title, date, description, evidence_sources)` - Submit a new historical event
   - `vote(event_id, support)` - Vote on an event
   - `getEvent(event_id)` - Retrieve event details
   - `getEventsByTimeline(timeline)` - Get all events in a timeline
   - `hasVoted(event_id, voter)` - Check if user voted
   - `getUserEvents(user)` - Get user's submitted events

### Using cargo-contract CLI:

```bash
# Query methods (read-only)
cargo contract call --contract <CONTRACT_ADDRESS> --message get_event --args 1 --suri //Alice --dry-run

# Transaction methods (state-changing)
cargo contract call --contract <CONTRACT_ADDRESS> --message submit_event --args "Moon Landing" 1969 "Apollo 11" '["nasa.gov"]' --suri //Alice
```

## Contract Address

✅ **Contract successfully deployed!**

**Contract Address**: `5DSAaWnn4Urzu4d64HPrhUgsAYij4N8riTTpuiu9oZYc8TiH`
**Deployer**: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY` (Alice)
**Network**: Local Development Node
**RPC Endpoint**: `ws://127.0.0.1:9944`
**Deployed At**: 2025-11-16T14:14:55.584Z

Update this address in:
- `frontend/src/config.ts` (or wherever contract config is stored)
- Any deployment scripts or documentation

Full deployment details are available in `contract/deployment-info.json`

## Next Steps

1. Deploy the contract using one of the methods above
2. Record the contract address
3. Test all contract methods to verify functionality
4. Configure the frontend with the contract address
5. Begin frontend development (Task 8+)
