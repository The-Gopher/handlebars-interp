import { parse } from "@handlebars/parser";
import {
  BlockStatement,
  ContentStatement,
  Expression,
  Literal,
  MustacheStatement,
  PathExpression,
  Program,
  Statement,
  StringLiteral,
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

export interface InterpContext {
  variables: Record<string, any>;
  options: InterpOptions;
}

function processProgram(program: Program, context: InterpContext): string[] {
  return program.body.flatMap((n) => processStatement(n as any, context));
}

function processStatement(
  statement: Statement,
  context: InterpContext
): string[] {
  switch (statement.type) {
    case "ContentStatement":
      return processContentStatement(statement as ContentStatement);
    case "MustacheStatement":
      return processMustacheStatement(statement as MustacheStatement, context);
    case "BlockStatement":
      return processBlockStatement(statement as BlockStatement, context);
  }
  throw new Error(`Unsupported node type: ${(statement as any).type}`);
  return [];
}
function processContentStatement(node: ContentStatement): string[] {
  return [node.value];
}

function processMustacheStatement(
  node: MustacheStatement,
  context: InterpContext
): string[] {
  const value = processExpression(node.path, context);
  return value.map((v) => String(v));
}

function processBlockStatement(
  node: BlockStatement,
  context: InterpContext
): string[] {
  // For simplicity, only handle "if" blocks here
  if (node.path.original === "if") {
    return processIfBlock(node, context);
  } else if (node.path.original === "each") {
    return processEachBlock(node, context);
  }
  throw new Error(`Unsupported block helper: ${node.path.original}`);
}

function processIfBlock(
  node: BlockStatement,
  context: InterpContext
): string[] {
  const conditionValues = node.params.flatMap((param) =>
    processExpression(param, context)
  );
  if (conditionValues.length !== 1) {
    console.error("node.params:", JSON.stringify(node.params, null, 2));
    throw new Error(
      "If condition returned multiple values (not supported ATM)"
    );
  }
  const [condition] = conditionValues;
  if (condition) {
    return processProgram(node.program, context);
  } else if (node.inverse) {
    return processProgram(node.inverse, context);
  } else {
    return [];
  }
}

function processEachBlock(
  node: BlockStatement,
  context: InterpContext
): string[] {
  const conditionValues = node.params.flatMap((param) =>
    processExpression(param, context)
  );

  return conditionValues.flatMap((collection) => {
    if (Array.isArray(collection)) {
      return collection.flatMap((item) =>
        processProgram(node.program, {
          variables: { ...context.variables, this: item, ...item },
          options: context.options,
        })
      );
    } else {
      throw new Error("Each block expects an array");
    }
  });
}

function processExpression(
  node: Expression,
  context: InterpContext
): (string | number | boolean)[] {
  switch (node.type) {
    case "StringLiteral":
      return [(node as StringLiteral).value];
    case "PathExpression":
      return processPathExpression(node as PathExpression, context);
    default:
      throw new Error(`Unsupported expression type: ${(node as any).type}`);
  }
}

function processPathExpression(
  node: PathExpression,
  context: InterpContext
): any[] {
  let value = context.variables;
  for (const part of node.parts) {
    if (typeof part === "string") {
      if (value && part in value) {
        value = value[part];
      } else {
        if (context.options.strict) {
          throw new Error(`Missing property: ${part}`);
        } else {
          return [];
        }
      }
    } else {
      console.error("node: ", JSON.stringify(node, null, 2));
      // Handle sub-expressions if needed
      throw new Error("Sub-expressions are not supported yet");
    }
  }
  return [value];
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

  return processProgram(ast, { variables, options }).join("");
}

export default interp;
