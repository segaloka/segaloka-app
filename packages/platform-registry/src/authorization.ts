export const AUTHORIZATION_SCOPES = [
  'GLOBAL',
  'TENANT',
  'BRANCH',
  'OWN',
  'ASSIGNED',
  'RELATIONSHIP',
  'PUBLIC'
] as const;

export type AuthorizationScope = (typeof AUTHORIZATION_SCOPES)[number];

export const PERMISSION_VISIBILITIES = ['PLATFORM_ONLY', 'TENANT_ASSIGNABLE'] as const;

export type PermissionVisibility = (typeof PERMISSION_VISIBILITIES)[number];

export type PermissionKey = `${string}.${string}`;

export interface PermissionDefinition {
  readonly key: PermissionKey;
  readonly description: string;
  readonly visibility: PermissionVisibility;
  readonly allowedScopes: readonly AuthorizationScope[];
}

export function isAuthorizationScope(value: string): value is AuthorizationScope {
  return AUTHORIZATION_SCOPES.includes(value as AuthorizationScope);
}

export function isPermissionVisibility(value: string): value is PermissionVisibility {
  return PERMISSION_VISIBILITIES.includes(value as PermissionVisibility);
}

export function definePermission(definition: PermissionDefinition): PermissionDefinition {
  if (!isValidPermissionKey(definition.key)) {
    throw new Error(`Invalid permission key: ${definition.key}`);
  }

  if (definition.description.trim().length === 0) {
    throw new Error('Permission description cannot be empty.');
  }

  if (definition.allowedScopes.length === 0) {
    throw new Error('Permission must allow at least one authorization scope.');
  }

  if (new Set(definition.allowedScopes).size !== definition.allowedScopes.length) {
    throw new Error('Permission authorization scopes must be unique.');
  }

  return Object.freeze({
    ...definition,
    allowedScopes: Object.freeze([...definition.allowedScopes])
  });
}

function isValidPermissionKey(value: string): boolean {
  return /^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/.test(value);
}
