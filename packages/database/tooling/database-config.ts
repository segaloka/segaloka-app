import {
  parseDatabaseConfig,
  type DatabaseConfig,
  type DatabaseConfigSource
} from '@segaloka/config';

export function loadDatabaseToolingConfig(
  source: DatabaseConfigSource = process.env
): DatabaseConfig {
  return parseDatabaseConfig(source);
}
