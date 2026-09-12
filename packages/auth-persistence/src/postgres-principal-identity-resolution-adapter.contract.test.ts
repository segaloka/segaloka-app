import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  new URL('./postgres-principal-identity-resolution-adapter.ts', import.meta.url),
  'utf8'
);

describe('PostgresPrincipalIdentityResolutionAdapter contract', () => {
  it('reads the canonical auth principals table through the database connection', () => {
    expect(source).toContain('databaseSchema.principals');

    expect(source).toMatch(/this\.database\.db\s*\.select\s*\(/);
  });

  it('matches the supplied PrincipalId against the principal primary key', () => {
    expect(source).toMatch(/eq\(\s*databaseSchema\.principals\.id,\s*principalId\s*\)/);
  });

  it('fails closed for non-active principals', () => {
    expect(source).toMatch(/eq\(\s*databaseSchema\.principals\.status,\s*['"]ACTIVE['"]\s*\)/);
  });

  it('returns undefined when no active principal row or identity mapping exists', () => {
    expect(source).toMatch(/const\s+identityId\s*=\s*row\?\.identityId\s*;/);

    expect(source).toMatch(/identityId\s*===\s*undefined/);

    expect(source).toMatch(/identityId\s*===\s*null/);

    expect(source).toMatch(/return\s+undefined/);
  });

  it('does not derive IdentityId from PrincipalId', () => {
    expect(source).not.toMatch(/asOpaqueId<['"]IdentityId['"]>\(\s*principalId\s*\)/);

    expect(source).not.toMatch(/principalId\s+as\s+IdentityId/);

    expect(source).not.toMatch(/principalId\s+as\s+unknown\s+as\s+IdentityId/);
  });

  it('maps only the persisted identity_id value into IdentityId', () => {
    expect(source).toMatch(/const\s+identityId\s*=\s*row\?\.identityId\s*;/);

    expect(source).toMatch(/asOpaqueId<['"]IdentityId['"]>\(\s*identityId\s*\)/);
  });
});
