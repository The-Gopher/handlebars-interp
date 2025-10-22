import { parse } from "@handlebars/parser";
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
  partials?: Record<string, string | Handlebars.Template>;

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
  const ast = parse(template);
  return "";
}

export default interp;
