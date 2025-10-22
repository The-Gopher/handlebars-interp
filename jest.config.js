const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: [
    "**/spec/**/*.spec.ts"
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/examples/"
  ]
};