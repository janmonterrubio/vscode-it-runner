const it = require("it");
const assert = require("assert");

it.describe("itDescribe", (it) => {
  it.should("should", () => {
    assert.isFunction(it.should);
  });
});
