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

  const testFiles = ["comments.json", "interpolation.json"];

  specs.forEach(function (name: string) {
    if (!testFiles.includes(name)) {
      it.skip(name, function () {});
      return;
    }

    var spec = require(specDir + name);
    spec.tests.forEach(function (test: any) {
      var data = Object.assign({}, test.data); // Shallow copy
      console.log("template: ", test.template);
      console.log("data:", data);
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
