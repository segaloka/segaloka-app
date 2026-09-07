export type Result<TValue, TError> =
  | {
      readonly ok: true;
      readonly value: TValue;
    }
  | {
      readonly ok: false;
      readonly error: TError;
    };

export function ok<TValue>(value: TValue): Result<TValue, never> {
  return {
    ok: true,
    value
  };
}

export function err<TError>(error: TError): Result<never, TError> {
  return {
    ok: false,
    error
  };
}

export function isOk<TValue, TError>(
  result: Result<TValue, TError>
): result is { readonly ok: true; readonly value: TValue } {
  return result.ok;
}

export function isErr<TValue, TError>(
  result: Result<TValue, TError>
): result is { readonly ok: false; readonly error: TError } {
  return !result.ok;
}
