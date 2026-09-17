import { definePermission, type PermissionDefinition } from './authorization.js';
import { createPermissionRegistry } from './permission-registry.js';

export const PERMISSION_CATALOG: readonly PermissionDefinition[] = Object.freeze([
  definePermission({
    key: 'package.publish',
    description:
      'Publish or withdraw marketplace packages belonging to the authorized Travel tenant.',
    visibility: 'TENANT_ASSIGNABLE',
    allowedScopes: ['TENANT']
  })
]);

export const PERMISSION_REGISTRY = createPermissionRegistry(PERMISSION_CATALOG);
