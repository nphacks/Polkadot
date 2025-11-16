# Testing Quick Start Guide

Get started with testing the Contested History Protocol in 5 minutes.

## Prerequisites

Ensure you have:
- ✅ Substrate Contracts Node running
- ✅ Contract deployed
- ✅ Polkadot.js extension installed
- ✅ Test accounts with tokens (Alice, Bob, Charlie)

## Quick Setup

```bash
# Terminal 1: Start blockchain (fresh state)
substrate-contracts-node --dev --tmp

# Terminal 2: Deploy contract (if needed)
cd contract
cargo contract build
cargo contract instantiate --constructor new --suri //Alice --skip-confirm

# Terminal 3: Start frontend
cd frontend
npm run dev
```

## 5-Minute Smoke Test

### 1. Test Contract (30 seconds)
```bash
cd contract
node test-contract.js
```

**Expected**: All 8 tests pass ✅

### 2. Test Frontend Build (30 seconds)
```bash
cd frontend
npm run build
```

**Expected**: Build completes successfully ✅

### 3. Test Wallet Connection (1 minute)
1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Select Alice account
4. Authorize connection

**Expected**: Wallet address appears in header ✅

### 4. Test Event Submission (2 minutes)
1. Click "Submit Event"
2. Fill in form:
   - Title: "Test Event"
   - Date: 2024
   - Description: "Testing the application"
   - Evidence: "https://example.com/test"
3. Click "Submit Event"
4. Sign transaction

**Expected**: Success message with event ID ✅

### 5. Test Voting (1 minute)
1. Navigate to "Timeline" → "Disputed"
2. Click on the event you just created
3. Click "Support" button
4. Sign transaction

**Expected**: Vote recorded, buttons disabled ✅

## Comprehensive Testing

For thorough testing, follow the complete checklist:

```bash
# Open the comprehensive testing guide
cat INTEGRATION_TEST_CHECKLIST.md
```

This includes:
- 15 test categories
- 50+ test cases
- Edge case testing
- Browser compatibility
- Error handling

## Automated Testing

Run the full integration test suite:

```bash
# Ensure fresh blockchain state
substrate-contracts-node --dev --tmp

# In another terminal
node contract/integration-test.js
```

**Note**: Restart the blockchain node with `--tmp` flag for clean state.

## Common Issues

### Issue: "Extension not found"
**Solution**: Install Polkadot.js extension and refresh page

### Issue: "Insufficient balance"
**Solution**: Use pre-funded accounts (Alice, Bob, Charlie) or get testnet tokens

### Issue: "Contract not found"
**Solution**: Verify contract address in `frontend/src/config/contract.ts`

### Issue: "Transaction failed"
**Solution**: Check substrate node is running and contract is deployed

## Test Results

After testing, check:
- ✅ All contract methods work
- ✅ Frontend loads without errors
- ✅ Wallet connects successfully
- ✅ Events can be submitted
- ✅ Voting works correctly
- ✅ Timeline movement works (75%, 25% thresholds)

## Next Steps

1. ✅ Complete 5-minute smoke test
2. ⏳ Follow comprehensive testing checklist
3. ⏳ Test on multiple browsers
4. ⏳ Test responsive design on mobile
5. ⏳ Document any bugs found

## Documentation

- **INTEGRATION_TEST_CHECKLIST.md**: Detailed testing guide
- **BUG_FIXES.md**: Known issues and fixes
- **TEST_SUMMARY.md**: Complete test results
- **README.md**: Project overview and setup

## Support

If you encounter issues:
1. Check the troubleshooting section in README.md
2. Review BUG_FIXES.md for known issues
3. Ensure all prerequisites are met
4. Restart blockchain node with fresh state

---

**Happy Testing! 🧪**
