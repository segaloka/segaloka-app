import {
  asCanonicalPrincipalId,
  type AuthorizationRequest,
  type RequestId,
  type TenantId,
  type WorkspaceId
} from '@segaloka/auth';
import { createDatabaseConnection } from '@segaloka/database';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  AuthorizationPolicyFactResolutionRequest,
  AuthorizationPolicyFactResolver,
  AuthorizationPolicyFacts
} from '../../application/authorization/authorization-policy-fact-resolver.js';

import { createProductionAuthorizationOrchestrator } from './production-authorization-composition.js';

const DATABASE_URL = 'postgresql://segaloka:segaloka_local_dev_only@127.0.0.1:5433/segaloka';

const FIXTURE = {
  principalId: 'a3d14000-0000-0000-0000-000000000001',
  identityId: 'a3d14000-0000-0000-0000-000000000002',
  organizationId: 'a3d14000-0000-0000-0000-000000000003',
  workspaceId: 'a3d14000-0000-0000-0000-000000000004',
  membershipId: 'a3d14000-0000-0000-0000-000000000005',
  roleId: 'a3d14000-0000-0000-0000-000000000006',
  roleAssignmentId: 'a3d14000-0000-0000-0000-000000000007',
  requestId: 'a3d14000-0000-0000-0000-000000000008'
} as const;

function createPolicyFactResolver(): {
  readonly resolver: AuthorizationPolicyFactResolver;
  readonly resolve: ReturnType<
    typeof vi.fn<
      (request: AuthorizationPolicyFactResolutionRequest) => Promise<AuthorizationPolicyFacts>
    >
  >;
} {
  const facts: AuthorizationPolicyFacts = {
    entitlementState: 'SATISFIED',
    capabilityState: 'SATISFIED',
    relationshipState: 'NOT_REQUIRED',
    riskPolicyState: 'SATISFIED'
  };

  const resolve = vi.fn((): Promise<AuthorizationPolicyFacts> => Promise.resolve(facts));

  return {
    resolver: {
      resolve
    },
    resolve
  };
}

describe('production authorization composition with PostgreSQL', () => {
  const connections: ReturnType<typeof createDatabaseConnection>[] = [];

  afterEach(async () => {
    while (connections.length > 0) {
      const connection = connections.pop();

      if (connection !== undefined) {
        await connection.close();
      }
    }
  });

  it('resolves persisted principal and identity authorization facts through the production composition', async () => {
    const connection = createDatabaseConnection({
      url: DATABASE_URL
    });

    connections.push(connection);

    const policy = createPolicyFactResolver();

    try {
      await connection.client`
        insert into identity.identities (
          id,
          status
        )
        values (
          ${FIXTURE.identityId}::uuid,
          'ACTIVE'
        )
      `;

      await connection.client`
        insert into identity.organizations (
          id,
          type,
          status
        )
        values (
          ${FIXTURE.organizationId}::uuid,
          'TRAVEL',
          'ACTIVE'
        )
      `;

      await connection.client`
        insert into identity.workspaces (
          id,
          organization_id
        )
        values (
          ${FIXTURE.workspaceId}::uuid,
          ${FIXTURE.organizationId}::uuid
        )
      `;

      await connection.client`
        insert into identity.memberships (
          id,
          identity_id,
          organization_id,
          status
        )
        values (
          ${FIXTURE.membershipId}::uuid,
          ${FIXTURE.identityId}::uuid,
          ${FIXTURE.organizationId}::uuid,
          'ACTIVE'
        )
      `;

      await connection.client`
        insert into identity.roles (
          id,
          organization_id,
          name,
          kind,
          status
        )
        values (
          ${FIXTURE.roleId}::uuid,
          ${FIXTURE.organizationId}::uuid,
          'A3 Production Composition Role',
          'CUSTOM',
          'ACTIVE'
        )
      `;

      await connection.client`
        insert into identity.role_permissions (
          role_id,
          organization_id,
          permission_key,
          scope
        )
        values (
          ${FIXTURE.roleId}::uuid,
          ${FIXTURE.organizationId}::uuid,
          'booking.read',
          'TENANT'
        )
      `;

      await connection.client`
        insert into identity.role_assignments (
          id,
          organization_id,
          membership_id,
          role_id,
          status
        )
        values (
          ${FIXTURE.roleAssignmentId}::uuid,
          ${FIXTURE.organizationId}::uuid,
          ${FIXTURE.membershipId}::uuid,
          ${FIXTURE.roleId}::uuid,
          'ACTIVE'
        )
      `;

      await connection.client`
        insert into iam.principals (
          id,
          identity_id,
          status
        )
        values (
          ${FIXTURE.principalId}::uuid,
          ${FIXTURE.identityId}::uuid,
          'ACTIVE'
        )
      `;

      const orchestrator = createProductionAuthorizationOrchestrator({
        database: connection,
        policyFactResolver: policy.resolver
      });

      const request: AuthorizationRequest = {
        context: {
          requestId: FIXTURE.requestId as RequestId,
          principalId: asCanonicalPrincipalId(FIXTURE.principalId),
          tenantId: FIXTURE.organizationId as TenantId,
          workspaceId: FIXTURE.workspaceId as WorkspaceId,
          locale: 'id',
          riskLevel: 'LOW'
        },
        permissionKey: 'booking.read',
        resource: {
          tenantId: FIXTURE.organizationId as TenantId
        }
      };

      await expect(orchestrator.authorize(request)).resolves.toEqual({
        completed: true,
        decision: {
          allowed: false,
          permissionKey: 'booking.read',
          reason: 'UNKNOWN_PERMISSION'
        }
      });

      expect(policy.resolve).toHaveBeenCalledTimes(1);
      expect(policy.resolve).toHaveBeenCalledWith({
        authorizationRequest: request,
        subjectId: FIXTURE.identityId,
        tenantId: request.context.tenantId
      });

      const persistedPrincipal = await connection.client<
        {
          identity_id: string | null;
          status: string;
        }[]
      >`
        select
          identity_id::text,
          status
        from iam.principals
        where id = ${FIXTURE.principalId}::uuid
      `;

      expect(persistedPrincipal).toEqual([
        {
          identity_id: FIXTURE.identityId,
          status: 'ACTIVE'
        }
      ]);
    } finally {
      await connection.client`
        delete from iam.principals
        where id = ${FIXTURE.principalId}::uuid
      `;

      await connection.client`
        delete from identity.role_assignments
        where id = ${FIXTURE.roleAssignmentId}::uuid
      `;

      await connection.client`
        delete from identity.role_permissions
        where
          role_id = ${FIXTURE.roleId}::uuid
          and organization_id = ${FIXTURE.organizationId}::uuid
          and permission_key = 'booking.read'
      `;

      await connection.client`
        delete from identity.roles
        where id = ${FIXTURE.roleId}::uuid
      `;

      await connection.client`
        delete from identity.memberships
        where id = ${FIXTURE.membershipId}::uuid
      `;

      await connection.client`
        delete from identity.workspaces
        where id = ${FIXTURE.workspaceId}::uuid
      `;

      await connection.client`
        delete from identity.organizations
        where id = ${FIXTURE.organizationId}::uuid
      `;

      await connection.client`
        delete from identity.identities
        where id = ${FIXTURE.identityId}::uuid
      `;
    }
  }, 30_000);
});
