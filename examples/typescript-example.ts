import { interp } from '../src/index';

// Basic example with TypeScript
const result: string = interp('Hello {{name}}!', { name: 'TypeScript' });
console.log(result); // "Hello TypeScript!"

// With type-safe variables
interface User {
  name: string;
  age: number;
  isActive: boolean;
}

const user: User = {
  name: 'Alice',
  age: 30,
  isActive: true,
};

const userGreeting = interp(
  'Welcome {{name}}! {{#if isActive}}Your account is active.{{/if}}',
  user
);
console.log(userGreeting);

// With custom helper
const withHelper = interp(
  'Total: {{formatCurrency amount}}',
  { amount: 1234.56 },
  {
    helpers: {
      formatCurrency: (value: number) => `$${value.toFixed(2)}`,
    },
  }
);
console.log(withHelper); // "Total: $1234.56"
