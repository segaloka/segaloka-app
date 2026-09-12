import { asOpaqueId } from '@segaloka/shared-kernel';

import type { PrincipalId } from './request-context.js';

const CANONICAL_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function asCanonicalPrincipalId(value: string): PrincipalId {
  const normalized = value.trim();

  if (!CANONICAL_UUID_PATTERN.test(normalized)) {
    throw new Error('Canonical PrincipalId must be a valid UUID.');
  }

  return asOpaqueId<'PrincipalId'>(normalized);
}
