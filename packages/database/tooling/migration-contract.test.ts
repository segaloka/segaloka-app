import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

interface DatabasePackageManifest {
  readonly scripts?: Readonly<Record<string, string>>;
}

const databasePackage = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as DatabasePackageManifest;

const drizzleConfig = readFileSync(new URL('../drizzle.config.ts', import.meta.url), 'utf8');

describe('database migration contract', () => {
  it('exposes only the approved migration command surface', () => {
    expect(databasePackage.scripts?.['db:generate']).toBe(
      'drizzle-kit generate --config=drizzle.config.ts'
    );

    expect(databasePackage.scripts?.['db:check']).toBe(
      'drizzle-kit check --config=drizzle.config.ts'
    );

    expect(databasePackage.scripts?.['db:migrate']).toBe(
      'drizzle-kit migrate --config=drizzle.config.ts'
    );
  });

  it('does not expose direct push, drop, or studio commands', () => {
    const scripts = Object.values(databasePackage.scripts ?? {}).join('\n');

    expect(scripts).not.toMatch(/\bdrizzle-kit\s+push\b/);
    expect(scripts).not.toMatch(/\bdrizzle-kit\s+drop\b/);
    expect(scripts).not.toMatch(/\bdrizzle-kit\s+studio\b/);
  });

  it('uses the authoritative PostgreSQL schema and migration paths', () => {
    expect(drizzleConfig).toContain("dialect: 'postgresql'");
    expect(drizzleConfig).toContain("schema: './src/schema.ts'");
    expect(drizzleConfig).toContain("out: './drizzle'");
  });

  it('loads database credentials through the canonical tooling bridge', () => {
    expect(drizzleConfig).toContain('loadDatabaseToolingConfig');
    expect(drizzleConfig).toContain('url: databaseConfig.url');

    expect(drizzleConfig).not.toMatch(/process\.env/);
    expect(drizzleConfig).not.toMatch(/import\.meta\.env/);
  });
});
