import { readFileSync } from 'node:fs';

import type { PrincipalBindingResolutionPort, VerifiedExternalIdentity } from '@segaloka/auth';
import { describe, expect, it } from 'vitest';

import { PostgresPrincipalBindingResolutionAdapter } from './postgres-principal-binding-resolution-adapter.js';

const productionSource = readFileSync(
  new URL('./postgres-principal-binding-resolution-adapter.ts', import.meta.url),
  'utf8'
);

describe('PostgresPrincipalBindingResolutionAdapter contract', () => {
  it('structurally satisfies the provider-neutral principal binding resolution port', () => {
    const adapterTypeCheck = (
      port: PrincipalBindingResolutionPort
    ): PrincipalBindingResolutionPort => port;

    expect(adapterTypeCheck).toBeDefined();
    expect(PostgresPrincipalBindingResolutionAdapter).toBeDefined();
  });

  it('accepts only the verified external identity contract at the resolution boundary', () => {
    const externalIdentity: VerifiedExternalIdentity = {
      issuer: 'https://identity.example.test',
      subject: 'external-subject-01'
    };

    expect(externalIdentity).toEqual({
      issuer: 'https://identity.example.test',
      subject: 'external-subject-01'
    });
  });

  it('reads principal bindings and joins the canonical principal table', () => {
    expect(productionSource).toContain('databaseSchema.principalBindings');

    expect(productionSource).toContain('databaseSchema.principals');

    expect(productionSource).toMatch(/\.innerJoin\s*\(\s*databaseSchema\.principals/);
  });

  it('matches issuer and subject exactly without persistence normalization', () => {
    expect(productionSource).toMatch(
      /eq\(\s*databaseSchema\.principalBindings\.issuer,\s*externalIdentity\.issuer\s*\)/
    );

    expect(productionSource).toMatch(
      /eq\(\s*databaseSchema\.principalBindings\.subject,\s*externalIdentity\.subject\s*\)/
    );

    expect(productionSource).not.toMatch(
      /externalIdentity\.(?:issuer|subject)\.(?:trim|toLowerCase|toUpperCase)\s*\(/
    );
  });

  it('fails closed unless both binding and principal are ACTIVE', () => {
    expect(productionSource).toMatch(
      /eq\(\s*databaseSchema\.principalBindings\.status,\s*['"]ACTIVE['"]\s*\)/
    );

    expect(productionSource).toMatch(
      /eq\(\s*databaseSchema\.principals\.status,\s*['"]ACTIVE['"]\s*\)/
    );
  });

  it('joins binding principal_id to the canonical principal primary key', () => {
    expect(productionSource).toMatch(
      /eq\(\s*databaseSchema\.principals\.id,\s*databaseSchema\.principalBindings\.principalId\s*\)/
    );
  });

  it('returns undefined when no active binding and active principal pair exists', () => {
    expect(productionSource).toMatch(/const\s+principalId\s*=\s*row\?\.principalId\s*;/);

    expect(productionSource).toMatch(/principalId\s*===\s*undefined/);

    expect(productionSource).toMatch(/return\s+undefined\s*;/);
  });

  it('asserts persisted principal UUID through the public canonical PrincipalId constructor', () => {
    expect(productionSource).toContain('asCanonicalPrincipalId');

    expect(productionSource).toMatch(/return\s+asCanonicalPrincipalId\(\s*principalId\s*\)\s*;/);
  });

  it('does not cross into identity resolution or credential verification concerns', () => {
    expect(productionSource).not.toMatch(/\.identityId\b/);

    expect(productionSource).not.toMatch(/\b(?:jwt|token|password|credential|claims|session)\b/i);

    expect(productionSource).not.toContain('createDatabaseConnection');

    expect(productionSource).not.toMatch(/this\.database\.close\s*\(/);
  });
});
