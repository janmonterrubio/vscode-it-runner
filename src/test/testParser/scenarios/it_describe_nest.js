const it = require("it");
const assert = require("assert");

it.describe("itDescribe", (it) => {
  it.describe("functions", (it) => {
    it.should("should", () => {
      assert.isFunction(it.should);
    });
  });
});
