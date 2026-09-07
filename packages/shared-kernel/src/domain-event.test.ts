import { describe, expect, it } from 'vitest';

import { createDomainEvent } from './domain-event.js';

describe('DomainEvent', () => {
  it('creates an immutable domain event with metadata', () => {
    const event = createDomainEvent({
      eventId: 'evt_01',
      eventName: 'travel.created.v1',
      eventVersion: 1,
      occurredAt: '2026-09-08T00:00:00.000Z',
      aggregateType: 'travel',
      aggregateId: 'travel_01',
      metadata: {
        correlationId: 'corr_01',
        requestId: 'req_01',
        tenantId: 'travel_01',
        workspaceId: 'workspace_01',
        principalId: 'principal_01'
      },
      payload: {
        travelId: 'travel_01'
      }
    });

    expect(event).toEqual({
      eventId: 'evt_01',
      eventName: 'travel.created.v1',
      eventVersion: 1,
      occurredAt: '2026-09-08T00:00:00.000Z',
      aggregateType: 'travel',
      aggregateId: 'travel_01',
      metadata: {
        correlationId: 'corr_01',
        requestId: 'req_01',
        tenantId: 'travel_01',
        workspaceId: 'workspace_01',
        principalId: 'principal_01'
      },
      payload: {
        travelId: 'travel_01'
      }
    });

    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.metadata)).toBe(true);
  });

  it('supports causation metadata', () => {
    const event = createDomainEvent({
      eventId: 'evt_02',
      eventName: 'payment.succeeded.v1',
      eventVersion: 1,
      occurredAt: '2026-09-08T01:00:00.000Z',
      aggregateType: 'payment',
      aggregateId: 'payment_01',
      metadata: {
        correlationId: 'corr_02',
        causationId: 'cmd_01'
      },
      payload: {
        paymentId: 'payment_01'
      }
    });

    expect(event.metadata.causationId).toBe('cmd_01');
  });

  it('supports platform-level events without tenant metadata', () => {
    const event = createDomainEvent({
      eventId: 'evt_platform_01',
      eventName: 'platform.configuration.updated.v1',
      eventVersion: 1,
      occurredAt: '2026-09-08T02:00:00.000Z',
      aggregateType: 'platform_configuration',
      aggregateId: 'platform',
      metadata: {
        correlationId: 'corr_platform_01'
      },
      payload: {}
    });

    expect(event.metadata.tenantId).toBeUndefined();
  });

  it('rejects an invalid event version', () => {
    expect(() =>
      createDomainEvent({
        eventId: 'evt_03',
        eventName: 'travel.created.v1',
        eventVersion: 0,
        occurredAt: '2026-09-08T00:00:00.000Z',
        aggregateType: 'travel',
        aggregateId: 'travel_03',
        metadata: {
          correlationId: 'corr_03'
        },
        payload: {}
      })
    ).toThrow('eventVersion must be a positive integer.');
  });

  it('rejects an invalid occurrence timestamp', () => {
    expect(() =>
      createDomainEvent({
        eventId: 'evt_04',
        eventName: 'travel.created.v1',
        eventVersion: 1,
        occurredAt: 'not-a-date',
        aggregateType: 'travel',
        aggregateId: 'travel_04',
        metadata: {
          correlationId: 'corr_04'
        },
        payload: {}
      })
    ).toThrow('occurredAt must be a valid ISO date-time string.');
  });

  it('rejects empty required event metadata', () => {
    expect(() =>
      createDomainEvent({
        eventId: 'evt_05',
        eventName: 'travel.created.v1',
        eventVersion: 1,
        occurredAt: '2026-09-08T00:00:00.000Z',
        aggregateType: 'travel',
        aggregateId: 'travel_05',
        metadata: {
          correlationId: ''
        },
        payload: {}
      })
    ).toThrow('metadata.correlationId cannot be empty.');
  });

  it('rejects empty optional context when provided', () => {
    expect(() =>
      createDomainEvent({
        eventId: 'evt_06',
        eventName: 'travel.created.v1',
        eventVersion: 1,
        occurredAt: '2026-09-08T00:00:00.000Z',
        aggregateType: 'travel',
        aggregateId: 'travel_06',
        metadata: {
          correlationId: 'corr_06',
          tenantId: '   '
        },
        payload: {}
      })
    ).toThrow('metadata.tenantId cannot be empty.');
  });
});
