import type { PrincipalId } from '@segaloka/auth';
import { databaseSchema, type DatabaseConnection } from '@segaloka/database';
import type { IdentityId } from '@segaloka/domain-identity';
import { asOpaqueId } from '@segaloka/shared-kernel';
import { and, eq } from 'drizzle-orm';

export class PostgresPrincipalIdentityResolutionAdapter {
  public constructor(private readonly database: DatabaseConnection) {}

  public async resolveIdentityId(principalId: PrincipalId): Promise<IdentityId | undefined> {
    const rows = await this.database.db
      .select({
        identityId: databaseSchema.principals.identityId
      })
      .from(databaseSchema.principals)
      .where(
        and(
          eq(databaseSchema.principals.id, principalId),
          eq(databaseSchema.principals.status, 'ACTIVE')
        )
      )
      .limit(1);

    const row = rows[0];

    const identityId = row?.identityId;

    if (identityId === undefined || identityId === null) {
      return undefined;
    }

    return asOpaqueId<'IdentityId'>(identityId);
  }
}
