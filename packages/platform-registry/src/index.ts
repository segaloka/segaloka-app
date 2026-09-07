export {
  AUTHORIZATION_SCOPES,
  PERMISSION_VISIBILITIES,
  definePermission,
  isAuthorizationScope,
  isPermissionVisibility
} from './authorization.js';

export {
  canAssignPermissionToTenant,
  createPermissionRegistry,
  getPermission,
  isScopeAllowedForPermission,
  requirePermission
} from './permission-registry.js';

export type {
  AuthorizationScope,
  PermissionDefinition,
  PermissionKey,
  PermissionVisibility
} from './authorization.js';

export type { PermissionRegistry } from './permission-registry.js';
