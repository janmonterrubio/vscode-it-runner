const it = require("it");
const assert = require("assert");

it.describe("itDescribe", (it) => {
  it.should("should", () => {
    assert.isFunction(it.should);
  });

  it.should("shouldCall", () => {
    assert.isFunction(it);
  });

  it.should("should2", () => {
    assert.isFunction(it.should);
  });

  it.should("shouldCall2", () => {
    assert.isFunction(it);
  });
});
