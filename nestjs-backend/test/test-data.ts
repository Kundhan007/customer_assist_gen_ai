export const TEST_USERS = {
  ADMIN: { email: 'admin@test.com', password: 'secret' },
  SUPERADMIN: { email: 'superadmin@test.com', password: 'secret' },
  SUPPORT: { email: 'support@test.com', password: 'secret' },
  JOHN_DOE: { email: 'john.doe@test.com', password: 'secret' },
  JANE_SMITH: { email: 'jane.smith@test.com', password: 'secret' },
  BOB_WILSON: { email: 'bob.wilson@test.com', password: 'secret' },
  ALICE_BROWN: { email: 'alice.brown@test.com', password: 'secret' },
  CHARLIE_DAVIS: { email: 'charlie.davis@test.com', password: 'secret' },
} as const;

export const TEST_POLICIES = {
  GOLD_001: 'GOLD-001',
  GOLD_002: 'GOLD-002',
  GOLD_003: 'GOLD-003',
  GOLD_004: 'GOLD-004',
  GOLD_005: 'GOLD-005',
  GOLD_006: 'GOLD-006',
  SILVER_001: 'SILVER-001',
  SILVER_002: 'SILVER-002',
  SILVER_003: 'SILVER-003',
  SILVER_004: 'SILVER-004',
  SILVER_005: 'SILVER-005',
  SILVER_006: 'SILVER-006',
} as const;

export const TEST_CLAIMS = {
  CLM_001: 'CLM-001',
  CLM_002: 'CLM-002',
  CLM_003: 'CLM-003',
  CLM_004: 'CLM-004',
  CLM_005: 'CLM-005',
  CLM_006: 'CLM-006',
  CLM_007: 'CLM-007',
  CLM_008: 'CLM-008',
  CLM_009: 'CLM-009',
  CLM_010: 'CLM-010',
  CLM_011: 'CLM-011',
  CLM_012: 'CLM-012',
  CLM_013: 'CLM-013',
  CLM_014: 'CLM-014',
  CLM_015: 'CLM-015',
  CLM_016: 'CLM-016',
} as const;

export const TEST_KB_ENTRY_ID = 'test-kb-001';

export const TEST_SESSION_ID = 'new-session-123';

export const NON_EXISTENT_USER_ID = '00000000-0000-0000-0000-000000000000';
export const NON_EXISTENT_POLICY_ID = 'NONEXISTENT';
export const NON_EXISTENT_CLAIM_ID = 'non-existent-claim';

// Password hash for 'secret' using bcrypt (cost 10)
// This should match the hash used in test-seed-data.sql
export const PASSWORD_HASH_SECRET = '$2b$10$n7FVTH8lz10f8vpZ68x3Autjzqaia8391IQXe7e1BtDdbgVLKCoLm';
