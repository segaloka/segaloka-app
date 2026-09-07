export interface DomainEventMetadata {
  readonly correlationId: string;
  readonly causationId?: string;
  readonly requestId?: string;
  readonly tenantId?: string;
  readonly workspaceId?: string;
  readonly principalId?: string;
}

export interface DomainEvent<TName extends string = string, TPayload = unknown> {
  readonly eventId: string;
  readonly eventName: TName;
  readonly eventVersion: number;
  readonly occurredAt: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly metadata: DomainEventMetadata;
  readonly payload: TPayload;
}

export interface CreateDomainEventInput<TName extends string, TPayload> {
  readonly eventId: string;
  readonly eventName: TName;
  readonly eventVersion: number;
  readonly occurredAt: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly metadata: DomainEventMetadata;
  readonly payload: TPayload;
}

export function createDomainEvent<TName extends string, TPayload>(
  input: CreateDomainEventInput<TName, TPayload>
): DomainEvent<TName, TPayload> {
  assertNonEmpty('eventId', input.eventId);
  assertNonEmpty('eventName', input.eventName);
  assertPositiveInteger('eventVersion', input.eventVersion);
  assertIsoDateTime('occurredAt', input.occurredAt);
  assertNonEmpty('aggregateType', input.aggregateType);
  assertNonEmpty('aggregateId', input.aggregateId);

  assertNonEmpty('metadata.correlationId', input.metadata.correlationId);

  assertOptionalNonEmpty('metadata.causationId', input.metadata.causationId);

  assertOptionalNonEmpty('metadata.requestId', input.metadata.requestId);

  assertOptionalNonEmpty('metadata.tenantId', input.metadata.tenantId);

  assertOptionalNonEmpty('metadata.workspaceId', input.metadata.workspaceId);

  assertOptionalNonEmpty('metadata.principalId', input.metadata.principalId);

  return Object.freeze({
    ...input,
    metadata: Object.freeze({
      ...input.metadata
    })
  });
}

function assertNonEmpty(field: string, value: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${field} cannot be empty.`);
  }
}

function assertOptionalNonEmpty(field: string, value: string | undefined): void {
  if (value !== undefined) {
    assertNonEmpty(field, value);
  }
}

function assertPositiveInteger(field: string, value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${field} must be a positive integer.`);
  }
}

function assertIsoDateTime(field: string, value: string): void {
  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`${field} must be a valid ISO date-time string.`);
  }
}
