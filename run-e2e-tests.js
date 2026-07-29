/**
 * run-e2e-tests.js - Interactive 3D Portfolio E2E Test Suite Runner
 * Executable via `node run-e2e-tests.js` or `npm test`.
 * Evaluates 43 requirement-driven opaque-box E2E test cases across Tiers 1 to 4.
 */

import { runTier1Tests } from './tests/tier1_features.test.js';
import { runTier2Tests } from './tests/tier2_boundary.test.js';
import { runTier3Tests } from './tests/tier3_cross.test.js';
import { runTier4Tests } from './tests/tier4_realworld.test.js';

console.log('================================================================');
console.log('      INTERACTIVE 3D PORTFOLIO - E2E TEST SUITE RUNNER (M0)     ');
console.log('================================================================\n');

const startTime = Date.now();

const tier1Results = runTier1Tests();
const tier2Results = runTier2Tests();
const tier3Results = runTier3Tests();
const tier4Results = runTier4Tests();

const allResults = [
  { tier: 'Tier 1: Feature Coverage (6 Features x 5 Tests)', tests: tier1Results },
  { tier: 'Tier 2: Boundary & Corner Cases', tests: tier2Results },
  { tier: 'Tier 3: Cross-Feature Combinations', tests: tier3Results },
  { tier: 'Tier 4: Real-World Application Scenarios', tests: tier4Results }
];

let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;

for (const group of allResults) {
  console.log(`--- ${group.tier} ---`);
  for (const t of group.tests) {
    totalTests++;
    if (t.passed) {
      totalPassed++;
      console.log(`  [PASS] ${t.name}`);
    } else {
      totalFailed++;
      console.log(`  [FAIL] ${t.name}`);
      console.log(`         Error: ${t.error}`);
    }
  }
  console.log('');
}

const duration = Date.now() - startTime;

console.log('================================================================');
console.log('                       E2E TEST SUMMARY                         ');
console.log('================================================================');
console.log(` Total Executed Test Cases : ${totalTests}`);
console.log(` Passed Test Cases          : ${totalPassed}`);
console.log(` Failed Test Cases          : ${totalFailed}`);
console.log(` Total Suite Duration       : ${duration} ms`);
console.log('================================================================');

if (totalFailed === 0) {
  console.log(' OVERALL VERDICT: ALL E2E TESTS PASSED SUCCESSFULLY! (100% PASS)');
  console.log('================================================================\n');
  process.exit(0);
} else {
  console.log(' OVERALL VERDICT: E2E TEST SUITE SUFFERED FAILURES!');
  console.log('================================================================\n');
  process.exit(1);
}
