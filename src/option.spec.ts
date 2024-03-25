import { describe, it, expect } from "vitest";

import { Option } from "./option";

describe("Option", () => {
  it("should throw an error when creating a Some Option with an undefined value", () => {
    expect(() => Option.some(undefined)).toThrowError(
      "Cannot create a Some Option with an undefined value."
    );
  });

  it("should throw an error when creating a Some Option with a null value", () => {
    expect(() => Option.some(null)).toThrowError(
      "Cannot create a Some Option with a null value."
    );
  });

  describe("match", () => {
    it("should match on Some", () => {
      const option = Option.some(42);
      const out = option.match({
        [Option.Some]: (value) => value,
        [Option.None]: () => 0,
      });
      expect(out).toBe(42);
    });

    it("should match on None", () => {
      const option = Option.none();
      const out = option.match({
        [Option.Some]: (value) => value,
        [Option.None]: () => 0,
      });
      expect(out).toBe(0);
    });

    describe("type inference", () => {
      function defaultToZero(value: Option<number>): number {
        return value.match({
          [Option.Some]: (value) => value,
          [Option.None]: () => 0,
        });
      }

      it("should infer the type of Some", () => {
        const opt = Option.some(42);
        const out = defaultToZero(opt);
        expect(out).toBe(42);
      });

      it("should infer the type of None", () => {
        const opt = Option.none();
        const out = defaultToZero(opt);
        expect(out).toBe(0);
      });
    });
  });

  describe("or", () => {
    it("should return the value of the Option", () => {
      const option = Option.some(42);
      expect(option.or(0)).toBe(42);
    });

    it("should return the default value", () => {
      const option = Option.none();
      expect(option.or(0)).toBe(0);
    });
  });

  describe("unwrap", () => {
    it("should unwrap the value", () => {
      const option = Option.some(42);
      expect(option.unwrap()).toBe(42);
    });

    it("should throw an error when unwrapping None", () => {
      const option = Option.none();
      expect(() => option.unwrap()).toThrowError(
        "Attempted to unwrap a None value Option."
      );
    });
  });

  describe("expect", () => {
    it("should unwrap the value", () => {
      const option = Option.some(42);
      expect(option.expect("Expected a number")).toBe(42);
    });

    it("should throw an error with a custom message", () => {
      const option = Option.none();
      expect(() => option.expect("Expected a number")).toThrowError(
        "Expected a number"
      );
    });
  });

  describe("unwrapNone", () => {
    it("should unwrap None", () => {
      const option = Option.none();
      expect(option.unwrapNone()).toBe(undefined);
    });

    it("should throw an error when unwrapping Some", () => {
      const option = Option.some(42);
      expect(() => option.unwrapNone()).toThrowError(
        "Attempted to unwrap a Some value Option."
      );
    });
  });

  describe("expectNone", () => {
    it("should unwrap None", () => {
      const option = Option.none();
      expect(option.expectNone("Expected None")).toBe(undefined);
    });

    it("should throw an error with a custom message", () => {
      const option = Option.some(42);
      expect(() => option.expectNone("Expected None")).toThrowError(
        "Expected None"
      );
    });
  });

  describe("isSome", () => {
    it("should return true for Some", () => {
      const option = Option.some(42);
      expect(option.isSome()).toBe(true);
    });

    it("should return false for None", () => {
      const option = Option.none();
      expect(option.isSome()).toBe(false);
    });
  });

  describe("isNone", () => {
    it("should return false for Some", () => {
      const option = Option.some(42);
      expect(option.isNone()).toBe(false);
    });

    it("should return true for None", () => {
      const option = Option.none();
      expect(option.isNone()).toBe(true);
    });
  });

  describe("from", () => {
    it("should create a Some Option from a value", () => {
      const option = Option.from(42);
      expect(option.isSome()).toBe(true);
      expect(option.unwrap()).toBe(42);
    });

    it("should create a None Option from undefined", () => {
      const option = Option.from(undefined);
      expect(option.isNone()).toBe(true);
    });

    it("should create a None Option from null", () => {
      const option = Option.from(null);
      expect(option.isNone()).toBe(true);
    });

    describe("type inference", () => {
      function defaultToZero(value: Option<number>): number {
        return value.match({
          [Option.Some]: (value) => value,
          [Option.None]: () => 0,
        });
      }

      it("should infer the type of undefined union", () => {
        const val: number | undefined = 42;
        const opt = Option.from(val);
        const out = defaultToZero(opt);
        expect(out).toBe(42);
      });

      it("should infer the type of null union", () => {
        const val: number | null = 42;
        const opt = Option.from(val);
        const out = defaultToZero(opt);
        expect(out).toBe(42);
      });
    });
  });

  describe("fromAsync", () => {
    it("should create a Some Option from a resolved Promise", async () => {
      const option = await Option.fromAsync(Promise.resolve(42));
      expect(option.isSome()).toBe(true);
    });

    it("should throw an error from a rejected Promise", async () => {
      await expect(Option.fromAsync(Promise.reject("error"))).rejects.toEqual(
        "error"
      );
    });

    it("should create a None Option from a Promise that resolves to undefined", async () => {
      const option = await Option.fromAsync(Promise.resolve(undefined));
      expect(option.isNone()).toBe(true);
    });

    it("should create a None Option from a Promise that resolves to null", async () => {
      const option = await Option.fromAsync(Promise.resolve(null));
      expect(option.isNone()).toBe(true);
    });
  });
});
