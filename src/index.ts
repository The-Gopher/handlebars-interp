import { parse } from '@handlebars/parser';
import {
  BlockStatement,
  ContentStatement,
  Expression,
  MustacheStatement,
  PathExpression,
  Program,
  Statement,
  StringLiteral,
} from '@handlebars/parser/types/ast';
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

  escapeExpression?: (str: string) => string;
}

export interface InterpContext {
  variables: [Record<string, any>];
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
    case 'ContentStatement':
      return processContentStatement(statement as ContentStatement);
    case 'MustacheStatement':
      return processMustacheStatement(statement as MustacheStatement, context);
    case 'BlockStatement':
      return processBlockStatement(statement as BlockStatement, context);
    case 'CommentStatement':
      return [];
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
  if (value === undefined || value === null) {
    return [];
  }

  let ret = [];
  switch (typeof value) {
    case 'function':
      const params = node.params.map((param) =>
        processExpression(param, context)
      );

      ret = [value.apply(null, params)];
      break;
    default:
      ret = [String(value)];
  }

  if (node.escaped) {
    return ret.map((s) =>
      (context.options.escapeExpression || Handlebars.escapeExpression)(s)
    );
  } else {
    return ret;
  }
}

function processBlockStatement(
  node: BlockStatement,
  context: InterpContext
): string[] {
  // For simplicity, only handle "if" blocks here
  switch (node.path.original) {
    case 'if':
      return processIfBlock(node, context);
    case 'unless':
      return processUnlessBlock(node, context);
    case 'each':
      return processEachBlock(node, context);
    case 'with':
      return processWithBlock(node, context);
  }
  const value = findInContext(node.path.original, context);
  if (value) {
    // If value is a list, iterate over it
    if (Array.isArray(value)) {
      return value.flatMap((item) =>
        processProgram(node.program, pushContext(context, item))
      );
    }
    return processProgram(node.program, {
      variables: [value, ...context.variables] as any,
      options: context.options,
    });
  }

  return processCustomBlock(node, context);
}

function processIfBlock(
  node: BlockStatement,
  context: InterpContext
): string[] {
  const conditionValues = node.params.flatMap((param) =>
    processExpression(param, context)
  );
  if (conditionValues.length !== 1) {
    console.error('node.params:', JSON.stringify(node.params, null, 2));
    throw new Error(
      'If condition returned multiple values (not supported ATM)'
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

function processUnlessBlock(
  node: BlockStatement,
  context: InterpContext
): string[] {
  const conditionValues = node.params.flatMap((param) =>
    processExpression(param, context)
  );
  if (conditionValues.length !== 1) {
    console.error('node.params:', JSON.stringify(node.params, null, 2));
    throw new Error(
      'If condition returned multiple values (not supported ATM)'
    );
  }
  const [condition] = conditionValues;
  if (!condition) {
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
  if (node.params.length !== 1) {
    throw new Error(
      'Each condition returned multiple values (not supported ATM)'
    );
  }

  const collection = node.params.flatMap((param) =>
    processExpression(param, context)
  );

  if (!Array.isArray(collection)) {
    console.error('collection:', JSON.stringify(collection, null, 2));
    throw new Error('Each block expects an array');
  }

  return (collection as any[]).flatMap((item) =>
    processProgram(node.program, pushContext(context, item))
  );
}

function processWithBlock(
  node: BlockStatement,
  context: InterpContext
): string[] {
  const conditionValues = node.params.flatMap((param) =>
    processExpression(param, context)
  );
  if (conditionValues.length !== 1) {
    console.error('node.params:', JSON.stringify(node.params, null, 2));
    throw new Error(
      'If condition returned multiple values (not supported ATM)'
    );
  }
  const [condition] = conditionValues;

  return processProgram(node.program, pushContext(context, condition));
}

function processCustomBlock(
  node: BlockStatement,
  context: InterpContext
): string[] {
  const helper = processExpression(node.path, context);
  if (helper === undefined || helper === null || helper === false) {
    return [];
  }
  if (typeof helper !== 'function') {
    // If helper is a list, iterate over it
    if (Array.isArray(helper)) {
      return helper.flatMap((item) =>
        processProgram(node.program, pushContext(context, item))
      );
    }
    return processProgram(node.program, pushContext(context, helper));
  }

  const params = node.params.map((param) => processExpression(param, context));

  const options = {
    data: context.variables,
    helpers: context.options.helpers,
  };

  return helper(params, options);
}

function processExpression(node: Expression, context: InterpContext): any {
  switch (node.type) {
    case 'StringLiteral':
      return (node as StringLiteral).value;
    case 'PathExpression':
      return processPathExpression(node as PathExpression, context);
    case 'NullLiteral':
      return null;
    default:
      throw new Error(`Unsupported expression type: ${(node as any).type}`);
  }
}

function pushContext(
  context: InterpContext,
  newVars: Record<string, any>
): InterpContext {
  return {
    variables: [newVars, ...context.variables] as any,
    options: context.options,
  };
}

function processPathExpression(
  node: PathExpression,
  context: InterpContext
): any {
  if (node.original === 'this' || node.original === '.') {
    const root = context.variables[0];
    return evalTail(root, node.tail);
  }
  if (typeof node.head === 'string') {
    const root = findInContext(node.head, context);
    return evalTail(root, node.tail);
  }

  return undefined;
}

function findInContext(key: string, context: InterpContext): any {
  if (context.options.helpers && context.options.helpers[key]) {
    return context.options.helpers[key];
  }

  for (let i of context.variables) {
    if (i[key]) {
      return i[key];
    }
  }

  if (context.options.strict) {
    throw new Error(`Missing property in strict mode: ${key}`);
  }
  return undefined;
}

function evalTail(obj: any, path: string[]): any {
  let current = obj;
  for (const part of path) {
    if (current && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
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

  return processProgram(ast, { variables: [variables], options }).join('');
}

export default interp;
