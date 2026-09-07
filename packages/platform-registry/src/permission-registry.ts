import type { AuthorizationScope, PermissionDefinition, PermissionKey } from './authorization.js';

export interface PermissionRegistry {
  readonly permissions: readonly PermissionDefinition[];
  readonly byKey: ReadonlyMap<PermissionKey, PermissionDefinition>;
}

export function createPermissionRegistry(
  definitions: readonly PermissionDefinition[]
): PermissionRegistry {
  const byKey = new Map<PermissionKey, PermissionDefinition>();

  for (const definition of definitions) {
    if (byKey.has(definition.key)) {
      throw new Error(`Duplicate permission key: ${definition.key}`);
    }

    byKey.set(definition.key, definition);
  }

  return Object.freeze({
    permissions: Object.freeze([...definitions]),
    byKey
  });
}

export function getPermission(
  registry: PermissionRegistry,
  key: PermissionKey
): PermissionDefinition | undefined {
  return registry.byKey.get(key);
}

export function requirePermission(
  registry: PermissionRegistry,
  key: PermissionKey
): PermissionDefinition {
  const permission = getPermission(registry, key);

  if (permission === undefined) {
    throw new Error(`Unknown permission key: ${key}`);
  }

  return permission;
}

export function canAssignPermissionToTenant(permission: PermissionDefinition): boolean {
  return permission.visibility === 'TENANT_ASSIGNABLE';
}

export function isScopeAllowedForPermission(
  permission: PermissionDefinition,
  scope: AuthorizationScope
): boolean {
  return permission.allowedScopes.includes(scope);
}
