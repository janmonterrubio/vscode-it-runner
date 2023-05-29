const it = require("it");
const assert = require("assert");

it.describe("scenarioDescription", (it) => {
  it.should("assert that isFunction", () => {
    assert.isFunction(it.should);
  });
});
