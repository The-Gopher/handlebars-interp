import Handlebars from 'handlebars';

/**
 * Options for the interp function
 */
export interface InterpOptions {
  /**
   * Custom helpers to register with Handlebars
   */
  helpers?: Record<string, Handlebars.HelperDelegate>;
  
  /**
   * Custom partials to register with Handlebars
   */
  partials?: Record<string, Handlebars.Template>;
  
  /**
   * Whether to use strict mode (throws errors on missing properties)
   */
  strict?: boolean;
  
  /**
   * Any additional Handlebars compile options
   */
  compileOptions?: CompileOptions;
}

/**
 * Interpolates a Handlebars template string with the provided variables
 * 
 * @param template - The Handlebars template string
 * @param variables - The variables to interpolate into the template
 * @param options - Optional configuration options
 * @returns The interpolated string
 * 
 * @example
 * ```typescript
 * const result = interp('Hello {{name}}!', { name: 'World' });
 * console.log(result); // "Hello World!"
 * ```
 */
export function interp(
  template: string,
  variables: Record<string, any> = {},
  options: InterpOptions = {}
): string {
  // Create a new Handlebars instance to avoid global state pollution
  const hb = Handlebars.create();
  
  // Register custom helpers if provided
  if (options.helpers) {
    Object.entries(options.helpers).forEach(([name, helper]) => {
      hb.registerHelper(name, helper);
    });
  }
  
  // Register custom partials if provided
  if (options.partials) {
    Object.entries(options.partials).forEach(([name, partial]) => {
      hb.registerPartial(name, partial);
    });
  }
  
  // Compile the template with options
  const compiledTemplate = hb.compile(template, {
    strict: options.strict,
    ...options.compileOptions
  });
  
  // Execute the template with the provided variables
  return compiledTemplate(variables);
}

export default interp;
