import { arg } from "../index";

describe("argcom", () => {
  describe("basic parsing", () => {
    test("should parse boolean flags", () => {
      const result = arg(
        {
          "--help": Boolean,
          "--version": Boolean,
        },
        { argv: ["--help", "--version"] },
      );

      expect(result).toEqual({
        _: [],
        "--help": true,
        "--version": true,
      });
    });

    test("should parse string arguments", () => {
      const result = arg(
        {
          "--name": String,
          "--host": String,
        },
        { argv: ["--name", "test", "--host=localhost"] },
      );

      expect(result).toEqual({
        _: [],
        "--name": "test",
        "--host": "localhost",
      });
    });

    test("should parse number arguments", () => {
      const result = arg(
        {
          "--port": Number,
          "--timeout": Number,
        },
        { argv: ["--port", "3000", "--timeout=5000"] },
      );

      expect(result).toEqual({
        _: [],
        "--port": 3000,
        "--timeout": 5000,
      });
    });

    test("should handle array arguments", () => {
      const result = arg(
        {
          "--tag": [String],
        },
        { argv: ["--tag", "dev", "--tag", "test"] },
      );

      expect(result).toEqual({
        _: [],
        "--tag": ["dev", "test"],
      });
    });
  });

  describe("aliases", () => {
    test("should handle aliases", () => {
      const result = arg(
        {
          "--verbose": Boolean,
          "--host": String,
          "-v": "--verbose",
          "-h": "--host",
        },
        { argv: ["-v", "-h", "localhost"] },
      );

      expect(result).toEqual({
        _: [],
        "--verbose": true,
        "--host": "localhost",
      });
    });

    test("should handle chained short flags", () => {
      const result = arg(
        {
          "--help": Boolean,
          "--version": Boolean,
          "--verbose": Boolean,
          "-h": "--help",
          "-v": "--version",
          "-V": "--verbose",
        },
        { argv: ["-hvV"] },
      );

      expect(result).toEqual({
        _: [],
        "--help": true,
        "--version": true,
        "--verbose": true,
      });
    });
  });

  describe("COUNT flag", () => {
    test("should count repeated flags", () => {
      const result = arg(
        {
          "--verbose": arg.COUNT,
        },
        { argv: ["--verbose", "--verbose", "--verbose"] },
      );

      expect(result).toEqual({
        _: [],
        "--verbose": 3,
      });
    });
  });

  describe("positional arguments", () => {
    test("should collect positional arguments", () => {
      const result = arg(
        {
          "--port": Number,
        },
        { argv: ["--port", "3000", "file1.txt", "file2.txt"] },
      );

      expect(result).toEqual({
        _: ["file1.txt", "file2.txt"],
        "--port": 3000,
      });
    });

    test("should handle -- separator", () => {
      const result = arg(
        {
          "--port": Number,
        },
        { argv: ["--port", "3000", "--", "--other", "file.txt"] },
      );

      expect(result).toEqual({
        _: ["--other", "file.txt"],
        "--port": 3000,
      });
    });
  });

  describe("permissive mode", () => {
    test("should handle unknown options in permissive mode", () => {
      const result = arg(
        {
          "--known": Boolean,
        },
        {
          argv: ["--known", "--unknown", "value"],
          permissive: true,
        },
      );

      expect(result).toEqual({
        _: ["--unknown", "value"],
        "--known": true,
      });
    });
  });

  describe("stopAtPositional", () => {
    test("should stop parsing at first positional argument", () => {
      const result = arg(
        {
          "--verbose": Boolean,
          "--port": Number,
        },
        {
          argv: ["--verbose", "file.txt", "--port", "3000"],
          stopAtPositional: true,
        },
      );

      expect(result).toEqual({
        _: ["file.txt", "--port", "3000"],
        "--verbose": true,
      });
    });
  });

  describe("error handling", () => {
    test("should throw on missing spec", () => {
      expect(() => {
        // @ts-expect-error - intentionally passing null for testing
        arg(null);
      }).toThrow("argument specification object is required");
    });

    test("should throw on empty key", () => {
      expect(() => {
        arg({ "": Boolean });
      }).toThrow("argument key cannot be an empty string");
    });

    test("should throw on invalid key format", () => {
      expect(() => {
        arg({ invalid: Boolean });
      }).toThrow("argument key must start with '-' but found: 'invalid'");
    });

    test("should throw on single dash key", () => {
      expect(() => {
        arg({ "-": Boolean });
      }).toThrow(
        "argument key must have a name; singular '-' keys are not allowed: -",
      );
    });

    test("should throw on long short option", () => {
      expect(() => {
        arg({ "-abc": Boolean });
      }).toThrow(
        "short argument keys (with a single hyphen) must have only one character: -abc",
      );
    });

    test("should throw on unknown option", () => {
      expect(() => {
        arg({ "--known": Boolean }, { argv: ["--unknown"] });
      }).toThrow("unknown or unexpected option: --unknown");
    });

    test("should throw on missing required argument", () => {
      expect(() => {
        arg({ "--name": String }, { argv: ["--name"] });
      }).toThrow("option requires argument: --name");
    });
  });

  describe("custom flag function", () => {
    test("should work with custom flag function", () => {
      const collect = arg.flag(
        (value: string, name: string, prev: string[] = []) => {
          return [...prev, value];
        },
      );

      const result = arg(
        {
          "--collect": collect,
        },
        { argv: ["--collect", "--collect", "--collect"] },
      );

      expect(result).toEqual({
        _: [],
        "--collect": [true, true, true],
      });
    });
  });
});
