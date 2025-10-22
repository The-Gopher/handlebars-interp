import { interp } from "../src/index";

describe("spec", function () {
  // NOP Under non-node environments
  if (typeof process === "undefined") {
    return;
  }

  var fs = require("fs");

  var specDir = __dirname + "/mustache/specs/";
  var specs = fs
    .readdirSync(specDir)
    .filter((name: string) => /.*\.json$/.test(name));

  const testFiles = ["comments.json"];

  specs.forEach(function (name: string) {
    if (!testFiles.includes(name)) {
      it.skip(name, function () {});
      return;
    }

    var spec = require(specDir + name);
    spec.tests.forEach(function (test: any) {
      // Our lambda implementation knowingly deviates from the optional Mustache lambda spec
      // We also do not support alternative delimiters

      var data = Object.assign({}, test.data); // Shallow copy
      if (data.lambda) {
        // Blergh
        /* eslint-disable-next-line no-eval */
        data.lambda = eval("(" + data.lambda.js + ")");
      }
      it(name + " - " + test.name, function () {
        expect(interp(test.template, data)).toBe(test.expected);
      });
    });
  });
});
