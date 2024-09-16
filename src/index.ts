const flagSymbol = Symbol("arg flag");

class ArgcomError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ArgcomError";

    Object.setPrototypeOf(this, ArgcomError.prototype);
  }
}

type ArgHandler<T> = (value: string, name: string, prev?: T[]) => T[];

interface ArgOptions {
  [key: string]: string | ArgHandler<any> | [ArgHandler<any>];
}

interface ArgConfig {
  argv?: string[];
  permissive?: boolean;
  stopAtPositional?: boolean;
}

export function arg(
  opts: ArgOptions,
  {
    argv = process.argv.slice(2),
    permissive = false,
    stopAtPositional = false,
  }: ArgConfig = {},
): { [key: string]: any; _: string[] } {
  if (!opts) {
    throw new ArgcomError(
      "argument specification object is required",
      "ARG_CONFIG_NO_SPEC",
    );
  }

  const result: { [key: string]: any; _: string[] } = { _: [] };

  const aliases: { [key: string]: string } = {};
  const handlers: { [key: string]: [Function, boolean] } = {};

  for (const key of Object.keys(opts)) {
    if (!key) {
      throw new ArgcomError(
        "argument key cannot be an empty string",
        "ARG_CONFIG_EMPTY_KEY",
      );
    }

    if (key[0] !== "-") {
      throw new ArgcomError(
        `argument key must start with '-' but found: '${key}'`,
        "ARG_CONFIG_NONOPT_KEY",
      );
    }

    if (key.length === 1) {
      throw new ArgcomError(
        `argument key must have a name; singular '-' keys are not allowed: ${key}`,
        "ARG_CONFIG_NONAME_KEY",
      );
    }

    if (typeof opts[key] === "string") {
      aliases[key] = opts[key];
      continue;
    }

    let type = opts[key];
    let isFlag = false;

    if (
      Array.isArray(type) &&
      type.length === 1 &&
      typeof type[0] === "function"
    ) {
      const [fn] = type as [Function];
      type = (value: string, name: string, prev: any[] = []) => {
        prev.push(fn(value, name, prev[prev.length - 1]));
        return prev;
      };
      isFlag = fn === Boolean || (fn as any)[flagSymbol] === true;
    } else if (typeof type === "function") {
      isFlag = (type as any) === Boolean || (type as any)[flagSymbol] === true;
    } else {
      throw new ArgcomError(
        `type missing or not a function or valid array type: ${key}`,
        "ARG_CONFIG_VAD_TYPE",
      );
    }

    if (key[1] !== "-" && key.length > 2) {
      throw new ArgcomError(
        `short argument keys (with a single hyphen) must have only one character: ${key}`,
        "ARG_CONFIG_SHORTOPT_TOOLONG",
      );
    }

    handlers[key] = [type, isFlag];
  }

  for (let i = 0, len = argv.length; i < len; i++) {
    const wholeArg = argv[i];

    if (stopAtPositional && result._.length > 0) {
      result._ = result._.concat(argv.slice(i));
      break;
    }

    if (wholeArg === "--") {
      result._ = result._.concat(argv.slice(i + 1));
      break;
    }

    if (wholeArg.length > 1 && wholeArg[0] === "-") {
      const separatedArguments =
        wholeArg[1] === "-" || wholeArg.length === 2
          ? [wholeArg]
          : wholeArg
              .slice(1)
              .split("")
              .map((a) => `-${a}`);

      for (let j = 0; j < separatedArguments.length; j++) {
        const arg = separatedArguments[j];
        const [originalArgName, argStr] =
          arg[1] === "-" ? arg.split(/=(.*)/, 2) : [arg, undefined];

        let argName = originalArgName;
        while (argName in aliases) {
          argName = aliases[argName];
        }

        if (!(argName in handlers)) {
          if (permissive) {
            result._.push(arg);
            continue;
          } else {
            throw new ArgcomError(
              `unknown or unexpected option: ${originalArgName}`,
              "ARG_UNKNOWN_OPTION",
            );
          }
        }

        const [type, isFlag] = handlers[argName];

        if (!isFlag && j + 1 < separatedArguments.length) {
          throw new ArgcomError(
            `option requires argument (but was followed by another short argument): ${originalArgName}`,
            "ARG_MISSING_REQUIRED_SHORTARG",
          );
        }

        if (isFlag) {
          result[argName] = type(true, argName, result[argName]);
        } else if (argStr === undefined) {
          if (
            argv.length < i + 2 ||
            (argv[i + 1].length > 1 &&
              argv[i + 1][0] === "-" &&
              !(
                argv[i + 1].match(/^-?\d*(\.(?=\d))?\d*$/) &&
                (type === Number ||
                  (typeof BigInt !== "undefined" && type === BigInt))
              ))
          ) {
            const extended =
              originalArgName === argName ? "" : ` (alias for ${argName})`;
            throw new ArgcomError(
              `option requires argument: ${originalArgName}${extended}`,
              "ARG_MISSING_REQUIRED_LONGARG",
            );
          }

          result[argName] = type(argv[i + 1], argName, result[argName]);
          ++i;
        } else {
          result[argName] = type(argStr, argName, result[argName]);
        }
      }
    } else {
      result._.push(wholeArg);
    }
  }

  return result;
}

arg.flag = (fn: Function) => {
  (fn as any)[flagSymbol] = true;
  return fn;
};

arg.COUNT = arg.flag(
  (v: string, name: string, existingCount: number = 0) =>
    (existingCount || 0) + 1,
);

arg.ArgcomError = ArgcomError;
