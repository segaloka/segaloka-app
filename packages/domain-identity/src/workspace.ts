import type { OpaqueId } from '@segaloka/shared-kernel';

import type { OrganizationId } from './organization.js';

export type WorkspaceId = OpaqueId<'WorkspaceId'>;

export interface Workspace {
  readonly id: WorkspaceId;
  readonly organizationId: OrganizationId;
}
