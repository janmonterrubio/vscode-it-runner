const spec = require("spec");
const assert = require("assert");

spec.describe("scenarioDescription", (spec) => {
  spec.should("assert that isFunction", () => {
    assert.isFunction(spec.should);
  });
});
