import type { VerifiedExternalIdentity } from '@segaloka/auth';
import { describe, expect, expectTypeOf, it } from 'vitest';

import {
  EXTERNAL_IDENTITY_VERIFICATION_FAILURE_REASONS,
  type ExternalIdentityVerificationFailure,
  type ExternalIdentityVerificationFailureReason,
  type ExternalIdentityVerificationResult,
  type ExternalIdentityVerificationSuccess,
  type ExternalIdentityVerifier
} from './external-identity-verifier.js';

describe('ExternalIdentityVerifier contract', () => {
  it('defines the canonical credential verification failure reasons', () => {
    expect(EXTERNAL_IDENTITY_VERIFICATION_FAILURE_REASONS).toEqual([
      'CREDENTIAL_MISSING',
      'CREDENTIAL_INVALID',
      'CREDENTIAL_EXPIRED'
    ]);
  });

  it('returns a verified external identity on successful verification', () => {
    const externalIdentity: VerifiedExternalIdentity = {
      issuer: 'https://identity.example.test',
      subject: 'external-subject-123'
    };

    const result: ExternalIdentityVerificationSuccess = {
      verified: true,
      externalIdentity
    };

    expect(result).toEqual({
      verified: true,
      externalIdentity
    });

    expectTypeOf(result.externalIdentity).toEqualTypeOf<VerifiedExternalIdentity>();
  });

  it('represents verification failure without manufacturing an external identity', () => {
    const result: ExternalIdentityVerificationFailure = {
      verified: false,
      reason: 'CREDENTIAL_INVALID'
    };

    expect(result).toEqual({
      verified: false,
      reason: 'CREDENTIAL_INVALID'
    });

    expect('externalIdentity' in result).toBe(false);
  });

  it('keeps verifier input transport agnostic', async () => {
    const verify = (
      credential: string
    ): Promise<ExternalIdentityVerificationResult> => {
      if (credential.length === 0) {
        return Promise.resolve({
          verified: false,
          reason: 'CREDENTIAL_MISSING'
        });
      }

      return Promise.resolve({
        verified: true,
        externalIdentity: {
          issuer: 'https://identity.example.test',
          subject: credential
        }
      });
    };

    const verifier: ExternalIdentityVerifier = {
      verify
    };

    expectTypeOf(verify).parameter(0).toEqualTypeOf<string>();

    await expect(verifier.verify('external-subject-456')).resolves.toEqual({
      verified: true,
      externalIdentity: {
        issuer: 'https://identity.example.test',
        subject: 'external-subject-456'
      }
    });

    await expect(verifier.verify('')).resolves.toEqual({
      verified: false,
      reason: 'CREDENTIAL_MISSING'
    });
  });

  it('keeps every failure reason inside the canonical failure union', () => {
    for (const reason of EXTERNAL_IDENTITY_VERIFICATION_FAILURE_REASONS) {
      expectTypeOf(reason).toMatchTypeOf<ExternalIdentityVerificationFailureReason>();
    }
  });
});
