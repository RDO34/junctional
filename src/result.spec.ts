import { describe, it, expect } from "vitest";

import { Result } from "./result";

describe("Result", () => {
  describe("match", () => {
    it("should match on Ok", () => {
      const result = Result.ok(42);
      const out = result.match({
        [Result.Ok]: (value) => value,
        [Result.Err]: () => 0,
      });
      expect(out).toBe(42);
    });

    it("should match on Err", () => {
      const result = Result.err("error");
      const out = result.match({
        [Result.Ok]: () => "yes",
        [Result.Err]: () => "no",
      });
      expect(out).toBe("no");
    });

    describe("type inference", () => {
      function defaultToZero(value: Result<number>): number {
        return value.match({
          [Result.Ok]: (value) => value,
          [Result.Err]: () => 0,
        });
      }

      it("should infer the type of Ok", () => {
        const result = Result.ok(42);
        const out = defaultToZero(result);
        expect(out).toBe(42);
      });

      it("should infer the type of Err", () => {
        const result = Result.err("error");
        const out = defaultToZero(result);
        expect(out).toBe(0);
      });
    });
  });

  describe("or", () => {
    it("should return the value of the Result", () => {
      const result = Result.ok(42);
      expect(result.or(0)).toBe(42);
    });

    it("should return the default value", () => {
      const result = Result.err("error");
      expect(result.or(0)).toBe(0);
    });
  });

  describe("unwrap", () => {
    it("should unwrap the value", () => {
      const result = Result.ok(42);
      expect(result.unwrap()).toBe(42);
    });

    it("should throw an error when unwrapping Err", () => {
      const result = Result.err("error message");
      expect(() => result.unwrap()).toThrowError(
        "Attempted to unwrap an Err value Result. Error: error message"
      );
    });
  });

  describe("expect", () => {
    it("should unwrap the value", () => {
      const result = Result.ok(42);
      expect(result.expect("error")).toBe(42);
    });

    it("should throw an error when unwrapping Err", () => {
      const result = Result.err("error");
      expect(() => result.expect("Expected a number")).toThrowError(
        "Expected a number"
      );
    });
  });

  describe("unwrapErr", () => {
    it("should unwrap the error", () => {
      const result = Result.err("error");
      expect(result.unwrapErr()).toBe("error");
    });

    it("should throw an error when unwrapping Ok", () => {
      const result = Result.ok(42);
      expect(() => result.unwrapErr()).toThrowError(
        "Attempted to unwrap error for an Ok value Result."
      );
    });
  });

  describe("expectErr", () => {
    it("should unwrap the error", () => {
      const result = Result.err("error");
      expect(result.expectErr("error")).toBe("error");
    });

    it("should throw an error with a custom message", () => {
      const result = Result.ok(42);
      expect(() => result.expectErr("Expected an error")).toThrowError(
        "Expected an error"
      );
    });
  });

  describe("isOk", () => {
    it("should return true for Ok", () => {
      const result = Result.ok(42);
      expect(result.isOk()).toBe(true);
    });

    it("should return false for Err", () => {
      const result = Result.err("error");
      expect(result.isOk()).toBe(false);
    });
  });

  describe("isErr", () => {
    it("should return false for Ok", () => {
      const result = Result.ok(42);
      expect(result.isErr()).toBe(false);
    });

    it("should return true for Err", () => {
      const result = Result.err("error");
      expect(result.isErr()).toBe(true);
    });
  });

  describe("try", () => {
    it("should return an Ok value", () => {
      const result = Result.try(() => 42);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(42);
    });

    it("should return an Err value", () => {
      const result = Result.try(() => {
        throw Error("error");
      });
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toBe("error");
    });

    it("should handle arguments", () => {
      const add = (a: number, b: number) => a + b;
      const result = Result.try(add, 1, 2);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(3);
    });

    describe("JSON example", () => {
      it("should return an Ok value", () => {
        const result = Result.try(JSON.parse, '{"key": "value"}');
        expect(result.isOk()).toBe(true);
        expect(result.isErr()).toBe(false);
        expect(result.unwrap()).toEqual({ key: "value" });
      });

      it("should return an Err value", () => {
        const result = Result.try(JSON.parse, "invalid json");
        expect(result.isErr()).toBe(true);
        expect(result.isOk()).toBe(false);
        expect(result.unwrapErr().message).toBe(
          "Unexpected token 'i', \"invalid json\" is not valid JSON"
        );
      });

      it("should return a default value", () => {
        const result = Result.try(JSON.parse, "invalid json").or({});
        expect(result).toEqual({});
      });
    });
  });

  describe("tryAsync", () => {
    it("should return an Ok value", async () => {
      const result = await Result.tryAsync(async () => 42);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(42);
    });

    it("should return an Err value", async () => {
      const result = await Result.tryAsync(async () => {
        throw Error("error");
      });
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toBe("error");
    });

    it("should handle arguments", async () => {
      const add = async (a: number, b: number) => a + b;
      const result = await Result.tryAsync(add, 1, 2);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(3);
    });
  });
});
