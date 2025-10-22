# handlebars-interp

A TypeScript library for interpolating Handlebars templates with a simple, clean API.

## Installation

```bash
npm install handlebars-interp
```

## Usage

### Basic Usage

```typescript
import { interp } from 'handlebars-interp';

const result = interp('Hello {{name}}!', { name: 'World' });
console.log(result); // "Hello World!"
```

### With Helpers

```typescript
import { interp } from 'handlebars-interp';

const template = 'Hello {{uppercase name}}!';
const variables = { name: 'world' };
const options = {
  helpers: {
    uppercase: (str: string) => str.toUpperCase()
  }
};

const result = interp(template, variables, options);
console.log(result); // "Hello WORLD!"
```

### With Strict Mode

```typescript
import { interp } from 'handlebars-interp';

const template = 'Hello {{name}}!';
const variables = { firstName: 'John' }; // missing 'name' property

try {
  const result = interp(template, variables, { strict: true });
} catch (error) {
  console.error('Missing property:', error);
}
```

## API

### `interp(template, variables, options)`

Interpolates a Handlebars template string with the provided variables.

#### Parameters

- `template` (string): The Handlebars template string
- `variables` (Record<string, any>, optional): The variables to interpolate into the template. Default: `{}`
- `options` (InterpOptions, optional): Configuration options. Default: `{}`

#### Options

- `helpers` (Record<string, Handlebars.HelperDelegate>, optional): Custom helpers to register with Handlebars
- `partials` (Record<string, Handlebars.Template>, optional): Custom partials to register with Handlebars
- `strict` (boolean, optional): Whether to use strict mode (throws errors on missing properties)
- `compileOptions` (CompileOptions, optional): Any additional Handlebars compile options

#### Returns

- `string`: The interpolated string

## Examples

See the `examples` directory for more usage examples.

## License

ISC
