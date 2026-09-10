export {
  DATABASE_CONFIGURATION_ERROR_CODES,
  DatabaseConfigurationError,
  parseDatabaseConfig
} from './database-config.js';

export type {
  DatabaseConfig,
  DatabaseConfigurationErrorCode,
  DatabaseConfigSource
} from './database-config.js';

export const SEGALOKA_CONFIG_PACKAGE = '@segaloka/config' as const;
