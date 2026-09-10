export const DATABASE_CONFIGURATION_ERROR_CODES = [
  'DATABASE_URL_MISSING',
  'DATABASE_URL_INVALID',
  'DATABASE_URL_PROTOCOL_UNSUPPORTED'
] as const;

export type DatabaseConfigurationErrorCode = (typeof DATABASE_CONFIGURATION_ERROR_CODES)[number];

export interface DatabaseConfig {
  readonly url: string;
}

export interface DatabaseConfigSource {
  readonly DATABASE_URL?: string | undefined;
}

export class DatabaseConfigurationError extends Error {
  readonly code: DatabaseConfigurationErrorCode;

  constructor(code: DatabaseConfigurationErrorCode, message: string) {
    super(message);

    this.name = 'DatabaseConfigurationError';
    this.code = code;
  }
}

export function parseDatabaseConfig(source: DatabaseConfigSource): DatabaseConfig {
  const databaseUrl = source.DATABASE_URL;

  if (databaseUrl === undefined || databaseUrl.trim().length === 0) {
    throw new DatabaseConfigurationError('DATABASE_URL_MISSING', 'DATABASE_URL is required.');
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new DatabaseConfigurationError(
      'DATABASE_URL_INVALID',
      'DATABASE_URL must be a valid URL.'
    );
  }

  if (parsedUrl.protocol !== 'postgresql:' && parsedUrl.protocol !== 'postgres:') {
    throw new DatabaseConfigurationError(
      'DATABASE_URL_PROTOCOL_UNSUPPORTED',
      'DATABASE_URL must use the postgresql: or postgres: protocol.'
    );
  }

  return Object.freeze({
    url: databaseUrl
  });
}
