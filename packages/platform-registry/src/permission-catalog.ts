import type { PermissionDefinition } from './authorization.js';
import { createPermissionRegistry } from './permission-registry.js';

export const PERMISSION_CATALOG: readonly PermissionDefinition[] = Object.freeze([]);

export const PERMISSION_REGISTRY = createPermissionRegistry(PERMISSION_CATALOG);
