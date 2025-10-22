const { interp } = require('../dist/index');

// Basic example
console.log('=== Basic Example ===');
const basic = interp('Hello {{name}}!', { name: 'World' });
console.log(basic); // "Hello World!"

// Multiple variables
console.log('\n=== Multiple Variables ===');
const multi = interp('{{greeting}} {{name}}! You are {{age}} years old.', {
  greeting: 'Hi',
  name: 'Alice',
  age: 30
});
console.log(multi); // "Hi Alice! You are 30 years old."

// With helpers
console.log('\n=== With Helpers ===');
const withHelpers = interp(
  'Hello {{uppercase name}}!',
  { name: 'world' },
  {
    helpers: {
      uppercase: (str) => str.toUpperCase()
    }
  }
);
console.log(withHelpers); // "Hello WORLD!"

// With built-in Handlebars features
console.log('\n=== With Built-in Features ===');
const conditional = interp(
  '{{#if isActive}}User is active{{else}}User is inactive{{/if}}',
  { isActive: true }
);
console.log(conditional); // "User is active"

const loop = interp(
  'Users: {{#each users}}{{name}}, {{/each}}',
  { users: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }] }
);
console.log(loop); // "Users: Alice, Bob, Charlie, "

console.log('\n=== Complex Example ===');
const complex = interp(
  `
  <div>
    <h1>{{title}}</h1>
    <ul>
      {{#each items}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
  </div>
  `,
  {
    title: 'Shopping List',
    items: ['Apples', 'Bananas', 'Oranges']
  }
);
console.log(complex.trim());
