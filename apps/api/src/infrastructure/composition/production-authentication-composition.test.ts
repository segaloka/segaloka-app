import type { DatabaseConnection } from '@segaloka/database';
import { describe, expect, it, vi } from 'vitest';

import { DefaultAuthenticationPrincipalResolver } from '../../application/authentication/authentication-principal-resolver.js';
import { DefaultRequestContextAssembler } from '../../application/authentication/request-context-assembler.js';

import {
  createProductionAuthenticationPrincipalResolver,
  createProductionRequestContextAssembler
} from './production-authentication-composition.js';

function createDatabaseConnectionStub(): DatabaseConnection {
  return {
    client: {} as DatabaseConnection['client'],
    db: {} as DatabaseConnection['db'],
    close: vi.fn(() => Promise.resolve())
  };
}

describe('production authentication composition', () => {
  it('creates the production authentication principal resolver from the injected database', () => {
    const database = createDatabaseConnectionStub();

    const resolver = createProductionAuthenticationPrincipalResolver({
      database
    });

    expect(resolver).toBeInstanceOf(DefaultAuthenticationPrincipalResolver);
  });

  it('does not take ownership of the injected database connection lifecycle', () => {
    const database = createDatabaseConnectionStub();

    createProductionAuthenticationPrincipalResolver({
      database
    });

    expect(database.close).not.toHaveBeenCalled();
  });

  it('creates the production request context assembler without infrastructure dependencies', () => {
    const assembler = createProductionRequestContextAssembler();

    expect(assembler).toBeInstanceOf(DefaultRequestContextAssembler);
  });

  it('creates independent stateless request context assembler instances', () => {
    const firstAssembler = createProductionRequestContextAssembler();
    const secondAssembler = createProductionRequestContextAssembler();

    expect(firstAssembler).toBeInstanceOf(DefaultRequestContextAssembler);
    expect(secondAssembler).toBeInstanceOf(DefaultRequestContextAssembler);
    expect(firstAssembler).not.toBe(secondAssembler);
  });
});
