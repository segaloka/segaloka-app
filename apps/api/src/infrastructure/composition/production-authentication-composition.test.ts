import type { DatabaseConnection } from '@segaloka/database';
import { describe, expect, it, vi } from 'vitest';

import { DefaultAuthenticatedRequestContextPipeline } from '../../application/authentication/authenticated-request-context-pipeline.js';
import { DefaultAuthenticationPrincipalResolver } from '../../application/authentication/authentication-principal-resolver.js';
import { DefaultRequestContextAssembler } from '../../application/authentication/request-context-assembler.js';

import {
  createProductionAuthenticatedRequestContextPipeline,
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

  it('creates the production authenticated request context pipeline', () => {
    const database = createDatabaseConnectionStub();

    const pipeline = createProductionAuthenticatedRequestContextPipeline({
      database
    });

    expect(pipeline).toBeInstanceOf(DefaultAuthenticatedRequestContextPipeline);
  });

  it('does not take ownership of the database lifecycle when composing the authenticated request context pipeline', () => {
    const database = createDatabaseConnectionStub();

    createProductionAuthenticatedRequestContextPipeline({
      database
    });

    expect(database.close).not.toHaveBeenCalled();
  });

  it('creates independent authenticated request context pipeline instances', () => {
    const database = createDatabaseConnectionStub();

    const firstPipeline = createProductionAuthenticatedRequestContextPipeline({
      database
    });

    const secondPipeline = createProductionAuthenticatedRequestContextPipeline({
      database
    });

    expect(firstPipeline).toBeInstanceOf(DefaultAuthenticatedRequestContextPipeline);
    expect(secondPipeline).toBeInstanceOf(DefaultAuthenticatedRequestContextPipeline);
    expect(firstPipeline).not.toBe(secondPipeline);
  });
});
