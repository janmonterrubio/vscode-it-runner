const it = require("it");
const sinon = require('sinon');
const assert = require("assert");

it.describe("scenarioDescription", (it) => {
  let sandbox;
  it.beforeAll(() => {
    sandbox = sinon.sandbox.create();
  });

  it.should("assert that isFunction", () => {
    assert.isFunction(it.should);
  });
});