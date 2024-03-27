type ResultConstructor<TValue, TError> =
  | { [Result.Ok]: TValue }
  | { [Result.Err]: TError };

export class Result<TValue, TError = any> {
  private value?: TValue;
  private error?: TError;

  private constructor(constructorArgs: ResultConstructor<TValue, TError>) {
    if (Result.Ok in constructorArgs) {
      this.value = constructorArgs[Result.Ok];
    } else {
      this.error = constructorArgs[Result.Err];
    }
  }

  match<TOut>(matchArgs: {
    [Result.Ok]: (value: TValue) => TOut;
    [Result.Err]: (error: TError) => TOut;
  }): TOut {
    if (this.error !== undefined) {
      return matchArgs[Result.Err](this.error);
    } else {
      return matchArgs[Result.Ok](this.value as TValue);
    }
  }

  or<TNewValue>(defaultValue: TNewValue): TValue | TNewValue {
    if (this.value !== undefined) {
      return this.value;
    }

    return defaultValue;
  }

  map<TNewValue, TNewError>(
    mapper: (value: TValue) => TNewValue
  ): Result<TNewValue, TError | TNewError> {
    if (this.error !== undefined) {
      return Result.err<TError>(this.error as TError);
    }

    return Result.try(mapper, this.value as TValue);
  }

  unwrap(): TValue {
    if (this.value === undefined) {
      throw Error(
        "Attempted to unwrap an Err value Result. Error: " + this.error
      );
    }

    return this.value;
  }

  expect(message: string): TValue {
    if (this.value === undefined) {
      throw Error(message);
    }

    return this.value;
  }

  unwrapErr(): TError {
    if (this.error === undefined) {
      throw Error("Attempted to unwrap error for an Ok value Result.");
    }

    return this.error;
  }

  expectErr(message: string): TError {
    if (this.error === undefined) {
      throw Error(message);
    }

    return this.error;
  }

  isOk(): boolean {
    return this.error === undefined;
  }

  isErr(): boolean {
    return this.error !== undefined;
  }

  static try<TValue, TError = any, TArgs extends Array<any> = []>(
    fn: (...args: TArgs) => TValue,
    ...args: TArgs
  ): Result<TValue, TError> {
    try {
      return Result.ok(fn(...args));
    } catch (error) {
      return Result.err<TError>(error as TError);
    }
  }

  static async tryAsync<TValue, TError = any, TArgs extends Array<any> = []>(
    fn: (...args: TArgs) => Promise<TValue>,
    ...args: TArgs
  ): Promise<Result<TValue, TError>> {
    try {
      return Result.ok(await fn(...args));
    } catch (error) {
      return Result.err(error as TError);
    }
  }

  static ok<TValue = void>(value: TValue = undefined as any) {
    return new Result({ [Result.Ok]: value });
  }

  static err<TError = void>(error: TError = undefined as any) {
    return new Result<any, TError>({ [Result.Err]: error });
  }

  static readonly Ok: unique symbol = Symbol("Result::Ok");
  static readonly Err: unique symbol = Symbol("Result::Err");
}
