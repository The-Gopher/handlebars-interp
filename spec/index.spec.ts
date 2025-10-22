import { interp, InterpOptions } from "../src/index";

describe("interp", () => {
  describe("Basic Interpolation", () => {
    it("should interpolate a simple variable", () => {
      const result = interp("Hello {{name}}!", { name: "World" });
      expect(result).toBe("Hello World!");
    });
    it("should interpolate multiple variables", () => {
      const result = interp(
        "{{greeting}} {{name}}! You are {{age}} years old.",
        {
          greeting: "Hi",
          name: "Alice",
          age: 30,
        }
      );
      expect(result).toBe("Hi Alice! You are 30 years old.");
    });

    it("should handle templates with no variables", () => {
      const result = interp("Just plain text");
      expect(result).toBe("Just plain text");
    });

    it("should handle empty templates", () => {
      const result = interp("", { name: "World" });
      expect(result).toBe("");
    });

    it("should handle missing variables gracefully", () => {
      const result = interp("Hello {{name}}!", {});
      expect(result).toBe("Hello !");
    });

    it("should handle nested object properties", () => {
      const result = interp("{{user.name}} - {{user.email}}", {
        user: { name: "John", email: "john@example.com" },
      });
      expect(result).toBe("John - john@example.com");
    });
  });

  describe("Built-in Handlebars Features", () => {
    it("should support if conditionals - truthy", () => {
      const result = interp("{{#if show}}visible{{/if}}", { show: true });
      expect(result).toBe("visible");
    });

    /*

    it('should support if conditionals - falsy', () => {
      const result = interp('{{#if show}}visible{{/if}}', { show: false });
      expect(result).toBe('');
    });

    it('should support if/else conditionals', () => {
      const result = interp('{{#if show}}visible{{else}}hidden{{/if}}', { show: false });
      expect(result).toBe('hidden');
    });

    it('should support each loops with arrays', () => {
      const result = interp('{{#each items}}{{this}},{{/each}}', {
        items: ['a', 'b', 'c']
      });
      expect(result).toBe('a,b,c,');
    });

    it('should support each loops with objects', () => {
      const result = interp('{{#each users}}{{name}},{{/each}}', {
        users: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]
      });
      expect(result).toBe('Alice,Bob,Charlie,');
    });

    it('should support unless conditionals', () => {
      const result = interp('{{#unless isHidden}}visible{{/unless}}', { isHidden: false });
      expect(result).toBe('visible');
    });

    it('should support with block helpers', () => {
      const result = interp('{{#with user}}{{name}} - {{email}}{{/with}}', {
        user: { name: 'John', email: 'john@example.com' }
      });
      expect(result).toBe('John - john@example.com');
    });
  });

  describe('Custom Helpers', () => {
    it('should support custom helpers', () => {
      const options: InterpOptions = {
        helpers: {
          uppercase: (str: string) => str.toUpperCase()
        }
      };
      const result = interp('{{uppercase name}}', { name: 'world' }, options);
      expect(result).toBe('WORLD');
    });

    it('should support multiple custom helpers', () => {
      const options: InterpOptions = {
        helpers: {
          uppercase: (str: string) => str.toUpperCase(),
          reverse: (str: string) => str.split('').reverse().join('')
        }
      };
      const result = interp('{{uppercase a}} {{reverse b}}', { a: 'hello', b: 'world' }, options);
      expect(result).toBe('HELLO dlrow');
    });

    it('should support helpers with multiple arguments', () => {
      const options: InterpOptions = {
        helpers: {
          add: (a: number, b: number) => a + b
        }
      };
      const result = interp('{{add x y}}', { x: 5, y: 3 }, options);
      expect(result).toBe('8');
    });

    it('should support block helpers', () => {
      const options: InterpOptions = {
        helpers: {
          bold: function(this: any, options: any) {
            return '<b>' + options.fn(this) + '</b>';
          }
        }
      };
      const result = interp('{{#bold}}Hello {{name}}{{/bold}}', { name: 'World' }, options);
      expect(result).toBe('<b>Hello World</b>');
    });
  });

  describe('Strict Mode', () => {
    it('should throw error on missing variables in strict mode', () => {
      const options: InterpOptions = { strict: true };
      expect(() => {
        interp('Hello {{name}}!', {}, options);
      }).toThrow();
    });

    it('should not throw error when all variables are provided in strict mode', () => {
      const options: InterpOptions = { strict: true };
      const result = interp('Hello {{name}}!', { name: 'World' }, options);
      expect(result).toBe('Hello World!');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in variables', () => {
      const result = interp('{{msg}}', { msg: 'Hello "World" & <friends>' });
      expect(result).toContain('Hello');
    });

    it('should handle numbers', () => {
      const result = interp('Count: {{count}}', { count: 42 });
      expect(result).toBe('Count: 42');
    });

    it('should handle booleans', () => {
      const result = interp('Active: {{isActive}}', { isActive: true });
      expect(result).toBe('Active: true');
    });

    it('should handle null values', () => {
      const result = interp('Value: {{value}}', { value: null });
      expect(result).toBe('Value: ');
    });

    it('should handle undefined values', () => {
      const result = interp('Value: {{value}}', { value: undefined });
      expect(result).toBe('Value: ');
    });

    it('should handle arrays directly', () => {
      const result = interp('{{items}}', { items: [1, 2, 3] });
      expect(result).toBe('1,2,3');
    });
  });

  describe('Complex Templates', () => {
    it('should handle complex nested templates', () => {
      const template = `
        <div>
          <h1>{{title}}</h1>
          <ul>
            {{#each items}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
        </div>
      `;
      const result = interp(template, {
        title: 'Shopping List',
        items: ['Apples', 'Bananas', 'Oranges']
      });
      expect(result).toContain('<h1>Shopping List</h1>');
      expect(result).toContain('<li>Apples</li>');
      expect(result).toContain('<li>Bananas</li>');
      expect(result).toContain('<li>Oranges</li>');
    });

    it('should handle deeply nested objects', () => {
      const result = interp('{{a.b.c.d}}', {
        a: { b: { c: { d: 'deep value' } } }
      });
      expect(result).toBe('deep value');
    });
  });

  describe('Instance Isolation', () => {
    it('should create separate Handlebars instances (no pollution)', () => {
      const options1: InterpOptions = {
        helpers: {
          helper1: () => 'helper1'
        }
      };
      
      const options2: InterpOptions = {
        helpers: {
          helper2: () => 'helper2'
        }
      };

      const result1 = interp('{{helper1}}', {}, options1);
      const result2 = interp('{{helper2}}', {}, options2);

      expect(result1).toBe('helper1');
      expect(result2).toBe('helper2');
    });
  });
  */
  });
});
