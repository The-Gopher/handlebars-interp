import { parse } from "@handlebars/parser";
import {
  BlockStatement,
  ContentStatement,
  Literal,
  MustacheStatement,
  PathExpression,
  Program,
  Statement,
  SubExpression,
} from "@handlebars/parser/types/ast";
import Handlebars from "handlebars";

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

type NodeType =
  | ContentStatement
  | MustacheStatement
  | SubExpression
  | PathExpression
  | BlockStatement;

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

  function processNode(statement: NodeType): string[] {
    function lookupVariable(path: string[]): any {
      let value: any = variables;
      for (const p of path) {
        if (value && value.hasOwnProperty(p)) {
          value = value[p];
        } else {
          return undefined;
        }
      }
      return value;
    }

    switch (statement.type) {
      case "ContentStatement":
        return [statement.value];
      case "MustacheStatement":
        const path = processNode(statement.path as NodeType);
        let value = lookupVariable(path);
        if (value === undefined) {
          return [];
        }
        return [value.toString()];
      case "BlockStatement":
        switch (statement.path.original) {
          case "if":
            const conditionPath = processNode(statement.params[0] as NodeType);
            const conditionVar = lookupVariable(conditionPath);

            if (conditionVar) {
              return statement.program.body.flatMap((n) =>
                processNode(n as any)
              );
            } else if (statement.inverse) {
              return statement.inverse.body.flatMap((n) =>
                processNode(n as any)
              );
            } else {
              return [];
            }
          default:
            console.warn(statement);
            return [];
        }
      case "PathExpression":
        return statement.parts.flatMap((part: SubExpression | string) =>
          typeof part === "string" ? [part] : processNode(part as NodeType)
        );
    }
    console.log(JSON.stringify(statement, null, 2));
    throw new Error(`Unsupported node type: ${(statement as any).type}`);
  }

  return ast.body.flatMap((n) => processNode(n as any)).join("");
}

export default interp;
