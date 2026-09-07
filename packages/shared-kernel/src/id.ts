declare const opaqueIdBrand: unique symbol;

export type OpaqueId<TName extends string> = string & {
  readonly [opaqueIdBrand]: TName;
};

export function asOpaqueId<TName extends string>(value: string): OpaqueId<TName> {
  const normalized = value.trim();

  if (normalized.length === 0) {
    throw new Error('Opaque ID cannot be empty.');
  }

  return normalized as OpaqueId<TName>;
}
