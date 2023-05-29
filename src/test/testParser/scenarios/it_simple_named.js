const testing = require("it");
const assert = require("assert");

testing.describe("itDescribe", (testing) => {
  testing.should("should", () => {
    assert.isFunction(testing.should);
  });
});
