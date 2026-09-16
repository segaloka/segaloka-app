import type { VerifiedExternalIdentity } from '@segaloka/auth';
import { createDatabaseConnection } from '@segaloka/database';
import { afterEach, describe, expect, it } from 'vitest';

import { createProductionAuthenticationPrincipalResolver } from './production-authentication-composition.js';

const DATABASE_URL = 'postgresql://segaloka:segaloka_local_dev_only@127.0.0.1:5433/segaloka';

const FIXTURE = {
  activePrincipalId: 'a4d15000-0000-0000-0000-000000000001',
  revokedBindingPrincipalId: 'a4d15000-0000-0000-0000-000000000002',
  suspendedPrincipalId: 'a4d15000-0000-0000-0000-000000000003',
  revokedPrincipalId: 'a4d15000-0000-0000-0000-000000000004',
  activeBindingId: 'a4d15000-0000-0000-0000-000000000011',
  revokedBindingId: 'a4d15000-0000-0000-0000-000000000012',
  suspendedPrincipalBindingId: 'a4d15000-0000-0000-0000-000000000013',
  revokedPrincipalBindingId: 'a4d15000-0000-0000-0000-000000000014'
} as const;

const EXTERNAL_IDENTITIES = {
  active: {
    issuer: 'https://identity.segaloka.test',
    subject: 'active-user'
  },
  revokedBinding: {
    issuer: 'https://identity.segaloka.test',
    subject: 'revoked-binding-user'
  },
  suspendedPrincipal: {
    issuer: 'https://identity.segaloka.test',
    subject: 'suspended-principal-user'
  },
  revokedPrincipal: {
    issuer: 'https://identity.segaloka.test',
    subject: 'revoked-principal-user'
  },
  unknown: {
    issuer: 'https://identity.segaloka.test',
    subject: 'unknown-user'
  }
} satisfies Record<string, VerifiedExternalIdentity>;

describe('production authentication composition with PostgreSQL', () => {
  const connections: ReturnType<typeof createDatabaseConnection>[] = [];

  afterEach(async () => {
    while (connections.length > 0) {
      const connection = connections.pop();

      if (connection !== undefined) {
        await connection.close();
      }
    }
  });

  it('resolves only active persisted principal bindings through the production composition', async () => {
    const connection = createDatabaseConnection({
      url: DATABASE_URL
    });

    connections.push(connection);

    try {
      await connection.client`
        insert into iam.principals (
          id,
          identity_id,
          status
        )
        values
          (
            ${FIXTURE.activePrincipalId}::uuid,
            null,
            'ACTIVE'
          ),
          (
            ${FIXTURE.revokedBindingPrincipalId}::uuid,
            null,
            'ACTIVE'
          ),
          (
            ${FIXTURE.suspendedPrincipalId}::uuid,
            null,
            'SUSPENDED'
          ),
          (
            ${FIXTURE.revokedPrincipalId}::uuid,
            null,
            'REVOKED'
          )
      `;

      await connection.client`
        insert into iam.principal_bindings (
          id,
          principal_id,
          issuer,
          subject,
          status
        )
        values
          (
            ${FIXTURE.activeBindingId}::uuid,
            ${FIXTURE.activePrincipalId}::uuid,
            ${EXTERNAL_IDENTITIES.active.issuer},
            ${EXTERNAL_IDENTITIES.active.subject},
            'ACTIVE'
          ),
          (
            ${FIXTURE.revokedBindingId}::uuid,
            ${FIXTURE.revokedBindingPrincipalId}::uuid,
            ${EXTERNAL_IDENTITIES.revokedBinding.issuer},
            ${EXTERNAL_IDENTITIES.revokedBinding.subject},
            'REVOKED'
          ),
          (
            ${FIXTURE.suspendedPrincipalBindingId}::uuid,
            ${FIXTURE.suspendedPrincipalId}::uuid,
            ${EXTERNAL_IDENTITIES.suspendedPrincipal.issuer},
            ${EXTERNAL_IDENTITIES.suspendedPrincipal.subject},
            'ACTIVE'
          ),
          (
            ${FIXTURE.revokedPrincipalBindingId}::uuid,
            ${FIXTURE.revokedPrincipalId}::uuid,
            ${EXTERNAL_IDENTITIES.revokedPrincipal.issuer},
            ${EXTERNAL_IDENTITIES.revokedPrincipal.subject},
            'ACTIVE'
          )
      `;

      const resolver = createProductionAuthenticationPrincipalResolver({
        database: connection
      });

      await expect(resolver.resolve(EXTERNAL_IDENTITIES.active)).resolves.toEqual({
        resolved: true,
        principalId: FIXTURE.activePrincipalId
      });

      await expect(resolver.resolve(EXTERNAL_IDENTITIES.unknown)).resolves.toEqual({
        resolved: false,
        reason: 'PRINCIPAL_BINDING_NOT_FOUND'
      });

      await expect(resolver.resolve(EXTERNAL_IDENTITIES.revokedBinding)).resolves.toEqual({
        resolved: false,
        reason: 'PRINCIPAL_BINDING_NOT_FOUND'
      });

      await expect(resolver.resolve(EXTERNAL_IDENTITIES.suspendedPrincipal)).resolves.toEqual({
        resolved: false,
        reason: 'PRINCIPAL_BINDING_NOT_FOUND'
      });

      await expect(resolver.resolve(EXTERNAL_IDENTITIES.revokedPrincipal)).resolves.toEqual({
        resolved: false,
        reason: 'PRINCIPAL_BINDING_NOT_FOUND'
      });

      const persistedBindings = await connection.client<
        {
          issuer: string;
          principal_id: string;
          status: string;
          subject: string;
        }[]
      >`
        select
          principal_id::text,
          issuer,
          subject,
          status
        from iam.principal_bindings
        where id in (
          ${FIXTURE.activeBindingId}::uuid,
          ${FIXTURE.revokedBindingId}::uuid,
          ${FIXTURE.suspendedPrincipalBindingId}::uuid,
          ${FIXTURE.revokedPrincipalBindingId}::uuid
        )
        order by id
      `;

      expect(persistedBindings).toHaveLength(4);
    } finally {
      await connection.client`
        delete from iam.principal_bindings
        where id in (
          ${FIXTURE.activeBindingId}::uuid,
          ${FIXTURE.revokedBindingId}::uuid,
          ${FIXTURE.suspendedPrincipalBindingId}::uuid,
          ${FIXTURE.revokedPrincipalBindingId}::uuid
        )
      `;

      await connection.client`
        delete from iam.principals
        where id in (
          ${FIXTURE.activePrincipalId}::uuid,
          ${FIXTURE.revokedBindingPrincipalId}::uuid,
          ${FIXTURE.suspendedPrincipalId}::uuid,
          ${FIXTURE.revokedPrincipalId}::uuid
        )
      `;
    }
  }, 30_000);
});
