import { describe, expect, it } from 'vitest';

import {
  asCanonicalPrincipalId,
  type BranchId,
  type PrincipalId,
  type RequestId,
  type TenantId,
  type WorkspaceId
} from '@segaloka/auth';

import {
  DefaultRequestContextAssembler,
  type RequestContextAssemblyInput
} from './request-context-assembler.js';

function createInput(
  overrides: Partial<RequestContextAssemblyInput> = {}
): RequestContextAssemblyInput {
  return {
    requestId: 'request_01' as RequestId,
    locale: 'id',
    riskLevel: 'LOW',
    ...overrides
  };
}

describe('DefaultRequestContextAssembler', () => {
  it('assembles an anonymous request context without inventing a principal', () => {
    const assembler = new DefaultRequestContextAssembler();

    expect(assembler.assemble(createInput())).toEqual({
      requestId: 'request_01',
      locale: 'id',
      riskLevel: 'LOW'
    });
  });

  it('includes an already resolved canonical principal without re-authenticating it', () => {
    const principalId: PrincipalId = asCanonicalPrincipalId('550e8400-e29b-41d4-a716-446655440000');

    const assembler = new DefaultRequestContextAssembler();

    expect(
      assembler.assemble(
        createInput({
          principalId
        })
      )
    ).toEqual({
      requestId: 'request_01',
      principalId,
      locale: 'id',
      riskLevel: 'LOW'
    });
  });

  it('preserves request scope assertions without treating them as authoritative facts', () => {
    const tenantId = 'tenant_assertion_01' as TenantId;
    const workspaceId = 'workspace_assertion_01' as WorkspaceId;
    const branchId = 'branch_assertion_01' as BranchId;

    const assembler = new DefaultRequestContextAssembler();

    expect(
      assembler.assemble(
        createInput({
          tenantId,
          workspaceId,
          branchId
        })
      )
    ).toEqual({
      requestId: 'request_01',
      tenantId,
      workspaceId,
      branchId,
      locale: 'id',
      riskLevel: 'LOW'
    });
  });

  it('preserves locale and risk level supplied by the upstream request boundary', () => {
    const assembler = new DefaultRequestContextAssembler();

    expect(
      assembler.assemble(
        createInput({
          locale: 'ar',
          riskLevel: 'HIGH'
        })
      )
    ).toEqual({
      requestId: 'request_01',
      locale: 'ar',
      riskLevel: 'HIGH'
    });
  });

  it('does not add fields that were not supplied by the upstream boundary', () => {
    const assembler = new DefaultRequestContextAssembler();

    const context = assembler.assemble(createInput());

    expect(context).not.toHaveProperty('principalId');
    expect(context).not.toHaveProperty('tenantId');
    expect(context).not.toHaveProperty('workspaceId');
    expect(context).not.toHaveProperty('branchId');
  });
});
