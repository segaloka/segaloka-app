import type { DatabaseConnection } from '@segaloka/database';

export interface PackagePublicationOwnership {
  readonly packageId: string;
  readonly travelId: string;
  readonly organizationId: string;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Server-side ownership lookup, not an authorization decision.
 * Call only after authentication. The organization ID must belong
 * to the selected tenant validated by the authorization workflow.
 * Missing and other-tenant packages both return null.
 */
export class PostgresPackagePublicationReadAdapter {
  public constructor(private readonly database: DatabaseConnection) {}

  public async findOwnedPackage(
    packageId: string,
    organizationId: string
  ): Promise<PackagePublicationOwnership | null> {
    if (!UUID_PATTERN.test(packageId) || !UUID_PATTERN.test(organizationId)) {
      return null;
    }

    const rows = await this.database.client<PackagePublicationOwnership[]>`
      select
        p.id as "packageId",
        p.travel_id as "travelId",
        t.organization_id as "organizationId"
      from public.marketplace_packages p
      inner join public.marketplace_travels t
        on t.id = p.travel_id
      where p.id = ${packageId}::uuid
        and t.organization_id = ${organizationId}::uuid
      limit 1
    `;

    return rows[0] ?? null;
  }
}
