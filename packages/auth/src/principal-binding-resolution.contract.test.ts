import { describe, expect, it } from 'vitest';

import type {
  PrincipalBindingResolutionPort,
  VerifiedExternalIdentity
} from './principal-binding-resolution.js';

describe('PrincipalBindingResolutionPort contract', () => {
  it('accepts a verified external identity and resolves a canonical principal when mapped', async () => {
    const port: PrincipalBindingResolutionPort = {
      resolvePrincipalId: (externalIdentity) => {
        expect(externalIdentity).toEqual({
          issuer: 'https://identity.example.test',
          subject: 'external-subject-01'
        });

        return Promise.resolve('11111111-1111-1111-1111-111111111111' as never);
      }
    };

    const externalIdentity: VerifiedExternalIdentity = {
      issuer: 'https://identity.example.test',
      subject: 'external-subject-01'
    };

    await expect(port.resolvePrincipalId(externalIdentity)).resolves.toBe(
      '11111111-1111-1111-1111-111111111111'
    );
  });

  it('returns undefined when the verified external identity has no active binding', async () => {
    const port: PrincipalBindingResolutionPort = {
      resolvePrincipalId: () => Promise.resolve(undefined)
    };

    const externalIdentity: VerifiedExternalIdentity = {
      issuer: 'https://identity.example.test',
      subject: 'unmapped-subject'
    };

    await expect(port.resolvePrincipalId(externalIdentity)).resolves.toBeUndefined();
  });
});
