# argcom
`argcom` is a straightforward CLI argument parser with no added complexity or opinions.

## Usage

`argcom()` accepts one or two arguments:

1. A command line specification object.
2. An optional options object, which defaults to `{ permissive: false, argv: process.argv.slice(2), stopAtPositional: false }`.

It returns an object containing the command-line values. Any parameters not used by options are placed in the `result._` array, which is always returned (even if empty). `argcom()` does not validate or enforce requirements—this is up to the application.

```typescript
// index.ts
import { argcom } from 'argcom';

const args = arg({
	// Types
	'--help': Boolean,
	'--version': Boolean,
	'--verbose': arg.COUNT, // Counts the number of times --verbose is passed
	'--port': Number, // --port <number> or --port=<number>
	'--host': String, // --host <string> or --host=<string>
	'--tag': [String], // --tag <string> or --tag=<string>

	// Aliases
	'-v': '--verbose',
	'-h': '--host', // -h <string>; result is stored in --host
	'--domain': '--host' // --domain <string> or --domain=<string>;
	//     result is stored in --host
});

console.log(args);
/*
{
	_: ["foo", "bar", "--foobar"],
	'--port': 3000,
	'--verbose': 4,
	'--host': "localhost",
	'--tag': ["tag1", "tag2"]
}
*/
```

## tsup
Bundle your TypeScript library with no config, powered by esbuild.

https://tsup.egoist.dev/

## How to use this
1. install dependencies
```
# pnpm
$ pnpm install

# yarn
$ yarn install

# npm
$ npm install
```
2. Add your code to `src`
3. Add export statement to `src/index.ts`
4. Test build command to build `src`.
Once the command works properly, you will see `dist` folder.

```zsh
# pnpm
$ pnpm run build

# yarn
$ yarn run build

# npm
$ npm run build
```
5. Publish your package

```zsh
$ npm publish
```


## test package
https://www.npmjs.com/package/argcom
