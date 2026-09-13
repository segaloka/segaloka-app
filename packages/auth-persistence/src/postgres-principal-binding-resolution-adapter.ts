import {
  asCanonicalPrincipalId,
  type PrincipalBindingResolutionPort,
  type PrincipalId,
  type VerifiedExternalIdentity
} from '@segaloka/auth';
import { databaseSchema, type DatabaseConnection } from '@segaloka/database';
import { and, eq } from 'drizzle-orm';

export class PostgresPrincipalBindingResolutionAdapter implements PrincipalBindingResolutionPort {
  public constructor(private readonly database: DatabaseConnection) {}

  public async resolvePrincipalId(
    externalIdentity: VerifiedExternalIdentity
  ): Promise<PrincipalId | undefined> {
    const rows = await this.database.db
      .select({
        principalId: databaseSchema.principalBindings.principalId
      })
      .from(databaseSchema.principalBindings)
      .innerJoin(
        databaseSchema.principals,
        eq(databaseSchema.principals.id, databaseSchema.principalBindings.principalId)
      )
      .where(
        and(
          eq(databaseSchema.principalBindings.issuer, externalIdentity.issuer),
          eq(databaseSchema.principalBindings.subject, externalIdentity.subject),
          eq(databaseSchema.principalBindings.status, 'ACTIVE'),
          eq(databaseSchema.principals.status, 'ACTIVE')
        )
      )
      .limit(1);

    const row = rows[0];

    const principalId = row?.principalId;

    if (principalId === undefined) {
      return undefined;
    }

    return asCanonicalPrincipalId(principalId);
  }
}
