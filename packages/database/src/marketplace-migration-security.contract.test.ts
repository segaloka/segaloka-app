import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migrationDirectory = new URL('../drizzle/', import.meta.url);

function marketplaceMigration(): string {
  const files = readdirSync(migrationDirectory)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const matching = files.filter((file) => {
    const source = readFileSync(new URL(file, migrationDirectory), 'utf8');
    return source.includes('marketplace_packages') && source.includes('marketplace_promotions');
  });

  expect(matching).toHaveLength(1);
  return readFileSync(new URL(matching[0]!, migrationDirectory), 'utf8');
}

describe('Marketplace migration security contract', () => {
  it('enables RLS on every public Marketplace table', () => {
    const sql = marketplaceMigration();
    for (const table of ['marketplace_travels', 'marketplace_packages', 'marketplace_promotions']) {
      expect(sql).toContain(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY`);
    }
  });

  it('grants public clients SELECT only', () => {
    const sql = marketplaceMigration();
    expect(sql).toContain('GRANT SELECT ON TABLE');
    expect(sql).toContain('TO anon, authenticated');
    expect(sql).not.toMatch(/GRANT\s+(INSERT|UPDATE|DELETE|ALL)/i);
  });

  it('adds all Marketplace tables to Supabase Realtime safely', () => {
    const sql = marketplaceMigration();
    expect(sql).toMatch(/where\s+pubname\s*=\s*'supabase_realtime'/i);
    expect(sql).toContain('marketplace_travels');
    expect(sql).toContain('marketplace_packages');
    expect(sql).toContain('marketplace_promotions');
  });
});
