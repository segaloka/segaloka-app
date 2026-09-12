import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const schemaSource = readFileSync(new URL('./schema.ts', import.meta.url), 'utf8');

function expectSource(pattern: RegExp, description: string): void {
  expect(schemaSource, `Expected schema source to define ${description}.`).toMatch(pattern);
}

function expectSourceNot(pattern: RegExp, description: string): void {
  expect(schemaSource, `Expected schema source not to define ${description}.`).not.toMatch(pattern);
}

describe('authentication principal persistence constraint contract', () => {
  it('uses a dedicated auth PostgreSQL schema', () => {
    expectSource(/pgSchema\(\s*['"]auth['"]\s*\)/, 'the dedicated "auth" PostgreSQL schema');
  });

  it('keeps principal and identity identifiers distinct', () => {
    expectSource(
      /principals[\s\S]*identityId:\s*uuid\(\s*['"]identity_id['"]\s*\)\.references\(\(\)\s*=>\s*identities\.id\)/,
      'a nullable principal-to-identity foreign key'
    );

    expectSourceNot(
      /identityId:\s*uuid\(\s*['"]identity_id['"]\s*\)\.notNull\(\)\.references\(\(\)\s*=>\s*identities\.id\)/,
      'a mandatory principal-to-identity mapping'
    );
  });

  it('allows at most one canonical principal mapping per identity', () => {
    expectSource(
      /unique\(\s*['"]principals_identity_id_unique['"]\s*\)\.on\(\s*table\.identityId\s*\)/,
      'one canonical principal per non-null identity'
    );
  });
  it('enforces principal lifecycle states', () => {
    expectSource(
      /principals_status_check[\s\S]*ACTIVE[\s\S]*SUSPENDED[\s\S]*REVOKED/,
      'principal ACTIVE, SUSPENDED, and REVOKED states'
    );
  });

  it('enforces external binding lifecycle states', () => {
    expectSource(
      /principal_bindings_status_check[\s\S]*ACTIVE[\s\S]*REVOKED/,
      'principal binding ACTIVE and REVOKED states'
    );
  });

  it('enforces global uniqueness of external issuer and subject', () => {
    expectSource(
      /unique\(\s*['"]principal_bindings_issuer_subject_unique['"]\s*\)\.on\(\s*table\.issuer\s*,\s*table\.subject\s*\)/,
      'issuer plus subject uniqueness'
    );
  });

  it('rejects blank issuer and subject values', () => {
    expectSource(
      /principal_bindings_issuer_non_empty_check[\s\S]*btrim/,
      'a non-empty issuer constraint'
    );

    expectSource(
      /principal_bindings_subject_non_empty_check[\s\S]*btrim/,
      'a non-empty subject constraint'
    );
  });

  it('does not persist external credentials or tokens in the principal mapping tables', () => {
    expectSourceNot(
      /password|passwordHash|accessToken|refreshToken|jwt|mfaSecret|apiKey|credentialPayload|claimsJson/i,
      'credential, token, MFA secret, API key, or raw claims fields'
    );
  });

  it('does not use cascading deletion for principal mappings', () => {
    expectSourceNot(
      /onDelete\s*:\s*['"]cascade['"]|onDelete\(\s*['"]cascade['"]\s*\)/i,
      'ON DELETE CASCADE'
    );
  });
});
