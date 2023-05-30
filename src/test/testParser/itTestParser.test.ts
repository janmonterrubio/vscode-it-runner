import { describe, expect, test } from "@jest/globals";

import { readFileSync } from "fs";
import { resolve } from "path";

import { TestType, findTests } from "../../itTestParser";
import exp = require("constants");
describe("itTestParser", () => {
  describe("finds test structure", () => {
    test("describe/should", () => {
      const content = readFileSync(
        resolve(__dirname, "scenarios/it_simple.js"),
        "utf-8"
      );
      const collected = findTests(content);

      // struct is
      // describe
      //  should
      expect(collected.children.length).toBe(1);

      const describe = collected.children[0];
      expect(describe.children.length).toBe(1);
    });

    test("describe/describe/should", () => {
      const content = readFileSync(
        resolve(__dirname, "scenarios/it_describe_nest.js"),
        "utf-8"
      );
      const collected = findTests(content);

      // struct is
      // describe
      //  describe
      //    should
      expect(collected.children.length).toBe(1);

      const describe = collected.children[0];
      expect(describe.children.length).toBe(1);

      const innerDescribe = describe.children[0];
      expect(innerDescribe.children.length).toBe(1);
    });

    test("describe multiShould", () => {
      const content = readFileSync(
        resolve(__dirname, "scenarios/it_multi_should.js"),
        "utf-8"
      );
      const collected = findTests(content);

      // struct is
      // describe
      //  should
      //  should
      //  should
      //  should
      expect(collected.children.length).toBe(1);

      const describe = collected.children[0];
      expect(describe.children.length).toBe(4);
    });

    test("describe multi describe/", () => {
      const content = readFileSync(
        resolve(__dirname, "scenarios/it_multi_describe.js"),
        "utf-8"
      );
      const collected = findTests(content);

      // struct is
      // describe
      //  should
      //  should
      // describe
      //  should
      //  should
      expect(collected.children.length).toBe(2);

      const describe = collected.children[0];
      expect(describe.children.length).toBe(2);


      const describe2 = collected.children[1];
      expect(describe2.children.length).toBe(2);
    });

    test("finds tests when not named it", () => {
      const content = readFileSync(
        resolve(__dirname, "scenarios/it_simple_named.js"),
        "utf-8"
      );
      const collected = findTests(content);

      // struct is
      // describe
      //  should
      expect(collected.children.length).toBe(1);

      const describe = collected.children[0];
      expect(describe.children.length).toBe(1);
    });
  });

  describe("node details", () => {

    describe("describe with should", () => {

      test("finds correct details", () => {
        const content = readFileSync(
          resolve(__dirname, "scenarios/describe_node.js"),
          "utf-8"
        );
        const collected = findTests(content);

        const describeNode = collected.children[0];
        expect(describeNode.testLiteral).toBe("scenarioDescription");
        expect(describeNode.parts).toEqual(["scenarioDescription"]);
        expect(describeNode.testType).toBe(TestType.DESCRIBE);

        const describeLocation = describeNode.location;
        expect(describeLocation?.start.line).toBe(4);
        expect(describeLocation?.start.column).toBe(0);
        expect(describeLocation?.end.line).toBe(8);
        expect(describeLocation?.end.column).toBe(3);

        const shouldNode = describeNode.children[0];
        expect(shouldNode.testLiteral).toBe("assert that isFunction");
        expect(shouldNode.parts).toEqual(["scenarioDescription", "should assert that isFunction"]);
        expect(shouldNode.testType).toBe(TestType.SHOULD);
       
        const shouldLocation = shouldNode.location;
        expect(shouldLocation?.start.line).toBe(5);
        expect(shouldLocation?.start.column).toBe(2);
        expect(shouldLocation?.end.line).toBe(7);
        expect(shouldLocation?.end.column).toBe(5);
      });


      test("ignores globally required library", () => {
        const content = readFileSync(
          resolve(__dirname, "scenarios/global_require.js"),
          "utf-8"
        );
        const collected = findTests(content);

        const describeNode = collected.children[0];
        expect(describeNode.testLiteral).toBe("scenarioDescription");
        expect(describeNode.parts).toEqual(["scenarioDescription"]);
        expect(describeNode.testType).toBe(TestType.DESCRIBE);

        const describeLocation = describeNode.location;
        expect(describeLocation?.start.line).toBe(5);
        expect(describeLocation?.start.column).toBe(0);
        expect(describeLocation?.end.line).toBe(9);
        expect(describeLocation?.end.column).toBe(3);

        const shouldNode = describeNode.children[0];
        expect(shouldNode.testLiteral).toBe("assert that isFunction");
        expect(shouldNode.parts).toEqual(["scenarioDescription", "should assert that isFunction"]);
        expect(shouldNode.testType).toBe(TestType.SHOULD);
       
        const shouldLocation = shouldNode.location;
        expect(shouldLocation?.start.line).toBe(6);
        expect(shouldLocation?.start.column).toBe(2);
        expect(shouldLocation?.end.line).toBe(8);
        expect(shouldLocation?.end.column).toBe(5);
      });

    });

  });

  describe("ignores tests", () => {
    test("returns empty on blank text", () => {
      const content = readFileSync(
        resolve(__dirname, "scenarios/notests.js"),
        "utf-8"
      );
      const collected = findTests(content);

      expect(collected.children).toEqual([]);
    });

    test("ignores non-it tests", () => {
      const content = readFileSync(
        resolve(__dirname, "scenarios/not_it.js"),
        "utf-8"
      );

      const collected = findTests(content);

      expect(collected.children).toEqual([]);
    });

    test("ignores non-it lib with same functions", () => {
      const content = readFileSync(
        resolve(__dirname, "scenarios/not_it_same_funcs.js"),
        "utf-8"
      );

      const collected = findTests(content);

      expect(collected.children).toEqual([]);
    });
  });
});
