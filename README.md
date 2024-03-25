# junctional

Simple Option and Result types for typescript.

## Motivation

This package was a fun experiment to explore convenient Result and Option types in typescript.

_Yep, another one of those!_

### What are Result and Option types?

- A result type is a enum type that respresents either a value or an error;
- An option type is a enum type that represents either some value or nothing.

## Installation

```sh
npm i junctional
```

## Usage

- [Result](#result)
  - [Result.ok](#resultok)
  - [Result.err](#resulterr)
  - [Result.try](#resulttry)
  - [Result.tryAsync](#resulttryasync)
  - [Result.Ok](#resultok-1)
  - [Result.Err](#resulterr-1)
  - [Result.match](#resultmatch)
  - [Result.or](#resultor)
  - [Result.map](#resultmap)
  - [Result.unwrap](#resultunwrap)
  - [Result.expect](#resultexpect)
  - [Result.unwrapErr](#resultunwraperr)
  - [Result.expectErr](#resultexpecterr)
  - [Result.isOk](#resultisok)
  - [Result.isErr](#resultiserr)
- [Option](#option)
  - [Option.some](#optionsome)
  - [Option.none](#optionnone)
  - [Option.from](#optionfrom)
  - [Option.fromAsync](#optionfromasync)
  - [Option.Some](#optionsome-1)
  - [Option.None](#optionnone-1)
  - [Option.match](#optionmatch)
  - [Option.or](#optionor)
  - [Option.map](#optionmap)
  - [Option.unwrap](#optionunwrap)
  - [Option.expect](#optionexpect)
  - [Option.unwrapNone](#optionunwrapnone)
  - [Option.expectNone](#optionexpectnone)
  - [Option.isSome](#optionissome)
  - [Option.isNone](#optionisnone)

### Result

To create a result use either of the static `ok` or `err` methods:

```ts
import { Result } from "junctional";

Result.ok("some value"); // Result<string, any>
Result.err("some error value"); // Result<any, string>
```

This will create a "box" that contains either a value or an error, with some useful methods to aid in branching logic.

One useful pattern would be to pair this with an enum or union for easy error handling:

```ts
enum MyFuncError {
  NumberTooLarge,
  NumberTooSmall,
}

function myFunc(value: number): Result<number, MyFuncError> {
  if (value > 100) {
    return Result.err(MyFuncError.NumberTooLarge);
  }

  if (value < 0) {
    return Result.err(MyFuncError.NumberTooSmall);
  }

  return Result.ok(value);
}
```

#### API

##### Result.ok

Construct an instance of an Ok Result.

```ts
static ok<TValue>(value: TValue): Result<TValue, any>;
```

Example:

```ts
Result.ok(42);
```

##### Result.err

Construct an instance of an Err Result.

```ts
static err<TError>(error: TError): Result<any, TError>;
```

Example:

```ts
Result.err("error");
```

##### Result.try

Try a callback function and return a Result.

Useful for converting an external function output into a Result.

```ts
static try<TValue, TError = any, TArgs extends Array<any> = []>(
  fn: (...args: TArgs) => TValue,
  ...args: TArgs
): Result<TValue, TError>
```

Example:

```ts
Result.try(JSON.parse, "{ "foo": "bar" }");
Result.try(() => JSON.parse("{ "foo": "bar" }"));
Result.try(JSON.parse, "not a valid JSON string");
```

##### Result.tryAsync

Try an async callback function and return a Result.

Useful for converting an async external function output into a Result.

```ts
static async tryAsync<TValue, TError = any, TArgs extends Array<any> = []>(
  fn: (...args: TArgs) => Promise<TValue>,
  ...args: TArgs
): Promise<Result<TValue, TError>>;
```

Example:

```ts
const asyncFunc = async (arg: string) => getThing(arg);

await Result.tryAsync(asyncFunc, "some-arg");
await Result.tryAsync(() => asyncFunc("some-arg"));
```

##### Result.Ok

Static Symbol to represent an Ok Result.

```ts
static readonly Ok: unique symbol = Symbol("Result::Ok");
```

##### Result.Err

Static Symbol to represent an Err Result.

```ts
static readonly Err: unique symbol = Symbol("Result::Err");
```

##### Result.match

Match a Result state and handle with a callback function.

Useful for handling branching logic.

```ts
match<TOut>(matchArgs: {
  [Result.Ok]: (value: TValue) => TOut;
  [Result.Err]: (error: TError) => TOut;
}): TOut;
```

Example:

```ts
const result = Result.ok(42);

const multipliedByTwelve = result.match({
  [Result.Ok]: (value) => value * 12;
  [Result.Err]: () => 0;
})
```

##### Result.or

Return the inner value of the Result OR a default value.

```ts
or<TNewValue>(defaultValue: TNewValue): TValue | TNewValue;
```

Example:

```ts
const result = Result.ok(42);
result.or(10); // 42

const result2 = Result.err("error");
result2.or(10); // 10
```

##### Result.map

Apply a callback function to the inner value and return a Result of the output OR return the current Err Result.

```ts
map<TNewValue, TNewError>(
  mapper: (value: TValue) => TNewValue
): Result<TNewValue, TError | TNewError>;
```

Example:

```ts
const result = Result.ok(42); // Result<number, any>
result.map((value) => `the value is: ${value}`); // Result<string, any>

const result2 = Result.err("error"); // Result<any, string>
result2.map((value) => `the value is: ${value}`); // Result<string, string>
```

##### Result.unwrap

> ⚠️Throws

Unwrap the inner value or throw an error.

Should only be used if the Result is known to be Ok or if throwing an error is an expected outcome.

```ts
unwrap(): TValue;
```

Example:

```ts
const result = Result.ok(42);
result.unwrap(); // 42

const result2 = Result.err("error");
result2.unwrap(); // Throws error "Attempted to unwrap an Err value Result. Error: error"
```

##### Result.expect

> ⚠️Throws

Unwrap the inner value or throw an error with a custom message.

Should only be used if the Result is known to be Ok or if throwing an error is an expected outcome.

Can be useful in cases where an error should be a fatal exception.

```ts
expect(message: string): TValue;
```

Example:

```ts
const result = Result.ok(42);
result.expect("expected result to be ok"); // 42

const result2 = Result.err("error");
result2.expect("expected result to be ok"); // Throws error "expected result to be ok"
```

##### Result.unwrapErr

> ⚠️Throws

Unwrap the inner error value or throw an error.

Should only be used if the Result is known to be Err or if throwing an error is an expected outcome.

```ts
unwrapErr(): TErr;
```

Example:

```ts
const result = Result.err("error");
result.unwrapErr(); // "error"

const result2 = Result.ok(42);
result2.unwrapErr(); // Throws error "Attempted to unwrap error for an Ok value Result."
```

##### Result.expectErr

> ⚠️Throws

Unwrap the inner error value or throw an error with a custom message.

Should only be used if the Result is known to be Err or if throwing an error is an expected outcome.

Can be useful in cases where Ok should be a fatal exception.

```ts
expectErr(message: string): TError;
```

Example:

```ts
const result = Result.err("error");
result.expectErr(); // "error"

const result2 = Result.ok(42);
result2.expectErr("expected result to not be ok"); // Throws error "expected result to not be ok"
```

##### Result.isOk

Returns true if the Result is Ok

```ts
isOk(): boolean;
```

Example:

```ts
const result = Result.ok(42);
result.isOk(); // true

const result2 = Result.err("error");
result2.isOk(); // false
```

##### Result.isErr

Returns true if the Result is Err

```ts
isErr(): boolean;
```

Example:

```ts
const result = Result.err("error");
result.isErr(); // true

const result2 = Result.ok(42);
result2.isErr(); // false
```

### Option

To create an Option use either of the static `some`, `none` or `from` methods:

```ts
import { Option } from "junctional";

Option.some(42); // Option<number>
Option.none(); // Option<any>

const thingThatMayBeUndefined = functionThatMayReturnUndefined(); // TypeOfThing | undefined
Option.from(thingThatMayBeUndefined); // Option<TypeOfThing>
```

This will create a "box" that contains either a value or nothing, with some useful methods to aid in branching logic.

##### Option.some

Construct an instance of a Some Option.

```ts
static Some<TValue>(value: TValue): Option<TValue>;
```

Example:

```ts
Option.some(42);
```

##### Option.none

Construct an instance of a None Option.

```ts
static none(): Option<any>;
```

Example:

```ts
Option.none();
```

##### Option.from

Convert an existing union type into an option.

Useful if an external type extends `null` or `undefined`.

```ts
static from<TValue>(
  value: TValue
): Option<Exclude<TValue, null | undefined>>;
```

Example:

```ts
const value: number | undefined = 42;
const value2: number | undefined = undefined;

Option.from(value); // Option<number>
Option.from(value2); // Option<number>
```

##### Option.fromAsync

Convert an existing union type Promise into an option.

Useful if an external Promise type extends `null` or `undefined`.

```ts
static async fromAsync<TValue>(
  value: Promise<TValue>
): Promise<Option<Exclude<TValue, null | undefined>>>;
```

Example:

```ts
const promiseValue = new Promise((resolve) => resolve(42));
await Option.fromAsync(promiseValue); // Option<number>
```

##### Option.Some

Static Symbol to represent a Some Option.

```ts
static readonly Some: unique symbol = Symbol("Option::Some");
```

##### Option.None

Static Symbol to represent a None Option.

```ts
static readonly None: unique symbol = Symbol("Option::None");
```

##### Option.match

Match an Option state and handle with a callback function.

Useful for handling branching logic.

```ts
match<TOut>(matchArgs: {
  [Option.Some]: (value: TValue) => TOut;
  [Option.None]: () => TOut;
}): TOut;
```

Example:

```ts
const option = Option.some(42);

const multipliedByTwelve = option.match({
  [Option.Some]: (value) => value * 12;
  [Option.None]: () => 0;
})
```

##### Option.or

Return the inner value of the Option OR a default value.

```ts
or<TNewValue>(defaultValue: TNewValue): TValue | TNewValue;
```

Example:

```ts
const option = Option.some(42);
option.or(10); // 42

const option2 = Option.none();
option2.or(10); // 10
```

##### Option.map

Apply a callback function to the inner value and return a Option of the output OR return the current None Option.

```ts
map<TNewValue>(
  mapper: (value: TValue) => TNewValue
): Option<TNewValue>;
```

Example:

```ts
const option = Option.some(42); // Option<number>
option.map((value) => `the value is: ${value}`); // Option<string>

const option2 = Option.none(); // Option<any>
option2.map((value) => `the value is: ${value}`); // Option<string>
```

##### Option.unwrap

> ⚠️Throws

Unwrap the inner value or throw an error.

Should only be used if the Option is known to be Some or if throwing an error is an expected outcome.

```ts
unwrap(): TValue;
```

Example:

```ts
const option = Option.some(42);
option.unwrap(); // 42

const option2 = Option.none("error");
Option2.unwrap(); // Throws error "Attempted to unwrap a None value Option."
```

##### Option.expect

> ⚠️Throws

Unwrap the inner value or throw an error with a custom message.

Should only be used if the Option is known to be Some or if throwing an error is an expected outcome.

Can be useful in cases where no value should be a fatal exception.

```ts
expect(message: string): TValue;
```

Example:

```ts
const option = Option.some(42);
option.expect("expected option to be some"); // 42

const option2 = Option.none("error");
option2.expect("expected option to be some"); // Throws error "expected option to be some"
```

##### Option.unwrapNone

> ⚠️Throws

Unwrap the inner None value or throw an error.

Should only be used if the Option is known to be None or if throwing an error is an expected outcome.

```ts
unwrapNone(): undefined;
```

Example:

```ts
const option = Option.none();
option.unwrapNone(); // undefined

const option2 = Option.some(42);
option2.unwrapNone(); // Throws error "Attempted to unwrap a Some value Option."
```

##### Option.expectNone

> ⚠️Throws

Unwrap the inner None value or throw an error with a custom message.

Should only be used if the Option is known to be None or if throwing an error is an expected outcome.

Can be useful in cases where a Some value should be a fatal exception.

```ts
expectNone(message: string): undefined;
```

Example:

```ts
const option = Option.none();
option.expectNone(); // undefined

const option2 = Option.some(42);
option2.expectErr("expected option to not be some"); // Throws error "expected option to not be some"
```

##### Option.isSome

Returns true if the Option is Some.

```ts
isSome(): boolean;
```

Example:

```ts
const option = Option.some(42);
option.isSome(); // true

const option2 = Option.none();
option2.isSome(); // false
```

##### Option.isNone

Returns true if the Option is None.

```ts
isNone(): boolean;
```

Example:

```ts
const option = Option.none();
option.isNone(); // true

const option2 = Option.some(42);
option2.isNone(); // false
```
