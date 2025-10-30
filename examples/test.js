const { interp } = require('../dist/index');

console.log('Running comprehensive tests...\n');

let passed = 0;
let failed = 0;

function test(name, actual, expected) {
  if (actual === expected) {
    console.log(`✓ ${name}`);
    passed++;
  } else {
    console.log(`✗ ${name}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Got: ${actual}`);
    failed++;
  }
}

// Test 1: Basic interpolation
test(
  'Basic interpolation',
  interp('Hello {{name}}!', { name: 'World' }),
  'Hello World!'
);

// Test 2: Multiple variables
test(
  'Multiple variables',
  interp('{{a}} + {{b}} = {{c}}', { a: 1, b: 2, c: 3 }),
  '1 + 2 = 3'
);

// Test 3: Empty variables (should use defaults)
test('Empty variables', interp('Hello {{name}}!', {}), 'Hello !');

// Test 4: With helper
test(
  'With helper',
  interp(
    '{{shout text}}',
    { text: 'hello' },
    { helpers: { shout: (str) => str.toUpperCase() + '!' } }
  ),
  'HELLO!'
);

// Test 5: Conditional (if)
test(
  'Conditional - true',
  interp('{{#if show}}visible{{/if}}', { show: true }),
  'visible'
);

// Test 6: Conditional (else)
test(
  'Conditional - false',
  interp('{{#if show}}visible{{else}}hidden{{/if}}', { show: false }),
  'hidden'
);

// Test 7: Each loop
test(
  'Each loop',
  interp('{{#each items}}{{this}},{{/each}}', { items: ['a', 'b', 'c'] }),
  'a,b,c,'
);

// Test 8: Nested properties
test(
  'Nested properties',
  interp('{{user.name}} - {{user.email}}', {
    user: { name: 'John', email: 'john@example.com' },
  }),
  'John - john@example.com'
);

// Test 9: No template variables
test('No template variables', interp('Just plain text'), 'Just plain text');

// Test 10: Empty template
test('Empty template', interp('', { name: 'World' }), '');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
