"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interp = interp;
const handlebars_1 = __importDefault(require("handlebars"));
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
function interp(template, variables = {}, options = {}) {
    // Create a new Handlebars instance to avoid global state pollution
    const hb = handlebars_1.default.create();
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
exports.default = interp;
