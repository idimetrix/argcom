# argcom

[![npm version](https://badge.fury.io/js/argcom.svg)](https://badge.fury.io/js/argcom)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A straightforward CLI argument parser with no added complexity or opinions. Built for simplicity, performance, and TypeScript support.

## Features

- 🚀 **Zero dependencies** - Lightweight and fast
- 📝 **TypeScript first** - Built with TypeScript, includes full type definitions
- 🎯 **Simple API** - Minimal learning curve, just works
- 🔧 **Flexible** - Support for all argument types and patterns
- ⚡ **Performance focused** - Optimized for speed and memory usage
- 🛡️ **Error handling** - Clear, actionable error messages

## Installation

```bash
npm install argcom
```

```bash
yarn add argcom
```

```bash
pnpm add argcom
```

## Quick Start

```typescript
import { arg } from 'argcom';

const args = arg({
  // Boolean flags
  '--help': Boolean,
  '--version': Boolean,
  
  // String arguments
  '--name': String,
  '--host': String,
  
  // Number arguments  
  '--port': Number,
  
  // Array arguments (multiple values)
  '--tag': [String],
  
  // Count flags (count occurrences)
  '--verbose': arg.COUNT,
  
  // Aliases
  '-h': '--help',
  '-v': '--version',
  '-n': '--name'
});

console.log(args);
```

## API Reference

### `arg(spec, options?)`

Parses command line arguments according to the provided specification.

#### Parameters

- **`spec`** (`object`): Argument specification object
- **`options`** (`object`, optional): Parser options

#### Specification Object

The specification object maps argument names to their types:

```typescript
{
  '--flag': Boolean,        // Boolean flag
  '--string': String,       // String argument
  '--number': Number,       // Number argument
  '--array': [String],      // Array of strings
  '--count': arg.COUNT,     // Count occurrences
  '--alias': '--flag'       // Alias to another argument
}
```

#### Options

```typescript
{
  argv?: string[];          // Custom argv (default: process.argv.slice(2))
  permissive?: boolean;     // Allow unknown arguments (default: false)
  stopAtPositional?: boolean; // Stop parsing at first positional arg (default: false)
}
```

#### Return Value

Returns an object with parsed arguments and a special `_` array containing positional arguments:

```typescript
{
  _: string[];              // Positional arguments
  [key: string]: any;       // Parsed argument values
}
```

## Examples

### Basic Usage

```typescript
import { arg } from 'argcom';

// Command: node script.js --port 3000 --host localhost file1.txt file2.txt
const args = arg({
  '--port': Number,
  '--host': String
});

console.log(args);
// Output: { _: ['file1.txt', 'file2.txt'], '--port': 3000, '--host': 'localhost' }
```

### Boolean Flags

```typescript
// Command: node script.js --verbose --debug
const args = arg({
  '--verbose': Boolean,
  '--debug': Boolean
});

console.log(args);
// Output: { _: [], '--verbose': true, '--debug': true }
```

### Aliases and Short Options

```typescript
// Command: node script.js -v -p 8080
const args = arg({
  '--verbose': Boolean,
  '--port': Number,
  '-v': '--verbose',
  '-p': '--port'
});

console.log(args);
// Output: { _: [], '--verbose': true, '--port': 8080 }
```

### Array Arguments

```typescript
// Command: node script.js --tag dev --tag test --tag prod
const args = arg({
  '--tag': [String]
});

console.log(args);
// Output: { _: [], '--tag': ['dev', 'test', 'prod'] }
```

### Count Flags

```typescript
// Command: node script.js -vvv
const args = arg({
  '--verbose': arg.COUNT,
  '-v': '--verbose'
});

console.log(args);
// Output: { _: [], '--verbose': 3 }
```

### Advanced Usage with Options

```typescript
// Permissive mode - unknown arguments go to positional array
const args = arg({
  '--known': Boolean
}, {
  permissive: true,
  argv: ['--known', '--unknown', 'value']
});

console.log(args);
// Output: { _: ['--unknown', 'value'], '--known': true }
```

### Stop at Positional

```typescript
// Stop parsing at first positional argument
const args = arg({
  '--verbose': Boolean,
  '--port': Number
}, {
  stopAtPositional: true,
  argv: ['--verbose', 'file.txt', '--port', '3000']
});

console.log(args);
// Output: { _: ['file.txt', '--port', '3000'], '--verbose': true }
```

## Error Handling

`argcom` provides clear error messages for common mistakes:

```typescript
import { arg, ArgcomError } from 'argcom';

try {
  const args = arg({
    '--port': Number
  }, {
    argv: ['--port'] // Missing value
  });
} catch (error) {
  if (error instanceof ArgcomError) {
    console.log(error.message); // "option requires argument: --port"
    console.log(error.code);    // "ARG_MISSING_REQUIRED_LONGARG"
  }
}
```

### Error Codes

- `ARG_CONFIG_NO_SPEC` - No specification object provided
- `ARG_CONFIG_EMPTY_KEY` - Empty string used as argument key
- `ARG_CONFIG_NONOPT_KEY` - Argument key doesn't start with `-`
- `ARG_CONFIG_NONAME_KEY` - Singular `-` used as key
- `ARG_CONFIG_BAD_TYPE` - Invalid type specification
- `ARG_CONFIG_SHORTOPT_TOOLONG` - Short option longer than one character
- `ARG_UNKNOWN_OPTION` - Unknown argument encountered
- `ARG_MISSING_REQUIRED_LONGARG` - Required argument value missing
- `ARG_MISSING_REQUIRED_SHORTARG` - Short argument missing required value

## Advanced Features

### Custom Flag Functions

Create custom argument processors using `arg.flag()`:

```typescript
const collect = arg.flag((value, name, previous = []) => {
  return [...previous, value];
});

const args = arg({
  '--collect': collect
});
```

### Multiple Value Handling

```typescript
// Command: node script.js --item apple --item banana --item cherry
const args = arg({
  '--item': [String]
});

console.log(args['--item']); // ['apple', 'banana', 'cherry']
```

### Argument Separation

Use `--` to separate options from positional arguments:

```typescript
// Command: node script.js --verbose -- --not-an-option file.txt
const args = arg({
  '--verbose': Boolean
});

console.log(args);
// Output: { _: ['--not-an-option', 'file.txt'], '--verbose': true }
```

## TypeScript Support

`argcom` is written in TypeScript and includes full type definitions:

```typescript
import { arg, ArgHandler, ArgOptions, ArgConfig, ArgcomError } from 'argcom';

// Type-safe argument specification
const spec: ArgOptions = {
  '--port': Number,
  '--host': String
};

// Type-safe options
const options: ArgConfig = {
  permissive: false,
  stopAtPositional: false
};

const result = arg(spec, options);
```

## Comparison with Other Libraries

| Feature | argcom | minimist | yargs | commander |
|---------|--------|----------|-------|-----------|
| Bundle size | ~3KB | ~4KB | ~500KB | ~200KB |
| TypeScript | ✅ Native | ❌ | ✅ | ✅ |
| Zero deps | ✅ | ✅ | ❌ | ❌ |
| Error handling | ✅ Clear | ❌ Basic | ✅ | ✅ |
| Performance | ✅ Fast | ✅ Fast | ❌ Slow | ❌ Slow |

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE) © [Dmitrii Selikhov](https://github.com/idimetrix)

## Links

- [npm package](https://www.npmjs.com/package/argcom)
- [GitHub repository](https://github.com/idimetrix/argcom)
- [Issue tracker](https://github.com/idimetrix/argcom/issues)