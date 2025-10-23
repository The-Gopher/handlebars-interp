# Test Generation Scripts

## generate-tests.js

This script parses JSON test specification files from `spec/mustache/specs/` and generates TypeScript test files in `spec/generated/`.

### Usage

```bash
yarn generate-tests
# or
node scripts/generate-tests.js
```

### How it works

1. Reads JSON spec files from `spec/mustache/specs/`
2. For each enabled spec file (defined in `enabledFiles` array):
   - Parses the JSON structure
   - Generates a TypeScript test file with individual test cases
   - Handles special cases like lambda functions and primitive data types
3. Outputs generated test files to `spec/generated/`

### Adding new test suites

To enable additional test suites, edit the `enabledFiles` array in `scripts/generate-tests.js`:

```javascript
const enabledFiles = ['comments.json', 'interpolation.json', 'new-suite.json'];
```

Then run `yarn generate-tests` to regenerate the test files.

### Generated files

The generated test files are:

- Auto-generated (DO NOT EDIT manually)
- Gitignored (should not be committed)
- Created before running tests

Each generated test file:

- Imports the `interp` function from the main source
- Contains one test case per test in the JSON spec
- Uses Jest's `describe` and `it` blocks
- Includes inline test data, templates, and expected results
