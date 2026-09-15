import { getTableColumns, getTableName } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import * as schema from './schema.js';

function columns(table: Parameters<typeof getTableColumns>[0]): string[] {
  return Object.values(getTableColumns(table))
    .map((column) => column.name)
    .sort();
}

describe('Marketplace public data schema contract', () => {
  it('exports the three canonical public tables', () => {
    expect(getTableName(schema.marketplaceTravels)).toBe('marketplace_travels');
    expect(getTableName(schema.marketplacePackages)).toBe('marketplace_packages');
    expect(getTableName(schema.marketplacePromotions)).toBe('marketplace_promotions');
  });

  it('defines the canonical Travel projection columns', () => {
    expect(columns(schema.marketplaceTravels)).toEqual(
      [
        'created_at',
        'display_name',
        'id',
        'logo_url',
        'organization_id',
        'status',
        'updated_at',
        'verification_status',
        'verified_at'
      ].sort()
    );
  });

  it('defines the canonical package projection columns', () => {
    expect(columns(schema.marketplacePackages)).toEqual(
      [
        'average_rating',
        'category_code',
        'created_at',
        'currency_code',
        'destination_labels',
        'duration_days',
        'hero_image_url',
        'id',
        'is_active',
        'is_bookable',
        'publication_status',
        'published_at',
        'review_count',
        'starting_price_amount_minor',
        'titles',
        'travel_id',
        'updated_at'
      ].sort()
    );
  });

  it('defines the canonical promotion projection columns', () => {
    expect(columns(schema.marketplacePromotions)).toEqual(
      [
        'call_to_action_labels',
        'created_at',
        'descriptions',
        'ends_at',
        'id',
        'image_url',
        'is_active',
        'is_sponsored',
        'package_id',
        'placement',
        'sort_order',
        'starts_at',
        'target_uri',
        'titles',
        'updated_at'
      ].sort()
    );
  });
});
