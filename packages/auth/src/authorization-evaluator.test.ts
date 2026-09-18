import { describe, expect, it } from 'vitest';

import { createPermissionRegistry, definePermission } from '@segaloka/platform-registry';

import { asOpaqueId } from '@segaloka/shared-kernel';

import { evaluateAuthorization } from './authorization-evaluator.js';

import type { AuthorizationEvaluationInput } from './authorization-evaluation.js';

const registry = createPermissionRegistry([
  definePermission({
    key: 'booking.read',
    description: 'Read bookings',
    visibility: 'TENANT_ASSIGNABLE',
    allowedScopes: ['TENANT', 'BRANCH', 'OWN', 'ASSIGNED']
  }),
  definePermission({
    key: 'partner.read',
    description: 'Read relationship resources',
    visibility: 'TENANT_ASSIGNABLE',
    allowedScopes: ['RELATIONSHIP']
  })
]);

function createInput(): AuthorizationEvaluationInput {
  return {
    context: {
      requestId: asOpaqueId<'RequestId'>('request_01'),
      principalId: asOpaqueId<'PrincipalId'>('principal_01'),
      tenantId: asOpaqueId<'TenantId'>('tenant_01'),
      locale: 'id',
      riskLevel: 'LOW'
    },
    permissionKey: 'booking.read',
    subjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_01'),
    tenantId: asOpaqueId<'TenantId'>('tenant_01'),
    identityState: 'ACTIVE',
    membershipState: 'ACTIVE',
    organizationState: 'ACTIVE',
    roleAssignmentState: 'ACTIVE',
    roleGrants: [
      {
        roleId: 'role_01',
        permissions: [
          {
            permissionKey: 'booking.read',
            scope: 'TENANT'
          }
        ]
      }
    ],
    branchAccess: [],
    resource: {
      tenantId: asOpaqueId<'TenantId'>('tenant_01')
    },
    entitlementState: 'NOT_REQUIRED',
    capabilityState: 'NOT_REQUIRED',
    relationshipState: 'NOT_REQUIRED',
    resourcePolicyState: 'NOT_REQUIRED',
    riskPolicyState: 'NOT_REQUIRED'
  };
}

describe('evaluateAuthorization', () => {
  it('allows a satisfied tenant-scoped permission', () => {
    const decision = evaluateAuthorization(createInput(), registry);

    expect(decision).toEqual({
      allowed: true,
      permissionKey: 'booking.read',
      satisfiedScope: 'TENANT'
    });
  });

  it('denies a valid anonymous request as unauthenticated', () => {
    const input: AuthorizationEvaluationInput = {
      context: {
        requestId: asOpaqueId<'RequestId'>('request_02'),
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        locale: 'id',
        riskLevel: 'LOW'
      },
      permissionKey: 'booking.read',
      tenantId: asOpaqueId<'TenantId'>('tenant_01'),
      identityState: 'MISSING',
      membershipState: 'MISSING',
      organizationState: 'ACTIVE',
      roleAssignmentState: 'NONE',
      roleGrants: [],
      branchAccess: [],
      entitlementState: 'NOT_REQUIRED',
      capabilityState: 'NOT_REQUIRED',
      relationshipState: 'NOT_REQUIRED',
      resourcePolicyState: 'NOT_REQUIRED',
      riskPolicyState: 'NOT_REQUIRED'
    };

    expect(evaluateAuthorization(input, registry)).toEqual({
      allowed: false,
      permissionKey: 'booking.read',
      reason: 'UNAUTHENTICATED'
    });
  });

  it('denies an unknown permission', () => {
    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      permissionKey: 'booking.delete'
    };

    expect(evaluateAuthorization(input, registry)).toEqual({
      allowed: false,
      permissionKey: 'booking.delete',
      reason: 'UNKNOWN_PERMISSION'
    });
  });

  it('requires a resolved identity for an authenticated principal', () => {
    const { subjectId: existingSubjectId, ...inputWithoutSubject } = createInput();

    expect(existingSubjectId).toBeDefined();

    const input: AuthorizationEvaluationInput = {
      ...inputWithoutSubject,
      identityState: 'MISSING',
      membershipState: 'MISSING',
      roleAssignmentState: 'NONE',
      roleGrants: [],
      branchAccess: []
    };

    expect(evaluateAuthorization(input, registry)).toMatchObject({
      allowed: false,
      reason: 'IDENTITY_REQUIRED'
    });
  });

  it('denies an inactive identity before membership authorization', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          identityState: 'INACTIVE'
        },
        registry
      )
    ).toMatchObject({
      allowed: false,
      reason: 'IDENTITY_INACTIVE'
    });
  });

  it('distinguishes missing membership', () => {
    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      membershipState: 'MISSING',
      roleAssignmentState: 'NONE',
      roleGrants: []
    };

    expect(evaluateAuthorization(input, registry)).toMatchObject({
      allowed: false,
      reason: 'MEMBERSHIP_REQUIRED'
    });
  });

  it('distinguishes inactive membership', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          membershipState: 'INACTIVE'
        },
        registry
      )
    ).toMatchObject({
      allowed: false,
      reason: 'MEMBERSHIP_INACTIVE'
    });
  });

  it('denies an inactive organization', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          organizationState: 'INACTIVE'
        },
        registry
      )
    ).toMatchObject({
      allowed: false,
      reason: 'ORGANIZATION_INACTIVE'
    });
  });

  it('denies tenant mismatch', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          resource: {
            tenantId: asOpaqueId<'TenantId'>('tenant_02')
          }
        },
        registry
      )
    ).toMatchObject({
      allowed: false,
      reason: 'TENANT_MISMATCH'
    });
  });

  it('distinguishes no active role assignment', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          roleAssignmentState: 'NONE',
          roleGrants: []
        },
        registry
      )
    ).toMatchObject({
      allowed: false,
      reason: 'NO_ACTIVE_ROLE_ASSIGNMENT'
    });
  });

  it('distinguishes a missing permission grant', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          roleGrants: [
            {
              roleId: 'role_01',
              permissions: []
            }
          ]
        },
        registry
      )
    ).toMatchObject({
      allowed: false,
      reason: 'PERMISSION_NOT_GRANTED'
    });
  });

  it('requires branch access for a branch-scoped grant', () => {
    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      context: {
        ...createInput().context,
        branchId: asOpaqueId<'BranchId'>('branch_01')
      },
      roleGrants: [
        {
          roleId: 'role_branch',
          permissions: [
            {
              permissionKey: 'booking.read',
              scope: 'BRANCH'
            }
          ]
        }
      ],
      resource: {
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        branchId: asOpaqueId<'BranchId'>('branch_01')
      },
      branchAccess: []
    };

    expect(evaluateAuthorization(input, registry)).toMatchObject({
      allowed: false,
      reason: 'BRANCH_ACCESS_REQUIRED'
    });
  });

  it('allows a branch-scoped grant with matching access', () => {
    const branchId = asOpaqueId<'BranchId'>('branch_01');

    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      roleGrants: [
        {
          roleId: 'role_branch',
          permissions: [
            {
              permissionKey: 'booking.read',
              scope: 'BRANCH'
            }
          ]
        }
      ],
      resource: {
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        branchId
      },
      branchAccess: [
        {
          branchId
        }
      ]
    };

    expect(evaluateAuthorization(input, registry)).toMatchObject({
      allowed: true,
      satisfiedScope: 'BRANCH'
    });
  });

  it('evaluates ownership scope', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          roleGrants: [
            {
              roleId: 'role_owner',
              permissions: [
                {
                  permissionKey: 'booking.read',
                  scope: 'OWN'
                }
              ]
            }
          ],
          resource: {
            tenantId: asOpaqueId<'TenantId'>('tenant_01'),
            ownerSubjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_01')
          }
        },
        registry
      )
    ).toMatchObject({
      allowed: true,
      satisfiedScope: 'OWN'
    });
  });

  it('evaluates assignment scope', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          roleGrants: [
            {
              roleId: 'role_assigned',
              permissions: [
                {
                  permissionKey: 'booking.read',
                  scope: 'ASSIGNED'
                }
              ]
            }
          ],
          resource: {
            tenantId: asOpaqueId<'TenantId'>('tenant_01'),
            assignedSubjectIds: [asOpaqueId<'AuthorizationSubjectId'>('subject_01')]
          }
        },
        registry
      )
    ).toMatchObject({
      allowed: true,
      satisfiedScope: 'ASSIGNED'
    });
  });

  it('evaluates relationship scope', () => {
    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      permissionKey: 'partner.read',
      roleGrants: [
        {
          roleId: 'role_partner',
          permissions: [
            {
              permissionKey: 'partner.read',
              scope: 'RELATIONSHIP'
            }
          ]
        }
      ],
      relationshipState: 'SATISFIED',
      resourcePolicyState: 'NOT_REQUIRED',
    };

    expect(evaluateAuthorization(input, registry)).toMatchObject({
      allowed: true,
      satisfiedScope: 'RELATIONSHIP'
    });
  });

  it('denies an unsatisfied entitlement', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          entitlementState: 'UNSATISFIED'
        },
        registry
      )
    ).toMatchObject({
      allowed: false,
      reason: 'ENTITLEMENT_REQUIRED'
    });
  });

  it('denies an unsatisfied capability', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          capabilityState: 'UNSATISFIED'
        },
        registry
      )
    ).toMatchObject({
      allowed: false,
      reason: 'CAPABILITY_RESTRICTED'
    });
  });

  it('denies an unsatisfied resource policy', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          resourcePolicyState: 'UNSATISFIED'
        },
        registry
      )
    ).toMatchObject({
      allowed: false,
      reason: 'RESOURCE_POLICY_DENIED'
    });
  });
  it('denies an unsatisfied risk policy', () => {
    expect(
      evaluateAuthorization(
        {
          ...createInput(),
          riskPolicyState: 'UNSATISFIED'
        },
        registry
      )
    ).toMatchObject({
      allowed: false,
      reason: 'RISK_POLICY_DENIED'
    });
  });

  it('returns ownership-specific denial when OWN scope is not satisfied', () => {
    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      roleGrants: [
        {
          roleId: 'role_owner',
          permissions: [
            {
              permissionKey: 'booking.read',
              scope: 'OWN'
            }
          ]
        }
      ],
      resource: {
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        ownerSubjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_other')
      }
    };

    expect(evaluateAuthorization(input, registry)).toMatchObject({
      allowed: false,
      reason: 'RESOURCE_OWNERSHIP_REQUIRED'
    });
  });

  it('returns assignment-specific denial when ASSIGNED scope is not satisfied', () => {
    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      roleGrants: [
        {
          roleId: 'role_assigned',
          permissions: [
            {
              permissionKey: 'booking.read',
              scope: 'ASSIGNED'
            }
          ]
        }
      ],
      resource: {
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        assignedSubjectIds: [asOpaqueId<'AuthorizationSubjectId'>('subject_other')]
      }
    };

    expect(evaluateAuthorization(input, registry)).toMatchObject({
      allowed: false,
      reason: 'RESOURCE_ASSIGNMENT_REQUIRED'
    });
  });

  it('returns relationship-specific denial when RELATIONSHIP scope is not satisfied', () => {
    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      permissionKey: 'partner.read',
      roleGrants: [
        {
          roleId: 'role_partner',
          permissions: [
            {
              permissionKey: 'partner.read',
              scope: 'RELATIONSHIP'
            }
          ]
        }
      ],
      relationshipState: 'UNSATISFIED',
      resourcePolicyState: 'NOT_REQUIRED',
    };

    expect(evaluateAuthorization(input, registry)).toMatchObject({
      allowed: false,
      reason: 'RELATIONSHIP_REQUIRED'
    });
  });

  it('rejects a grant scope that is not allowed by the permission registry', () => {
    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      permissionKey: 'partner.read',
      roleGrants: [
        {
          roleId: 'role_invalid',
          permissions: [
            {
              permissionKey: 'partner.read',
              scope: 'TENANT'
            }
          ]
        }
      ]
    };

    expect(evaluateAuthorization(input, registry)).toMatchObject({
      allowed: false,
      reason: 'SCOPE_NOT_SATISFIED'
    });
  });

  it('selects the same most-contextual satisfied scope regardless of role grant order', () => {
    const ownGrant = {
      roleId: 'role_owner',
      permissions: [
        {
          permissionKey: 'booking.read' as const,
          scope: 'OWN' as const
        }
      ]
    };

    const tenantGrant = {
      roleId: 'role_tenant',
      permissions: [
        {
          permissionKey: 'booking.read' as const,
          scope: 'TENANT' as const
        }
      ]
    };

    const baseInput: AuthorizationEvaluationInput = {
      ...createInput(),
      resource: {
        tenantId: asOpaqueId<'TenantId'>('tenant_01'),
        ownerSubjectId: asOpaqueId<'AuthorizationSubjectId'>('subject_01')
      }
    };

    const firstDecision = evaluateAuthorization(
      {
        ...baseInput,
        roleGrants: [tenantGrant, ownGrant]
      },
      registry
    );

    const secondDecision = evaluateAuthorization(
      {
        ...baseInput,
        roleGrants: [ownGrant, tenantGrant]
      },
      registry
    );

    expect(firstDecision).toEqual({
      allowed: true,
      permissionKey: 'booking.read',
      satisfiedScope: 'OWN'
    });

    expect(secondDecision).toEqual(firstDecision);
  });

  it('ignores registry-disallowed grants when a valid grant can authorize the request', () => {
    const input: AuthorizationEvaluationInput = {
      ...createInput(),
      roleGrants: [
        {
          roleId: 'role_invalid_global',
          permissions: [
            {
              permissionKey: 'booking.read',
              scope: 'GLOBAL'
            }
          ]
        },
        {
          roleId: 'role_valid_tenant',
          permissions: [
            {
              permissionKey: 'booking.read',
              scope: 'TENANT'
            }
          ]
        }
      ]
    };

    expect(evaluateAuthorization(input, registry)).toEqual({
      allowed: true,
      permissionKey: 'booking.read',
      satisfiedScope: 'TENANT'
    });
  });
});
