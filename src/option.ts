type OptionConstructor<TValue> =
  | { [Option.Some]: TValue }
  | { [Option.None]: null };

export class Option<TValue> {
  private value: TValue | undefined;

  private constructor(constructorArgs: OptionConstructor<TValue>) {
    if (Option.None in constructorArgs) {
      this.value = undefined;
    } else {
      this.value = constructorArgs[Option.Some];
    }
  }

  match<TSomeOut, TNoneOut>(matchArgs: {
    [Option.Some]: (value: TValue) => TSomeOut;
    [Option.None]: () => TNoneOut;
  }): TSomeOut | TNoneOut {
    if (this.value === undefined) {
      return matchArgs[Option.None]();
    } else {
      return matchArgs[Option.Some](this.value);
    }
  }

  or<TDefault>(defaultValue: TDefault): TValue | TDefault {
    if (this.value === undefined) {
      return defaultValue;
    }

    return this.value;
  }

  map<TOut>(
    mapper: (value: TValue) => TOut
  ): Option<Exclude<TOut, null | undefined>> {
    if (this.value === undefined) {
      return Option.none();
    }

    return Option.from(mapper(this.value));
  }

  unwrap(): TValue {
    if (this.value === undefined) {
      throw Error("Attempted to unwrap a None value Option.");
    }

    return this.value;
  }

  expect(message: string): TValue {
    if (this.value === undefined) {
      throw Error(message);
    }

    return this.value;
  }

  unwrapNone(): undefined {
    if (this.value !== undefined) {
      throw Error("Attempted to unwrap a Some value Option.");
    }

    return undefined;
  }

  expectNone(message: string): undefined {
    if (this.value !== undefined) {
      throw Error(message);
    }

    return undefined;
  }

  isSome(): boolean {
    return this.value !== undefined;
  }

  isNone(): boolean {
    return this.value === undefined;
  }

  static from<TValue>(
    value: TValue
  ): Option<Exclude<TValue, null | undefined>> {
    if (value === undefined) {
      return Option.none();
    }

    if (value === null) {
      return Option.none();
    }

    return Option.some(value as Exclude<TValue, null | undefined>);
  }

  static async fromAsync<TValue>(
    value: Promise<TValue>
  ): Promise<Option<Exclude<TValue, null | undefined>>> {
    const unwrappedValue = await value;

    return Option.from(unwrappedValue);
  }

  static some<TValue>(value: TValue) {
    if (value === undefined) {
      throw Error("Cannot create a Some Option with an undefined value.");
    }

    if (value === null) {
      throw Error("Cannot create a Some Option with a null value.");
    }

    return new Option({ [Option.Some]: value });
  }

  static none<TValue = any>() {
    return new Option<TValue>({ [Option.None]: null });
  }

  static readonly Some: unique symbol = Symbol("Option::Some");
  static readonly None: unique symbol = Symbol("Option::None");
}
