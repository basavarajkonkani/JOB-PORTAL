# Quick Load Test Guide

## TL;DR

```bash
cd backend
npm run test:load:report
```

## Prerequisites

1. Set `FIREBASE_SERVICE_ACCOUNT` in `.env`
2. Ensure Firebase project is configured
3. Have sufficient Firebase quotas

## Run Tests

### Option 1: With Report (Recommended)

```bash
npm run test:load:report
```

- Interactive prompts
- Generates timestamped report in `reports/` directory
- Best for production testing

### Option 2: Direct Execution

```bash
npm run test:load
```

- Runs tests immediately
- Output to console only
- Best for quick checks

### Option 3: Skip Load Tests

```bash
SKIP_LOAD_TESTS=true npm test
```

- Skips load tests
- Runs other tests normally
- Best for CI/CD

## What Gets Tested

| Test Suite        | Operations          | Expected Time |
| ----------------- | ------------------- | ------------- |
| Firestore Queries | 50 concurrent reads | ~30s          |
| Firestore Writes  | 5 batch writes      | ~10s          |
| Firebase Auth     | 20 user creations   | ~20s          |
| Cloud Storage     | 20 file uploads     | ~30s          |
| Combined Load     | 30 mixed operations | ~20s          |

**Total Test Time**: ~2 minutes

## Reading Results

### Success Rate

- **>95%**: ✅ Excellent
- **90-95%**: ✓ Good
- **80-90%**: ⚠️ Fair
- **<80%**: ❌ Poor

### Response Times

- **Reads**: <500ms is excellent
- **Writes**: <1000ms is excellent
- **Auth**: <1000ms is excellent
- **Storage**: <3000ms is excellent

### Example Output

```
============================================================
Load Test Results: Concurrent Document Reads
============================================================
Total Requests:       50
Successful:           49
Failed:               1
Success Rate:         98.00%
Total Duration:       12450.50ms
Average Duration:     254.09ms
Min Duration:         145.23ms
Max Duration:         487.65ms
Requests/Second:      3.94
============================================================
```

## Common Issues

### "Tests timing out"

```bash
# Reduce concurrent requests in load-testing.test.ts
const CONCURRENT_REQUESTS = 25; // Instead of 50
```

### "High failure rate"

- Check Firebase Console for quota limits
- Verify service account permissions
- Check network connectivity

### "Permission denied"

```bash
chmod +x scripts/run-load-tests.sh
```

## Firebase vs PostgreSQL

| Metric      | PostgreSQL | Firebase  | Difference    |
| ----------- | ---------- | --------- | ------------- |
| Read Speed  | 50-200ms   | 100-500ms | 2-3x slower   |
| Write Speed | 10-50ms    | 100-300ms | 5-10x slower  |
| Scalability | Manual     | Automatic | Firebase wins |
| Maintenance | High       | Low       | Firebase wins |

## When to Run

- ✅ Before major releases
- ✅ After performance optimizations
- ✅ When investigating performance issues
- ✅ Monthly for baseline tracking
- ❌ Not in CI/CD (too slow)
- ❌ Not against production (use staging)

## Quick Optimization Tips

### If reads are slow:

1. Add Firestore composite indexes
2. Implement Redis caching
3. Denormalize frequently accessed data

### If writes are slow:

1. Use batch operations
2. Reduce security rule complexity
3. Consider write batching

### If auth is slow:

1. Cache user data
2. Reduce custom claims complexity
3. Implement token caching

## Need More Info?

- **Full Guide**: See `LOAD_TESTING.md`
- **Comparison**: See `PERFORMANCE_COMPARISON.md`
- **Summary**: See `LOAD_TEST_SUMMARY.md`

## Support

If tests fail consistently:

1. Check Firebase Status: https://status.firebase.google.com/
2. Review Firebase Console for errors
3. Check quotas and limits
4. Verify service account permissions

## Report Location

Reports are saved to:

```
backend/reports/load-test-report-YYYYMMDD_HHMMSS.txt
```

Keep reports for:

- Performance trend analysis
- Before/after comparisons
- Capacity planning
- Incident investigation
