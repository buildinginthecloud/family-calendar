/**
 * Jest setup file for property-based testing configuration
 * Configures fast-check to run minimum 100 iterations per property test
 */

import * as fc from 'fast-check';

// Configure fast-check globally for minimum 100 iterations
// This applies to all property-based tests
beforeEach(() => {
  fc.configureGlobal({
    numRuns: 100, // Minimum 100 iterations as specified in design document
    verbose: false, // Minimize output to avoid session timeouts
  });
});

// Optional: Add custom matchers or test utilities here
